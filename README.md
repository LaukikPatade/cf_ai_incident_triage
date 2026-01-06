# cf_ai_incident_triage

An AI-powered incident triage assistant built entirely on the Cloudflare platform. This application demonstrates the integration of multiple Cloudflare services to create a stateful, intelligent system that guides engineers through incident diagnosis and resolution.

## Overview

When production incidents occur, engineers often waste precious time trying to gather context and form hypotheses. This AI assistant acts as an experienced SRE, guiding users through a structured triage process:

1. **Information Gathering** - Collects critical signals about the incident
2. **Analysis & Diagnosis** - Uses AI to generate hypotheses and identify root causes  
3. **Recommendations** - Provides actionable next steps and metrics to monitor

## Demo

**Live Demo**: https://cf-ai-incident-triage.pages.dev

**Local Development**: Follow the setup instructions below

## Features

### Core Functionality
- **AI-Powered Triage**: Llama 3.3 via Workers AI provides intelligent incident analysis
- **Structured Workflow**: Deterministic stage-based progression (Intake → Diagnose → Recommend)
- **Persistent State**: Each incident maintains context across the entire conversation
- **Real-time Chat Interface**: React-based UI for natural interaction

### Advanced Features
- **Incident History**: Browse and search past incidents stored in KV
- **Semantic Search**: Find similar past incidents using Vectorize embeddings
- **Analytics Dashboard**: Track incident patterns and trends
- **Report Export**: Generate JSON/Markdown incident reports stored in R2
- **Notification Queue**: Async alerts for critical incidents via Queues
- **Incident Templates**: Pre-built templates for common issue types

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                    localhost:5173 / Pages                        │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP/REST
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Worker (API Gateway)               │
│                         localhost:8787                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  /api/     │  │  /api/     │  │  /api/     │  │  /api/     │ │
│  │  incident  │  │  history   │  │  analytics │  │  templates │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘ │
└────────┼───────────────┼───────────────┼───────────────┼────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Durable   │   │     KV      │   │  Analytics  │   │     KV      │
│   Objects   │   │  (History)  │   │   Engine    │   │ (Templates) │
│  (per-inc)  │   └─────────────┘   └─────────────┘   └─────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Workers AI (Llama 3.3)                    │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │  Intake Prompt  │    │ Diagnosis Prompt│                     │
│  │  (Extract JSON) │    │  (Generate Dx)  │                     │
│  └─────────────────┘    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Vectorize  │   │   Queues    │   │     R2      │
│ (Embeddings)│   │(Notifications)│  │  (Reports)  │
└─────────────┘   └─────────────┘   └─────────────┘
```

## Cloudflare Services Used

| Service | Purpose |
|---------|---------|
| **Workers AI** | LLM inference using Llama 3.3 70B for incident analysis |
| **Durable Objects** | Per-incident state management and workflow coordination |
| **Workers KV** | Incident history storage and template management |
| **Vectorize** | Semantic search for similar past incidents |
| **Analytics Engine** | Incident metrics and trend tracking |
| **Queues** | Async notification delivery for critical incidents |
| **R2** | Persistent storage for exported incident reports |
| **Workers** | API gateway and request routing |

## Tech Stack

- **Backend**: Cloudflare Workers + Durable Objects (TypeScript)
- **Frontend**: React 18 + Vite + TypeScript
- **LLM**: Llama 3.3 70B via Workers AI
- **Embeddings**: BGE Base EN v1.5 via Workers AI
- **State**: Durable Objects (strongly consistent) + KV (eventually consistent)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cf_ai_incident_triage.git
   cd cf_ai_incident_triage
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Login to Cloudflare**
   ```bash
   npx wrangler login
   ```

4. **Start the backend (Worker)**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:8787`

5. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev:frontend
   ```
   The UI will be available at `http://localhost:5173`

### Quick Test

1. Open `http://localhost:5173` in your browser
2. Describe an incident, e.g.: *"Our payment service is returning 500 errors after deploying v2.5.0"*
3. The AI will ask clarifying questions to gather context
4. Once enough information is collected, it will provide a diagnosis with:
   - Severity assessment
   - Root cause hypotheses (ranked by confidence)
   - Immediate actions to take
   - Deeper investigation steps
   - Metrics to monitor

## Project Structure

