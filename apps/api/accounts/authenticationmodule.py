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

        cookie_setting = {
            'lax': 'lax',
            'None': None,
            'False': False,
            'True': True,
        }


        refresh, access = self.create_token()
        self.response.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=cookie_setting[os.getenv("SECURE")],
            samesite=cookie_setting[os.getenv("SAMESITE")],
        )
        self.response.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,
            secure= cookie_setting[os.getenv("SECURE")] ,
            samesite=cookie_setting[os.getenv("SAMESITE")],
        )
        print('self.response', self.response)
        return self.response



