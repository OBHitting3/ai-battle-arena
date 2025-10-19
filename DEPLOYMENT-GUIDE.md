# 🚀 Production Deployment Guide

Complete guide to deploy the Faceless Automation Platform to production.

---

## Architecture Overview

```
┌─────────────────┐
│  Next.js Client │  (Vercel)
│  Dashboard UI   │
└────────┬────────┘
         │
    HTTPS API
         │
┌────────▼────────┐
│  FastAPI Backend│  (AWS Lambda / EC2)
│  REST API       │
└────────┬────────┘
         │
    ┌────┴──────┬─────────────┬──────────────┐
    │           │             │              │
┌───▼───┐  ┌───▼────┐  ┌────▼──────┐  ┌────▼─────┐
│PostgreSQL │Temporal │  S3 Assets │  │  Stripe  │
│ Database  │ Cloud  │   Storage  │  │  Connect │
└───────────┘└────────┘  └───────────┘  └──────────┘
```

---

## Deployment Options

### Option A: Serverless (Recommended for MVP)
- **Frontend**: Vercel (Next.js)
- **Backend**: AWS Lambda (FastAPI via Mangum)
- **Database**: AWS RDS PostgreSQL
- **Temporal**: Temporal Cloud
- **Storage**: AWS S3
- **Cost**: ~$50-200/month for 1,000 videos

### Option B: Full Cloud (Production Scale)
- **Frontend**: Vercel
- **Backend**: AWS ECS/Fargate
- **Database**: AWS RDS Multi-AZ
- **Temporal**: Temporal Cloud (Production tier)
- **Storage**: AWS S3 + CloudFront CDN
- **Cost**: ~$500-1,000/month for 10K+ videos

### Option C: Hybrid (Development)
- **Frontend**: Localhost:3000
- **Backend**: Localhost:8000
- **Database**: Local PostgreSQL
- **Temporal**: Local Temporal server
- **Storage**: Local filesystem
- **Cost**: $0

---

## Step-by-Step Deployment

### Phase 1: Pre-Deployment Setup

#### 1. Environment Variables
Create `.env.production` with all credentials:

```bash
# Database
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/db

# APIs
OPENAI_API_KEY=sk-...
PEXELS_API_KEY=...
ELEVENLABS_API_KEY=...
ADOBE_FIREFLY_API_KEY=...

# Temporal Cloud
TEMPORAL_CLOUD=true
TEMPORAL_ADDRESS=namespace.tmprl.cloud:7233
TEMPORAL_NAMESPACE=faceless-automation
TEMPORAL_CLIENT_CERT_PATH=./certs/client.pem
TEMPORAL_CLIENT_KEY_PATH=./certs/client-key.pem

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PLATFORM_FEE_PERCENT=30

# JWT
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AWS
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=faceless-automation-assets
AWS_REGION=us-east-1

# YouTube
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
```

#### 2. Security Checklist
- [ ] Rotate all API keys
- [ ] Generate new JWT secret
- [ ] Enable HTTPS only
- [ ] Configure CORS allowlist
- [ ] Setup rate limiting
- [ ] Enable database encryption
- [ ] Setup backup strategy

---

### Phase 2: Database Deployment

#### AWS RDS PostgreSQL Setup

```bash
# 1. Create RDS instance (via AWS Console or CLI)
aws rds create-db-instance \
  --db-instance-identifier faceless-automation-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password <strong-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --backup-retention-period 7 \
  --multi-az false

# 2. Wait for availability
aws rds wait db-instance-available \
  --db-instance-identifier faceless-automation-db

# 3. Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier faceless-automation-db \
  --query 'DBInstances[0].Endpoint.Address'

# 4. Update DATABASE_URL in .env.production
```

#### Run Migrations

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
cd backend
export DATABASE_URL=postgresql://...  # Use RDS endpoint
alembic upgrade head

# Verify
psql $DATABASE_URL -c "\dt"
# Should show: users, projects, scripts, payments, analytics
```

---

### Phase 3: Backend Deployment (AWS Lambda)

#### Option 1: Serverless Framework

**Install Serverless**:
```bash
npm install -g serverless
serverless plugin install -n serverless-python-requirements
```

**Create `serverless.yml`**:
```yaml
service: faceless-automation-api

