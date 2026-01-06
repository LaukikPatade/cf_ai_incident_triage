# 🚀 Quick Reference Card

## 🎯 One-Page Overview

### **What Is This?**
AI-powered incident management system built on Cloudflare's platform.
**8 services integrated** • **Production-ready** • **Fully functional**

---

## ⚡ Quick Start (3 Commands)

```bash
npm install && cd frontend && npm install && cd ..
npx wrangler login
npm run dev  # Terminal 1
npm run dev:ui  # Terminal 2 (new window)
```

Open: **http://localhost:5173**

---

## 🎮 Test Scenarios

### Scenario 1: Basic Triage (30 seconds)
```
1. Message: "Payment service down with 500 errors"
2. Message: "Started after v2.5.0 deploy, DB CPU 95%, error rate 90%"
3. ✅ Watch diagnosis appear automatically
```

### Scenario 2: All Features (2 minutes)
```
1. Complete 2-3 incidents (use scenario 1)
2. Press Ctrl+2 → See analytics dashboard
3. Press Ctrl+3 → Browse incident history
4. Search: "payment" or "database"
5. Click Export → Download report
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + 1` | Triage View |
| `Ctrl/Cmd + 2` | Analytics View |
| `Ctrl/Cmd + 3` | History View |
| `Ctrl/Cmd + N` | New Incident |
| `Ctrl/Cmd + Enter` | Send Message |

---

## 🏗️ Architecture (One Diagram)

```
Frontend (React) → Worker (API) → Durable Objects (State)
                                       ↓
                    ┌──────────────────┴──────────────────┐
                    ↓         ↓         ↓         ↓       ↓
                   AI        KV    Vectorize  Analytics  Queue
                (LLM)    (History)  (Search)  (Metrics)  (Notif)
                                                          ↓
                                                         R2
                                                     (Reports)
```

**8 Cloudflare Services** working together!

---

## 📊 Features Checklist

- ✅ **AI Triage**: Llama 3.3 conversational diagnosis
- ✅ **History**: KV-powered incident archive
- ✅ **Search**: Semantic similarity with Vectorize
- ✅ **Analytics**: Real-time metrics dashboard
- ✅ **Notifications**: Queue-based alerts (Slack-ready)
- ✅ **Export**: JSON/Markdown reports to R2
- ✅ **Templates**: 4 pre-built incident types
- ✅ **Modern UI**: Multi-view with keyboard shortcuts

---

## 🔗 API Endpoints

**Incident:**
- `POST /api/incident` - Create
- `POST /api/message` - Chat
- `GET /api/incident/:id` - Get state

**Features:**
- `GET /api/history` - Past incidents
- `GET /api/analytics/stats` - Metrics
- `GET /api/incident/:id/similar` - Semantic search
- `POST /api/incident/:id/export` - Download report

---

## 📁 Key Files

**Backend:**
- `src/worker.ts` - API gateway
- `src/incident.ts` - Durable Object
- `src/services/*` - Feature modules

**Frontend:**
- `frontend/src/App.tsx` - Main app
- `frontend/src/components/*` - UI components

**Config:**
- `wrangler.toml` - 8 service bindings

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| "Not logged in" | `npx wrangler login` |
| Backend not running | `npm run dev` in root |
| Frontend not loading | `npm run dev:ui` in new terminal |
| Port conflict | Kill process on 8787/5173 |

**Health Check:** http://localhost:8787/health → `{"status":"ok"}`

---

## 📚 Documentation

- **SETUP.md** - Detailed setup instructions
- **FEATURES.md** - Comprehensive feature guide
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **README.md** - Full project documentation

---

## 🎯 Demo Script (60 seconds)

**"Let me show you an incident management system I built on Cloudflare..."**

1. **Open app** (http://localhost:5173)
   - "Built with 8 Cloudflare services"

2. **Start incident** (Ctrl+N)
   - Type: "Payment service down, 500 errors"
   - "AI extracts signals automatically"

3. **Add details**
   - "DB CPU 95%, started after deploy"
   - "Watch it diagnose in real-time"

4. **Show diagnosis**
   - "Severity, hypotheses, action items"
   - "Similar past incidents appear"

5. **Switch views** (Ctrl+2, Ctrl+3)
   - "Analytics dashboard with metrics"
   - "Searchable incident history"

6. **Export** (Click button)
   - "Download as JSON or Markdown"
   - "Stored in R2 for archival"

**"All running on Cloudflare's edge network!"** 🎉

---

## 💡 Why This Is Special

1. **8 Services**: Not just Workers - full platform showcase
2. **AI-Powered**: Real LLM integration, not just API calls
3. **Production-Ready**: Error handling, UX, documentation
4. **Real Use Case**: Solves actual SRE/DevOps problems
5. **Modern Stack**: React, TypeScript, Edge computing

---

## 🚀 Deployment (Optional)

```bash
# Deploy Worker
npx wrangler deploy

# Build Frontend
cd frontend && npm run build

# Deploy to Pages
npx wrangler pages deploy dist
```

---

## 📊 Free Tier Capacity

- **~1000 incidents/day** on free tier
- All features work without credit card
- Perfect for development and demos

---

## 🎓 For Internship Application

**Demonstrates:**
- ✅ Cloudflare platform expertise
- ✅ Full-stack development
- ✅ AI/ML integration
- ✅ System design
- ✅ Modern development practices

**Perfect for showcasing technical skills!** 🌟

---

## 🆘 Quick Help

**Check logs:**
- Backend: Terminal where `npm run dev` runs
- Frontend: Browser DevTools console

**Verify auth:**
```bash
npx wrangler whoami
```

**Restart everything:**
```bash
# Kill both terminals (Ctrl+C)
# Then restart:
npm run dev      # Terminal 1
npm run dev:ui   # Terminal 2
```

---

## ✨ Ready to Go!

**Servers Running:**
- ✅ Backend: http://localhost:8787
- ✅ Frontend: http://localhost:5173

**Start Testing:** Open http://localhost:5173 🚀

---

**Made with ☁️ on Cloudflare**

