import os
from datetime import timedelta
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

User = get_user_model()



class TestRegisterApi(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.normal_user = User.objects.create_user(email="user@user.com", password="slfjalsfj")
        self.refresh = RefreshToken.for_user(self.normal_user)
        self.access = self.refresh.access_token
        self.url = reverse('register')
        self.access.set_exp(lifetime=timedelta(seconds=-1))
        self.validate_data = {
            "password": "96239623",
            "confirm_password": "96239623",
            "email": "a@gmail.com",
            "first_name": "Ali",
            "last_name": "Asadi"
        }

    def assert_valid_cookie(self, cookie, expected_max_age):
        self.assertTrue(cookie.value)
        self.assertGreater(len(cookie.value), 10)
        self.assertEqual(cookie["domain"], os.getenv("COOKIE_DOMAIN"))
        self.assertTrue(cookie["httponly"])
        self.assertEqual((cookie["samesite"]), os.getenv("SAMESITE"))
        self.assertEqual(int(cookie["max-age"]), expected_max_age)

    def assert_token_user(self, cookie_value):
        validated_token = JWTAuthentication().get_validated_token(cookie_value)
        return JWTAuthentication().get_user(validated_token)

    def test_empty_data(self):
        response = self.client.post(self.url,data={}, format='json')
        self.assertEqual(response.data, {'message': 'email: This field is required.'
                                                    ',password: This field is required.,'
                                                    'confirm_password: This field is required.', 'code': 400})
    def test_empty_email(self):
        response = self.client.post(self.url, data={"password":"96239623", "confirm_password":"96239623"})
        self.assertEqual(response.data, {'message': 'email: This field is required.', 'code': 400})

    def test_different_passwords(self):
        response = self.client.post(self.url, data={"password": "96239623", "confirm_password": "9623962", "email":"a@gmail.com"})
        self.assertEqual(response.data, {"message": "password: passwords not match", "code": 400})

    def test_create_user_valid_data(self):
        response = self.client.post(self.url, data=self.validate_data)
        self.assertEqual(response.status_code, 201)
        user_in_db = User.objects.filter(email=self.validate_data["email"]).first()
        self.assertIsNotNone(user_in_db)

        access = response.cookies["access"]
        refresh = response.cookies["refresh"]

        self.assert_valid_cookie(access, 300)
        self.assert_valid_cookie(refresh, 86400)

        user_with_token = self.assert_token_user(access.value)
        self.assertEqual(user_with_token, user_in_db)

    def test_create_user_with_fake_token(self):
        self.client.cookies["access"] = 'lasdfjalsfjsfldjaflsfjalsfkjsdlfjsdflsajf'
        self.client.cookies["refresh"] = 'alsdkfjasldfkjsldfkjaslfjalsfjdlsfjjfsdfj'
        response = self.client.post(self.url, data=self.validate_data)
        self.assertEqual(response.status_code, 201)

        user_in_db = User.objects.filter(email=self.validate_data["email"]).first()
        self.assertIsNotNone(user_in_db)

        access = response.cookies["access"]
        refresh = response.cookies["refresh"]

        self.assert_valid_cookie(access, 300)
        self.assert_valid_cookie(refresh, 86400)

        user_with_token = self.assert_token_user(access.value)
        self.assertTrue(user_with_token, user_in_db)











