# Soddo Christian Hospital - Permit Management System

A full-stack web application for managing work permits, residence IDs, and medical licenses for foreign workers at Soddo Christian Hospital, Ethiopia.

**Production:** [https://sch-addis.org](https://sch-addis.org)

## Features

- Foreigner Management - Track foreign workers, documents, and permit status
- Permit Tracking - Work Permits, Residence IDs, and Medical Licenses
- Document Management - Upload, organize, and track required documents
- Workflow Stages - Track permit applications through each stage
- Dashboard - Real-time statistics and overview
- AI Assistant - Built-in chatbot for permit inquiries
- Calendar - Task tracking with due dates and expiration alerts
- Notification Bell - Urgent issue alerts
- Responsive Design - Desktop and mobile
- Role-Based Access - Admin, HR Manager, HR Staff, and Logistics roles

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** PostgreSQL 16 with Drizzle ORM
- **Authentication:** NextAuth.js v5
- **File Storage:** MinIO (S3-compatible)
- **Caching:** Redis 7
- **Deployment:** Docker, GitHub Actions, Nginx, Let's Encrypt SSL

## Local Development

```bash
git clone https://github.com/Yosef-Ali/v0-sodo-hospital.git
cd v0-sodo-hospital
pnpm install
cp .env.example .env.local
pnpm db:push
pnpm dev
```

## Production Deployment

Deployment is **automatic** via GitHub Actions. Push to `master` triggers the pipeline:

```
Push to master -> Build Docker image -> Push to GHCR -> SSH into VPS -> docker compose pull & restart
```

### Deploy

```bash
git push origin master
```

### Check deploy status

```bash
gh run list --limit 3
gh run watch <run-id> --exit-status
```

Or visit: https://github.com/Yosef-Ali/v0-sodo-hospital/actions

### If deploy fails

```bash
gh run view <run-id> --log-failed
gh run rerun <run-id> --failed
```

### Manual deploy (if GitHub Action is down)

```bash
ssh root@72.62.170.70
cd /root/sodo-hospital
bash scripts/deploy-vps.sh
```

## Production Stack

| Service | Image | Port |
|---------|-------|------|
| App | `ghcr.io/yosef-ali/v0-sodo-hospital:latest` | 3000 |
| PostgreSQL | `postgres:16-alpine` | 5432 |
| Redis | `redis:7-alpine` | 6379 |
| MinIO | `minio/minio:latest` | 9000, 9001 |

### Key files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `Dockerfile` | Docker build (Node 20, pnpm, standalone) |
| `docker-compose.yml` | Production stack |
| `scripts/deploy-vps.sh` | Manual deploy script |
| `scripts/start-db-tunnel.sh` | SSH tunnel for local dev with VPS DB |
| `scripts/dev-vps.sh` | Start local dev with VPS database |
| `scripts/switch-db.sh` | Switch between VPS and Neon DB |

## Project Structure

```
app/                  # Next.js App Router
  api/                # API routes (upload, files, chat)
  dashboard/          # Dashboard pages
  login/              # Authentication
components/           # React components
  ui/                 # UI components
  sheets/             # Side panel forms
  pages/              # Page components
lib/                  # Utilities
  db/                 # Database schema & migrations
  actions/            # Server actions
  storage/            # S3/MinIO client
hooks/                # Custom React hooks
scripts/              # Deploy and dev scripts
```

## Git Workflow

- `master` - Development branch, auto-deploys to VPS on push
- `main` - Production branch, synced from master via PRs

## License

Proprietary software for Soddo Christian Hospital.
