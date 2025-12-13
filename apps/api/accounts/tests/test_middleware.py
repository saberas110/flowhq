from datetime import timedelta
from os import getenv
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

User = get_user_model()

class TestMiddleware(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('a@a.com', password='adsfdfdfs')
        self.client = APIClient()
        self.url = reverse("user_status")
        self.refresh = RefreshToken.for_user(self.user)
        self.access = self.refresh.access_token


    def test_invalid_jwt_in_header(self):
        fake_token = "lasdfjdlsfjalfjdslfjdsf"
        self.client.cookies["access"] = fake_token
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_valid_access_token(self):
        self.client.cookies["access"] = str(self.access)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_correct_refresh_token_fake_access(self):
        self.client.cookies["refresh"] = self.refresh
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_correct_refresh_exp_access(self):
        self.access.set_exp(lifetime=timedelta(seconds=-1))
        self.client.cookies["access"] = self.access
        self.client.cookies["refresh"] = self.refresh
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)


    def test_not_allowed_origin(self):
        self.client.cookies["access"] = str(self.access)
        response = self.client.get(self.url, HTTP_ORIGIN="http://digikala.com")
        self.assertIsNone(response.headers.get("Access-Control-Allow-Origin"))

    def test_allowed_origin(self):
        self.client.cookies["access"] = str(self.access)
        response = self.client.get(self.url, HTTP_ORIGIN=getenv("ALLOWED_ORIGINS").split(",")[0])
        self.assertEqual(response.headers.get("Access-Control-Allow-Origin"),getenv("ALLOWED_ORIGINS").split(",")[0])

    def test_remove_invalid_token_in_response(self):
        self.client.cookies["access"] = 'sdfhaskdfhasdkfhsadkfhksafhskdfh'
        self.client.cookies["refresh"] = 'dsfhsdafhaslkfhdsfhsakfhsdkfhsdf'
        response = self.client.get(self.url)


















