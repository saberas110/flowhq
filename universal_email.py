from apps.api.chat_manager.celery_tasks.gmail_tasks import fetch_emails_task, send_email_task



class UniversalEmailService:
    """
    Universal Email Service - supports Gmail API and SMTP/IMAP
    Works with Gmail, Outlook, Yahoo, and custom email servers
    """

    def __init__(self, email_account):
        self.account = email_account

    # ==================== SEND METHODS ====================

    def send_email_async(self, message_id):
    
        send_email_task.delay(message_id)
        return {'status': 'queued', 'message_id': message_id}


    def fetch_email_async(self):
        fetch_emails_task.delay(self.account)
        return {'status': 'queued'}