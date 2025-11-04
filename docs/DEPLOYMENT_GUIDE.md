# WombGuard Deployment Guide

## 🚀 Production Deployment

This guide covers deploying WombGuard to production environments.

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Code reviewed and approved
- [ ] Security audit completed
- [ ] Performance optimized

### Configuration
- [ ] Environment variables set
- [ ] Database migrations complete
- [ ] API keys configured
- [ ] CORS settings updated
- [ ] SSL certificates ready

### Data
- [ ] Database backups created
- [ ] Data migration tested
- [ ] Rollback plan documented
- [ ] Monitoring configured

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

**Advantages:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments
- Easy rollbacks

**Steps:**

1. **Connect Repository**
```bash
npm install -g vercel
vercel login
```

2. **Deploy**
```bash
cd Desktop/wombguard_frontend
vercel
```

3. **Configure Environment**
- Add environment variables in Vercel dashboard
- Set `REACT_APP_API_URL` to production API
- Set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`

4. **Custom Domain**
- Add domain in Vercel settings
- Update DNS records

### Option 2: Netlify

**Steps:**

1. **Build**
```bash
npm run build
```

2. **Deploy**
- Drag & drop `build/` folder to Netlify
- Or connect GitHub for auto-deployment

3. **Configure**
- Set environment variables
- Configure redirects in `netlify.toml`

### Option 3: AWS S3 + CloudFront

**Steps:**

1. **Build**
```bash
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://wombguard-frontend
```

3. **Upload**
```bash
aws s3 sync build/ s3://wombguard-frontend --delete
```

4. **CloudFront Distribution**
- Create distribution pointing to S3
- Set default root object to `index.html`
- Configure error pages

---

## 🔧 Backend Deployment

### Option 1: AWS EC2

**Steps:**

1. **Launch Instance**
- Ubuntu 22.04 LTS
- t3.medium or larger
- Security group: Allow 80, 443, 8000

2. **Setup Server**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx -y
```

3. **Deploy Application**
```bash
git clone <repo-url>
cd wombguard_frontend/wombguard_predictive_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. **Configure Gunicorn**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

5. **Setup Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name api.wombguard.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

6. **Enable HTTPS**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --nginx -d api.wombguard.com
```

### Option 2: Google Cloud Run

**Steps:**

1. **Create Dockerfile**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build & Deploy**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/wombguard-api
gcloud run deploy wombguard-api \
  --image gcr.io/PROJECT_ID/wombguard-api \
  --platform managed \
  --region us-central1
```

### Option 3: Heroku

**Steps:**

1. **Create Procfile**
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. **Deploy**
```bash
heroku login
heroku create wombguard-api
git push heroku main
```

3. **Configure Environment**
```bash
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_KEY=...
```

---

## 🗄️ Database Deployment

### Supabase (Recommended)

**Already Configured:**
- Project URL: https://tbpvwccscohkpelfswxo.supabase.co
- Tables created via `supabase_setup.sql`
- RLS policies enabled

**Backup Strategy:**
```bash
# Automated daily backups in Supabase dashboard
# Manual backup:
pg_dump postgresql://user:password@host/db > backup.sql
```

### Self-Hosted PostgreSQL

**Steps:**

1. **Install PostgreSQL**
```bash
sudo apt install postgresql postgresql-contrib -y
```

2. **Create Database**
```bash
sudo -u postgres createdb wombguard
```

3. **Run Schema**
```bash
psql -U postgres -d wombguard < supabase_setup.sql
```

4. **Configure Backups**
```bash
# Daily backup script
0 2 * * * pg_dump wombguard > /backups/wombguard_$(date +\%Y\%m\%d).sql
```

---

## 🔐 Security Hardening

### Frontend
- [ ] Enable HTTPS only
- [ ] Set security headers
- [ ] Configure CSP
- [ ] Enable HSTS

### Backend
- [ ] Enable HTTPS
- [ ] Set CORS properly
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection

### Database
- [ ] Enable encryption at rest
- [ ] Enable encryption in transit
- [ ] Regular backups
- [ ] Access logs
- [ ] RLS policies

### Infrastructure
- [ ] Firewall rules
- [ ] VPC configuration
- [ ] DDoS protection
- [ ] WAF rules

---

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# Install monitoring tools
pip install prometheus-client
pip install sentry-sdk
```

### Log Aggregation
- CloudWatch (AWS)
- Stackdriver (GCP)
- ELK Stack (self-hosted)

### Alerts
- CPU > 80%
- Memory > 85%
- Error rate > 1%
- Response time > 1s

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: npm run build
      - name: Deploy
        run: vercel --prod
```

---

## 📈 Performance Optimization

### Frontend
- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Minification
- [ ] Caching strategy

### Backend
- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching (Redis)
- [ ] Load balancing
- [ ] Auto-scaling

---

## 🔄 Rollback Procedure

### Frontend
```bash
# Vercel
vercel rollback

# Manual
git revert <commit-hash>
npm run build
# Redeploy
```

### Backend
```bash
# Stop current version
systemctl stop wombguard

# Restore previous version
git checkout <previous-tag>
pip install -r requirements.txt

# Start
systemctl start wombguard
```

---

## 📞 Post-Deployment

### Verification
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Database connected
- [ ] Authentication working
- [ ] Predictions working
- [ ] Chat functional

### Monitoring
- [ ] Error logs checked
- [ ] Performance metrics normal
- [ ] User feedback collected
- [ ] Alerts configured

### Documentation
- [ ] Update runbooks
- [ ] Document issues
- [ ] Update team
- [ ] Plan next release

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check backend health |
| CORS errors | Verify CORS settings |
| Database connection | Check credentials |
| High latency | Check database indexes |
| Memory leak | Profile application |

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [AWS Deployment](https://aws.amazon.com/getting-started/)
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Last Updated**: October 2025  
**Version**: 1.0.0

