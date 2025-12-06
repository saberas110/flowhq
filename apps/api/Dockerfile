# Python base
FROM python:3.12-slim

# Prevent Python from writing .pyc files & enable stdout logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=api.settings

COPY --from=ghcr.io/astral-sh/uv:0.8.17 /uv /uvx /usr/local/bin/

ADD . /app

WORKDIR /app

# Install system dependencies
RUN apt-get update \
     && apt-get install -y build-essential  --no-install-recommends curl ca-certificates curl libpq-dev \
    && rm -rf /var/lib/apt/lists/*


RUN uv sync --locked



#COPY requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt


# Copy project files


# Expose port for Daphne/ASGI
EXPOSE 8000

# Run migrations + Daphne server
CMD ["bash", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 api.asgi:application"]


