from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from chat_manager.email_service.gmail_service import setup_gmail_watch, get_history
from chat_manager.email_service.gmail_service import  fetch_email_by_id, logger, send_emil_via_gmail, _save_received_email
from chat_manager.models import GmailAccounts, Message
from chat_manager.serializers import MessageSerializer


@shared_task
def renew_gmail_watches():
    expiring_soon = GmailAccounts.objects.filter(
        is_active=True,
        watch_expiration_lte=timezone.now() + timedelta(days=1)
    )

    for account in expiring_soon:
        setup_gmail_watch(account)

                                                        # will be checked

@shared_task
def process_gmail_notifications(email_address, history_id):

    try:
        email_account = GmailAccounts.objects.get(email=email_address)
        changes = get_history(email_account, email_account.history_id)

        for change in changes:
            if 'messagesAdded' in change:
                for msg_addedd in change['messagesAdded']:
                    message_id = msg_addedd['message']['id']

                    email_data = fetch_email_by_id(email_account, message_id)

                    if email_data:
                        _save_received_email(email_account, email_data)
        email_account.history_id = history_id
        email_account.save()

    except Exception as e:
        logger.error(f'Error: {str(e)}')


@shared_task
def send_email_via_gmail_task(message_id):
    """ارسال ایمیل از طریق Gmail API"""

    try:
        message = Message.objects.get(id=message_id)

        # تغییر وضعیت
        message.email_status = 'sending'
        message.save()

        # ارسال
        gmail_message_id, error = send_emil_via_gmail(
            email_account=message.email_account,
            to=message.email_to,
            subject=message.email_subject,
            body=message.text
        )

        if gmail_message_id:
            message.email_status = 'sent'
            message.email_message_id = gmail_message_id
        else:
            message.email_status = 'failed'
            message.error_message = error

        message.save()

        # اطلاع‌رسانی WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'chat_{message.conversation.id}',
            {
                'type': 'email.status',
                'message': MessageSerializer(message).data
            }
        )

    except Exception as e:
        logger.error(f"Error: {str(e)}")