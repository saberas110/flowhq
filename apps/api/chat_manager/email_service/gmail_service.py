import base64
import logging
import traceback
from datetime import datetime
from urllib.error import HTTPError

from django.core.exceptions import ValidationError
from django.utils import timezone
from channels.layers import get_channel_layer
from email.mime.text import MIMEText
from os import getenv
from asgiref.sync import async_to_sync
from chat_manager.models import Conversation, Message, EmailMessage
from chat_manager.serializers import MessageSerializer, ConversationSerializer

logger = logging.getLogger(__name__)


from chat_manager.email_service.gmail_auth import get_email_account


def parse_gmail_message(message):
    """
    Parse کردن Gmail message

    Args:
        message: Gmail message object

    Returns:
        dict: اطلاعات parse شده
    """
    try:
        # استخراج headers
        headers = message.get('payload', {}).get('headers', [])

        # Helper function
        def get_header(name):
            for header in headers:
                if header.get('name', '').lower() == name.lower():
                    return header.get('value', '')
            return ''

        # استخراج body
        def get_body(payload):
            """استخراج body از payload"""
            body = ''

            # چک کردن body مستقیم
            if 'body' in payload and 'data' in payload['body']:
                try:
                    body = base64.urlsafe_b64decode(
                        payload['body']['data']
                    ).decode('utf-8')
                    return body
                except:
                    pass

            # چک کردن parts
            if 'parts' in payload:
                for part in payload['parts']:
                    # اول text/plain رو بگیر
                    if part.get('mimeType') == 'text/plain':
                        if 'data' in part.get('body', {}):
                            try:
                                body = base64.urlsafe_b64decode(
                                    part['body']['data']
                                ).decode('utf-8')
                                return body
                            except:
                                pass

                    # اگه نبود، text/html رو بگیر
                    elif part.get('mimeType') == 'text/html':
                        if 'data' in part.get('body', {}):
                            try:
                                body = base64.urlsafe_b64decode(
                                    part['body']['data']
                                ).decode('utf-8')
                                if not body:  # فقط اگه قبلاً body نگرفتیم
                                    return body
                            except:
                                pass

                    # Recursive برای nested parts
                    elif 'parts' in part:
                        nested_body = get_body(part)
                        if nested_body:
                            return nested_body

            return body

        # ✅ ساخت dict با اطلاعات کامل
        parsed_data = {
            'id': message.get('id'),
            'threadId': message.get('threadId'),
            'labelIds': message.get('labelIds', []),
            'snippet': message.get('snippet', ''),
            'internalDate': message.get('internalDate'),
            'from': get_header('From'),
            'to': get_header('To'),
            'subject': get_header('Subject'),
            'date': get_header('Date'),
            'body': get_body(message.get('payload', {})),
            'message_id_header': get_header('Message-ID'),
            'in_reply_to': get_header('In-Reply-To'),
            'references': get_header('References'),
        }

        return parsed_data

    except Exception as e:
        logger.error(f"Error parsing message: {e}")
        import traceback
        traceback.print_exc()
        return None


def setup_gmail_watch(email_account):

    service = get_email_account(email_account)
    print("getenvGMAIL_PUBSUB_TOPIC", getenv("GMAIL_PUBSUB_TOPIC"))
    request_body = {
        'labelIds': ['INBOX'],
        'topicName': getenv("GMAIL_PUBSUB_TOPIC")    # created in google cloud
    }

    try:
        response = service.users().watch(userId='me', body=request_body).execute()
        logger.info(f"✅ Gmail watch setup successful!")
        logger.debug(f"Response: {response}")
        expiration_ms = response.get('expiration')
        if expiration_ms:
            # تبدیل از میلی‌ثانیه به ثانیه
            expiration_timestamp = int(expiration_ms) / 1000

            # تبدیل به datetime
            expiration_datetime = datetime.fromtimestamp(
                expiration_timestamp,
                tz=timezone.utc
            )
        else:
            expiration_datetime = None
            logger.info(f"Watch expires at: {expiration_datetime}")



        email_account.watch_expiration = expiration_datetime
        email_account.history_id = response['historyId']
        email_account.save(update_fields=['watch_expiration', 'history_id'])

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

    try:
        service = get_email_account(email_account)
        logger.info(f"Fetching email: {message_id}")
        message = service.users().messages().get(
            userId='me',
            id=message_id,
            format='full',
        ).execute()

        parsed = parse_gmail_message(message)
        logger.info(f"✅ Email fetched: {parsed.get('subject', 'No subject')}")

        return parsed

    except HTTPError as e:
        if e.resp.status == 404:
            logger.warning(f"⚠️  Message not found: {message_id}")
            logger.warning("   This might be a temporary message ID")
        else:
            logger.error(f"❌ Gmail API error: {e}")

        return None

    except Exception as e:
        logger.error(f"❌ Error fetching email: {e}")
        traceback.print_exc()

        return None


# chat_manager/email_service/gmail_service.py

