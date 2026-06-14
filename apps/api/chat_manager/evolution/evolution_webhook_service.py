import logging

from asgiref.sync import async_to_sync
from django.utils import timezone
from rest_framework.response import Response
from channels.layers import get_channel_layer
from chat_manager.evolution.evolution_service import get_evolution_service
from chat_manager.models import (
    ChannelIdentity, Contact, Conversation,
    WhatsAppAccount, WhatsAppMessage
)
from chat_manager.serializers import WhatsAppMessageSerializer





logger = logging.getLogger(__name__)


class EvolutionWebHookService:

    def __init__(self, instance, data) -> None:
        self.instance = instance
        self.data = data

    def handle_connection(self):
        """Saves to DB ONLY when state == 'open' (the COMMIT)"""

        state = self.data.get('state')
        logger.info(f'📱 Connection: {self.instance} -> {state}')

        

        if state == 'open':
            service = get_evolution_service(self.instance)
            info = service.get_instance_info()

            phone = info.get('ownerJid', '').replace('@s.whatsapp.net', '')

            try:
                org_id = int(self.instance.split('_')[1])
            except (IndexError, ValueError):
                logger.warning(f'⚠️ Cannot extract org_id from: {self.instance}')
                return Response({'statsu': 'error'}, status=400)

            account, created = WhatsAppAccount.objects.update_or_create(
                instance_name=self.instance,
                defaults={
                    'organization_id': org_id,
                    'instance_id': info.get('id', ''),
                    'jid': info.get('ownerJid', ''),
                    'push_name': info.get('profileName', ''),
                    'profile_picture_url': info.get('profilePicUrl', ''),
                    'phone_number': phone,
                    'is_connected': True,
                    'connected_at': timezone.now(),
                    'service_type': 'whatsapp',
                }
            )

            action = 'CREATED' if created else 'UPDATED'
            logger.info(f'✅ WhatsAppAccount {action}: {account.push_name} ({phone})')

            return Response({'status': 'ok', 'state': state, 'action': action})

        elif state == 'close':
            updated = WhatsAppAccount.objects.filter(
                instance_name=self.instance,
            ).update(is_connected=False)

            if not updated:
                try:
                    service = get_evolution_service(self.instance)
                    service.delete_instance()
                    print(f'🗑️ Pending instance rolled back: {self.instance}')
                except Exception:
                    pass
            else:
                print(f'🔴 WhatsApp disconnected: {self.instance}')

            return Response({'status': 'ok', 'state': state})

        return Response({'status': 'ok', 'state': state})
    

    def handle_message(self):
        """New message received or sent"""
      
        # print(f'📦 Raw webhook data keys: {list(self.data.values()) if isinstance(self.data, dict) else type(self.data)}')
       
        # print(f'📦 Raw webhook data: {str(self.data)[:500]}')

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
                text = message_content.get('conversation') or ''
                if not text:
                    extended = message_content.get('extendedTextMessage')
                    if isinstance(extended, dict):
                        text = extended.get('text', '')
            else:
                text = ''

            msg_type = msg.get('messageType', 'text')
            media_url = None
            medi_mime = None
            media_caption = None

            if isinstance(message_content, dict):
                img = message_content.get('imageMessage')
                if isinstance('img', dict):
                    media_url = img.get('url')
                    media_mime = img.get('mimetype')
                    media_caption = img.get('caption', '')
                    msg_type = 'image'

                vid = message_content.get('videoMessage')
                if isinstance(vid, dict):
                    media_url = vid.get('url')
                    media_mime = vid.get('mimetype')
                    media_caption = vid.get('capiton', '')
                    msg_type = 'video'

                aud = message_content.get('audioMessage')
                if isinstance(aud, dict):
                    media_url = aud.get('url')
                    media_mime = aud.get('mimetype')
                    msg_type = 'audio'

                doc = message_content.get('documentMessage')
                if isinstance(doc, dict):
                    media_url = doc.get('url')
                    media_mime = doc.get('mimetype')
                    media_caption = doc.get('caption', '')
                    msg_type = 'document'


                stk = message_content.get('stickerMessage')
                if isinstance(stk, dict):
                    media_url = stk.get('url')
                    media_mime = stk.get('mimetype')
                    msg_type = 'image'


            if not text and media_caption:
                text = media_caption                  

            phone = remote_jid.split('@')[0] if remote_jid else ''
            push_name = msg.get('pushName', '')

            context_info = (
                message_content.get('extendedTextMessage', {}).get('contextInfo', {})
                if isinstance(message_content, dict) else {}
            )
            quoted_id = context_info.get('stanzaId') if isinstance(context_info, dict) else None

            # Use ChannelIdentity (remote_jid) as stable identifier for the contact
            identity = ChannelIdentity.objects.filter(
                channel='whatsapp',
                external_id=phone,
            ).select_related('contact').first()

            if identity:
                contact = identity.contact
                
            else:
                contact_name = push_name if push_name and not from_me else phone
                contact = Contact.objects.create(
                    name=contact_name,
                    avatar_url=None,
                )
                identity = ChannelIdentity.objects.create(
                    channel='whatsapp',
                    external_id=phone,
                    contact=contact,
                    organization=account.organization,
                )

            conversation, _ = Conversation.objects.get_or_create(
                contact=contact,
                organization=account.organization,
                defaults={'title': contact.name or phone}
            )

            message = WhatsAppMessage.objects.create(
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
                media_url=media_url,
                mime_type=media_mime,
                caption=media_caption,
            )
            # if not from_me:
            channel_layers = get_channel_layer()
            async_to_sync(channel_layers.group_send)(
                f'chat_{conversation.id}',
                {
                    'type': 'new_message',
                    'message': WhatsAppMessageSerializer(message).data
                }
            )


            direction = '→' if from_me else '←'
            logger.info(f'📩 Saved and Send to socket: {direction} {phone}: {text[:50]}')

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
