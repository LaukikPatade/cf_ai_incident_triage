# 📁 Project Structure

Complete file structure and description of the AI Incident Triage Assistant.

```
Cloudflare/
│
├── 📄 README.md                      # Main project documentation
├── 📄 GETTING_STARTED.md             # Quick start guide for new users
├── 📄 ARCHITECTURE.md                # Deep technical architecture dive
├── 📄 DEPLOYMENT.md                  # Production deployment guide
├── 📄 TESTING.md                     # Test scenarios and validation
├── 📄 INTERNSHIP_NOTES.md            # Notes for Cloudflare recruiters
├── 📄 PROJECT_STRUCTURE.md           # This file
│
├── 📄 package.json                   # Root dependencies and scripts
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 wrangler.toml                  # Cloudflare Worker configuration
├── 📄 .gitignore                     # Git ignore rules
├── 📄 .dev.vars.example              # Example environment variables
│
├── 📁 src/                           # Backend (Cloudflare Worker)
│   ├── 📄 worker.ts                  # Main Worker entry point & API routes
│   ├── 📄 incident.ts                # Durable Object implementation
│   ├── 📄 prompts.ts                 # LLM prompt templates
│   └── 📄 types.ts                   # TypeScript type definitions
│
└── 📁 frontend/                      # Frontend (React application)
    ├── 📄 index.html                 # HTML entry point
    ├── 📄 package.json               # Frontend dependencies
    ├── 📄 vite.config.ts             # Vite configuration
    ├── 📄 tsconfig.json              # TypeScript config (frontend)
    ├── 📄 tsconfig.node.json         # TypeScript config (build tools)
    │
    └── 📁 src/
        ├── 📄 main.tsx               # React entry point
        ├── 📄 App.tsx                # Main application component
        ├── 📄 App.css                # Application styles
        ├── 📄 index.css              # Global styles & theme
        ├── 📄 types.ts               # Frontend type definitions
        ├── 📄 api.ts                 # Backend API client
        │
        └── 📁 components/
            ├── 📄 ChatInterface.tsx       # Chat UI component
            ├── 📄 ChatInterface.css       # Chat styles
            ├── 📄 SignalsPanel.tsx        # Signals & diagnosis panel
            ├── 📄 SignalsPanel.css        # Panel styles
            ├── 📄 StageIndicator.tsx      # Workflow stage indicator
            └── 📄 StageIndicator.css      # Stage indicator styles
```

## File Descriptions

### Root Configuration

#### `wrangler.toml`
- Configures Cloudflare Worker
- Defines Durable Object bindings
- Sets up Workers AI binding
- Configures environment variables

#### `package.json`
- Root dependencies (Wrangler, TypeScript)
- Scripts for dev, deploy, and setup
- Workspace configuration

#### `tsconfig.json`
- TypeScript compiler settings for backend
- Target: ES2022
- Includes Cloudflare Workers types

### Backend (`src/`)

#### `worker.ts` (~80 lines)
**Purpose**: Main Worker entry point and API gateway

**Exports**:
- `default` - Worker fetch handler
- `IncidentDurableObject` - DO class export

**Routes**:
- `POST /api/incident` - Create new incident
- `GET /api/incident/:id` - Get incident state
- `POST /api/message` - Send message to incident
- `GET /health` - Health check

**Responsibilities**:
- HTTP request routing
- CORS handling
- Durable Object stub management
- Error handling

#### `incident.ts` (~250 lines)
**Purpose**: Durable Object for per-incident state management

**Key Methods**:
- `fetch()` - Handle HTTP requests to DO
- `handleMessage()` - Process incoming messages
- `handleIntakeStage()` - Information gathering logic
- `handleDiagnoseStage()` - Incident analysis logic
- `createNewIncident()` - Initialize incident state
- `saveState()` - Persist to Durable Object storage

**Responsibilities**:
- Workflow state machine (INTAKE → DIAGNOSE → RECOMMEND)
- LLM orchestration
- Response parsing
- State persistence

#### `prompts.ts` (~100 lines)
**Purpose**: LLM prompt templates

**Functions**:
- `generateIntakePrompt()` - Prompt for information gathering
- `generateDiagnosisPrompt()` - Prompt for incident analysis
- `formatSignals()` - Helper for signal formatting
- `formatRecentConversation()` - Helper for context

**Design**:
- Task-specific prompts
- Structured output format (JSON)
- Context window management

#### `types.ts` (~80 lines)
**Purpose**: Shared TypeScript type definitions

