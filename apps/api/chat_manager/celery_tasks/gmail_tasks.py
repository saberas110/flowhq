import time

from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from chat_manager.email_service.gmail_service import setup_gmail_watch, get_history
from chat_manager.email_service.gmail_service import  fetch_email_by_id, logger, send_emil_via_gmail, _save_received_email
from chat_manager.models import GmailAccounts, EmailMessage
from chat_manager.serializers import PolymorphicMessageSerializer



@shared_task
def renew_gmail_watches():
    expiring_soon = GmailAccounts.objects.filter(
        is_active=True,
        watch_expiration_lte=timezone.now() + timedelta(days=1)
    )

    for account in expiring_soon:
        setup_gmail_watch(account)


@shared_task
def process_gmail_notifications(email_address, history_id):
    """
    پردازش Gmail notifications

    Args:
        email_address (str): آدرس ایمیل
        history_id (str): History ID از Gmail notification
    """
    try:
        logger.info("=" * 60)
        logger.info("🔄 Processing Gmail notification")
        logger.info(f"   Email: {email_address}")
        logger.info(f"   Notification History ID: {history_id}")
        logger.info("=" * 60)


        try:
            email_account = GmailAccounts.objects.get(
                email=email_address,
                is_active=True
            )
            logger.info(f"✅ Found Gmail account")
            logger.info(f"   Saved History ID: {email_account.history_id}")
        except GmailAccounts.DoesNotExist:
            logger.error(f"❌ Gmail account not found: {email_address}")
            return

        logger.info("⏳ Waiting 3 seconds for Gmail to sync...")
        time.sleep(3)

        message_ids = get_history(email_account, history_id)

        if not message_ids:
            logger.info("ℹ️  No new messages to process")
            return

        logger.info(f"📧 Processing {len(message_ids)} messages")

        # پردازش هر message
        processed_count = 0
        failed_count = 0

        for message_id in message_ids:
            try:
                logger.info(f"\n📧 Processing: {message_id}")

                # دریافت جزئیات email
                email_data = fetch_email_by_id(email_account, message_id)

                if email_data is None:
                    logger.warning(f"⚠️  Could not fetch message {message_id}")
                    failed_count += 1
                    continue

                if not isinstance(email_data, dict):
                    logger.error(f"❌ Invalid data type: {type(email_data)}")
                    failed_count += 1
                    continue

                logger.info(f"   ✅ Fetched successfully")
                logger.info(f"   From: {email_data.get('from', 'Unknown')}")
                logger.info(f"   Subject: {email_data.get('subject', 'No subject')}")
                logger.info(f"   Date: {email_data.get('date', 'Unknown')}")
                logger.info(f"   Snippet: {email_data.get('snippet', '')[:100]}")

                _save_received_email(email_account, email_data)

                processed_count += 1

            except Exception as e:
                logger.error(f"❌ Error processing {message_id}: {e}")
                import traceback
                traceback.print_exc()
                failed_count += 1
                continue

        logger.info(f"\n{'=' * 60}")
        logger.info(f"✅ Processing complete")
        logger.info(f"   Processed: {processed_count}")
        logger.info(f"   Failed: {failed_count}")
        logger.info(f"   Final History ID: {email_account.history_id}")
        logger.info("=" * 60 + "\n")

    except Exception as e:
        logger.error(f"❌ Error in process_gmail_notifications: {e}")
        import traceback
        traceback.print_exc()


@shared_task
def send_email_via_gmail_task(message_id):
    """ارسال ایمیل از طریق Gmail API"""

    try:
        message = EmailMessage.objects.get(id=message_id)

        # تغییر وضعیت
        message.status = 'sending'
        message.save(update_fields=['status'])

        # ارسال
        gmail_message_id, error = send_emil_via_gmail(
            email_account=message.service_account,
            to=message.to_email,
            subject=message.subject,
            body=message.html_body
        )

        if gmail_message_id:
            message.status = 'sent'
            message.email_message_id = gmail_message_id
            message.save(update_fields=['status', 'email_message_id'])
        else:
            message.status = 'failed'
            message.error_message = error
            message.save(update_fields=['status', 'error_message'])

        # اطلاع‌رسانی WebSocket
        # channel_layer = get_channel_layer()
        # async_to_sync(channel_layer.group_send)(
        #     f'chat_{message.conversation_id}',
        #     {
        #         'type': 'email.status',
        #         'message': PolymorphicMessageSerializer(message).data
        #     }
        # )

    except EmailMessage.DoesNotExist:
        logger.error(f"EmailMessage not found: {message_id}")
    except Exception as e:
        logger.error(f"Error in send email via GmailApi: {str(e)}")