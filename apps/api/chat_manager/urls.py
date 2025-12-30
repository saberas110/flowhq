from django.urls import path

from chat_manager import views



urlpatterns = [
    path('ouath2callback', views.GmailAuthCallbackView.as_view()),
    path('webhooks/gmail', views.GmailWebHook.as_view()),
    path('gmail/auth/start', views.GmailAuthStartView.as_view()),
    path('hello', views.ConversationView.as_view())
]
