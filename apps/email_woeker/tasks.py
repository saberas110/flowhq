import os
from billiard.util import sub_debug
from celery import Celery
import logging
from worker_manager import worker_manager


logger = logging.getLogger(__name__)


app = Celery('email_worker')

app.conf.broker_url = 'amqp://guest:guest@localhost//'
app.conf.result_backend = 'rpc://'
app.conf.task_serializer = 'json'
app.conf.accept_content = ['json']
app.conf.timezone = 'Asia/Tehran'
app.conf.enable_utc = False

app.conf.task_routes = {
    'email_worker.tasks.*': {'queue': 'email_worker_queue'}
}




@app.task(name='email_worker.tasks.start_worker_task')
def start_worker_task(
    user_id,
    email_account_id,
    email_address,
    password,
    imap_host = 'imap.gmail.com',
    imap_port = 933,
    use_ssl = True,
    folder = 'INBOX'
):


    logger.info(f'Starting worker for {email_address}')

    success = worker_manager.start_worker(
        user_id=user_id,
        email_account_id=email_account_id,
        email_address=email_address,
        password=password,
        imap_host=imap_host,
        imap_port=imap_port,
        use_ssl=use_ssl,
        folder=folder,
    )

    return{
        'success': success,
        'email': email_address,
        'account_id': email_account_id
    }


@app.task(name='email_worker.tasks.stop_worker_task')
def stop_worker_task(email_account_id):
    from worker_manager import worker_manager

    logger.info(f'Stopping worker for account {email_account_id}')

    success = worker_manager.stop_worker(email_account_id)

    return {
        'success': success,
        'account_id': email_account_id,
    }



@app.task(name='email_worker.tasks.get_status_task')
def get_status_task():
    from worker_manager import worker_manager

    return worker_manager.get_status()
