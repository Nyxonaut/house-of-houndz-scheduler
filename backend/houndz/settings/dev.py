# backend/houndz/settings/dev.py

from __future__ import annotations

import os
from pathlib import Path

# Optional: handle missing dotenv gracefully
try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

# Import base settings and helpers
from .base import *
from .base import PROJECT_DIR, dj_database_url, env_list

# ---------------------------------------------------------------------
# Environment setup
# ---------------------------------------------------------------------

# Define project root and .env file path
ROOT_DIR = Path(__file__).resolve().parents[3]
ENV_PATH = ROOT_DIR / ".env"

# --- Guarded .env loader ---
if os.getenv("DISABLE_DOTENV") == "1":
    print("⚠️  Dotenv loading disabled via DISABLE_DOTENV=1")
else:
    if load_dotenv is None:
        print("⚠️  python-dotenv not installed; skipping .env load")
    elif not ENV_PATH.is_file():
        print(f"⚠️  .env not found at {ENV_PATH}, skipping load")
    else:
        try:
            load_dotenv(ENV_PATH, override=False)
            print(f"✅ Loaded environment from {ENV_PATH}")
        except Exception as e:
            print(f"⚠️  Error loading {ENV_PATH}: {e}")

# ---------------------------------------------------------------------
# Django core settings overrides for development
# ---------------------------------------------------------------------

DEBUG = os.getenv("DEBUG", "True").lower() in ("1", "true", "yes")

# Default allowed hosts for local dev
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

# Database configuration
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "houndz"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "password"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# --- TEMPORARY for debugging only ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]
# --- end TEMPORARY ---

# ---------------------------------------------------------------------
# Other environment-specific settings
# ---------------------------------------------------------------------

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "http://localhost,http://127.0.0.1",
)

# Logging (optional but good for visibility)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG" if DEBUG else "INFO",
    },
}
