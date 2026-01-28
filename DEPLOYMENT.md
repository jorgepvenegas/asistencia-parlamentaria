# Deployment Guide - QuienAtiende

**Last Updated**: 2026-01-27
**Status**: Production Ready

## Overview

This guide covers deploying QuienAtiende to various environments (local, staging, production). The application consists of:
- **Frontend**: Astro static site + interactive components (served on port 3001)
- **API**: Hono.js REST backend (served on port 3000)
- **Database**: SQLite with automatic migrations

## Quick Start

### Local Development

```bash
# Install and setup
./deploy.sh local

# Start API (terminal 1)
cd packages/api
pnpm run dev

# Start Frontend (terminal 2)
cd packages/frontend
pnpm run dev

# Open browser
open http://localhost:3001
```

### Staging Deployment

```bash
# Build and validate everything
./deploy.sh staging

# Push to staging environment
git push origin staging
```

### Production Deployment

```bash
# Prepare for production
./deploy.sh production

# Push to production
git push origin main
```

## Environment Configuration

Create environment-specific `.env` files:

### `.env.local`
```bash
NODE_ENV=development
API_URL=http://localhost:3000
API_PORT=3000
FRONTEND_URL=http://localhost:3001
FRONTEND_PORT=3001
DB_PATH=./quienatiende.db
```

### `.env.staging`
```bash
NODE_ENV=production
API_URL=https://api-staging.example.com
API_PORT=3000
FRONTEND_URL=https://staging.example.com
FRONTEND_PORT=443
DB_PATH=/data/quienatiende.db
```

### `.env.production`
```bash
NODE_ENV=production
API_URL=https://api.quienatiende.cr
API_PORT=443
FRONTEND_URL=https://quienatiende.cr
FRONTEND_PORT=443
DB_PATH=/var/lib/quienatiende/quienatiende.db
```

## Automated Deployment

### GitHub Actions

The repository includes automated workflows:

#### 1. Daily Data Fetch (`.github/workflows/fetch-daily.yml`)
Runs every day at 3am PT (10am UTC) to fetch new attendance data:
- Executes with up to 3 automatic retries
- Updates database with new records
- Creates GitHub issue on failure
- Logs results in Actions tab

#### 2. Performance Monitoring (`.github/workflows/lighthouse.yml`)
Runs on push/PR to track performance:
- Bundles size check (must be <500KB)
- Lighthouse audit scores
- Comments results on PRs
- Uploads detailed reports

#### 3. Tests (`.github/workflows/test.yml`)
Runs on every push:
- Unit tests for API & frontend
- E2E tests (desktop & mobile)
- TypeScript compilation check
- Linting & formatting validation

## Deployment Steps

### Step 1: Prepare Code

```bash
# Update dependencies
pnpm install

# Verify tests pass locally
pnpm run test
pnpm run test:e2e

# Check code quality
pnpm run lint
pnpm run format:check
```

### Step 2: Build

```bash
# Using deployment script (recommended)
./deploy.sh [environment]

# Or manual build
pnpm -r run build
pnpm -F frontend run analyze:bundle
```

### Step 3: Database Migration

```bash
# Automatic (via deploy.sh)
./deploy.sh production

# Or manual
cd packages/api
pnpm run migrate
```

### Step 4: Start Services

#### Option A: Using PM2 (Production Recommended)

```bash
# Install PM2
npm install -g pm2

# Start API
cd packages/api
pm2 start "pnpm run start" --name quienatiende-api --max-memory-restart 512M

# Start Frontend
cd packages/frontend
pm2 start "pnpm run preview" --name quienatiende-frontend

# Monitor
pm2 logs quienatiende-api
pm2 monit

# Restart on reboot
pm2 startup
pm2 save
```

#### Option B: Using Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy files
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm -r run build

# Expose ports
EXPOSE 3000 3001

# Start services
CMD ["pnpm", "-r", "run", "start"]
```

#### Option C: Using systemd (Linux)

Create `/etc/systemd/system/quienatiende.service`:

```ini
[Unit]
Description=QuienAtiende Service
After=network.target

[Service]
Type=simple
User=quienatiende
WorkingDirectory=/opt/quienatiende
ExecStart=/opt/quienatiende/start.sh
Restart=always
RestartSec=10
StandardOutput=journal

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable quienatiende
sudo systemctl start quienatiende
sudo systemctl status quienatiende
```

### Step 5: Web Server Configuration

#### Nginx (Recommended)

```nginx
upstream api {
  server 127.0.0.1:3000;
}

upstream frontend {
  server 127.0.0.1:3001;
}

