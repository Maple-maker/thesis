---
name: server-deploy
description: Deploy the Thesis backend server to Fly.io and verify it's healthy. Use when the user says "deploy the server", "ship the backend", "update fly.io", "push to production", or mentions deploying, shipping, or updating the Thesis API/server/backend.
---

# Server Deploy

Deploy the Thesis backend to Fly.io and verify the deployment succeeded.

## Deployment

Run the deploy command from the server directory:

```bash
cd /Users/jaidenrabatin/Projects/thesis/server && fly deploy -a thesis-server-beta
```

This is an interactive command — it streams build and deploy output. The user watches it progress in real time. Do not background it.

## Verification

After the deploy command exits successfully, verify the server is healthy:

```bash
curl -s https://thesis-server-beta.fly.dev/v1/health
```

The health endpoint returns status information. Any HTTP error or non-200 response means the deploy may have issues.

**If health check passes:** report that the deploy succeeded and the server is healthy.

**If health check fails,** fetch recent logs to help diagnose:

```bash
fly logs -a thesis-server-beta
```

Show the user relevant error lines from the logs and suggest next steps.

## Server info

| Thing | Value |
|-------|-------|
| App name | `thesis-server-beta` |
| URL | `https://thesis-server-beta.fly.dev` |
| Health | `GET /v1/health` |
| Server dir | `/Users/jaidenrabatin/Projects/thesis/server` |
