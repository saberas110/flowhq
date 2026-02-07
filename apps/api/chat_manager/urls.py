from django.urls import path, include
from rest_framework.routers import DefaultRouter

from chat_manager import views

router = DefaultRouter()
router.register('schema', views.SchemaViewSet, basename='schema')

urlpatterns = [
    path('ouath2callback', views.GmailAuthCallbackView.as_view()),
    path('webhooks/gmail', views.GmailWebHook.as_view()),
    path('gmail/auth/start', views.GmailAuthStartView.as_view()),
    path('email/connect', views.ConnectEmailView.as_view()),
    path('', include(router.urls))
]


