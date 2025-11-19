# views.py
import urllib.parse
import secrets
import requests
from django.conf import settings
from django.shortcuts import redirect
from django.http import JsonResponse
from django.views import View
from authlib.jose import jwt, JsonWebKey
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class GoogleLogin(View):
    def get(self, request):
        state = secrets.token_urlsafe(32)
        request.session["oauth_state"] = state

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
        return redirect(url)


class GoogleCallBack(View):
    def get(self, request):
        state = request.GET.get('state')
        print('call state is  :', state)


        saved_state = request.session.get("oauth_state")
        if not saved_state:
            print("No saved state in session (session might be missing)")
        if state != saved_state:
            return JsonResponse({"error": "Invalid State"}, status=400)

        code = request.GET.get('code')
        if not code:
            return JsonResponse({"error": "no code provided"}, status=400)


        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,  # **اسم صحیح پارامتر**
            "grant_type": "authorization_code",
        }
        token_res = requests.post(token_url, data=data, timeout=10)
        token_res.raise_for_status()
        token_data = token_res.json()
        id_token = token_data.get('id_token')
        if not id_token:
            return JsonResponse({"error": "no id_token from google", "detail": token_data}, status=400)

        jwks = requests.get("https://www.googleapis.com/oauth2/v3/certs", timeout=10).json()
        claims = None
        for key in jwks.get("keys", []):
            try:
                claims = jwt.decode(id_token, JsonWebKey.import_key(key))
                break
            except Exception as e:

                continue

        if claims is None:
            return JsonResponse({"error": "invalid id_token"}, status=400)


        try:
            claims.validate()
        except Exception as e:
            return JsonResponse({"error": "id_token validation failed", "detail": str(e)}, status=400)

        email = claims.get('email')
        email_verified = claims.get('email_verified', False)
        if not email or not email_verified:
            return JsonResponse({'error': 'email not found or not verified'}, status=400)


        user, created = User.objects.get_or_create(email=email, defaults={
            "username": email.split("@")[0]
        })


        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        refresh_str = str(refresh)
        access_str = str(access_token)


        response = redirect(settings.FRONTEND_LOGIN_SUCCESS_URL if hasattr(settings, "FRONTEND_LOGIN_SUCCESS_URL") else "/")
        response.set_cookie(
            key="access",
            value=access_str,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            max_age=300,
            path="/",
        )
        response.set_cookie(
            key="refresh",
            value=refresh_str,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            max_age=7 * 24 * 3600,
            path="/api/accounts/auth/refresh/",
        )

        try:
            del request.session["oauth_state"]
        except KeyError:
            pass

        return response
