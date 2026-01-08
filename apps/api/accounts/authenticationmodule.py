import os
from datetime import timedelta

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
        access_lifetime = timedelta(minutes=5)  # 5 minutes, not 5 seconds
        refresh_lifetime = timedelta(days=7)

        # For SameSite=Lax, cookies work with same-origin requests (via proxy)
        samesite = os.getenv("SAMESITE", "Lax")
        secure = os.getenv("SECURE") == "True"
        domain = os.getenv("COOKIE_DOMAIN") or None

        self.response.set_cookie(
            key="access",
            value=access,
            httponly=False,  # Allow JS to read for WebSocket cross-domain auth
            secure=secure,
            samesite=samesite,
            path='/',
            domain=domain,
            max_age=int(access_lifetime.total_seconds())
        )
        self.response.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,  # Keep secure - not needed by JS
            secure=secure,
            samesite=samesite,
            path='/',
            domain=domain,
            max_age=int(refresh_lifetime.total_seconds())
        )
        return self.response
