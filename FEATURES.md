# 🚀 AI Incident Triage Assistant - Feature Guide

## Overview

This application showcases a comprehensive incident management system built on Cloudflare's platform, demonstrating the power and versatility of Workers, Durable Objects, and various Cloudflare services.

---

## 🎯 Core Features

### 1. **AI-Powered Incident Triage** 🤖

**Technology**: Workers AI (Llama 3.3)

**What it does**:
- Intelligently extracts incident signals from natural language descriptions
- Asks contextual follow-up questions to gather critical information
- Transitions automatically from information gathering to diagnosis
- Provides structured, actionable recommendations

**User Experience**:
- Start by describing an incident in plain English
- AI asks targeted questions to understand the situation
- Automatically moves to diagnosis when enough information is gathered
- Receive severity assessment, root cause hypotheses, and action items

---

### 2. **Incident History with KV Storage** 📚

**Technology**: Workers KV

**What it does**:
- Stores completed incidents for future reference
- Enables fast retrieval of past incidents
- Supports filtering by service
- Provides searchable incident archive

**Key Features**:
- **Recent Incidents View**: See the last 20 completed incidents
- **Service Filtering**: Filter incidents by affected service
- **Search**: Find incidents by keywords in symptoms or services
- **Incident Details**: View severity, duration, resolution steps

**API Endpoints**:
```
GET /api/history                    # Get recent incidents
GET /api/history?service=payment    # Filter by service
GET /api/history?query=database     # Search incidents
```

---

### 3. **Semantic Search with Vectorize** 🔍

**Technology**: Cloudflare Vectorize + Workers AI Embeddings

**What it does**:
- Converts incident descriptions into vector embeddings
- Finds semantically similar past incidents
- Shows relevant historical context during triage

**How it works**:
1. When an incident completes, its description is embedded using `@cf/baai/bge-base-en-v1.5`
2. Embedding is stored in Vectorize with metadata (service, severity, etc.)
3. During new incidents, similar past incidents are retrieved
4. Results show similarity score and relevant details

**User Experience**:
- See "Similar Past Incidents" panel during diagnosis
- View what worked before for similar issues
- Learn from historical patterns

**API Endpoints**:
```
GET /api/incident/{id}/similar      # Get similar incidents
```

---

### 4. **Analytics Dashboard** 📊

**Technology**: Analytics Engine + KV-based aggregation

**What it does**:
- Tracks incident metrics over time
- Provides insights into incident patterns
- Shows severity distribution and service impact

**Metrics Displayed**:
- **Total Incidents**: Lifetime count
- **Last 24 Hours**: Recent incident volume
- **Last 7 Days**: Weekly trend
- **By Severity**: CRITICAL, HIGH, MEDIUM, LOW breakdown
- **Top Services**: Most frequently affected services

**Real-time Updates**:
- Auto-refreshes every 30 seconds
- Manual refresh button available

**Analytics Events Tracked**:
- Incident creation
- Stage transitions (INTAKE → DIAGNOSE → RECOMMEND)
- Incident completion with duration
- User message activity

---

### 5. **Queue-Based Notifications** 📬

**Technology**: Cloudflare Queues

**What it does**:
- Sends async notifications without blocking diagnosis
- Queues alerts for CRITICAL and HIGH severity incidents
- Processes notifications in batches

**Notification Types** (extensible):
- Slack alerts (placeholder for webhook integration)
- Email notifications (placeholder)
- PagerDuty incidents (placeholder)

**How it works**:
1. When diagnosis completes, severity is checked
2. CRITICAL/HIGH incidents trigger notification
3. Notification is queued (non-blocking)
4. Queue consumer processes in batches of 10

**Queue Configuration**:
```toml
[[queues.producers]]
binding = "NOTIFICATION_QUEUE"
queue = "incident-notifications"

[[queues.consumers]]
queue = "incident-notifications"
max_batch_size = 10
max_batch_timeout = 30
```

---

### 6. **Incident Report Export** 📥

**Technology**: R2 Object Storage

