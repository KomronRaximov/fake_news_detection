from rest_framework import serializers
from .models import NewsPrediction

class NewsPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsPrediction
        fields = '__all__'
