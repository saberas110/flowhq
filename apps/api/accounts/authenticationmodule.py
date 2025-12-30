import os
from datetime import timedelta

from django.conf import settings

from chat_manager.models import Organization


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

        if not self.user.organizations.exists():
            org = Organization.objects.create()
            org.owner.add(self.user)



        refresh, access = self.create_token()
        access_lifetime = timedelta(seconds=5)
        refresh_lifetime = timedelta(days=1)

        self.response.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=os.getenv("SECURE") == "True",
            samesite=os.getenv("SAMESITE"),
            path= '/',
            domain=os.getenv("COOKIE_DOMAIN", None),
            max_age=int(access_lifetime.total_seconds())
        )
        self.response.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,
            secure=os.getenv("SECURE") == "True",
            samesite=os.getenv("SAMESITE"),
            domain=os.getenv("COOKIE_DOMAIN", None),
            path='/',
            max_age=int(refresh_lifetime.total_seconds())
        )
        return self.response
