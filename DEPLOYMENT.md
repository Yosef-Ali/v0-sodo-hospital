# Sodo Hospital - VPS Deployment Guide

## Server Details

| Item | Value |
|------|-------|
| **IP Address** | 72.62.170.70 |
| **Live URL** | http://72.62.170.70 |
| **Provider** | Hostinger KVM 2 |
| **OS** | Ubuntu 24.04 |
| **Specs** | 2 vCPU, 8GB RAM, 100GB NVMe |

---

## SSH Access

```bash
# Connect to server
ssh root@72.62.170.70
```

---

## Docker Services

| Service | Image | Port |
|---------|-------|------|
| app | sodo-hospital-app | 80 → 3000 |
| db | postgres:16-alpine | 5432 |
| redis | redis:7-alpine | 6379 |

### Database Credentials
```
Host: db (internal) or localhost
Port: 5432
Database: sodo_hospital
User: postgres
Password: sodo2024secure
```

---

## Common Commands

### View Logs
```bash
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml logs -f app"
```

### Restart App
```bash
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml restart app"
```

### Check Status
```bash
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml ps"
```

### Rebuild & Deploy Manually
```bash
ssh root@72.62.170.70 "cd /root/sodo-hospital && git pull origin master && docker compose build app --no-cache && docker compose up -d app"
```

### View Database
```bash
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml exec db psql -U postgres -d sodo_hospital"
```

### Run Migrations
```bash
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml exec app npx drizzle-kit push"
```

### Stop All Services
```bash
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml down"
```

### Start All Services
```bash
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml up -d"
```

---

## Auto-Deploy (GitHub Actions)

**How it works:**
1. Push code to `master` branch
2. GitHub Action triggers automatically
3. VPS pulls code, rebuilds, and restarts

**Monitor deployments:** 
https://github.com/Yosef-Ali/v0-sodo-hospital/actions

**GitHub Secret Required:**
- Name: `VPS_SSH_KEY`
- Location: Repository Settings → Secrets → Actions

---

## Environment Variables (Production)

```env
DATABASE_URL=postgresql://postgres:sodo2024secure@db:5432/sodo_hospital
REDIS_URL=redis://redis:6379
NEXTAUTH_URL=http://72.62.170.70
NEXTAUTH_SECRET=sodo-hospital-secret-2024-production
AUTH_SECRET=sodo-hospital-auth-2024-production
NODE_ENV=production
```

---

## Add Custom Domain

1. **Point DNS to server:**
   - A Record: `yourdomain.com` → `72.62.170.70`
   - A Record: `www.yourdomain.com` → `72.62.170.70`

2. **Update NEXTAUTH_URL in docker-compose.yml:**
   ```yaml
   NEXTAUTH_URL: https://yourdomain.com
   ```

3. **Rebuild:**
   ```bash
   git add . && git commit -m "Update domain" && git push origin master
   ```

---

## Add SSL (HTTPS)

```bash
# SSH into server
ssh root@72.62.170.70

# Install Certbot
apt update && apt install -y certbot

# Stop app temporarily
docker compose -f /root/sodo-hospital/docker-compose.yml stop app

# Get certificate (replace yourdomain.com)
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

---

## Troubleshooting

### App not responding
```bash
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml logs app --tail 50"
```

### Port 80 in use
```bash
ssh root@72.62.170.70 "lsof -i :80"
ssh root@72.62.170.70 "fuser -k 80/tcp"
```

### Disk space
```bash
ssh root@72.62.170.70 "df -h && docker system prune -af"
```

### Memory usage
```bash
ssh root@72.62.170.70 "free -h && docker stats --no-stream"
```

---

## Backup Database

```bash
# Create backup
ssh root@72.62.170.70 "docker compose -f /root/sodo-hospital/docker-compose.yml exec db pg_dump -U postgres sodo_hospital > /root/backup-$(date +%Y%m%d).sql"

# Download backup
scp root@72.62.170.70:/root/backup-*.sql ./
```

---

## File Locations

| Item | Path |
|------|------|
| App code (VPS) | `/root/sodo-hospital` |
| Docker compose | `/root/sodo-hospital/docker-compose.yml` |
| Postgres data | Docker volume: `sodo-hospital_postgres_data` |

---

## Login Credentials

### Admin Account
| Field | Value |
|-------|-------|
| Email | admin@sodohospital.com |
| Password | Admin@123 |
| Role | ADMIN |

### Other Test Accounts (same password: Admin@123)
| Email | Role |
|-------|------|
| hr.manager@sodohospital.com | HR_MANAGER |
| hr.staff@sodohospital.com | HR |
| logistics@sodohospital.com | LOGISTICS |

---

*Last updated: January 5, 2026*
