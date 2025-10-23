from __future__ import annotations

import os

from dotenv import load_dotenv

from .base import *  # noqa: F401,F403
from .base import PROJECT_DIR, dj_database_url, env_list

# Load environment variables from backend/.env for local development.
load_dotenv(PROJECT_DIR / ".env")

DEBUG = True

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key")

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

CSRF_TRUSTED_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000"
)

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get(
            "DATABASE_URL",
            f"sqlite:///{PROJECT_DIR / 'db.sqlite3'}",
        ),
        conn_max_age=0,
    )
}

# Developer-friendly logging
LOG_LEVEL = os.environ.get("DJANGO_LOG_LEVEL", "DEBUG")
