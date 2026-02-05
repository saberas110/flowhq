import json
import logging
import uuid
import pika





logger = logging.getLogger(__name__)

RABBITMQ_HOST = 'localhost'
RABBITMQ_PORT = 5672
DJANGO_QUEUE = 'celery'


class RabbitMQClient:


    def __init__(self):
        self.connection = None
        self.channel = None

    
    def connect(self):

        try:
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    port=RABBITMQ_PORT,
                    heartbeat=600,
                    blocked_connection_timeout=300
                )
            )

            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=DJANGO_QUEUE, durable=True)
            logger.info("✅ Connected to Rabbitmq")
        
        except Exception as e:
            logger.error(f"❌ Failed to connect to Rabbitmq: {e}")
            raise

    def publish_task(self, task_name, args, kwargs=None):
        if not self.channel or self.connection.is_closed:
            self.connect()
        
        task_id = str(uuid.uuid4())

        message = {
            'task': task_name,
            'id' :task_id,
            'args': args or [],
            'kwargs': kwargs or {},
            'retries': 0
        }
        
        try:
            self.channel.basic_publish(
                exchange='',
                routing_key=DJANGO_QUEUE,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    content_type='application/json',
                    content_encoding='utf-8'
                )
            )

            logger.info(f"Published task:{task_name} (id:{task_id[:8]})")
            return task_id
        except Exception as e:
            logger.error(f"❌ Failed to publish task:{task_name} (id:{task_id[:8]}): {e}")
            self.connect()
            return self.publish_task(task_name, args, kwargs)


    def close(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("🔌 Rabbitmq connection closed")



rabbitmq_client = RabbitMQClient()