server {
  listen 443 ssl http2;
  server_name quienatiende.cr;

  # SSL certificates
  ssl_certificate /etc/letsencrypt/live/quienatiende.cr/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/quienatiende.cr/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Frontend
  location / {
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # API
  location /api {
    proxy_pass http://api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type' always;

    if ($request_method = 'OPTIONS') {
      return 204;
    }
  }

  # Caching
  location ~* \.(js|css|svg|woff|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1024;
}

# HTTP redirect to HTTPS
server {
  listen 80;
  server_name quienatiende.cr;
  return 301 https://$server_name$request_uri;
}
```

#### Apache

```apache
<VirtualHost *:443>
  ServerName quienatiende.cr
  SSLEngine on
  SSLCertificateFile /etc/letsencrypt/live/quienatiende.cr/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/quienatiende.cr/privkey.pem

  # Enable modules
  a2enmod proxy
  a2enmod proxy_http
  a2enmod headers
  a2enmod ssl
  a2enmod rewrite

  # Frontend
  ProxyPass / http://127.0.0.1:3001/
  ProxyPassReverse / http://127.0.0.1:3001/

  # API
  ProxyPass /api http://127.0.0.1:3000/api
  ProxyPassReverse /api http://127.0.0.1:3000/api

  # Security headers
  Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
</VirtualHost>
```

## Post-Deployment

### Health Checks

```bash
# API health
curl https://api.quienatiende.cr/api/metadata

# Frontend availability
curl https://quienatiende.cr

# Database status
curl https://api.quienatiende.cr/api/politicians?limit=1
```

### Monitoring

#### Log Files
```bash
# API logs
tail -f /var/log/quienatiende/api.log

# Frontend logs
tail -f /var/log/quienatiende/frontend.log

# Database access
sqlite3 /data/quienatiende.db "SELECT COUNT(*) as total_records FROM attendance_records;"
```

#### Performance Monitoring
- **Lighthouse CI**: Check `.lighthouseci/manifest.json` for performance metrics
- **Bundle Size**: Run `pnpm -F frontend run analyze:bundle`
- **Load Testing**: `ab -n 1000 -c 10 https://quienatiende.cr`

### Backup Strategy

```bash
#!/bin/bash
# Backup database daily
BACKUP_DIR="/backups/quienatiende"
mkdir -p $BACKUP_DIR

sqlite3 /data/quienatiende.db ".backup $BACKUP_DIR/quienatiende-$(date +%Y%m%d-%H%M%S).db"

# Keep only last 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
```

### Data Updates

Daily data fetch runs automatically via GitHub Actions at 3am PT. To manually trigger:

```bash
# Trigger GitHub Actions manually
gh workflow run fetch-daily.yml

# Or run locally
pnpm -F automation run fetch-attendance
```

## Rollback Procedure

```bash
# If deployment fails, revert to previous version
git revert HEAD
./deploy.sh production

# Or restore from backup
sqlite3 /data/quienatiende.db ".restore /backups/quienatiende/quienatiende-[date].db"
```

## Troubleshooting

### Database Locked
```bash
# Check if process is still running
lsof /data/quienatiende.db

# Kill stale processes
kill -9 [pid]

# Restart service
pm2 restart quienatiende-api
```

### High Memory Usage
```bash
# Check memory
ps aux | grep node

# Increase PM2 memory limit in ecosystem.config.js
max_memory_restart: "1G"

# Restart
pm2 restart all
```

### Slow Performance
```bash
# Run analysis
pnpm -F frontend run analyze:bundle
pnpm -F api run test:performance

# Check database indices
sqlite3 /data/quienatiende.db ".indices"

# Check slow queries
sqlite3 /data/quienatiende.db ".timer on"
```

## Security Checklist

- [ ] Enable HTTPS only (redirect HTTP to HTTPS)
- [ ] Set security headers (HSTS, CSP, X-Frame-Options)
- [ ] Configure CORS properly (API only allows frontend origin)
- [ ] Enable database backups
- [ ] Setup monitoring and alerting
- [ ] Restrict database file permissions (600)
- [ ] Use environment variables for secrets (never commit)
- [ ] Enable rate limiting on API
- [ ] Audit log all data access

## Support & Escalation

For deployment issues:
1. Check GitHub Actions logs: https://github.com/your-repo/actions
2. Review server logs: `/var/log/quienatiende/`
3. Check database integrity: `sqlite3 quienatiende.db "PRAGMA integrity_check;"`
4. Create issue with logs attached

## Related Documentation

- [MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md) - Mobile testing & optimization
- [quickstart.md](./specs/001-attendance-visibility/quickstart.md) - Local development setup
- [plan.md](./specs/001-attendance-visibility/plan.md) - Architecture & design decisions
