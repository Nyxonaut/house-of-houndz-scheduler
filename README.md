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
5. Run backend locally (temporary placeholder):
   ```bash
   python backend/manage.py
   ```

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
This repository currently contains scaffolding for Prompt 1. Full implementation will occur after aligning on requirements and architecture.
