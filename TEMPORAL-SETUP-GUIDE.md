# Temporal Cloud Setup Guide

Complete guide to configure Temporal Cloud for workflow orchestration.

---

## Option 1: Temporal Cloud (Production)

### Step 1: Sign Up for Temporal Cloud
1. Go to https://temporal.io/cloud
2. Create account and namespace (e.g., `faceless-automation.a2dd6`)
3. Download mTLS certificates from dashboard

### Step 2: Configure Environment Variables
Add to `.env`:

```bash
# Temporal Cloud Configuration
TEMPORAL_CLOUD=true
TEMPORAL_ADDRESS=namespace.a2dd6.tmprl.cloud:7233
TEMPORAL_NAMESPACE=faceless-automation.a2dd6
TEMPORAL_CLIENT_CERT_PATH=./certs/client.pem
TEMPORAL_CLIENT_KEY_PATH=./certs/client-key.pem
TEMPORAL_TASK_QUEUE=content-generation-queue

# Worker Configuration
MAX_CONCURRENT_WORKFLOWS=100
MAX_CONCURRENT_ACTIVITIES=200
```

### Step 3: Save Certificates
```bash
mkdir -p certs
# Save downloaded certificates to:
# - certs/client.pem (client certificate)
# - certs/client-key.pem (private key)
```

### Step 4: Test Connection
```bash
npx tsx src/temporal-config.ts
```

Expected output:
```
🔐 Connecting to Temporal Cloud with mTLS...
✅ Connected to Temporal namespace: faceless-automation.a2dd6
✅ Temporal health check passed
```

---

## Option 2: Local Development (Free)

### Step 1: Install Temporal CLI
```bash
# macOS
brew install temporal

# or download from https://temporal.io/cli
```

### Step 2: Start Temporal Server
```bash
temporal server start-dev

# Runs on localhost:7233
# Web UI: http://localhost:8233
```

### Step 3: Configure Environment Variables
Add to `.env`:

```bash
# Local Temporal Configuration
TEMPORAL_CLOUD=false
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=content-generation-queue
```

### Step 4: Test Connection
```bash
npx tsx src/temporal-config.ts
```

Expected output:
```
🔧 Connecting to local Temporal server...
✅ Connected to Temporal namespace: default
✅ Temporal health check passed
```

---

## Starting Temporal Workers

Workers execute workflow and activity code.

### Start Worker
```bash
npm run worker
```

This runs:
```javascript
import { Worker } from '@temporalio/worker';
import { getWorkerConfig, createTemporalClient } from './temporal-config';
import * as activities from './activities/content-activities';

const config = getWorkerConfig();
const connection = await createTemporalClient();

const worker = await Worker.create({
  connection,
  namespace: config.namespace,
  taskQueue: config.taskQueue,
  workflowsPath: config.workflowsPath,
  activities,
  maxConcurrentWorkflowTaskExecutions: config.maxConcurrentWorkflows,
  maxConcurrentActivityTaskExecutions: config.maxConcurrentActivities,
});

await worker.run();
```

---

## Workflow Lifecycle

### 1. Start Workflow (API Endpoint)
```typescript
// POST /api/projects/:id/start
const handle = await startContentWorkflow(projectId, {
  niche: 'AI Education',
  targetDuration: 300,
  keywords: ['AI', 'machine learning', 'tutorial']
});
```

### 2. Wait for Human Approval
Workflow pauses and sends notification:
```typescript
// In workflow:
const approval = await condition(
  () => state.approved !== undefined,
  '24h' // Timeout
);
```

### 3. User Approves via Dashboard
```typescript
// POST /api/workflows/:workflowId/approve
await sendApprovalSignal(workflowId, true, scriptId, thumbnailId);
```

### 4. Workflow Continues
Video assembly, thumbnail generation, publication.

### 5. Monitor Progress
```bash
# Web UI (local):
http://localhost:8233

# Web UI (cloud):
https://cloud.temporal.io

# Or via API:
const status = await getWorkflowStatus(workflowId);
```

---

## Workflow Error Handling

Temporal automatically:
- **Retries failed activities** with exponential backoff
- **Preserves workflow state** across crashes
- **Recovers from timeouts** and network failures
- **Tracks execution history** for debugging

Example retry configuration:
```typescript
// In activity definition
export const assembleVideo = {
  startToCloseTimeout: '10m',
  retry: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumAttempts: 5,
    maximumInterval: '60s',
  },
};
```

---

## Temporal Cloud Pricing

| Tier | Actions/month | Storage | Cost |
|------|---------------|---------|------|
| Free | 1M actions | 10 GB | $0 |
| Standard | 10M actions | 100 GB | $200/mo |
| Production | Custom | Custom | Contact sales |

**Actions**: Workflow starts, signals, queries, activity executions

**Estimate for faceless platform**:
- 1,000 videos/month
- ~50 actions per video
- Total: 50K actions/month
- **Fits in Free tier** ✅

---

## Monitoring & Observability

### Temporal Web UI
- Workflow execution history
- Activity status and retries
- Search workflows by ID/status
- Stack traces for failures

### Integrations
- **Weights & Biases (Weave)**: Track workflow performance
- **Datadog**: Metrics and alerting
- **Prometheus**: Custom metrics export

---

## Troubleshooting

### Connection Failed
```
❌ Temporal health check failed: connect ECONNREFUSED
```

**Fix**:
1. Check `TEMPORAL_ADDRESS` in `.env`
2. Verify Temporal server is running
3. For cloud: check mTLS certificates are valid

### Workflow Not Starting
```
Error: Workflow not found in registry
```

**Fix**:
1. Ensure worker is running: `npm run worker`
2. Check `workflowsPath` points to correct directory
3. Verify workflow is exported from `workflows/index.ts`

### Activity Timeout
```
ActivityTaskTimedOut: activity timeout
```

**Fix**:
1. Increase `startToCloseTimeout` in activity config
2. Check activity is completing successfully
3. Review activity logs for errors

### Certificate Errors (Cloud Only)
```
Error: unable to get local issuer certificate
```

**Fix**:
1. Verify certificate paths in `.env`
2. Ensure certificates are in PEM format
3. Check certificates haven't expired

---

## Next Steps

1. ✅ Choose Temporal Cloud (production) or local dev
2. ✅ Configure `.env` with connection details
3. ✅ Test connection: `npx tsx src/temporal-config.ts`
4. ✅ Start worker: `npm run worker`
5. ✅ Create test project via API
6. ✅ Monitor workflow in Temporal UI

**Ready for production workflow orchestration!**
