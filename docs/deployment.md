# House of Houndz Scheduler – Deployment Guide

## Settings Overview
- `houndz/settings/base.py`: shared defaults (apps, middleware, logging, static/media configuration helpers).
- `houndz/settings/dev.py`: development overrides (`DEBUG=True`, loads `backend/.env`, SQLite fallback).
- `houndz/settings/prod.py`: production hardening (`DEBUG=False`, requires `DJANGO_SECRET_KEY` and `DJANGO_ALLOWED_HOSTS`, enables HSTS and secure cookies).

Export `DJANGO_SETTINGS_MODULE=houndz.settings.prod` for production runs; development defaults to `houndz.settings.dev`.

## Required Environment Variables
- `DJANGO_SECRET_KEY`
- `DJANGO_ALLOWED_HOSTS` (comma-separated hostnames)
- `DATABASE_URL` (PostgreSQL connection string)
- `DJANGO_STATIC_ROOT` / `DJANGO_MEDIA_ROOT` (optional overrides)
- `DJANGO_LOG_LEVEL` (optional, defaults to `INFO` in production)
- Gunicorn overrides (optional): `GUNICORN_BIND`, `GUNICORN_WORKERS`, `GUNICORN_TIMEOUT`, etc.

## Deployment Checklist
1. **Prepare system** – install Python 3.11, PostgreSQL 15, Node 18 (for frontend build), and Nginx or Cloudflare Tunnel if exposing externally.
2. **Clone repo & install deps** – create virtualenv, `pip install -r backend/requirements.txt`.
3. **Database setup** – create Postgres role/database (`houndz_user`/`houndz_db`) and apply migrations: `python backend/manage.py migrate`.
4. **Static assets** – run `python backend/manage.py collectstatic --noinput` with `DJANGO_STATIC_ROOT` pointing to a shared volume (e.g., `/var/www/houndz/static`).
5. **Seed data (optional)** – `python backend/manage.py seed_demo_data` or load real data via admin/API.
6. **Run backend** – `DJANGO_SETTINGS_MODULE=houndz.settings.prod gunicorn -c houndz/gunicorn.conf.py houndz.wsgi:application`.
7. **Reverse proxy** – configure Nginx (or Cloudflare Tunnel) to serve `/static` `/media` from mounted path and proxy `/` to Gunicorn.
8. **Monitoring & backups** – schedule `scripts/backup_db.sh`, enable `ufw`/`fail2ban`, and monitor logs.

## Post-Deployment Tasks
- Create systemd services for Gunicorn and backup cron entries.
- Configure Cloudflare Tunnel (or alternative) for remote access if exposing off-LAN.
- Document SSH access, maintenance windows, and emergency rollback procedures.
