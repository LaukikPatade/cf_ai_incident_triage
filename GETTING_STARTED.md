# 🎯 Quick Start Guide

Follow these steps to get your AI Incident Triage Assistant running locally.

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

## Step 2: Authenticate with Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

## Step 3: Start the Development Servers

You'll need **two terminal windows**:

### Terminal 1: Start the Worker (Backend)

```bash
npm run dev
```

This starts the Cloudflare Worker on `http://localhost:8787`. You should see:
```
⛅️ wrangler 3.x.x
-------------------
Your worker has 2 bindings:
- Durable Objects: INCIDENT (IncidentDurableObject)
- AI: AI
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Terminal 2: Start the Frontend

```bash
npm run dev:frontend
```

This starts the Vite dev server on `http://localhost:5173`. You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 4: Open the Application

Navigate to **http://localhost:5173** in your browser.

## Step 5: Test the System

1. The app will automatically create a new incident
2. Type a message describing an incident, for example:
   ```
   Our API is returning 500 errors and users can't log in
   ```
3. The AI will ask clarifying questions
4. Answer the questions to provide more context
5. Watch as the system transitions through stages:
   - 📝 **Intake**: Gathering information
   - 🔍 **Diagnose**: Analyzing the incident
   - ✅ **Recommend**: Providing action plan

## Troubleshooting

### "Module not found" errors

Make sure you've installed dependencies in both root and frontend:
```bash
npm install
cd frontend && npm install
```

### Worker won't start

Make sure you're logged in to Cloudflare:
```bash
npx wrangler login
```

### Port already in use

If port 8787 or 5173 is in use, you can change them:
- Worker: Add `--port 8788` to the dev command
- Frontend: Modify `frontend/vite.config.ts`

### CORS errors

Make sure both servers are running and the frontend is proxying requests to the Worker.

## Next Steps

- Read the full [README.md](./README.md) for architecture details
- Explore the code in `src/` and `frontend/src/`
- Try deploying to production with `npm run deploy`

## Example Incident Scenarios to Try

1. **Database Connection Issue**
   ```
   Our database connections are timing out in the us-east region
   ```

2. **Memory Leak**
   ```
   Our service memory usage has been climbing steadily for the past 2 hours
   ```

3. **API Rate Limiting**
   ```
   Users are getting 429 errors after we deployed 30 minutes ago
   ```

4. **Dependency Failure**
   ```
   Payment processing is failing with connection errors to Stripe
   ```

Enjoy building with Cloudflare! 🚀

