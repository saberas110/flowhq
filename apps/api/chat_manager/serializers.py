from asyncio import FastChildWatcher
import email
from unittest import getTestCaseNames
from django.db.models import manager
from drf_spectacular.utils import extend_schema_field, PolymorphicProxySerializer
from pyasn1.type import tag
from rest_framework import serializers

from chat_manager.models import (
    Conversation, ChannelIdentity, EmailAccount, GmailAccounts, Message, 
    ServiceAccount, WhatsAppAccount, WhatsAppMessage, EmailMessage,
    SERVICE_ACCOUNT_TYPE_CHOICES
)









class BaseMessageSerializer(serializers.ModelSerializer):
    """
    Serializer پایه برای Message
    """
    service_type = serializers.CharField(source='get_service_type', read_only=True)
    service_icon = serializers.CharField(source='get_service_icon', read_only=True)
    is_me = serializers.SerializerMethodField()


    class Meta:
        model = Message
        fields = [
            'id', 'text', 'sender', 'direction', 'status',
            'created_at', 'updated_at', 'sent_at',
            'service_type', 'service_icon', 'is_me', 'message_type'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'sent_at',
            'service_type', 'service_icon', 'is_me'
        ]

    def get_is_me(self, obj):
        """
        ✅ چک می‌کند پیام از سمت ما ارسال شده (out) یا دریافت شده (in)
        """
        return obj.direction == 'out'




class EmailMessageSerializer(BaseMessageSerializer):
    """
    ✅ Serializer برای EmailMessage
    """
    service_account_id = serializers.IntegerField(write_only=True, required=True)
    html_body = serializers.CharField(required=True, allow_blank=True)

    class Meta(BaseMessageSerializer.Meta):
        model = EmailMessage
        fields = BaseMessageSerializer.Meta.fields + [
            'subject', 'from_email', 'to_email', 'cc_email', 'bcc',
            'reply_to', 'html_body', 'has_attachments', 'labels',
            'email_message_id', 'email_thread_id',
            'service_account_id'
        ]
        read_only_fields = list(BaseMessageSerializer.Meta.read_only_fields) + [
            'has_attachments', 'labels',
            'email_message_id', 'email_thread_id', 'to_email'
        ]

    

class WhatsAppMessageSerializer(BaseMessageSerializer):
    """
    ✅ Serializer برای WhatsAppMessage
    """
    service_account_id = serializers.IntegerField(write_only=True, required=True)
    is_media = serializers.BooleanField(source='is_media_message', read_only=True)
    filename = serializers.CharField(required=False)
    file = serializers.FileField(write_only=True, required=False)
    class Meta(BaseMessageSerializer.Meta):
        model = WhatsAppMessage
        fields = BaseMessageSerializer.Meta.fields + [
            'from_number', 'to_number','media_type', 'file', 
            'media_url', 'media_id', 'mime_type', 'caption',
            'template_name', 'template_language', 'template_parameters',
            'wa_message_id', 'wa_status', 'is_media',
            'service_account_id', 'filename'
        ]
        read_only_fields = list(BaseMessageSerializer.Meta.read_only_fields) + [
            'from_number', 'to_number',
            'media_id', 'mime_type',
            'template_name', 'template_language', 'template_parameters',
            'wa_message_id', 'wa_status', 'is_media',
        ]

    


class PolymorphicMessageSerializer(serializers.Serializer):

    def to_representation(self, instance):
        types = {
            'EmailMessage': EmailMessageSerializer,
            'WhatsAppMessage': WhatsAppMessageSerializer,
        }
        class_name = type(instance).__name__
        if class_name in types:
            return types[class_name](instance, context = self.context).data

        return BaseMessageSerializer(instance, context = self.context).data


class LastMessageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()
    created_at = serializers.DateTimeField()
    sender = serializers.CharField()
    direction = serializers.CharField()
    status = serializers.CharField()
    service_type = serializers.CharField(source='get_service_type', read_only=True)
    service_icon = serializers.CharField(source='get_service_icon', read_only=True)


class TagSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    color = serializers.CharField()

class ContactSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    avatar = serializers.CharField()
    tags = TagSerializer(many=True, allow_null=True)

