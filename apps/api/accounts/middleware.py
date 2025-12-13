import os

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import ExpiredTokenError, TokenError, AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken


class AttachTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access_token = request.COOKIES.get('access')
        if access_token:
            request.META["HTTP_AUTHORIZATION"] = f'Bearer {access_token}'
        return self.get_response(request)



class RefreshJWTMiddleware:


    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from django.contrib.auth.models import AnonymousUser


        access = request.COOKIES.get('access')
        refresh = request.COOKIES.get('refresh')


        user = AnonymousUser()
        new_access = None
        if access:
            try:
                AccessToken(access)
                validate_token = JWTAuthentication().get_validated_token(access)
                user = JWTAuthentication().get_user(validate_token)
            except ExpiredTokenError:
                print('expired token')
                if refresh:
                    try:
                        refresh = RefreshToken(refresh)
                        new_access = str(refresh.access_token)
                        request.COOKIES['access'] = new_access
                        validate_token = JWTAuthentication().get_validated_token(new_access)
                        user = JWTAuthentication().get_user(validate_token)
                    except Exception as e:
                        print("Refresh error token in midd:", e)
                        request = self.delete_token_from_request(request)
            except Exception as e:
                request = self.delete_token_from_request(request)



        request.user = user
        response = self.get_response(request)
        if new_access:
            response.set_cookie(
                key= "access",
                value= new_access,
                httponly=True,
                secure=os.getenv("SECURE") == "True",
                samesite=os.getenv("SAMESITE", "Lax"),
                domain=os.getenv("COOKIE_DOMAIN", None)
            )

        return response


    def delete_token_from_request(self, request):
        request.COOKIES.pop('access', None)
        request.COOKIES.pop('refresh', None)
        return request


