import logging

from django.utils import timezone
from rest_framework.response import Response

from chat_manager.evolution.evolution_service import get_evolution_service
from chat_manager.models import (
    ChannelIdentity, Contact, Conversation,
    WhatsAppAccount, WhatsAppMessage
)


logger = logging.getLogger(__name__)


class EvolutionWebHookService:

    def __init__(self, instance, data) -> None:
        self.instance = instance
        self.data = data

    def handle_connection(self):
        """Connection status changed (open/close)"""
        state = self.data.get('state')
        logger.info(f'📱 Connection: {self.instance} -> {state}')

        try:
            account = WhatsAppAccount.objects.get(instance_name=self.instance)

            if state == 'open':
                service = get_evolution_service(self.instance)
                info = service.get_instance_info()

                account.is_connected = True
                account.connected_at = timezone.now()
                account.jid = info.get('ownerJid', '')
                account.push_name = info.get('profileName', '')
                account.profile_picture_url = info.get('profilePicUrl', '')
                account.phone_number = info.get('ownerJid', '').replace('@s.whatsapp.net', '')
                account.save()
                logger.info(f'✅ WhatsApp connected: {account.push_name} ({account.phone_number})')

            elif state == 'close':
                account.is_connected = False
                account.save(update_fields=['is_connected'])
                logger.info(f'❌ WhatsApp disconnected: {self.instance}')

        except WhatsAppAccount.DoesNotExist:
            logger.warning(f'❌ WhatsApp account not found: {self.instance}')

        return Response({'status': 'ok', 'state': state})

    def handle_message(self):
        """New message received or sent"""

        # Debug: print raw data to see structure
        print(f'📦 Raw webhook data keys: {list(self.data.keys()) if isinstance(self.data, dict) else type(self.data)}')
        print(f'📦 Raw webhook data: {str(self.data)[:500]}')

        try:
            account = WhatsAppAccount.objects.get(instance_name=self.instance)
        except WhatsAppAccount.DoesNotExist:
            logger.warning(f'❌ WhatsApp account not found: {self.instance}')
            return Response({'status': 'error', 'message': 'WhatsApp account not found'}, status=400)

        # Evolution v2.3.7 sends single message object, not array
        if isinstance(self.data, dict) and 'key' in self.data:
            messages = [self.data]
        else:
            messages = self.data.get('messages', [])

        for msg in messages:
            key = msg.get('key', {})
            message_id = key.get('id')
            remote_jid = key.get('remoteJid', '')
            from_me = key.get('fromMe', False)

            if WhatsAppMessage.objects.filter(wa_message_id=message_id).exists():
                continue

            message_content = msg.get('message', {})
            if isinstance(message_content, dict):
                text = (
                    message_content.get('conversation') or
                    message_content.get('extendedTextMessage', {}).get('text', '')
                    if isinstance(message_content.get('extendedTextMessage'), dict)
                    else ''
                )
            else:
                text = ''

            msg_type = msg.get('messageType', 'text')
            phone = remote_jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
            push_name = msg.get('pushName', '')

            context_info = (
                message_content.get('extendedTextMessage', {}).get('contextInfo', {})
                if isinstance(message_content, dict) else {}
            )
            quoted_id = context_info.get('stanzaId') if isinstance(context_info, dict) else None

            contact, _ = Contact.objects.get_or_create(
                name=push_name or phone,
                defaults={'avatar_url': None}
            )

            identity, _ = ChannelIdentity.objects.get_or_create(
                channel='whatsapp',
                service_account=account,
                external_id=remote_jid,
                defaults={
                    'contact': contact,
                    'organization': account.organization,
                }
            )

            conversation, _ = Conversation.objects.get_or_create(
                contact=identity,
                organization=account.organization,
                defaults={'title': push_name or phone}
            )

            WhatsAppMessage.objects.create(
                whatsapp_account=account,
                conversation=conversation,
                wa_message_id=message_id,
                from_number=phone if not from_me else account.phone_number,
                to_number=account.phone_number if not from_me else phone,
                is_from_me=from_me,
                text=text,
                message_type=msg_type,
                direction='out' if from_me else 'in',
                status='sent' if from_me else 'received',
                sender=push_name or phone,
                quoted_message_id=quoted_id,
                raw_payload=msg,
            )

            direction = '→' if from_me else '←'
            logger.info(f'📩 Saved: {direction} {phone}: {text[:50]}')

        return Response({'status': 'ok'})

    def handle_message_update(self):
        """Message status update (sent/delivered/read)"""

        updates = self.data if isinstance(self.data, list) else [self.data]

        for update in updates:
            key = update.get('key', {})
            message_id = key.get('id') if isinstance(key, dict) else None
            new_status = update.get('status')

            if message_id and new_status:
                updated = WhatsAppMessage.objects.filter(
                    wa_message_id=message_id
                ).update(wa_status=new_status)

                if updated:
                    logger.info(f'✅ Message {message_id}: {new_status}')

        return Response({'status': 'ok'})

    def handle_qrcode(self):
        """New QR code generated"""
        logger.info(f'📱 New QR code for: {self.instance}')
        # TODO: Send WebSocket with new QR code to frontend
        return Response({'status': 'ok'})


def get_evolution_webhook_service(instance, data):
    return EvolutionWebHookService(instance=instance, data=data)
