# Auan-Auan-Platform — Production Deployment Guide

## Architecture

```
User (LINE / Browser)
        ↓
  Cloudflare (Free Tier)
  ├── DNS
  ├── HTTPS / SSL
  ├── DDoS Protection
  ├── Caching (static assets)
  └── Rate Limiting
        ↓
  VPS (HTTP only, port 80)
        ↓
  Nginx (:80)
  ├── /          → Customer SPA
  ├── /admin/    → Admin SPA
  └── /api/      → Fastify API (:3000, internal)
                        ↓
                   PostgreSQL (:5432, internal)
```

## Quick Start

```bash
cp .env.production.example .env.production
# edit .env.production with real values
chmod +x scripts/*.sh
./scripts/deploy.sh
```

---

## Deployment Steps

### 1. Configure Environment

```bash
cp .env.production.example .env.production
```

Fill in all values. Required (API crashes without):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Customer auth (min 32 chars) |
| `STAFF_JWT_SECRET` | Admin auth (min 32 chars) |
| `LINE_CHANNEL_ID` | LINE channel |
| `LINE_CHANNEL_SECRET` | LINE channel |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE messaging |
| `POSTGRES_PASSWORD` | Database password |

Generate secrets:

```bash
openssl rand -hex 32
```

**Frontend env vars:** `VITE_API_BASE_URL` and `VITE_LIFF_ID` are NOT needed
when behind a reverse proxy. The frontend calls `/api/*` which Nginx proxies
to the backend. Set `VITE_LIFF_ID` only if you need LIFF SDK on the client.

### 2. Build and Deploy

The deploy script handles everything:

```bash
./scripts/deploy.sh
```

What it does:
1. Validates `.env.production`
2. Installs dependencies
3. Builds customer, admin, and API
4. Builds Docker images
5. Starts all containers
6. Runs health check

### 3. Verify

```bash
curl http://localhost/api/v1/health
```

---

## HTTPS via Cloudflare (Free Tier)

The stack serves HTTP on port 80. Cloudflare handles HTTPS.

### Cloudflare Setup