**Key Types**:
- `IncidentState` - Complete incident data model
- `IncidentStage` - Workflow stages
- `IncidentSignals` - Structured incident data
- `Message` - Chat message format
- `IntakeResponse` - LLM intake output
- `DiagnosisResponse` - LLM diagnosis output
- `Env` - Worker environment bindings

### Frontend (`frontend/src/`)

#### `main.tsx` (~10 lines)
**Purpose**: React application entry point
- Mounts React app to DOM
- Wraps in StrictMode

#### `App.tsx` (~150 lines)
**Purpose**: Main application component

**State Management**:
- Incident ID and stage
- Message history
- Signals and questions
- Diagnosis results
- Loading states

**Key Functions**:
- `initializeIncident()` - Setup or restore incident
- `handleSendMessage()` - Send user message
- `handleNewIncident()` - Reset for new incident

**Child Components**:
- `<StageIndicator />` - Workflow progress
- `<ChatInterface />` - Chat UI
- `<SignalsPanel />` - Context display

#### `api.ts` (~50 lines)
**Purpose**: Backend API client

**Functions**:
- `createIncident()` - POST to create incident
- `sendMessage()` - POST message to incident
- `getIncident()` - GET incident state

**Features**:
- Configurable API base URL
- Error handling
- TypeScript types for responses

#### Components

##### `ChatInterface.tsx` (~100 lines)
- Message display with auto-scroll
- Message input form
- Loading indicator
- Markdown-like formatting
- Typing animation

##### `SignalsPanel.tsx` (~120 lines)
- Display collected signals
- Show open questions
- Render diagnosis (severity, hypotheses)
- Display action items
- Show monitoring recommendations

##### `StageIndicator.tsx` (~40 lines)
- Visual workflow progress bar
- Three stages with icons
- Active state highlighting
- Animated current stage

### Styles

#### `index.css` (~100 lines)
- CSS variables for theming
- Dark mode color scheme
- Global element styles
- Reusable utility classes

#### Component CSS files
- Scoped styles for each component
- Responsive design breakpoints
- Animations and transitions
- Accessibility considerations

### Documentation

#### `README.md`
- Project overview
- Quick start instructions
- Architecture diagram
- Feature highlights
- Deployment instructions

#### `GETTING_STARTED.md`
- Step-by-step setup guide
- Troubleshooting tips
- Example scenarios to try
- Common issues and solutions

#### `ARCHITECTURE.md`
- Detailed technical deep-dive
- Component descriptions
- Data flow diagrams
- Design decisions and trade-offs
- Performance characteristics
- Security considerations

#### `DEPLOYMENT.md`
- Production deployment steps
- Custom domain setup
- Environment configuration
- Monitoring and observability
- Rollback procedures
- CI/CD examples

#### `TESTING.md`
- Test scenarios
- Functional test cases
- Performance benchmarks
- UI/UX verification
- Regression tests
- Debugging procedures

#### `INTERNSHIP_NOTES.md`
- Project highlights for recruiters
- Technical decisions explained
- Challenges overcome
- Future improvements
- Time investment breakdown
- What I learned

## Key Metrics

```
Total Files:        32
Lines of Code:      ~2,500
Backend (TS):       ~510 lines
Frontend (TSX):     ~560 lines
Styles (CSS):       ~430 lines
Documentation:      ~2,000 lines
Configuration:      ~100 lines
```

## Technology Stack

### Backend
- **Runtime**: Cloudflare Workers
- **State**: Durable Objects
- **AI**: Workers AI (Llama 3.3 70B)
- **Language**: TypeScript

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **Styling**: CSS3 (no framework)

### DevOps
- **CLI**: Wrangler 3
- **VCS**: Git
- **Package Manager**: npm

## Dependencies

### Backend
```json
{
  "@cloudflare/workers-types": "^4.20241127.0",
  "wrangler": "^3.90.0",
  "typescript": "^5.3.3"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.8",
  "typescript": "^5.3.3"
}
```

## Build Outputs

### Development
- Worker runs on `localhost:8787`
- Frontend runs on `localhost:5173`
- Hot reload enabled
- Source maps for debugging

### Production
- Worker bundled and minified
- Frontend optimized for CDN
- Assets hashed for caching
- Deployable to Cloudflare's global network

## Getting Started

```bash
# 1. Install dependencies
npm run setup

# 2. Start Worker (terminal 1)
npm run dev

# 3. Start Frontend (terminal 2)  
npm run dev:frontend

# 4. Open browser
open http://localhost:5173
```

---

**Total Development Time**: ~12 hours
**Platform**: Cloudflare Workers, Durable Objects, Workers AI, Pages
**Purpose**: Cloudflare Software Engineering Internship Take-Home Assignment

