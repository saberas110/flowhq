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


class RefreshJWTMiddleware:
    def __init__(self, get_response):  # ← این را اضافه کنید!
        self.get_response = get_response

    def __call__(self, request):
        print("=" * 60)
        print("🐍 [Django Middleware] Request received")
        print(f"   Path: {request.path}")
        print(f"   Cookies: {list(request.COOKIES.keys())}")
        print("=" * 60)
        
        if request.path.startswith('/admin/'):
            return self.get_response(request)

        access = request.COOKIES.get('access')
        refresh = request.COOKIES.get('refresh')

        user = AnonymousUser()
        new_access = None
        should_refresh = False

        if access:
            try:
                validate_token = JWTAuthentication().get_validated_token(access)
                user = JWTAuthentication().get_user(validate_token)
                print(f"✅ [Django Middleware] Valid token for user: {user}")
            except ExpiredTokenError:
                print('⏰ [Django Middleware] Token expired')
                should_refresh = True
            except Exception as e:
                print(f'❌ [Django Middleware] Token error: {e}')
                should_refresh = True
        else:
            print('⚠️ [Django Middleware] No access token')
            should_refresh = True

        if should_refresh and refresh:
            print('🔄 [Django Middleware] Refreshing token...')
            try:
                refresh_token = RefreshToken(refresh)
                new_access = str(refresh_token.access_token)
                request._new_access_token = new_access

                validate_token = JWTAuthentication().get_validated_token(new_access)
                user = JWTAuthentication().get_user(validate_token)
                print(f"✅ [Django Middleware] New token created for: {user}")

            except Exception as e:
                print(f"❌ [Django Middleware] Refresh failed: {e}")

        request.user = user
        response = self.get_response(request)

        if new_access:
            print("🍪 [Django Middleware] Setting new access cookie")
            print(f"   Value: {new_access[:30]}...")
            print(f"   Path: /")
            print(f"   SameSite: Lax")
            print(f"   Max-Age: 300")

            response.set_cookie(
                key="access",
                value=new_access,
                httponly=False,  # Allow JS to read for WebSocket cross-domain auth
                secure=os.getenv("SECURE") == "True",
                samesite=os.getenv("SAMESITE", "Lax"),
                domain=os.getenv("COOKIE_DOMAIN", None),
                path='/',
                max_age=300
            )

            # تأیید که کوکی در response است
            if hasattr(response, 'cookies') and 'access' in response.cookies:
                print("✅ [Django Middleware] Cookie added to response")
            else:
                print("❌ [Django Middleware] Cookie NOT added to response!")

        print("=" * 60)
        return response


class AttachTokenMiddleware:
    def __init__(self, get_response):  # ← این را هم اضافه کنید!
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, '_new_access_token'):
            token = request._new_access_token
            print(f"🟢 AttachToken - Using token: {token[:30]}...")
            print(f"🟢 AttachToken - Has _new_access_token: True")
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
            print("✅ Authorization header set")
        else:
            access = request.COOKIES.get('access')
            if access:
                print(f"🟡 AttachToken - Using cookie token: {access[:30]}...")
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access}'
                print("✅ Authorization header set from cookie")

        return self.get_response(request)

class AttachTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access_token = getattr(request, '_new_access_token', None)

        if not access_token:
            access_token = request.COOKIES.get('access')

        print(f"🟢 AttachToken - Using token: {access_token[:20] if access_token else None}...")
        print(f"🟢 AttachToken - Has _new_access_token: {hasattr(request, '_new_access_token')}")

        if access_token:
            request.META["HTTP_AUTHORIZATION"] = f'Bearer {access_token}'
            print(f"✅ Authorization header set")

        return self.get_response(request)