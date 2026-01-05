from unittest import getTestCaseNames
from django.db.models import manager
from drf_spectacular.utils import PolymorphicProxySerializer, extend_schema_field
from pyasn1.type import tag
from rest_framework import serializers

from chat_manager.models import Conversation, ChannelIdentity, Message, WhatsAppMessage, EmailMessage






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




class EmailServiceAccountSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()  # 'email'
    display_name = serializers.CharField()
    email = serializers.CharField()
    icon = serializers.CharField()


class WhatsAppServiceAccountSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()  # 'whatsapp'
    display_name = serializers.CharField()
    phone_number = serializers.CharField()
    icon = serializers.CharField()






class EmailMessageSerializer(BaseMessageSerializer):
    """
    ✅ Serializer برای EmailMessage
    """
    service_account = serializers.SerializerMethodField()
    html_body = serializers.CharField(required=True, allow_blank=True)

    class Meta(BaseMessageSerializer.Meta):
        model = EmailMessage
        fields = BaseMessageSerializer.Meta.fields + [
            'subject', 'from_email', 'to_email', 'cc_email', 'bcc',
            'reply_to', 'html_body', 'has_attachments', 'labels',
            'email_message_id', 'email_thread_id',
            'service_account'
        ]
        read_only_fields = list(BaseMessageSerializer.Meta.read_only_fields) + [
            'has_attachments', 'labels',
            'email_message_id', 'email_thread_id',
            'service_account', 'to_email'
        ]

    @extend_schema_field(EmailServiceAccountSerializer)
    def get_service_account(self, obj):

        """
        ✅ اطلاعات ServiceAccount
        """
        if obj.service_account:
            return {
                'id': obj.service_account.id,
                'type': 'email',
                'display_name': obj.service_account.display_name,
                'email': obj.service_account.email,
                'icon': '📧'
            }
        return None

@extend_schema_field(WhatsAppServiceAccountSerializer)
class WhatsAppMessageSerializer(BaseMessageSerializer):
    """
    ✅ Serializer برای WhatsAppMessage
    """
    service_account = serializers.SerializerMethodField()
    is_media = serializers.BooleanField(source='is_media_message', read_only=True)

    class Meta(BaseMessageSerializer.Meta):
        model = WhatsAppMessage
        fields = BaseMessageSerializer.Meta.fields + [
            'from_number', 'to_number',
            'media_url', 'media_id', 'mime_type', 'caption',
            'template_name', 'template_language', 'template_parameters',
            'wa_message_id', 'wa_status', 'is_media',
            'service_account'
        ]
        read_only_fields = list(BaseMessageSerializer.Meta.read_only_fields) + [
            'wa_message_id', 'wa_status', 'is_media',
            'service_account'
        ]

    def get_service_account(self, obj):
        """
        ✅ اطلاعات ServiceAccount
        """
        if obj.whatsapp_account:
            return {
                'id': obj.whatsapp_account.id,
                'type': 'whatsapp',
                'display_name': obj.whatsapp_account.display_name,
                'phone_number': obj.whatsapp_account.phone_number,
                'icon': '💬'
            }
        return None


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
                'name': obj.contact_user_id ,
                'avatar': '',
                'tags': None
            }

        tags = getattr(obj.contact, '_cached_tags', None)
        if tags is None:
            tags = obj.contact.tags.all()

        return {
            'id': obj.contact.id,
            'name': obj.contact.name or '',
            'avatar': '',
            'tags': [
                {'id': tag.id, 'name': tag.name or '', 'color': tag.colort}
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
        """
            ✅ لیست ServiceAccount های موجود (برای dropdown ارسال پیام)
            Format:
            [
                {class LastMessageSerializer(serializers.Serializer):
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
                'name': obj.contact_user_id ,
                'avatar': '',
                'tags': None
            }

        tags = getattr(obj.contact, '_cached_tags', None)
        if tags is None:
            tags = obj.contact.tags.all()

        return {
            'id': obj.contact.id,
            'name': obj.contact.name or '',
            'avatar': '',
            'tags': [
                {'id': tag.id, 'name': tag.name or '', 'color': tag.colort}
                for tag in tags
            ]
        }
    @extend_schema_field(LastMessageSerializer)  
    def get_last_message(self, obj):
        last_msg = obj.last_message
        if not last_msg:
             return None

        return LastMessageSerializer(last_msg).data
                    'id': 1,
                    'type': 'email',
                    'display_name': 'پشتیبانی',
                    'icon': '📧',
                    'channel': 'email',
                    'external_id': 'support@company.com'
                },
            ]
            """
        return obj.get_service_account()

    # def get_contact(self, obj):
    #     if obj.contact:
    #         return obj.contact
    #
    #     return obj.contact_user_id if obj.contact_user_id else None



    @extend_schema_field(PolymorphicProxySerializer(
        component_name='Message',
        serializers=[EmailMessageSerializer, 
        WhatsAppMessageSerializer, BaseMessageSerializer],
        resource_type_field_name='channel',
        many=True
    ))
    def get_messages(self, obj):
        messages = obj.messages.all()
        return PolymorphicMessageSerializer(
            messages,
            many=True,
            context=self.context
        ).data