1. **Create account** at [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Add site** — enter your domain name
3. **Change nameservers** — Cloudflare gives you 2 NS records.
   Update them at your domain registrar. Takes up to 24 hours.
4. **Add DNS record:**
   - Type: `A`
   - Name: `@` (or subdomain like `app`)
   - IPv4: `YOUR_VPS_IP`
   - Proxy: **On** (orange cloud)
5. **SSL/TLS settings:**
   - Go to SSL/TLS → Overview
   - Mode: **Full (strict)**
   - This means Cloudflare connects to origin via HTTPS or HTTP,
     but requires a valid cert at Cloudflare's edge.
   - With "Full (strict)", Cloudflare still accepts HTTP from your VPS
     as long as origin is not publicly accessible. However, for strict
     mode, the origin must have a valid cert. If using Cloudflare Origin
     Certificates, install one on the VPS.

   **For simplicity on Free Tier:** Use **Full** mode (not strict).
   Cloudflare will connect to your VPS via HTTP on port 80. This is
   secure because your VPS firewall blocks all external access except
   Cloudflare IPs.

6. **Firewall (VPS):**
   ```bash
   # Allow only Cloudflare IP ranges + SSH
   ufw allow 22/tcp
   ufw allow from 173.245.48.0/20 to any port 80
   ufw allow from 103.21.244.0/22 to any port 80
   ufw allow from 103.22.200.0/22 to any port 80
   ufw allow from 103.31.4.0/22 to any port 80
   ufw allow from 141.101.64.0/18 to any port 80
   ufw allow from 108.162.192.0/18 to any port 80
   ufw allow from 190.93.240.0/20 to any port 80
   ufw allow from 188.114.96.0/20 to any port 80
   ufw allow from 197.234.240.0/22 to any port 80
   ufw allow from 198.41.128.0/17 to any port 80
   ufw allow from 162.158.0.0/15 to any port 80
   ufw allow from 104.16.0.0/13 to any port 80
   ufw allow from 104.24.0.0/14 to any port 80
   ufw allow from 172.64.0.0/13 to any port 80
   ufw allow from 131.0.72.0/22 to any port 80
   ufw allow from 2400:cb00::/32 to any port 80
   ufw allow from 2606:4700::/32 to any port 80
   ufw allow from 2803:f800::/32 to any port 80
   ufw allow from 2405:b500::/32 to any port 80
   ufw allow from 2405:8100::/32 to any port 80
   ufw allow from 2a06:98c0::/29 to any port 80
   ufw allow from 2c0f:f248::/32 to any port 80
   ufw enable
   ```

7. **Cloudflare caching rules** (recommended):
   - Go to Caching → Cache Rules
   - Rule 1: Static assets
     - Expression: `URI Path contains "/assets/"`
     - Browser Cache TTL: 1 year
     - Edge Cache TTL: 1 year
     - Cache Everything
   - Rule 2: API
     - Expression: `URI Path starts with "/api/"`
     - Browser Cache TTL: 0 seconds
     - Bypass Cache

8. **Security settings:**
   - Security → WAF → Enable
   - Security → Bots → Enable Bot Fight Mode
   - Security → Settings → Security Level: Medium

---

## Database Backup

```bash
./scripts/backup.sh           # Create backup
./scripts/backup.sh restore   # Restore latest
```

Backups stored in `backups/`. Auto-cleanup keeps last 30.

### Manual backup

```bash
docker exec auan-postgres pg_dump -U postgres auan_platform | gzip > backup.sql.gz
```

### Manual restore

```bash
gunzip -c backup.sql.gz | docker exec -i auan-postgres psql -U postgres auan_platform
```

### Automated backup (cron)

```bash
# Add to crontab: daily backup at 3 AM
crontab -e
0 3 * * * /path/to/project/scripts/backup.sh
```

---

## Useful Commands

```bash
./scripts/deploy.sh                      # Full deploy
./scripts/stop.sh                        # Stop all services
./scripts/logs.sh                        # View all logs
./scripts/logs.sh api -f                  # API logs, follow mode
./scripts/logs.sh nginx -f                # Nginx logs, follow mode
docker compose -f docker-compose.prod.yml ps         # Check status
docker compose -f docker-compose.prod.yml restart api  # Restart single service
docker compose -f docker-compose.prod.yml up -d --build  # Rebuild and restart
```

---

## Rollback

```bash
./scripts/stop.sh
./scripts/backup.sh restore
git checkout <previous-tag>
./scripts/deploy.sh
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API won't start | Check `.env.production` — all required vars must be real values, not placeholders |
| Health check fails | `./scripts/logs.sh api` — check startup errors |
| DB connection refused | `docker compose -f docker-compose.prod.yml ps` — postgres must be healthy |
| Frontend 404 | Run `pnpm --filter @auan/customer build` — nginx bind-mounts `dist/` |
| Admin 404 | Run `pnpm --filter @auan/admin build` — nginx bind-mounts `dist/` |
| LINE Webhook fails | Verify `LINE_WEBHOOK_PATH` matches LINE Developers Console |
| CORS errors | Set `FRONTEND_URL` to your actual domain in `.env.production` |
| Cloudflare SSL error | Set SSL/TLS mode to "Full" (not strict) if no cert on VPS |
| 502 Bad Gateway | API container unhealthy — check `./scripts/logs.sh api` |

---

## Security Checklist

- [ ] `JWT_SECRET` and `STAFF_JWT_SECRET` are strong random values
- [ ] `POSTGRES_PASSWORD` is strong
- [ ] Cloudflare proxy (orange cloud) enabled on DNS record
- [ ] SSL/TLS mode set to "Full" or "Full (strict)"
- [ ] VPS firewall allows only Cloudflare IPs + SSH
- [ ] `JWT_COOKIE_SECURE=true` in `.env.production`
- [ ] Swagger docs not publicly accessible (blocked by firewall)
- [ ] `.env.production` NOT in git
- [ ] Backup cron job configured

## Ports

| Service | Internal | External | Notes |
|---------|----------|----------|-------|
| Nginx | 80 | 80 (Cloudflare only) | VPS firewall limits to CF IPs |
| API | 3000 | None | Internal only |
| PostgreSQL | 5432 | None | Internal only |
