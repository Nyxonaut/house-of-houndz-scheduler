# House of Houndz Scheduler

The House of Houndz Scheduler is a full-stack system designed to manage kennel bookings, staff coordination, and customer communication. The platform runs on a Raspberry Pi for on-premise resilience while leveraging Django, React, PostgreSQL, and Nginx.

## System Overview
- **Frontend:** React + Tailwind UI served via Nginx.
- **Backend:** Django REST Framework API running under Gunicorn.
- **Database:** PostgreSQL 15 with scheduled backups.
- **Deployment:** Docker Compose orchestration on Raspberry Pi.
- **Reverse Proxy:** Nginx load balancing frontend and backend traffic.

## Development Environment
1. Clone the repository and install prerequisites (`python3`, `pip`, `node`, `docker`, `docker compose`).
2. Copy environment examples to real files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Create a Python virtual environment and install backend dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```
4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Additional frontend scripts:
   ```bash
   npm run test
   npm run typecheck
   ```
5. Run backend locally:
   ```bash
   python backend/manage.py migrate
   python backend/manage.py runserver
   ```
   To run backend tests:
   ```bash
   python backend/manage.py test
   ```

### Demo data
Populate the database with a starter set of 13 suites, a demo owner/pet, and a sample checked-in booking:
```bash
python backend/manage.py seed_demo_data
```

### Backend environment variables
The Django service reads configuration from `backend/.env`. Key values include:
- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL` (e.g. `postgresql://houndz_user:securepassword@localhost:5432/houndz_db`)
- `DJANGO_STATIC_ROOT`, `DJANGO_MEDIA_ROOT`

### Frontend environment variables
Define variables in `frontend/.env`:
- `VITE_API_BASE_URL` (required, e.g. `http://localhost:8000/api`)
- `VITE_BOOKING_POLL_MS` (optional polling interval for dashboard refresh)

### Seed data before using the UI
- Use Django admin (`http://localhost:8000/admin/`) or fixtures to create suite records (recommend labels `Suite 1`–`Suite 13`).
- Add at least one owner and pet so the calendar and resident dashboard have context.
- Run `python backend/manage.py createsuperuser` if you need admin credentials.
- On the “Add pet” admin form, start typing an owner's name into the autocomplete field to reveal matches. The inline “+” button can also create a new owner without leaving the form.

## Frontend Highlights (Sprint 4)
- **New Booking Intake** – Create bookings with existing or new owners/pets, capture notes, and receive inline conflict warnings before submitting.
- **Weekly Calendar** – Navigate by week, view suite occupancy at a glance, and spot overlaps with color-coded statuses.
- **Resident Dashboard** – Manage check-ins/check-outs, toggle bathing status, review special needs icons, and filter suites (checked-in, booked, vacant).
- **Global Toasts & Skeletons** – Success/error toasts and loading placeholders improve operator feedback during daily use.

## Dockerized Workflow
```bash
docker compose build
docker compose up
```

Services:
- `backend`: Django API available on `http://localhost:8000`
- `frontend`: React app available on `http://localhost:3000`
- `nginx`: Reverse proxy exposed on `http://localhost`
- `db`: PostgreSQL available on `localhost:5432`

## Raspberry Pi Deployment
1. Run `scripts/setup_pi.sh` once to install system dependencies and Docker.
2. Clone the repository onto the Pi and copy environment files as above.
3. Deploy with `scripts/deploy_pi.sh`.
4. Schedule database backups:
   ```bash
   0 2 * * * /path/to/scripts/backup_db.sh /path/to/backups >> /var/log/house-of-houndz-backup.log 2>&1
   ```

## Git & GitHub Bootstrap
Run these commands from the repository root to initialize version control and publish to GitHub:
```bash
git init
git add .
git commit -m "feat: initial repository scaffolding"

gh auth login
gh repo create house-of-houndz-scheduler --public --source=. --remote=origin

git push -u origin main

git checkout -b dev
git branch feature/backend-models
git branch feature/frontend-calendar
```

Tag releases as `v0.1.0`, `v0.2.0`, etc. Enable GitHub Issues and Discussions, then add default labels (`backend`, `frontend`, `docs`, `bug`, `enhancement`).

## Project Status
Back-end domain models and API endpoints are in place (Sprint 2). Front-end now ships booking intake, live calendar, and resident dashboard experiences with toast notifications and tests (Sprint 4). Upcoming work will focus on real-time updates, deployment automation, and Cloudflare Tunnel guidance.
