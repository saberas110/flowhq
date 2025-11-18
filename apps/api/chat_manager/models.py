from django.contrib.auth import get_user_model
from django.db import models


User  = get_user_model()


class CreatedAtMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True



class UpdatedAtMixin(models.Model):
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Organization(models.Model):
    name = models.CharField(max_length=150)
    owner = models.ManyToManyField(User, related_name='organizations')

    def __str__(self):
        return self.name


class ServiceAccount(CreatedAtMixin):
    SERVICE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('gmail', 'Gmail'),
    ]

    organization = models.ForeignKey(Organization, models.CASCADE, related_name='services')
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    display_name = models.CharField(max_length=150, blank=True)
    access_token = models.TextField(blank=True)
    refresh_token = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    phone_number_id = models.CharField(max_length=40, blank=True)
    webhook_url = models.URLField(blank=True)
    token_expired_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        if self.service_type and self.organization.name:
            return f'{self.service_type}--{self.organization.name}'
        return None


class Conversation(CreatedAtMixin, UpdatedAtMixin):
    service_account = models.ForeignKey(ServiceAccount, models.CASCADE, related_name='conversations')
    contact_id = models.CharField(max_length=255)
    title = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f'{self.contact_id}--{self.service_account.phone_number}'


class Message(CreatedAtMixin, UpdatedAtMixin):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=255, blank=True)
    service_account = models.ForeignKey(ServiceAccount, models.CASCADE)
    direction = models.CharField(max_length= 10 , choices=[('in', 'Inbound'), ('out', 'Outbound')])
    body = models.TextField()
    message_type = models.CharField(max_length=20, default='text')

    def __str__(self):
        return (f'{self.body}  ---  with{self.conversation} '
                f'service_type: {self.service_account.service_type} -----sender : {self.sender}')


class MessageReadStatus(CreatedAtMixin):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reads')
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='message_reads')



class Contact(CreatedAtMixin, UpdatedAtMixin):
    name = models.CharField(max_length=100, null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    tags = models.ManyToManyField('ContactTag', blank=True)

    def __str__(self):
        return self.name or None


class ChannelIdentity(CreatedAtMixin, UpdatedAtMixin):
    CHANNEL_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("email", "Email"),
    ]
    contact = models.ForeignKey(Contact, models.CASCADE, "identities")
    service_account = models.ForeignKey(ServiceAccount, models.CASCADE, "identities")
    external_id = models.CharField(max_length=255, db_index=True)
    channel = models.CharField(max_length=25, choices=CHANNEL_CHOICES)

    class Meta:
        unique_together = ('channel', 'service_account', 'external_id')

    def __str__(self):
        return f"{self.channel}--:{self.external_id}"


class ContactTag(CreatedAtMixin, UpdatedAtMixin):
    service_account = models.ForeignKey(ServiceAccount, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=20, default='#cccccc')

    class Meta:
        unique_together = ('service_account', 'name')

    def __str__(self):
        return self.name




















