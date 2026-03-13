import os
import torch
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.conf import settings
from .models import NewsPrediction
from .serializers import NewsPredictionSerializer
from transformers import BertTokenizer, BertForSequenceClassification
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.authentication import JWTAuthentication

class UserView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'username': request.user.username,
                'is_staff': request.user.is_staff
            })
        return Response({'is_authenticated': False})

from django.contrib.auth.models import User
import json

import uuid
from django.core.mail import send_mail
from .models import EmailVerification

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not username or not password or not email:
        return Response({'error': 'Please provide username, email and password'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    # Create user as active immediately for production
    user = User.objects.create_user(username=username, email=email, password=password, is_active=True)
    
    return Response({
        'success': True, 
        'message': 'Registration successful! You can now login.'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email_view(request, token):
    try:
        verification = EmailVerification.objects.get(token=token)
        user = verification.user
        user.is_active = True
        user.save()
        verification.delete()
        return Response({'success': True, 'message': 'Email verified successfully. You can now login.'})
    except EmailVerification.DoesNotExist:
        return Response({'error': 'Invalid or expired token'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    identifier = request.data.get('username') or '' # can be username or email
    password = request.data.get('password')
    
    user_to_auth = None
    if identifier and '@' in identifier:
        try:
            user_obj = User.objects.get(email=identifier)
            user_to_auth = user_obj
        except User.DoesNotExist:
            pass
    else:
        try:
            user_to_auth = User.objects.get(username=identifier)
        except User.DoesNotExist:
            pass

    if user_to_auth and not user_to_auth.is_active:
        return Response({'error': 'Email not verified. Please check your inbox.'}, status=401)

    user = authenticate(username=user_to_auth.username if user_to_auth else identifier, password=password)
        
    if user:
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True, 
            'is_staff': user.is_staff, 
            'username': user.username,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def logout_view(request):
    logout(request)
    return Response({'success': True})

import re
from .utils import check_fact

# Load models and tokenizers once
article_tokenizer = BertTokenizer.from_pretrained(settings.ARTICLE_MODEL_PATH)
article_model = BertForSequenceClassification.from_pretrained(settings.ARTICLE_MODEL_PATH)
article_model.eval()

liar_tokenizer = BertTokenizer.from_pretrained(settings.LIAR_MODEL_PATH)
liar_model = BertForSequenceClassification.from_pretrained(settings.LIAR_MODEL_PATH)
liar_model.eval()

def get_confidence_level(prob):
    if prob >= 0.9: return "Very High"
    if prob >= 0.7: return "High"
    if prob >= 0.5: return "Moderate"
    return "Low"

def count_words_and_sentences(text):
    words = text.split()
    word_count = len(words)
    # Simple sentence count based on punctuation
    sentences = re.split(r'[.!?]+', text)
    sentence_count = len([s for s in sentences if s.strip()])
    return word_count, sentence_count

class PredictView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '')
        if not text:
            return Response({'error': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)

        word_count, sentence_count = count_words_and_sentences(text)

        # Smart Routing Logic
        # - If ≤ 60 words AND ≤ 2 sentences → use LIAR model
        # - Otherwise → use Article model
        if word_count <= 60 and sentence_count <= 2:
            current_model = liar_model
            current_tokenizer = liar_tokenizer
            model_used_name = "BERT (LIAR Dataset)"
        else:
            current_model = article_model
            current_tokenizer = article_tokenizer
            model_used_name = "BERT (Article Dataset)"

        # Preprocess
        inputs = current_tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        
        # Inference
        with torch.no_grad():
            outputs = current_model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            prediction_idx = torch.argmax(probs, dim=-1).item()
            probability = probs[0][prediction_idx].item()

        # Label mapping (0: Fake, 1: Real) - Flipped as per user request
        label = "Real" if prediction_idx == 1 else "Fake"
        confidence_level = get_confidence_level(probability)

        # Fact Check Integration
        fact_check_data = check_fact(text)
        verification_status = "No external verification found"
        fact_check_source = None
        
        if fact_check_data:
            verification_status = f"Verified by external fact-check source: {fact_check_data['textualRating']}"
            fact_check_source = f"{fact_check_data['publisher']} ({fact_check_data['url']})"

        # Save to database
        user_ip = request.META.get('REMOTE_ADDR')
        creator = request.user if request.user.is_authenticated else None
        
        prediction_obj = NewsPrediction.objects.create(
            creator=creator,
            text=text,
            predicted_label=label,
            probability=probability,
            confidence_level=confidence_level,
            model_used=model_used_name,
            fact_check_source=fact_check_source,
            verification_status=verification_status,
            word_count=word_count,
            user_ip=user_ip
        )

        return Response({
            'prediction': label,
            'confidence_percent': round(probability * 100, 2),
            'confidence_level': confidence_level,
            'model_used': model_used_name,
            'word_count': word_count,
            'verification': verification_status,
            'id': prediction_obj.id,
            # Backwards compatibility
            'label': label,
            'probability': probability
        })

class HistoryPagination(PageNumberPagination):
    page_size = 10

class HistoryView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_ip = request.META.get('REMOTE_ADDR')
        
        if request.user.is_staff:
            predictions = NewsPrediction.objects.all().order_by('-created_at')
        elif request.user.is_authenticated:
            predictions = NewsPrediction.objects.filter(creator=request.user).order_by('-created_at')
        else:
            predictions = NewsPrediction.objects.filter(user_ip=user_ip, creator__isnull=True).order_by('-created_at')
            
        paginator = HistoryPagination()
        result_page = paginator.paginate_queryset(predictions, request)
        serializer = NewsPredictionSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

class StatsView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_ip = request.META.get('REMOTE_ADDR')
        
        if request.user.is_staff:
            base_query = NewsPrediction.objects.all()
        elif request.user.is_authenticated:
            base_query = NewsPrediction.objects.filter(creator=request.user)
        else:
            base_query = NewsPrediction.objects.filter(user_ip=user_ip, creator__isnull=True)
            
        total_count = base_query.count()
        label_stats = base_query.values('predicted_label').annotate(count=Count('predicted_label'))
        
        last_7_days = timezone.now() - timedelta(days=7)
        daily_stats = base_query.filter(created_at__gte=last_7_days) \
            .extra(select={'day': "date(created_at)"}) \
            .values('day') \
            .annotate(count=Count('id')) \
            .order_by('day')

        return Response({
            'total_count': total_count,
            'label_stats': label_stats,
            'daily_stats': daily_stats
        })
