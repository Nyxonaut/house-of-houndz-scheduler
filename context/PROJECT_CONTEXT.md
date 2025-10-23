# Project Context – House of Houndz Scheduler

## Mission
Deliver a kennel scheduling platform that kennel staff can operate locally on a Raspberry Pi while offering a modern React interface for bookings, occupancy tracking, and client communication.

## System Architecture
- **Frontend**: React + Vite + Tailwind CSS, state managed via context providers, communicates with backend REST API, packaged for Nginx static serving.
- **Backend**: Django + Django REST Framework exposing Suite, Owner, Pet, Booking resources; Gunicorn behind Nginx; PostgreSQL primary datastore.
- **Infrastructure**: Docker Compose targets (backend, frontend, nginx, postgres), shell scripts for Raspberry Pi setup/deploy, GitHub Actions for test/build CI.

## Key Dependencies
- Python 3.11, Django 4.2, djangorestframework, django-cors-headers, psycopg.
- Node 18, React 18, Tailwind CSS, Vite, axios.
- PostgreSQL 15 (production), SQLite allowed for local quick-start.
- GitHub Actions with vitest/pytest runners.

## Outstanding Decisions
- Finalize deployment automation for Raspberry Pi (CI-triggered vs. manual `deploy_pi.sh`).
- Determine monitoring/alerting for on-premise Pi instance.
- Evaluate real-time updates (WebSocket vs. polling) for dashboard status.
- Formalize backup retention policy and storage location for `backup_db.sh`.
