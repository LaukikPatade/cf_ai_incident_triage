# 🚀 Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works!)
- Wrangler CLI

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate. Make sure you're logged in!

### 3. Create Required Resources

The application uses several Cloudflare services. You'll need to create them:

#### Option A: Automatic (Recommended)

```bash
# Create KV namespaces
npx wrangler kv:namespace create "INCIDENT_HISTORY"
npx wrangler kv:namespace create "TEMPLATES"

# Create Vectorize index
npx wrangler vectorize create incident-embeddings --dimensions=768 --metric=cosine

# Create Queue
npx wrangler queues create incident-notifications

# Create R2 bucket
npx wrangler r2 bucket create incident-reports
```

#### Option B: Use Preview Mode (Development)

For local development, you can use preview resources which are created automatically.

### 4. Update wrangler.toml (if using production resources)

If you created production resources in Step 3A, update `wrangler.toml` with the actual IDs:

```toml
[[kv_namespaces]]
binding = "INCIDENT_HISTORY"
id = "YOUR_KV_ID_HERE"  # Replace with actual ID from step 3
preview_id = "incident_history_preview"

[[kv_namespaces]]
binding = "TEMPLATES"
id = "YOUR_TEMPLATES_ID_HERE"  # Replace with actual ID
preview_id = "preview_id_templates"
```

**For development, you can leave the preview IDs as-is!**

### 5. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev
```

This starts the Worker on `http://localhost:8787`

**Terminal 2 - Frontend:**
```bash
npm run dev:ui
```

This starts the React app on `http://localhost:5173`

### 6. Open the Application

Navigate to: **http://localhost:5173**

The app will automatically:
- Initialize incident templates
- Connect to the backend Worker
- Be ready to triage incidents!

---

## 🧪 Testing the Application

### Test Scenario 1: Basic Triage

1. **Start a new incident**
2. **Send message:**
   ```
   Our payment service is down with 500 errors
   ```
3. **Follow up with details:**
   ```
   It started 10 minutes ago after deploying v2.5.0. Database CPU is at 95%. Error rate is 90%.
   ```
4. **Watch the magic:**
   - AI extracts signals automatically
   - Provides diagnosis with severity
   - Suggests immediate actions

### Test Scenario 2: Explore Features

1. **Triage View**: Complete an incident
2. **Analytics View** (Ctrl+2): See incident metrics
3. **History View** (Ctrl+3): Browse past incidents
4. **Export**: Download incident report

### Test Scenario 3: Similar Incidents

1. Complete 2-3 incidents with similar symptoms
2. Start a new incident with similar description
3. See "Similar Past Incidents" panel appear
4. View similarity scores and past resolutions

---

## 🐛 Troubleshooting

### Issue: "Not logged in" error

**Solution:**
```bash
npx wrangler login
```

### Issue: "Failed to send message"

**Possible causes:**
1. Backend not running → Run `npm run dev`
2. Not authenticated → Run `npx wrangler login`
3. Port conflict → Check if port 8787 is available

### Issue: Frontend can't connect to backend

**Solution:**
Check that both servers are running:
- Backend: `http://localhost:8787/health` should return `{"status":"ok"}`
- Frontend: `http://localhost:5173` should load the UI

### Issue: Vectorize errors

**Note:** Vectorize might not be available in all accounts. The app will continue to work without it - you just won't see "Similar Incidents" feature.

### Issue: Analytics not showing data

**Solution:**
- Complete at least one incident first
- Refresh the analytics page
- Analytics Engine has a slight delay (few seconds)

---

## 🚀 Deployment to Production

### 1. Update wrangler.toml

Replace preview IDs with production IDs from Step 3.

### 2. Deploy Worker

```bash
npx wrangler deploy
```

### 3. Build and Deploy Frontend

```bash
cd frontend
npm run build
```

Deploy the `frontend/dist` folder to:
- Cloudflare Pages
- Vercel
- Netlify
- Or any static hosting

### 4. Update Frontend Environment

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-worker.your-subdomain.workers.dev/api
```

---

## 📊 Resource Usage (Free Tier)

All features work within Cloudflare's free tier:

| Service | Free Tier Limit | Usage per Incident |
|---------|----------------|-------------------|
| Workers | 100k req/day | ~5-10 requests |
| Workers AI | 10k neurons/day | ~2k neurons |
| KV | 100k reads/day | ~2-3 reads |
| Vectorize | 30M queries/month | 1 query |
| Analytics | 10M events/month | ~5 events |
| Queues | 1M messages/month | 1 message |
| R2 | 10GB storage | ~1KB per report |

**Estimated capacity:** ~1000 incidents/day on free tier! 🎉

---

## 🎯 Next Steps

1. ✅ Complete the setup above
2. ✅ Test all features
3. ✅ Read `FEATURES.md` for detailed feature documentation
4. ✅ Check `ARCHITECTURE.md` for system design
5. ✅ Review `DEPLOYMENT.md` for production deployment
6. ✅ See `INTERNSHIP_NOTES.md` for application highlights

---

## 💡 Tips

- **Use keyboard shortcuts** for faster navigation (Ctrl+1/2/3)
- **Export incidents** to build a knowledge base
- **Check analytics** to see incident patterns
- **Search history** to find similar past issues
- **Templates** provide quick starting points

---

## 🆘 Need Help?

- Check the logs in the terminal where you ran `npm run dev`
- Use browser DevTools to see network requests
- Verify Cloudflare authentication with `npx wrangler whoami`
- Ensure all dependencies are installed

---

**Ready to triage some incidents? Let's go! 🚀**