```
cf_ai_incident_triage/
├── src/
│   ├── worker.ts              # Main Worker entry point (API routes)
│   ├── incident.ts            # Durable Object (state + workflow)
│   ├── prompts.ts             # LLM prompt templates
│   ├── types.ts               # TypeScript interfaces
│   └── services/
│       ├── history.ts         # KV incident history
│       ├── vectorize.ts       # Semantic search
│       ├── analytics.ts       # Metrics tracking
│       ├── notifications.ts   # Queue-based alerts
│       ├── reports.ts         # R2 report storage
│       └── templates.ts       # Incident templates
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main React component
│   │   ├── api.ts             # API client
│   │   └── components/
│   │       ├── ChatInterface.tsx
│   │       ├── SignalsPanel.tsx
│   │       ├── StageIndicator.tsx
│   │       ├── AnalyticsDashboard.tsx
│   │       ├── IncidentHistory.tsx
│   │       └── ...
│   └── vite.config.ts
├── wrangler.toml              # Cloudflare configuration
├── package.json
├── README.md
└── PROMPTS.md                 # AI prompts used in development
```

## API Reference

### Incident Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/incident` | POST | Create new incident |
| `/api/incident/:id` | GET | Get incident state |
| `/api/incident/:id/message` | POST | Send message to incident |
| `/api/incident/:id/similar` | GET | Find similar past incidents |
| `/api/incident/:id/export` | GET | Export incident report |

### History & Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/history` | GET | List recent incidents |
| `/api/history?service=X` | GET | Filter by service |
| `/api/analytics/stats` | GET | Get incident statistics |
| `/api/templates` | GET | List incident templates |

## Workflow States

The incident progresses through three stages:

```
INTAKE ────────────────► DIAGNOSE ────────────────► RECOMMEND
   │                         │                           │
   │ Collect signals:        │ Generate:                 │ Provide:
   │ - Service affected      │ - Severity                │ - Actions
   │ - Symptom               │ - Hypotheses              │ - Monitoring
   │ - Scope                 │ - Root causes             │ - Export
   │ - Recent changes        │                           │
   │ - Error messages        │                           │
```

## Configuration

### Environment Variables (wrangler.toml)

```toml
[vars]
ALLOWED_ORIGINS = "http://localhost:5173"
```

### Bindings

All Cloudflare service bindings are configured in `wrangler.toml`:

- `AI` - Workers AI binding
- `INCIDENT` - Durable Object for incident state
- `INCIDENT_HISTORY` - KV namespace for history
- `TEMPLATES` - KV namespace for templates
- `VECTORIZE` - Vector index for embeddings
- `ANALYTICS` - Analytics Engine dataset
- `NOTIFICATION_QUEUE` - Queue for notifications
- `INCIDENT_REPORTS` - R2 bucket for reports

## Deployment

### Deploy to Cloudflare

1. **Create required resources** (one-time setup):
   ```bash
   # Create KV namespaces
   npx wrangler kv:namespace create INCIDENT_HISTORY
   npx wrangler kv:namespace create TEMPLATES
   
   # Create Vectorize index
   npx wrangler vectorize create incident-embeddings --dimensions=768 --metric=cosine
   
   # Create R2 bucket
   npx wrangler r2 bucket create incident-reports
   
   # Create Queue
   npx wrangler queues create incident-notifications
   ```

2. **Update wrangler.toml** with the created resource IDs

3. **Deploy the Worker**:
   ```bash
   npm run deploy
   ```

4. **Deploy the Frontend** to Cloudflare Pages:
   ```bash
   cd frontend
   npm run build
   npx wrangler pages deploy dist
   ```

## Design Decisions

### Why Durable Objects?

Each incident requires strongly consistent state and isolated workflow management. Durable Objects provide:
- Per-incident isolation (no cross-contamination)
- Transactional state updates
- Automatic scaling with incident volume
- Built-in persistence

### Why Structured Prompts?

Rather than a single monolithic prompt, the system uses task-specific prompts:
- **Intake Prompt**: Extracts structured signals from user messages (JSON output)
- **Diagnosis Prompt**: Generates analysis based on collected context

This approach ensures:
- Reliable JSON extraction
- Focused, high-quality responses
- Easier debugging and iteration

### Why Stage-Based Workflow?

A deterministic workflow ensures:
- Consistent user experience
- No premature diagnosis (enough context is gathered first)
- Clear progression indicators for the user
- Auditable decision points

## Known Limitations

- Local development uses preview IDs for KV/R2/Vectorize (data doesn't persist across restarts)
- The LLM responses occasionally include emojis despite prompt instructions
- Vectorize queries require at least one indexed incident to return results

## Future Enhancements

- [ ] Voice input via Cloudflare Realtime
- [ ] PagerDuty/Slack integration for notifications
- [ ] Runbook linking based on incident type
- [ ] Multi-user collaboration on incidents
- [ ] Custom LLM fine-tuning for domain-specific triage

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- Built for the Cloudflare AI Internship Application
- Powered by Cloudflare Workers AI and the Cloudflare Developer Platform
- UI design inspired by modern incident management tools
