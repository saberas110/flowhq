import logging
import os
import signal
import sys
from worker_manager import worker_manager
from tasks import app
    


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(threadName)s] %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


def main():
    
    logger.info('=' * 60)
    logger.info('🚀 Starting Email Worker Service')
    logger.info("=" * 60)

    def shutdown(signum, frame):
        logger.info('\n 🔴 Received shutdown signal')
        worker_manager.stop_all()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    logger.info('📡 Starting Celery worker for email_worker tasks...')

    app.worker_main([
        'worker',
        '--loglevel=info',
        '-Q','email_worker_queue',
        '--concurrency=4',
        '-n', 'email_worker@%h'
    ])

if __name__ == '__main__':
    main()