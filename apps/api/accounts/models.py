from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from datetime import timezone, datetime
from .managers import UserManager

class User(AbstractBaseUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=datetime.now())

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()


    def has_perm(self,perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin


    def __str__(self):
        return self.email

