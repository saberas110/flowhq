from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from polymorphic.models import PolymorphicModel



from chat_manager.managers.conversation import ConversationQuerySet
from chat_manager.managers.messages import MessageManager, MessageQuerySet

User  = get_user_model()

class CreatedAtMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        abstract = True

class UpdatedAtMixin(models.Model):
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        abstract = True


class CrUpDateMixin(CreatedAtMixin, UpdatedAtMixin):
    """
    inherits from CreatedAtMixin and UpdatedAtMixin
    """
    class Meta:
        abstract = True



class Organization(models.Model):
    name = models.CharField(max_length=150, default='default')
    owner = models.ManyToManyField(User, related_name='organizations')

    def __str__(self):
        return self.name


# Choices for service account type (generates TypeScript enum)
SERVICE_ACCOUNT_TYPE_CHOICES = [
    ('email', 'Email'),
    ('whatsapp', 'WhatsApp'),
]


class ServiceAccount(PolymorphicModel, CreatedAtMixin):
    organization = models.ForeignKey(Organization, models.CASCADE, related_name='services')
    display_name = models.CharField(max_length=150, blank=True)
    webhook_url = models.URLField(blank=True)
    token_expired_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    service_type = models.CharField(max_length=20, choices=SERVICE_ACCOUNT_TYPE_CHOICES, blank=True)


    def __str__(self):
        return f'{self.__class__.__name__} {self.organization.name}'

    def save(self, *args, **kwargs):
        # Auto-set service_type based on child class
        if not self.service_type:
            types = {
                'WhatsAppAccount': 'whatsapp',
                'GmailAccounts': 'email'
            }
            self.service_type = types.get(type(self).__name__, '')
        super().save(*args, **kwargs)




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



class Conversation(CrUpDateMixin):
    organization = models.ForeignKey(Organization, models.CASCADE, related_name='conversations',  blank=True, null=True)
    title = models.CharField(max_length=100, null=True, blank=True)
    contact_user_id = models.CharField(max_length=255, null=True, blank=True)
    contact = models.ForeignKey('ChannelIdentity', on_delete=models.CASCADE, related_name='conversations', null=True, blank=True)

    objects = ConversationQuerySet.as_manager()


    @property
    def last_message(self):
        """last message from catch"""
        last_messages = getattr(self, '_cached_last_message', None)
        if last_messages is not None :
            return last_messages[0] if last_messages else None

        return self.messages.order_by('-created_at').first()


    @property
    def all_messages(self):
        """all messages from catch"""
        messages = getattr(self, '_cached_messages', None)
        if messages is not None:
            return messages

        return self.messages.all()

    @property
    def primary_identity(self):
        """
        ✅ اولین identity
        """
        identities = self.identities
        if isinstance(identities, list):
            return identities[0] if identities else None
        return identities.first() if identities else None

    def get_display_name(self):
        if self.contact:
            return self.contact.get_display_name()
        return self.title or ""

    def get_avatar(self):
        pass

    def get_tags(self):
        if self.contact:
            tags = getattr(self.contact, '_cached_tags', None)
            if tags is not None:
                return tags
            return self.contact.tags.all()
        return []




    def get_last_message(self):
        return self.messages.order_by('-created_at').first()

    def get_last_message_preview(self):
        last = self.get_last_message()
        if not last:
            return None
        preview = {
            'text': last.text[:50] if last.text else '',
            'created_at': last.created_at,
            'sender': last.sender,
            'service': last.get_service_type(),
            'service_icon': last.get_service_icon()
        }
        return preview

    # def get_unread_count(self):
    #     return self.messages.filter(
    #         direction='in',
    #         status__in=['received', 'delivered']
    #     ).exclude(status='read').count()
    #
    # def get_unread_count(self):
    #     """
    #     ✅ تعداد پیام‌های خوانده نشده
    #     """
    #     # اگر از annotate استفاده شده باشد
    #     if hasattr(self, 'unread_messages'):
    #         return self.unread_messages
    #
    #     # Fallback
    #     return self.messages.filter(
    #         direction='in',
    #         status__in=['received', 'delivered']
    #     ).exclude(status='read').count()
    #
    # def get_service_accounts(self):
    #     """
    #     ✅ لیست ServiceAccount های موجود (برای dropdown)
    #     """
    #     if not self.contact:
    #         return []
    #
    #     identities = self.identities
    #     service_accounts = []
    #
    #     for identity in identities:
    #         if identity.service_account:
    #             service_accounts.append({
    #                 'id': identity.service_account.id,
    #                 'type': identity.service_account.get_service_type(),
    #                 'display_name': identity.service_account.display_name,
    #                 'icon': identity.service_account.get_service_icon(),
    #                 'channel': identity.channel,
    #                 'external_id': identity.external_id,
    #             })
    #
    #     return service_accounts
    #
    # def mark_all_as_read(self):
    #     """
    #     ✅ علامت‌گذاری همه پیام‌ها به عنوان خوانده شده
    #     """
    #     return self.messages.filter(
    #         direction='in'
    #     ).exclude(status='read').update(status='read')

    def __str__(self):
        return f'{self.get_display_name()} - {self.id}'







