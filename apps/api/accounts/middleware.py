import os
from django.contrib.auth.models import AnonymousUser

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import ExpiredTokenError, TokenError, AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

# accounts/middleware.py

import os
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from jwt import ExpiredSignatureError as ExpiredTokenError




class JWTFromCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("=" * 60)
        print("🐍 [JWT Middleware] Request received")

        print(f"   Path: {request.path}")
        print(f"   Cookies: {list(request.COOKIES.keys())}")
        print("=" * 60)

        if request.path.startswith('/admin/'):
            return self.get_response(request)

        access = request.COOKIES.get('access')
        refresh = request.COOKIES.get('refresh')
        new_access = None

        jwt_auth = JWTAuthentication()

        if access:
            try:
                jwt_auth.get_validated_token(access)
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access}'
                print("✅ Access token attached to Authorization header")
            except Exception as e:
                print(f"⏰/❌ Access invalid or expired: {e}")
                access = None

        if not access and refresh:
            try:
                print("🔄 Refreshing access token...")
                refresh_token = RefreshToken(refresh)
                new_access = str(refresh_token.access_token)
                request.COOKIES['access'] = new_access

                request.META['HTTP_AUTHORIZATION'] = f'Bearer {new_access}'
                print("✅ New access token attached to Authorization header")
            except Exception as e:
                print(f"❌ Refresh failed: {e}")

        response = self.get_response(request)

        if new_access:
            response.set_cookie(
                key='access',
                value=new_access,
                httponly=False,
                secure=os.getenv("SECURE") == "True",
                samesite=os.getenv("SAMESITE", "Lax"),
                domain=os.getenv("COOKIE_DOMAIN", None),
                path='/',
                max_age=300
            )
            print("🍪 New access cookie set on response")

        print("=" * 60)
        return response