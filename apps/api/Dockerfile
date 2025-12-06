# Python base
FROM python:3.12-slim

# Prevent Python from writing .pyc files & enable stdout logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=api.settings



WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y bash build-essential curl ca-certificates libpq-dev \
    && rm -rf /var/lib/apt/lists/

COPY uv.lock pyproject.toml ./

COPY --from=ghcr.io/astral-sh/uv:0.8.17 /uv /uvx /usr/local/bin/

RUN uv sync --locked --no-dev


COPY . .

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Run migrations + Daphne server
CMD ["bash", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 api.asgi:application"]


