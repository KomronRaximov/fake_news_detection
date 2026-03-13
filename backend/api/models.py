from django.db import models
from django.contrib.auth.models import User

class NewsPrediction(models.Model):
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    text = models.TextField()
    predicted_label = models.CharField(max_length=50) # Fake / Real
    probability = models.FloatField()
    confidence_level = models.CharField(max_length=50, null=True, blank=True)
    model_used = models.CharField(max_length=100, null=True, blank=True)
    fact_check_source = models.TextField(null=True, blank=True)
    verification_status = models.CharField(max_length=200, null=True, blank=True)
    word_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    user_ip = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.predicted_label} - {self.text[:50]}..."

class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