**What it does**:
- Exports complete incident reports
- Supports JSON and Markdown formats
- Stores reports in R2 for long-term archival

**Export Formats**:

**JSON** (Machine-readable):
```json
{
  "metadata": {
    "incidentId": "...",
    "createdAt": "2025-01-06T...",
    "duration": 180000
  },
  "signals": { ... },
  "diagnosis": { ... },
  "conversation": [ ... ]
}
```

**Markdown** (Human-readable):
```markdown
# Incident Report: abc123

## Overview
- Service: payment-service
- Severity: CRITICAL
- Duration: 3.0 minutes

## Diagnosis
### Root Cause Hypotheses
1. **HIGH**: Database connection pool exhaustion
   - Reasoning: ...

## Recommended Actions
...
```

**User Experience**:
- Click "Export Report" button in completed incidents
- Choose format (JSON or Markdown)
- Report downloads immediately
- Also stored in R2 for archival

**API Endpoints**:
```
POST /api/incident/{id}/export
Body: { "format": "json" | "md" }
```

---

### 7. **Incident Templates & Runbooks** 📖

**Technology**: Workers KV

**What it does**:
- Provides pre-defined templates for common incident types
- Suggests relevant questions based on symptoms
- Links to runbooks for standard procedures

**Built-in Templates**:

1. **Database Connection Timeout**
   - Common causes: Connection pool exhaustion, slow queries
   - Suggested questions: CPU/memory usage, recent migrations
   - Runbook: Database troubleshooting guide

2. **Post-Deployment Issues**
   - Common causes: Config errors, incompatible dependencies
   - Suggested questions: What changed, can we rollback
   - Runbook: Deployment rollback procedure

3. **API Performance Degradation**
   - Common causes: N+1 queries, downstream slowness
   - Suggested questions: P99 latency, specific endpoints
   - Runbook: Performance optimization guide

4. **Authentication Failures**
   - Common causes: Token expiration, provider outage
   - Suggested questions: User segments affected, error logs
   - Runbook: Auth troubleshooting guide

**Template Matching**:
- Automatic based on keywords in symptoms
- Suggests relevant template during triage
- Provides contextual questions and runbook links

**API Endpoints**:
```
GET /api/templates                  # List all templates
POST /api/templates/init            # Initialize default templates
GET /api/incident/{id}/template     # Get suggested template
```

---

### 8. **Durable Objects for State Management** 💾

**Technology**: Cloudflare Durable Objects

**What it does**:
- Provides strongly consistent, per-incident state
- Manages conversation history and workflow
- Ensures no data loss during concurrent operations

**State Managed**:
- Incident ID and creation timestamp
- Current workflow stage
- Extracted signals
- Full conversation history
- Open questions
- Diagnosis results

**Workflow Stages**:
1. **INTAKE**: Gathering information
2. **DIAGNOSE**: Analyzing root cause
3. **RECOMMEND**: Providing action items

---

## 🎨 User Interface Features

### Navigation

**Three Main Views**:
1. **🚨 Triage**: Active incident management
2. **📊 Analytics**: Metrics and insights
3. **📋 History**: Past incident archive

**Keyboard Shortcuts**:
- `Ctrl/Cmd + 1`: Switch to Triage
- `Ctrl/Cmd + 2`: Switch to Analytics
- `Ctrl/Cmd + 3`: Switch to History
- `Ctrl/Cmd + N`: New Incident
- `Ctrl/Cmd + Enter`: Send message (in chat)

### Triage View

**Components**:
- **Stage Indicator**: Visual progress through workflow
- **Chat Interface**: Conversational incident triage
- **Signals Panel**: Real-time signal extraction
- **Similar Incidents**: Contextual historical data
- **Export Button**: Download incident reports

### Analytics View

**Visualizations**:
- Total incident count cards
- Severity distribution bar chart
- Top affected services list
- Time-based metrics (24h, 7d)

### History View

**Features**:
- Searchable incident list
- Service filtering
- Severity badges with color coding
- Duration and timestamp display
- Resolution summaries

---

## 🏗️ Architecture Highlights

