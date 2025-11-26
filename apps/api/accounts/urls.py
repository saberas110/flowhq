from django.urls import path

from . import views


urlpatterns = [
    path('auth/google/login', views.GoogleLogin.as_view()),
    path('auth/google/callback/', views.GoogleCallBack.as_view()),
    path('userstatus', views.UserStatus.as_view()),
]