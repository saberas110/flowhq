from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password):
        if not email:
            raise ValueError('user must have email')
        user = self.model(email=email)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, password, email):
        user = self.create_user(email, password)
        user.email = self.normalize_email(email)
        user.is_admin = True
        user.save(using=self._db)
        return user