### Service Layer

All features are implemented as modular services:

```
src/services/
├── history.ts        # KV-based incident history
├── vectorize.ts      # Semantic search
├── analytics.ts      # Metrics tracking
├── notifications.ts  # Queue-based alerts
├── reports.ts        # R2 export
└── templates.ts      # Runbook management
```

### API Design

RESTful endpoints with clear separation of concerns:

```
/api/incident         # Incident CRUD
/api/message          # Chat interaction
/api/history          # Historical data
/api/analytics/stats  # Metrics
/api/templates        # Template management
```

### Data Flow

```
User Input
  ↓
Worker (API Gateway)
  ↓
Durable Object (State + Logic)
  ↓
Workers AI (LLM Processing)
  ↓
Parallel Service Calls:
  - KV (History)
  - Vectorize (Search)
  - Analytics Engine (Metrics)
  - Queue (Notifications)
  - R2 (Reports)
```

---

## 🚀 Getting Started

### Prerequisites

1. Cloudflare account with Workers AI access
2. Wrangler CLI installed
3. Node.js 18+

### Setup

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Login to Cloudflare
npx wrangler login

# Start development
npm run dev        # Backend (port 8787)
npm run dev:ui     # Frontend (port 5173)
```

### First Run

1. Navigate to `http://localhost:5173`
2. Templates will auto-initialize on first load
3. Start describing an incident
4. Explore Analytics and History views

---

## 📊 Demo Scenarios

### Scenario 1: Database Incident

```
User: "Our payment service is down with database connection errors"

AI: [Extracts signals, asks targeted questions]

User: "It started after we deployed v2.5.0, CPU is at 95%"

AI: [Provides diagnosis with HIGH severity]
- Hypothesis: Connection pool exhaustion from new deployment
- Immediate: Rollback deployment, increase pool size
- Monitor: Connection count, query latency
```

### Scenario 2: Similar Incident Detection

```
User: "API timeouts in checkout service"

AI: [Shows 2 similar past incidents]
- 85% match: "Checkout timeouts" from 2 weeks ago
- Resolution: Increased worker timeout, added caching

User: [Can learn from past solutions]
   ```

---

## 🎯 Cloudflare Services Demonstrated

| Service | Purpose | Key Feature |
|---------|---------|-------------|
| **Workers** | API Gateway | Serverless request handling |
| **Durable Objects** | State Management | Strongly consistent per-incident state |
| **Workers AI** | LLM Processing | Llama 3.3 for triage and diagnosis |
| **KV** | Storage | Incident history and templates |
| **Vectorize** | Vector Search | Semantic similarity matching |
| **Analytics Engine** | Metrics | Time-series incident data |
| **Queues** | Async Processing | Non-blocking notifications |
| **R2** | Object Storage | Long-term report archival |

---

## 🔮 Future Enhancements

### Potential Additions

1. **Multi-User Collaboration**
   - WebSocket support via Durable Objects
   - Real-time updates when multiple responders join
   - Presence indicators

2. **Advanced Analytics**
   - Time-series charts with D3.js
   - MTTR (Mean Time To Resolution) tracking
   - Incident frequency trends

3. **Integration Ecosystem**
   - Real Slack/PagerDuty webhooks
   - Jira ticket creation
   - Datadog/Grafana metric correlation

4. **AI Improvements**
   - Fine-tuned models on incident data
   - Automatic runbook generation
   - Predictive incident detection

5. **Hyperdrive Integration**
   - Query production databases for logs
   - Automatic error log analysis
   - Real-time metric correlation

---

## 📝 Summary

This application demonstrates a **production-grade incident management system** built entirely on Cloudflare's platform. It showcases:

✅ **8 Cloudflare services** working together seamlessly  
✅ **AI-powered intelligence** for faster incident resolution  
✅ **Scalable architecture** with Durable Objects and Workers  
✅ **Modern UX** with React and real-time updates  
✅ **Enterprise features** like history, analytics, and exports  

Perfect for demonstrating platform expertise in a Cloudflare internship application! 🎉