class ConversationSerializer(serializers.ModelSerializer):
    contact = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'last_message', 'contact']

    @extend_schema_field(ContactSerializer)  # 👈 Add this decorator
    def get_contact(self, obj):
        if not obj.contact:
            return {
                'id': obj.contact_user_id,
                'name': obj.contact_user_id,
                'avatar': '',
                'tags': None
            }

        contact = obj.contact

        tags = getattr(contact, '_cached_tags', None)
        if tags is None:
            tags = contact.tags.all()

        return {
            'id': contact.id,
            'name': contact.name or '',
            'avatar': contact.avatar_url or '',
            'tags': [
                {'id': tag.id, 'name': tag.name or '', 'color': tag.color}
                for tag in tags
            ]
        }
    @extend_schema_field(LastMessageSerializer)  
    def get_last_message(self, obj):
        last_msg = obj.last_message
        if not last_msg:
             return None

        return LastMessageSerializer(last_msg).data




class MessageSerializer(serializers.ModelSerializer):
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'text', 'is_me', 'created_at', 'updated_at']

    @extend_schema_field(bool)
    def get_is_me(self, obj):
        user = self.context.get('user')
        return user == obj.sender


class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['messages', ]

    def get_service_type(self, obj):
        return obj.get_service_account()

    @extend_schema_field(PolymorphicProxySerializer(
        component_name='Message',
        serializers=[EmailMessageSerializer, WhatsAppMessageSerializer, BaseMessageSerializer],
        resource_type_field_name=None,
        many=True
    ))
    def get_messages(self, obj):
        messages = obj.messages.all()
        return PolymorphicMessageSerializer(
            messages,
            many=True,
            context=self.context
        ).data

class BaseServiceAccountSerializer(serializers.ModelSerializer):
    service_type = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceAccount
        fields = ['id', 'service_type', 'display_name', 'icon']
        read_only_fields = ['id', 'service_type']
    
    @extend_schema_field(serializers.ChoiceField(choices=SERVICE_ACCOUNT_TYPE_CHOICES))
    def get_service_type(self, obj):

        if obj.service_type:
            return obj.service_type
        types = {
            'WhatsAppAccount': 'whatsapp',
            'GmailAccounts': 'email'
        }
        return types.get(type(obj).__name__, 'service')
    
    def get_icon(self, obj):
        return '📧' if hasattr(obj, 'email') else '💬'


# 2. Email service account (inherits from Base)
class EmailServiceAccountSerializer(BaseServiceAccountSerializer):
    class Meta(BaseServiceAccountSerializer.Meta):
        model = GmailAccounts  # Use the child model
        fields = BaseServiceAccountSerializer.Meta.fields + ['email']


# 3. WhatsApp service account (inherits from Base)
class WhatsAppServiceAccountSerializer(BaseServiceAccountSerializer):
    class Meta(BaseServiceAccountSerializer.Meta):
        model = WhatsAppAccount  # Use the child model
        fields = BaseServiceAccountSerializer.Meta.fields + ['phone_number']

class PolymorphicServiceAccountSerializer(serializers.Serializer):
    def to_representation(self, instance):
        service_types = {
            'EmailAccount' : EmailServiceAccountSerializer,
            'WhatsAppAccount' : WhatsAppServiceAccountSerializer,

        }

        class_name = type(instance).__name__
        if class_name in service_types:
            return service_types[class_name](instance, context = self.context).data

        return BaseServiceAccountSerializer(instance, context = self.context).data


ServiceAccountSchema = PolymorphicProxySerializer(
    component_name = 'ServiceAccount',
    serializers=[
        EmailServiceAccountSerializer,
        WhatsAppServiceAccountSerializer,
        BaseServiceAccountSerializer,
    ],
    resource_type_field_name=None
)







class ConnectEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    app_password = serializers.CharField(min_length=8, write_only=True)
    provider = serializers.ChoiceField(
        choices=[
            ('gmail', 'Gmail'),
            ('outlook', 'Outlook/Office 365'),
            ('yahoo', 'Yahoo Mail'),
            ('custom', 'Custom IMAP/SMTP'),
        ]
    )

    imap_host = serializers.CharField(required=False, allow_blank=True)
    imap_port = serializers.IntegerField(required=False, default=993)
    smtp_host = serializers.CharField(required=False, allow_blank=True)
    smtp_port = serializers.IntegerField(required=False, default=587)
    folder = serializers.CharField(required=False, default='INBOX')


    def validate_email(self, value):
        if EmailAccount.objects.filter(email=value).exists():
            raise serializers.ValidationError({'email': 'this email already exist'})
        
        return value


    def validate(self, data):
        provider = data.get('provider')

        if provider == 'custom':
            if not data.get('imap_host'):
                raise serializers.ValidationError({'imap_host': 'for custom provider the IMAP host must be existting'})

            if not data.get('smtp_host'):
                raise serializers.ValidationError({
                    'smtp_host': "for custom provider the SMTP host must be existting"
                })

        return data