import os
import urllib.parse
import secrets
import requests
from django.shortcuts import redirect
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from authlib.jose import jwt, JsonWebKey
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .authenticationmodule import HandleToken
from .serializers import UserRegisterSerializer
from .serializers import UserLoginSerializer

User = get_user_model()





class GoogleLogin(View):
    def get(self, request):
        print("redirect_uri", os.environ.get("GOOGLE_REDIRECT_URI"))
        state = secrets.token_urlsafe(32)
        request.session["oauth_state"] = state

        params = {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
            "redirect_uri": os.environ.get("GOOGLE_REDIRECT_URI"),
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
        print('hello im form google callback')

        state = request.GET.get('state')

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
            "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": os.environ.get("GOOGLE_REDIRECT_URI"),
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


        user, created = User.objects.get_or_create(email=email)
        response = redirect(os.environ.get("FRONTEND_LOGIN_SUCCESS_URL"), '/')

        handle_token = HandleToken(user, response)

        try:
            del request.session["oauth_state"]
        except KeyError:
            pass

        return handle_token.set_token_in_response()



class RegisterUser(APIView):
    def post(self, request):
        srz_data = UserRegisterSerializer(data=request.data)
        if srz_data.is_valid(raise_exception=True):
            user = srz_data.create(srz_data.validated_data)
            response = Response(srz_data.data, status=status.HTTP_201_CREATED)
            handle_token = HandleToken(user, response)
            return handle_token.set_token_in_response()

        return Response(srz_data.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutUser(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        response = Response({"detail": "Logged out"})
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        return response


class LoginUser(APIView):
    def post(self, request):
        srz_data = UserLoginSerializer(data=request.data)
        if srz_data.is_valid(raise_exception=True):
            user = srz_data.validated_data
            response = Response(srz_data.data, status=status.HTTP_200_OK)
            handle_token = HandleToken(user, response)
            return handle_token.set_token_in_response()
        return Response(srz_data.errors, status=status.HTTP_400_BAD_REQUEST)



class UserStatus(APIView):
    permission_classes = [IsAuthenticated,]
    def get(self, request):
        print('UserStatus')
        return Response({'UserStatus': 'Authenticated'}, status=status.HTTP_200_OK)



class CSRFTokenView(APIView):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({'message':'CSRFToken set successfully'})