provider:
  name: aws
  runtime: python3.11
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    PEXELS_API_KEY: ${env:PEXELS_API_KEY}
    # ... all other env vars

functions:
  api:
    handler: backend/lambda_handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    timeout: 300
    memorySize: 2048

plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: true
```

**Create Lambda handler** (`backend/lambda_handler.py`):
```python
from mangum import Mangum
from app.main import app

handler = Mangum(app)
```

**Deploy**:
```bash
serverless deploy --stage production

# Output:
# endpoints:
#   ANY - https://xxxxxx.execute-api.us-east-1.amazonaws.com/production/{proxy+}
```

#### Option 2: Manual Lambda Deployment

```bash
# 1. Package application
cd backend
pip install -r requirements.txt -t package/
cp -r app package/
cd package && zip -r ../lambda.zip .

# 2. Create Lambda function
aws lambda create-function \
  --function-name faceless-automation-api \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler lambda_handler.handler \
  --zip-file fileb://lambda.zip \
  --timeout 300 \
  --memory-size 2048

# 3. Create API Gateway
aws apigateway create-rest-api --name faceless-automation-api

# 4. Configure routes and deploy
```

---

### Phase 4: Frontend Deployment (Vercel)

#### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Navigate to client
cd client

# 4. Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-api-gateway-url.amazonaws.com/production

# 5. Deploy
vercel --prod

# Output:
# ✅ Production: https://faceless-automation.vercel.app
```

#### Configure Custom Domain (Optional)

```bash
# Add domain
vercel domains add faceless-automation.com

# Configure DNS
# Add CNAME: faceless-automation.com → cname.vercel-dns.com
```

---

### Phase 5: Temporal Worker Deployment

Temporal workers must run continuously to execute workflows.

#### Option 1: AWS ECS Fargate (Recommended)

**Create Dockerfile for worker**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src/ ./src/
COPY tsconfig.json ./

CMD ["npm", "run", "worker"]
```

**Deploy to ECS**:
```bash
# 1. Build and push to ECR
aws ecr create-repository --repository-name faceless-worker
docker build -t faceless-worker .
docker tag faceless-worker:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/faceless-worker:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/faceless-worker:latest

# 2. Create ECS task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json

# 3. Create ECS service
aws ecs create-service \
  --cluster faceless-automation \
  --service-name temporal-worker \
  --task-definition faceless-worker \
  --desired-count 2 \
  --launch-type FARGATE
```

#### Option 2: EC2 Instance

```bash
# 1. Launch EC2 instance (t3.medium)
# 2. SSH into instance
ssh ec2-user@instance-ip

# 3. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 4. Clone repository
git clone https://github.com/your-repo/faceless-automation-platform.git
cd faceless-automation-platform

# 5. Install dependencies
npm install

# 6. Setup environment
cp .env.production .env

# 7. Run worker with PM2
npm install -g pm2
pm2 start npm --name "temporal-worker" -- run worker
pm2 save
pm2 startup
```

---

### Phase 6: S3 Storage Setup

```bash
# 1. Create S3 bucket
aws s3 mb s3://faceless-automation-assets --region us-east-1

# 2. Enable versioning
aws s3api put-bucket-versioning \
  --bucket faceless-automation-assets \
  --versioning-configuration Status=Enabled

# 3. Configure CORS
aws s3api put-bucket-cors \
  --bucket faceless-automation-assets \
  --cors-configuration file://s3-cors.json

# s3-cors.json:
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://faceless-automation.vercel.app"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}

# 4. Create CloudFront distribution (optional for CDN)
aws cloudfront create-distribution \
  --origin-domain-name faceless-automation-assets.s3.amazonaws.com
```

---

### Phase 7: Monitoring & Logging

#### CloudWatch Logging

```bash
# Enable Lambda logs
aws logs create-log-group --log-group-name /aws/lambda/faceless-automation-api

