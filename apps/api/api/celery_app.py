import os


from celery import Celery 




os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
app = Celery('api')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.broker_url = 'amqp://guest:guest@localhost//'
app.conf.result_backend = 'rpc://'
app.conf.accept_content = ['json', 'pickle']
app.conf.task_serializer = 'json'
app.conf.result_serializer = 'json'
app.conf.timezone = 'UTC'

