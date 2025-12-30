from unittest import getTestCaseNames

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
    # created_at = serializers.SerializerMethodField()
    # updated_at = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'text', 'sender', 'direction', 'status',
            'created_at', 'updated_at', 'sent_at',
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
    service_account = serializers.SerializerMethodField()

    class Meta(BaseMessageSerializer.Meta):
        model = EmailMessage
        fields = BaseMessageSerializer.Meta.fields + [
            'subject', 'from_email', 'to_email', 'cc_email', 'bcc',
            'reply_to', 'html_body', 'has_attachments', 'labels',
            'email_message_id', 'email_thread_id',
            'service_account'
        ]

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


class WhatsAppMessageSerializer(BaseMessageSerializer):
    """
    ✅ Serializer برای WhatsAppMessage
    """
    service_account = serializers.SerializerMethodField()
    is_media = serializers.BooleanField(source='is_media_message', read_only=True)

    class Meta(BaseMessageSerializer.Meta):
        model = WhatsAppMessage
        fields = BaseMessageSerializer.Meta.fields + [
            'from_number', 'to_number', 'message_type',
            'media_url', 'media_id', 'mime_type', 'caption',
            'template_name', 'template_language', 'template_parameters',
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



class ConversationSerializer(serializers.ModelSerializer):
    contact = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'last_message', 'contact']


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

    def get_last_message(self, obj):
        last_msg = obj.last_message
        if not last_msg: return None

        return {
            'id': last_msg.id,
            'text': last_msg.text[:30] if last_msg and last_msg.text else "",
            'created_at': last_msg.created_at.isoformat()[-10:],   # will be check
            'sender': last_msg.sender,
            'direction': last_msg.direction,
            'status': last_msg.status,
            # 'status_icon': last_msg.get_status_icon(),
            'channel': last_msg.get_service_type(),
            'service_icon': last_msg.get_service_icon(),
        }


class MessageSerializer(serializers.ModelSerializer):
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'text', 'is_me', 'created_at', 'updated_at']

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
                {
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


    def get_messages(self, obj):
        messages = obj.messages.all()
        return PolymorphicMessageSerializer(
            messages,
            many=True,
            context=self.context
        ).data


