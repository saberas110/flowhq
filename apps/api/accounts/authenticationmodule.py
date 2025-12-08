import os

from django.conf import settings


class HandleToken:
    def __init__(self, user, response):
        self.user = user
        self.response = response

    def create_token(self):
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(self.user)
        access_token = refresh.access_token

        return str(refresh), str(access_token)

    def set_token_in_response(self):
        # self.response.delete_cookie("access")
        # self.response.delete_cookie("refresh")


        refresh, access = self.create_token()
        print(refresh)
        print(access)
        self.response.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=os.getenv("SECURE"),
            samesite='lax',
            domain=os.getenv("ALLOWED_ORIGINS")
        )
        self.response.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,
            secure=os.getenv("SECURE"),
            samesite= "lax",
            domain=os.getenv("ALLOWED_ORIGINS")
        )
        print('self.response')
        return self.response



