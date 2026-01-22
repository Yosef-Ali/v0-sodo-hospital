# Sodo Hospital - VPS Deployment Guide

## Local Development with VPS Database

### Quick Start (Connect to VPS Database)

```bash
# Terminal 1: Start SSH tunnel (keep this running)
pnpm db:tunnel

# Terminal 2: Run the app
pnpm dev
```

### Switch Between Databases

```bash
# Use VPS Docker PostgreSQL
pnpm db:vps

# Use Neon Cloud PostgreSQL  
pnpm db:neon

# Check current database
./scripts/switch-db.sh
```

### Database Connection Details (VPS)
| Item | Value |
|------|-------|
| Local Port | localhost:5433 |
| Remote | 72.62.170.70:5432 |
| Database | sodo_hospital |
| User | postgres |
| Password | sodo2024secure |

---

## Live URLs

| Service | URL |
|---------|-----|
| **Main App** | https://sch-addis.org |
| **MinIO Console** | http://72.62.170.70:9001 |

## Server Details

| Item | Value |
|------|-------|
| **IP Address** | 72.62.170.70 |
| **Domain** | sch-addis.org |
| **Provider** | Hostinger KVM 2 |
| **OS** | Ubuntu 24.04 |
| **Specs** | 2 vCPU, 8GB RAM, 100GB NVMe |
| **SSL** | Let's Encrypt (auto-renews) |

---

## SSH Access

```bash
# Connect to server
ssh root@72.62.170.70
```

---

## Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| app | sodo-hospital-app | 127.0.0.1:3000 | Next.js App |
| db | postgres:16-alpine | 5432 | Database |
| redis | redis:7-alpine | 6379 | Cache |
| minio | minio/minio | 9000, 9001 | Document Storage |
| nginx | system | 80, 443 | Reverse Proxy + SSL |

### Database Credentials
```
Host: db (internal) or localhost
Port: 5432
Database: sodo_hospital
User: postgres
Password: sodo2024secure
```

### MinIO (Document Storage)
```
Console URL: http://72.62.170.70:9001
Storage URL: https://sch-addis.org/storage/documents/
Username: minioadmin
Password: minioadmin123
Bucket: documents
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

### Ethiopian Network / TLS Timeout Issue

**Symptom:** Website works locally on VPS but TLS handshake times out from Ethiopian networks.

**Cause:** Ethiopian ISPs have routing issues that drop large TLS packets (MTU problem).

**Solution:** Set VPS network MTU to 1200.

```bash
# Check current MTU
ssh root@72.62.170.70 "ip link show eth0 | grep mtu"

# Temporarily set MTU (lost on reboot)
ssh root@72.62.170.70 "ip link set eth0 mtu 1200"

# Make MTU permanent via netplan
ssh root@72.62.170.70 "cat /etc/netplan/99-custom-mtu.yaml"
# Should show: mtu: 1200
```

**Permanent MTU Config Files:**
- `/etc/netplan/99-custom-mtu.yaml` - MTU setting
- `/etc/cloud/cloud.cfg.d/99-disable-network-config.cfg` - Prevents cloud-init from overriding

### SSH Not Working

**Symptom:** SSH connection times out or hangs at banner exchange.

**Fix:**
```bash
# Via Hostinger Browser Terminal:
sudo systemctl start ssh
sudo systemctl enable ssh

# Disable DNS lookups for faster connections
echo "UseDNS no" >> /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### Firewall Issues

If external access fails but internal works:
```bash
# Check Hostinger VPS Panel → Firewall rules
# Ensure these ports are ALLOWED:
# - TCP 22 (SSH)
# - TCP 80 (HTTP)
# - TCP 443 (HTTPS)

# Check internal firewall (should be disabled)
sudo ufw status
# Should show: inactive
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

*Last updated: January 6, 2026*
