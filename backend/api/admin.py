from django.contrib import admin
from .models import NewsPrediction

@admin.register(NewsPrediction)
class NewsPredictionAdmin(admin.ModelAdmin):
    list_display = ('predicted_label', 'probability', 'user_ip', 'created_at')
    list_filter = ('predicted_label', 'created_at')
    search_fields = ('text', 'user_ip')
    readonly_fields = ('created_at',)