class Message(PolymorphicModel, CrUpDateMixin):


    objects = MessageManager.from_queryset(MessageQuerySet)()


    MESSAGE_STATUS = [
        ('pending', 'Pending'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
        ('received', 'Received'),
    ]

    MESSAGE_TYPES = [
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
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

    sender = models.CharField(max_length=255, blank=True)
    direction = models.CharField(max_length= 10 , choices=[('in', 'Inbound'), ('out', 'Outbound')], blank=True)
    status = models.CharField(max_length=20, choices=MESSAGE_STATUS, default='pending')
    sent_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)
    text = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True, null=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE
                                     , related_name='messages', null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
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

    def get_service_type(self):
        """return service type """
        types = {
            'EmailMessage': 'email',
            'WhatsAppMessage': 'whatsapp',
        }
        class_name = type(self).__name__
        return types.get(class_name, 'message')

    def get_service_icon(self):
        service_icons = {
            'email': '📧',
            'whatsapp': '💬',
            'message': '📨'
        }
        return service_icons.get(self.get_service_type(), '📨')




    def __str__(self):
        return (f' with{self.conversation} '
                f' sender : {self.sender}')


class EmailMessage(Message):
    service_account = models.ForeignKey(GmailAccounts, models.CASCADE, null=True, related_name='emails')
    subject = models.CharField()
    from_email = models.EmailField()
    to_email = models.EmailField()
    cc_email = models.JSONField(default=list, blank=True)
    bcc = models.JSONField(default=list, blank=True)
    reply_to = models.EmailField(null=True, blank=True)
    email_message_id = models.CharField(max_length=500, unique=True, null=True, blank=True)
    email_thread_id = models.CharField(max_length=500, null=True, blank=True)
    html_body = models.TextField( blank=True)
    has_attachments = models.BooleanField(default=False)
    labels = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = 'Email Message'
        ordering = ['created_at']
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


# class MessageReadStatus(CreatedAtMixin):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reads')
#     message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='message_reads')



class Contact(CrUpDateMixin):
    name = models.CharField(max_length=100, null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    tags = models.ManyToManyField('ContactTag', blank=True)

    def __str__(self):
        return self.name or None


class ChannelIdentity(CrUpDateMixin):
    CHANNEL_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("email", "Email"),
    ]
    contact = models.ForeignKey(Contact, models.CASCADE, "identities")
    service_account = models.ForeignKey(ServiceAccount, models.CASCADE, "identities")
    organization = models.ForeignKey(Organization, models.CASCADE, "identities", null=True)
    external_id = models.CharField(max_length=255, db_index=True)
    channel = models.CharField(max_length=25, choices=CHANNEL_CHOICES)

    class Meta:
        unique_together = ('channel', 'service_account', 'external_id')

    def __str__(self):
        return f"{self.channel}--:{self.external_id}"


class ContactTag(CrUpDateMixin):
    service_account = models.ForeignKey(ServiceAccount, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=20, default='#cccccc')

    class Meta:
        unique_together = ('service_account', 'name')

    def __str__(self):
        return self.name




















