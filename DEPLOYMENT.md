# 🚀 Deployment Guide

This guide covers deploying your AI Incident Triage Assistant to production on Cloudflare's global network.

## Prerequisites

- Cloudflare account with Workers enabled
- Wrangler CLI installed and authenticated
- Node.js 18+ and npm

## Deployment Steps

### 1. Deploy the Worker

The Worker includes the Durable Object and handles all backend logic.

```bash
# From the project root
npm run deploy
```

This command:
- Bundles your Worker code
- Uploads it to Cloudflare's global network
- Creates/updates your Durable Object namespace
- Outputs your Worker URL (e.g., `https://ai-incident-triage.your-subdomain.workers.dev`)

**Note your Worker URL** - you'll need it for the frontend configuration.

### 2. Configure Frontend for Production

Update the frontend to point to your deployed Worker:

```bash
cd frontend
```

Create a `.env.production` file:

```env
VITE_API_URL=https://ai-incident-triage.your-subdomain.workers.dev/api
```

Replace `your-subdomain` with your actual Worker URL.

### 3. Build the Frontend

```bash
npm run build
```

This creates an optimized production build in `frontend/dist/`.

### 4. Deploy Frontend to Cloudflare Pages

#### Option A: Automatic Git Deployment (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`
6. Add environment variable:
   - **Variable name**: `VITE_API_URL`
   - **Value**: Your Worker URL + `/api`
7. Click "Save and Deploy"

#### Option B: Manual Deployment

```bash
cd frontend
npx wrangler pages deploy dist --project-name=incident-triage
```

Follow the prompts to create a new Pages project.

### 5. Update CORS Settings

After deploying the frontend, update your Worker's CORS configuration:

Edit `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://incident-triage.pages.dev,https://your-custom-domain.com"
```

Replace with your actual Pages URL and any custom domains.

Then redeploy the Worker:

```bash
npm run deploy
```

### 6. Test the Production Deployment

1. Visit your Cloudflare Pages URL
2. Create a test incident
3. Verify the chat interface works
4. Check browser console for any errors

## Custom Domain Setup

### For Cloudflare Pages (Frontend)

1. Go to your Pages project → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `triage.example.com`)
4. Follow DNS configuration instructions

### For Workers (Backend)

1. Go to Workers & Pages → Your Worker
2. Click "Triggers" → "Custom Domains"
3. Add a route (e.g., `api.triage.example.com`)

Don't forget to update CORS settings after adding custom domains!

## Environment-Specific Configuration

### Production Variables

Add production-specific configuration in Cloudflare Dashboard:

1. Go to Workers & Pages → Your Worker → Settings → Variables
2. Add any production environment variables
3. For Pages, go to your project → Settings → Environment variables

### Secrets Management

If you add integrations requiring secrets (e.g., Slack, PagerDuty):

```bash
# Set a secret for the Worker
npx wrangler secret put SECRET_NAME

# For Pages
npx wrangler pages secret put SECRET_NAME --project-name=incident-triage
```

## Monitoring and Analytics

### Worker Analytics

View your Worker metrics:
1. Dashboard → Workers & Pages → Your Worker → Metrics
2. Monitor: Requests, Errors, CPU Time, Durable Object operations

### Pages Analytics

View frontend metrics:
1. Dashboard → Pages → Your Project → Analytics
2. Monitor: Page views, Performance, Geography

### Custom Logging

The Worker logs to console. View logs in real-time:

```bash
npx wrangler tail
```

## Scaling Considerations

### Durable Objects

- Each incident gets its own Durable Object instance
- Automatic scaling based on demand
- No manual configuration needed

### Workers AI

- Included in your Workers plan
- Rate limits based on your plan tier
- Monitor usage in the Dashboard

### Cost Estimates

For the **Free Plan**:
- Workers: 100,000 requests/day
- Durable Objects: 1,000,000 read units/day
- Workers AI: 10,000 Neurons/day (sufficient for ~30-50 incidents)

For production use, consider the **Workers Paid** plan.

## Rollback Procedure

If you need to rollback a deployment:

```bash
# List recent deployments
npx wrangler deployments list

# Rollback to a previous version
npx wrangler rollback [deployment-id]
```

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-worker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Note: You'll need to add `CLOUDFLARE_API_TOKEN` to your repository secrets.

## Health Checks

Monitor your deployment with a health check endpoint:

```bash
curl https://your-worker.workers.dev/health
```

Should return: `{"status":"ok"}`

## Troubleshooting Production Issues

### 1. CORS Errors

- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check that both HTTP and HTTPS are configured if needed
- Redeploy Worker after changing CORS settings

### 2. Durable Object Errors

- Check the Dashboard for migration status
- Verify the binding name matches in code
- Review Worker logs with `npx wrangler tail`

### 3. Workers AI Quota

- Monitor usage in Dashboard → AI
- Consider upgrading plan if hitting limits
- Implement rate limiting in your Worker

### 4. Slow Response Times

- Check Durable Object location (they're created near first request)
- Review Workers AI latency metrics
- Consider caching strategies for repeated queries

## Production Checklist

- [ ] Worker deployed successfully
- [ ] Frontend built and deployed to Pages
- [ ] CORS configured with production URLs
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS working correctly
- [ ] Health check endpoint responding
- [ ] Tested incident creation and workflow
- [ ] Monitoring and alerts set up
- [ ] Team has access to Dashboard
- [ ] Rollback procedure documented

## Support

For Cloudflare-specific issues:
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Discord](https://discord.gg/cloudflaredev)
- [Workers Documentation](https://developers.cloudflare.com/workers/)

---

🎉 **Congratulations!** Your AI Incident Triage Assistant is now running on Cloudflare's global network.

