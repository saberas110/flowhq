from django.urls import path

from . import views


urlpatterns = [
    path('auth/google/login', views.GoogleLogin.as_view()),
    path('auth/google/callback/', views.GoogleCallBack.as_view()),
    path('userstatus', views.UserStatus.as_view()),
    path('csrf',views.CSRFTokenView.as_view() ),
    path('register', views.RegisterUser.as_view()),
    path('logout', views.LogoutUser.as_view()),
    path('login', views.LoginUser.as_view()),
]