import base64
import logging
from channels.layers import get_channel_layer
from email.mime.text import MIMEText
from os import getenv
from asgiref.sync import async_to_sync
from chat_manager.models import Conversation, Message
from chat_manager.serializers import MessageSerializer, ConversationSerializer

logger = logging.getLogger(__name__)


from chat_manager.email_service.gmail_auth import get_email_account


def parse_gmail_message(message):
    headers = message['payload']['headers']

    subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
    from_email = next((h['value'] for h in headers if h['name'] == "From"), '')
    to_email = next((h['value'] for h in headers if h['name'] == 'To'), '')

    body = ''
    if 'parts' in message['payload']:
        for part in message['payload']['parts']:
            if part['mimeType'] == 'text/plain':
                body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                break
    else:
        body = base64.urlsafe_b64decode(message['payload']['body']['data']).decode('utf-8')

    return {
        'id': message['id'],
        'subject': subject,
        'from': from_email,
        'to': to_email,
        'body': body
    }


def setup_gmail_watch(email_account):

    service = get_email_account(email_account)

    request_body = {
        'labelIds': ['INBOX'],
        'topicName': getenv("GMAIL_PUBSUB_TOPIC")    # created in google cloud
    }

    try:
        response = service.users().watch(userId='me', body=request_body).execute()

        email_account.watch_expiration = response['expiration']
        email_account.history_id = response['historyId']
        email_account.save()

        return response
    except Exception as e:
        logger.error(f"Failed to setup Gmail watch: {str(e)}")
        raise


def send_emil_via_gmail(email_account, to, subject, body):
    service = get_email_account(email_account)
    message = MIMEText(body, 'html')
    message['to'] = to
    message['subject'] = subject
    message['from'] = email_account.email

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

    try:
        sent_message = service.users().messages().send(
            userId='me',
            body={'raw': raw_message},
        ).execute()

        return sent_message['id'], None
    except Exception as e:
        return None, str(e)


def fetch_email_by_id(email_account, message_id):

    service = get_email_account(email_account)

    try:
        message = service.users().messages().get(
            userId='me',
            id=message_id,
            format='full',
        ).execute()

        return parse_gmail_message(message)
    except Exception as e:
        return None, str(e)

def get_history(email_account, start_history_id):
    """
       دریافت تغییرات از آخرین historyId
    """
    service = get_email_account(email_account)

    try:
        history = service.users().history().list(
            userId='me',
            startHistoryId=start_history_id,
            labelId='INBOX',
        ).execute()
        changes = history.get('history', [])
        return changes
    except Exception as e:
        return []




def _save_received_email(email_account, email_data):

    conversation, created = Conversation.objects.get_or_create(
        organization=email_account.organization,
        contact_id = email_data['from']
    )
    message = Message.objects.create(
        conversation=conversation,
        sender=None,  # از بیرون اومده
        message_type='email',
        text=email_data['body'],
        email_subject=email_data['subject'],
        email_from=email_data['from'],
        email_to=email_data['to'],
        email_message_id=email_data['id'],
        email_status='received',
        email_account=email_account
    )

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f'chat_{conversation.id}',
        {
            'type': 'chat.message',
            'message': MessageSerializer(message).data,
        }
    )

    for owner in conversation.organization.owner.all():
        async_to_sync(channel_layer.group_send)(
            f'user_{owner.id}',
            {
                'type': 'new.chat',
                'conversation': ConversationSerializer(conversation).data
            }
        )
