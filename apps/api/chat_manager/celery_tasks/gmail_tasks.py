import time
from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from chat_manager.email_service.gmail_service import setup_gmail_watch, get_history, _fetch_via_imap, _send_via_smtp
from chat_manager.email_service.gmail_service import  fetch_email_by_id, logger, send_emil_via_gmail, _save_received_email
from chat_manager.models import EmailAccount, EmailMessage



@shared_task
def renew_gmail_watches():
    expiring_soon = EmailAccount.objects.filter(
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
            email_account = EmailAccount.objects.get(
                email=email_address,
                is_active=True
            )
            logger.info(f"✅ Found Gmail account")
            logger.info(f"   Saved History ID: {email_account.history_id}")
        except EmailAccount.DoesNotExist:
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
def send_email_task(message_id):
    """
    Universal email send task - supports Gmail API and SMTP
    Works with Gmail, Outlook, Yahoo, and custom SMTP servers
    """
    try:
        message = EmailMessage.objects.select_related('service_account').get(id=message_id)
        email_account = message.service_account

        message.status = 'sending'
        message.save(update_fields=['status'])

        message_id_result = None
        error = None

        if email_account.uses_oauth():
            # Gmail API
            logger.info(f"📧 Sending via Gmail API to {message.to_email}")
            message_id_result, error = send_emil_via_gmail(
                email_account=email_account,
                to=message.to_email,
                subject=message.subject,
                body=message.html_body
            )
        else:
            # SMTP (Gmail, Outlook, Yahoo, Custom)
            logger.info(f"📧 Sending via SMTP ({email_account.provider}) to {message.to_email}")
            result = _send_via_smtp(
                email_account=email_account,
                to=message.to_email,
                subject=message.subject,
                body=message.html_body,
                cc=message.cc_email if message.cc_email else None,
                bcc=message.bcc if message.bcc else None
            )
            message_id_result = result.get('message_id') if result.get('success') else None
            error = result.get('error')

        # Update message status
        if message_id_result:
            message.status = 'sent'
            message.email_message_id = message_id_result
            message.save(update_fields=['status', 'email_message_id'])
            logger.info(f"✅ Email sent successfully: {message_id_result}")
        else:
            message.status = 'failed'
            message.error_message = error
            message.save(update_fields=['status', 'error_message'])
            logger.error(f"❌ Email failed: {error}")

    except EmailMessage.DoesNotExist:
        logger.error(f"EmailMessage not found: {message_id}")
    except Exception as e:
        logger.error(f"❌ Error in send_email_task: {str(e)}")
        import traceback
        traceback.print_exc()



@shared_task
def fetch_emails_task(email_account_id, folder='INBOX', limit=50, since_date=None):
    """
    Fetch emails in background via IMAP or Gmail API
    """
    
    
    try:
        # 1. Get account
        account = EmailAccount.objects.get(id=email_account_id)
        logger.info(f"📧 Fetching emails for {account.email}")
        
        # 2. Check which method to use
        if account.uses_oauth():
            # Use Gmail API
            emails = fetch_email_by_id(account, limit)
        else:
            # Use IMAP
            emails = _fetch_via_imap(account, folder, limit, since_date)
        
        # 3. Save to database
        for email_data in emails:
            _save_received_email(account, email_data)
        
        logger.info(f"✅ Fetched {len(emails)} emails")
        return {'success': True, 'count': len(emails)}
        
    except EmailAccount.DoesNotExist:
        logger.error(f"❌ Account not found: {email_account_id}")
        return {'success': False, 'error': 'Account not found'}
    except Exception as e:
        logger.error(f"❌ Error fetching emails: {e}")
        return {'success': False, 'error': str(e)}




