from django.contrib.auth import get_user_model
from django.utils import timezone
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
    organization = models.ForeignKey(Organization, models.CASCADE, related_name='services')
    display_name = models.CharField(max_length=150, blank=True)
    webhook_url = models.URLField(blank=True)
    token_expired_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)



    def __str__(self):
        return f'{self.__class__.__name__} {self.organization.name}'


class WhatsAppAccount(ServiceAccount):
    phone_number = models.CharField(max_length=20)
    phone_number_id = models.CharField(max_length=40, unique=True)
    access_token = models.TextField()
    business_account_id = models.CharField(max_length=40, blank=True)

    class Meta:
        verbose_name = 'WhatsApp Account'


class GmailAccounts(ServiceAccount):
    email = models.EmailField(unique=True)
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_uri = models.CharField(max_length=500)
    watch_expiration = models.DateTimeField(null=True, blank=True)
    history_id = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        verbose_name = 'Gmail Account'

    def is_token_expired(self):
        from django.utils import timezone
        return self.token_expired_at and self.token_expired_at < timezone.now()

    def is_watch_expired(self):
        from django.utils import timezone
        return self.watch_expiration and self.watch_expiration < timezone.now()



class Conversation(CreatedAtMixin, UpdatedAtMixin):
    organization = models.ForeignKey(Organization, models.CASCADE, related_name='conversations',  blank=True, null=True)
    contact_id = models.CharField(max_length=255)
    title = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f'{self.contact_id}--'


class Message(CreatedAtMixin, UpdatedAtMixin):
    MESSAGE_STATUS = [
        ('pending', 'Pending'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
        ('received', 'Received'),
    ]
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=255, blank=True)
    direction = models.CharField(max_length= 10 , choices=[('in', 'Inbound'), ('out', 'Outbound')])
    status = models.CharField(max_length=20, choices=MESSAGE_STATUS, default='pending')
    sent_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    error_message = models.TextField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)

    metadata = models.JSONField(default=dict, blank=True, null=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=[ 'created_at']),
        ]

    def mark_as_sent(self):
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])

    def mark_as_failed(self, error):
        self.status = 'failed'
        self.error_message = str(error)
        self.retry_count += 1
        self.save(update_fields=['status', 'error_message', 'retry_count'])

    def __str__(self):
        return (f'{self.body}  ---  with{self.conversation} '
                f' sender : {self.sender}')


class EmailMessage(Message):

    service_account = models.ForeignKey(GmailAccounts, models.CASCADE, null=True, related_name='emails')
    subject = models.CharField()
    from_email = models.EmailField()
    to_email = models.EmailField()
    cc_email = models.JSONField(default=list, blank=True)
    bcc = models.JSONField(default=list, blank=True)
    reply_to = models.EmailField(null=True, blank=True)
    gmail_message_id = models.CharField(max_length=500, unique=True, null=True, blank=True)
    gmail_thread_id = models.CharField(max_length=500, null=True, blank=True)
    html_body = models.TextField(blank=True)
    has_attachments = models.BooleanField(default=False)
    labels = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = 'Email Message'
        verbose_name_plural = 'Email Messages'

    def __str__(self):
        return f'{self.subject} - {self.from_email} - {self.to_email}'

    def add_labels(self, label):
        if label not in self.labels:
            self.labels.append(label)
            self.save(update_fields=['labels'])

    def is_reply(self):
        return self.gmail_thread_id is not None


class WhatsAppMessage(Message):
    """پیام واتساپ"""

    whatsapp_account = models.ForeignKey(
        'WhatsAppAccount',
        on_delete=models.SET_NULL,
        null=True,
        related_name='messages'
    )

    # اطلاعات واتساپ
    wa_message_id = models.CharField(max_length=200, unique=True, null=True, blank=True)
    from_number = models.CharField(max_length=20)
    to_number = models.CharField(max_length=20)

    # نوع پیام
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
        ('location', 'Location'),
        ('contact', 'Contact'),
        ('template', 'Template'),
    ]
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')

    # رسانه
    media_url = models.URLField(null=True, blank=True)
    media_id = models.CharField(max_length=200, null=True, blank=True)
    mime_type = models.CharField(max_length=100, null=True, blank=True)
    caption = models.TextField(null=True, blank=True)

    # Template (برای پیام‌های تبلیغاتی)
    template_name = models.CharField(max_length=100, null=True, blank=True)
    template_language = models.CharField(max_length=10, default='fa', null=True, blank=True)
    template_parameters = models.JSONField(default=list, blank=True)

    # وضعیت تحویل واتساپ
    wa_status = models.CharField(max_length=20, null=True, blank=True)  # sent, delivered, read, failed

    class Meta:
        verbose_name = 'WhatsApp Message'
        verbose_name_plural = 'WhatsApp Messages'
    def __str__(self):
        return f'{self.message_type} to {self.to_number}'

    def is_media_message(self):
        return self.message_type in ['image', 'video', 'audio', 'document']


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




















