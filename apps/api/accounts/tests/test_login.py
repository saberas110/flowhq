from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.authentication import JWTAuthentication
from os import getenv

Validation


User = get_user_model()

class TestLogin(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="saber@gmail.com", password="1234@5678")
        self.client = APIClient()
        self.url = reverse('login')

    def assert_valid_cookie(self, cookie, expected_max_age):
        self.assertTrue(cookie.value)
        self.assertGreater(len(cookie.value), 10)
        self.assertEqual(cookie["domain"], getenv("COOKIE_DOMAIN"))
        self.assertTrue(cookie["httponly"])
        self.assertEqual((cookie["samesite"]), getenv("SAMESITE"))
        self.assertEqual(int(cookie["max-age"]), expected_max_age)

    def assert_token_user(self, cookie_value):
        validated_token = JWTAuthentication().get_validated_token(cookie_value)
        return JWTAuthentication().get_user(validated_token)

    def test_empty_request(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {'message': 'email: This field is required.'
                                                    ',password: This field is required.', 'code': 400})

    def test_empty_password(self):
        response = self.client.post(self.url, {'email': "s@s.com"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {'message': 'password: This field is required.', 'code': 400})


    def test_empty_email(self):
        response = self.client.post(self.url, {'password': "12345678"})
        self.assertEqual(response.data, {'message': 'email: This field is required.', 'code': 400})
        self.assertEqual(response.status_code, 400)

    def test_user_dose_not_exists(self):
        response = self.client.post(self.url, {'email': 's@s.com', 'password': "12345678"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {'message': 'user: user does not exists.', 'code': 400})

    def test_wrong_password(self):
        response = self.client.post(self.url, {'email': 'saber@gmail.com', 'password': '12345678'})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {'message': 'password: password is wrong.', 'code': 400})

    def test_set_tokens_and_login(self):
        response = self.client.post(self.url, {'email': 'saber@gmail.com', 'password': '1234@5678'})
        user_in_database = User.objects.filter(email='saber@gmail.com').first()
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(user_in_database)

        access = response.cookies["access"]
        refresh = response.cookies["refresh"]
        user_with_token = self.assert_token_user(access.value)
        self.assertTrue(user_with_token==user_in_database)

        self.assert_valid_cookie(access, 300)
        self.assert_valid_cookie(refresh, 86400)















