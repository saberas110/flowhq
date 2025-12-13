from django.contrib.auth import get_user_model
from rest_framework import serializers
from twisted.python.util import raises

User = get_user_model()

from rest_framework.serializers import ErrorDetail

class UserRegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        fields = ["first_name", "last_name", "email", "password", "confirm_password"]
        model = User


    def create(self, validated_data):
        password = validated_data["confirm_password"]
        del validated_data ["password"]
        del validated_data["confirm_password"]
        user, created = User.objects.get_or_create(**validated_data)
        user.set_password(password)
        user.save()
        return user


    def validate(self, data):
        if len(data["password"]) < 8 :
            raise serializers.ValidationError({"password":"password must be more than 8 character"})

        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password":"passwords not match"})
        return data


class UserLoginSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    class Meta:
        fields = ["email", "password"]
        model = User

    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs["email"])
            if not user.check_password(attrs["password"]):
                raise serializers.ValidationError({"password":"password is wrong."})
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError({"user":"user does not exists."})