# Enable RDS logs
aws rds modify-db-instance \
  --db-instance-identifier faceless-automation-db \
  --cloudwatch-logs-export-configuration '{"EnableLogTypes":["postgresql"]}'
```

#### Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/node @sentry/browser

# Add to backend/app/main.py:
import sentry_sdk
sentry_sdk.init(dsn="https://xxx@sentry.io/xxx")

# Add to client/app/layout.tsx:
import * as Sentry from "@sentry/nextjs";
Sentry.init({ dsn: "..." });
```

#### Uptime Monitoring

- **Uptime Robot**: https://uptimerobot.com (free)
- **Pingdom**: https://pingdom.com
- **StatusCake**: https://statuscake.com

---

### Phase 8: Post-Deployment Testing

```bash
# 1. Health check
curl https://your-api.com/health
# Expected: {"status": "ok"}

# 2. Create test user
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Login
curl -X POST https://your-api.com/api/auth/login \
  -d "username=test@example.com&password=test123"

# 4. Create test project
curl -X POST https://your-api.com/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Video","niche":"AI"}'

# 5. Check Temporal workflow started
# Visit Temporal Cloud dashboard: https://cloud.temporal.io
```

---

## Cost Estimate (1,000 videos/month)

| Service | Cost/month |
|---------|------------|
| AWS RDS (db.t3.micro) | $15 |
| AWS Lambda (API requests) | $20 |
| AWS ECS (Worker, 2 tasks) | $30 |
| AWS S3 (Storage + transfer) | $10 |
| Vercel (Hobby plan) | $0 |
| Temporal Cloud (Free tier) | $0 |
| Pexels API | $0 (free tier) |
| ElevenLabs | $30 (pro plan) |
| Adobe Firefly | $50 (standard plan) |
| **Total** | **~$155/month** |

---

## Security Hardening

### 1. Enable WAF (Web Application Firewall)
```bash
aws wafv2 create-web-acl \
  --name faceless-automation-waf \
  --scope REGIONAL \
  --default-action Block={} \
  --rules file://waf-rules.json
```

### 2. Setup Rate Limiting
```python
# backend/app/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/projects")
@limiter.limit("10/minute")
async def create_project():
    ...
```

### 3. Enable Database Encryption
```bash
aws rds modify-db-instance \
  --db-instance-identifier faceless-automation-db \
  --storage-encrypted \
  --kms-key-id alias/aws/rds
```

### 4. Rotate Secrets Automatically
```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name faceless-automation/prod/db-password \
  --secret-string "strong-password"

# Enable auto-rotation (every 30 days)
aws secretsmanager rotate-secret \
  --secret-id faceless-automation/prod/db-password \
  --rotation-lambda-arn arn:aws:lambda:...
```

---

## Rollback Strategy

### If Deployment Fails

**Backend**:
```bash
# Serverless rollback
serverless deploy --stage production --function api --revert

# Or manually revert Lambda version
aws lambda update-alias \
  --function-name faceless-automation-api \
  --name production \
  --function-version $PREVIOUS_VERSION
```

**Frontend**:
```bash
# Vercel rollback
vercel rollback https://faceless-automation.vercel.app
```

**Database**:
```bash
# Rollback migration
cd backend
alembic downgrade -1  # Rollback one migration
# or
alembic downgrade <revision_id>  # Rollback to specific version
```

---

## Success Criteria

- [ ] Health check returns 200 OK
- [ ] User registration works
- [ ] JWT authentication works
- [ ] Project creation starts Temporal workflow
- [ ] Workflow appears in Temporal Cloud dashboard
- [ ] Test video generation completes end-to-end
- [ ] No errors in CloudWatch logs
- [ ] SSL/HTTPS working on all endpoints
- [ ] Database migrations applied
- [ ] Backups configured

---

## Next Steps

1. ✅ Review all environment variables
2. ✅ Deploy database and run migrations
3. ✅ Deploy backend API
4. ✅ Deploy frontend dashboard
5. ✅ Deploy Temporal workers
6. ✅ Run post-deployment tests
7. ✅ Configure monitoring and alerts
8. ✅ Setup automated backups

**Platform is production-ready!** 🚀
