from django.urls import path

from chat_manager import views

urlpatterns = [
    path('conversations', views.Conversations.as_view()),
    path('messages', views.Messages.as_view()),

]