def get_history(email_account, start_history_id):
    """
    دریافت تغییرات history از Gmail

    Args:
        email_account: GmailAccounts instance
        start_history_id: History ID برای شروع

    Returns:
        list: لیست message ID های جدید
    """
    try:
        service = get_email_account(email_account)

        saved_history_id = email_account.history_id

        logger.info(f"📥 Getting history changes")
        logger.info(f"   Notification History ID: {start_history_id}")
        logger.info(f"   Saved History ID: {saved_history_id}")

        # دریافت History ID فعلی
        profile = service.users().getProfile(userId='me').execute()
        current_history_id = profile['historyId']
        logger.info(f"   Current History ID: {current_history_id}")

        # ✅ استفاده از کوچکترین History ID
        # برای اطمینان از اینکه هیچ چیزی از دست نمیره
        use_history_id = min(
            int(saved_history_id),
            int(start_history_id)
        )

        logger.info(f"   Using History ID: {use_history_id}")

        # دریافت history
        try:
            history_response = service.users().history().list(
                userId='me',
                startHistoryId=str(use_history_id),
                historyTypes=['messageAdded'],
                maxResults=100
            ).execute()
        except Exception as e:
            logger.error(f"❌ Error calling history API: {e}")

            # اگه History ID خیلی قدیمی بود
            if '404' in str(e) or 'Not Found' in str(e) or 'Invalid' in str(e):
                logger.warning("   History ID is too old!")
                logger.warning("   Using notification History ID instead...")

                # استفاده از History ID از notification
                try:
                    history_response = service.users().history().list(
                        userId='me',
                        startHistoryId=start_history_id,
                        historyTypes=['messageAdded'],
                        maxResults=100
                    ).execute()
                except:
                    # اگه باز هم کار نکرد، update کن و برو
                    email_account.history_id = current_history_id
                    email_account.save(update_fields=['history_id'])
                    return []
            else:
                return []

        # پردازش response
        logger.info(f"   Response keys: {list(history_response.keys())}")

        if 'history' not in history_response:
            logger.info("   ℹ️  No 'history' key in response")

            # Update History ID
            if 'historyId' in history_response:
                new_history_id = history_response['historyId']
                logger.info(f"   Updating History ID: {saved_history_id} → {new_history_id}")
                email_account.history_id = new_history_id
                email_account.save(update_fields=['history_id'])

            return []

        # استخراج messages
        history_records = history_response['history']
        logger.info(f"   Found {len(history_records)} history records")

        message_ids = []

        for idx, history_record in enumerate(history_records):
            logger.info(f"   📝 Record {idx + 1}:")
            logger.info(f"      Keys: {list(history_record.keys())}")

            if 'messagesAdded' not in history_record:
                logger.info(f"      No messagesAdded")
                continue

            messages_added = history_record['messagesAdded']
            logger.info(f"      Messages added: {len(messages_added)}")

            for msg_idx, message_added in enumerate(messages_added):
                message = message_added.get('message', {})
                message_id = message.get('id')
                label_ids = message.get('labelIds', [])

                logger.info(f"      📧 Message {msg_idx + 1}:")
                logger.info(f"         ID: {message_id}")
                logger.info(f"         Labels: {label_ids}")

                if message_id:
                    message_ids.append(message_id)

        logger.info(f"✅ Total messages found: {len(message_ids)}")

        # Update History ID
        if 'historyId' in history_response:
            new_history_id = history_response['historyId']
            logger.info(f"   Updating History ID: {saved_history_id} → {new_history_id}")
            email_account.history_id = new_history_id
            email_account.save(update_fields=['history_id'])

        return message_ids

    except Exception as e:
        logger.error(f"❌ Error getting history: {e}")
        traceback.print_exc()
        return []


def _save_received_email(email_account, email_data):
    print('='*90)
    print(f'email_data: {email_data}')
    print('='*90)

    organization_email = email_account.email
    _from = clean_email(email_data['from'])
    _to = clean_email(email_data['to'])
    contact_email = None
    direction = None

    try:
        if organization_email == _from:
            contact_email = _to
            direction = 'in'
        elif organization_email == _to:
            contact_email = _from
            direction = 'out'
    except Exception as e:
        raise ValidationError(str(e))


    conversation, created = Conversation.objects.get_or_create(
        organization=email_account.organization,
        contact_user_id = contact_email
    )
    message, created = EmailMessage.objects.get_or_create(
        email_message_id=email_data['id'],
        defaults={
            'conversation': conversation,
            'sender': _from,
            'text': email_data['snippet'],
            'subject': email_data['subject'],
            'from_email': email_data['from'],
            'to_email': email_data['to'],
            'status': 'received',
            'service_account': email_account,
            'direction': direction
        }
    )
    
    if not created:
        logger.info(f"Email already exists: {email_data['id']}")
        return message

    channel_layer = get_channel_layer()

    # async_to_sync(channel_layer.group_send)(
    #     f'chat_{conversation.id}',
    #     {
    #         'type': 'chat.message',
    #         'message': MessageSerializer(message).data,
    #     }
    # )

    # for owner in conversation.organization.owner.all():
    #     async_to_sync(channel_layer.group_send)(
    #         f'user_{owner.id}',
    #         {
    #             'type': 'new.chat',
    #             'conversation': ConversationSerializer(conversation).data
    #         }
    #     )



def clean_email(email):

    if '<' in email:
        cl_email = email.split('<')[1]
        if '>' in cl_email:
            cl_email = cl_email.split('>')[0]

        return cl_email
    return email


