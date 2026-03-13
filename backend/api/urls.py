from django.urls import path
from .views import PredictView, HistoryView, StatsView, UserView, login_view, register_view, logout_view, verify_email_view

urlpatterns = [
    path('predict/', PredictView.as_view(), name='predict'),
    path('history/', HistoryView.as_view(), name='history'),
    path('stats/', StatsView.as_view(), name='stats'),
    path('user/', UserView.as_view(), name='user'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),
    path('verify-email/<str:token>/', verify_email_view, name='verify-email'),
]
