import os

from celery import Celery


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
celery_app = Celery('api')
celery_app.config_from_object('django.conf:settings', namespace='CELERY')
celery_app.autodiscover_tasks()

celery_app.conf.broker_url = 'amqp://guest:guest@localhost//'
celery_app.conf.result_backend = 'rpc://'
celery_app.conf.accept_content = ['json', 'pickle']
celery_app.conf.task_serializer = 'json'
celery_app.conf.result_serializer = 'json'
celery_app.conf.timezone = 'UTC'

