from unittest import getTestCaseNames

from rest_framework import serializers

from chat_manager.models import Conversation, ChannelIdentity, Message


class ConversationSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    last_channel = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_direction = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'avatar', 'last_channel', 'last_message', 'last_direction', 'name']

    def _get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return last_message
        return None

    def get_name(self, obj):
        query = ChannelIdentity.objects.filter(external_id=obj.contact_id).first()
        if query and hasattr(query, 'contact'):
            return getattr(query.contact, 'name', None)
        return 'get this field from service_account'

    def get_last_channel(self, obj):
        last_message = self._get_last_message(obj)
        if last_message:
            return getattr(last_message.service_account, "service_type", None)
        return None

    def get_last_message(self, obj):
        last_message = self._get_last_message(obj)
        if last_message:
            return getattr(last_message, 'body', None)
        return None

    def get_last_direction(self, obj):
        last_message = self._get_last_message(obj)
        if last_message:
            return getattr(last_message, 'direction', None)
        return None

    def get_avatar(self, obj):
        query = ChannelIdentity.objects.filter(external_id=obj.contact_id).first()
        if query and hasattr(query, 'contact'):
            return getattr(query.contact, 'avatar_url', None)
        return None


class MessageSerializer(serializers.ModelSerializer):
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'body', 'is_me', 'created_at', 'updated_at']

    def get_is_me(self, obj):
        user = self.context.get('user')
        return user == obj.sender
