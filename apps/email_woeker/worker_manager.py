from ast import Dict
import logging

from rabbitmq_client import rabbitmq_client
from Email_worker import EmailConfig, EmailWorker



logger = logging.getLogger(__name__)

SAVE_EMAIL_TASK = 'chat_manager.celery_tasks.gmail_tasks.save_email_task'


class WorkerManager:

    def __init__(self) -> None:
        self.workers: Dict[int, EmailWorker] = {}
        self._lock = __import__('threading').Lock()

        rabbitmq_client.connect()

    def _on_new_email(self, email_account_id, email_data):
        logger.info(f"📤 Sending email to Django for saving...")

        rabbitmq_client.publish_task(
            task_name=SAVE_EMAIL_TASK,
            args=[email_account_id, email_data]
        )

    def start_worker(
        self,
        user_id: int,
        email_account_id: int,
        email_address: str,
        password: str,
        imap_host: str = 'imap.gmail.com',
        imap_port : int = 993,
        use_ssl: bool = True,
        folder: str = "INBOX"
    ) -> bool:

        with self._lock:
            if email_account_id in self.workers:
                logger.warning(f'⚠️ Worker already running for account {email_account_id}')
                return False
            
            config = EmailConfig(
                user_id=user_id,
                email_account_id=email_account_id,
                email_address=email_address,
                password=password,
                imap_host=imap_host,
                imap_port=imap_port,
                use_ssl=use_ssl,
                folder=folder
            )
            worker = EmailWorker(config, self._on_new_email)
            worker.start()

            self.workers[email_account_id] = worker
            logger.info(f' Started worker for {email_address} (account_id: {email_account_id})')

            return True

    def stop_worker(self, email_account_id):
        
        with self._lock:
            if email_account_id not in self.workers:
                logger.warning(f'Worker not found for account {email_account_id}')
                return False
            worker = self.workers.pop(email_account_id)
            worker.stop()

            logger.info(f'f Stopped worker for account {email_account_id}')
            return True
    
    def get_worker(self, email_account_id):
        return self.workers.get(email_account_id)

    def is_running(self, email_account_id):
        worker = self.workers.get(email_account_id)
        return worker is not None and worker.is_alive

    def get_status(self):
        return {
            'active_workers': len(self.workers),
            'workers': {
                account_id: {
                    'email': worker.config.email_address,
                    'running': worker.is_alive(),
                    'user_id': worker.config.user_id,
                }
                
                for account_id, worker in self.workers.items()}
        }

    def stop_all(self):
        with self._lock:
            for account_id in list(self.workers.keys()):
                self.workers[account_id].stop()
            self.workers.clear()
        
        rabbitmq_client.close()
        logger.info('All workers stopped')


worker_manager = WorkerManager()
     


