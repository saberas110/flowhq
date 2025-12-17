FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=api.settings


WORKDIR /app


RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements1.txt .


RUN pip install --no-cache-dir requirements.txt requirements1.txt



COPY . .

EXPOSE 8000

CMD ["bash", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 api.asgi:application"]


