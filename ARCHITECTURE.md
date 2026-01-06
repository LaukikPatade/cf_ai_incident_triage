# 🏗️ Architecture Deep Dive

This document provides a detailed explanation of the AI Incident Triage Assistant's architecture and design decisions.

## System Overview

The application is built entirely on Cloudflare's edge platform, demonstrating modern patterns for stateful AI applications.

```
┌───────────────────────────────────────────────────────────────┐
│                         Browser / User                         │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages (CDN)                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              React Single Page Application              │  │
│  │  • Chat Interface                                       │  │
│  │  • State Management                                     │  │
│  │  • Real-time UI Updates                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ REST API (JSON)
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    Cloudflare Worker (API)                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              HTTP Request Handler                       │  │
│  │  • Route matching (/api/incident, /api/message)        │  │
│  │  • CORS policy enforcement                             │  │
│  │  • Request validation                                  │  │
│  │  • Response formatting                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            │                                   │
│                            │ Durable Object Stub               │
│                            ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         Durable Object (Per-Incident State)            │  │
│  │  • Workflow State Machine                              │  │
│  │  • Message History                                     │  │
│  │  • Signal Extraction                                   │  │
│  │  • LLM Orchestration                                   │  │
│  └───────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────────┘
                             │
                             │ Binding
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      Workers AI (LLM)                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Llama 3.3 70B (Inference)                 │  │
│  │  • Natural language understanding                      │  │
│  │  • Structured output generation                        │  │
│  │  • Reasoning and analysis                              │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (React + TypeScript)

**Location**: `frontend/src/`

**Responsibilities**:
- Render chat interface
- Manage local UI state
- Make API calls to Worker
- Display incident signals and diagnosis
- Handle user interactions

**Key Components**:

#### App.tsx
- Root component
- Manages incident lifecycle
- Coordinates state between components
- Handles API communication

#### ChatInterface
- Message display and input
- Auto-scrolling
- Loading states
- Markdown-like formatting

#### SignalsPanel
- Display collected structured signals
- Show open questions
- Render diagnosis results
- Action items and metrics

#### StageIndicator
- Visual workflow progress
- Stage transitions
- Current state highlighting

**State Management**:
- Uses React hooks (useState, useEffect)
- LocalStorage for incident persistence across page reloads
- Optimistic UI updates for better UX

### 2. Cloudflare Worker (API Gateway)

**Location**: `src/worker.ts`

**Responsibilities**:
- HTTP request routing
- CORS handling
- Durable Object coordination
- Error handling

**API Endpoints**:

```typescript
POST   /api/incident        → Create new incident (generates UUID)
GET    /api/incident/:id    → Retrieve incident state
POST   /api/message         → Send message to incident
GET    /health              → Health check endpoint
```

**Design Patterns**:

1. **Stateless Gateway**: Worker itself is stateless, delegates to Durable Objects
2. **Request Validation**: Validates inputs before forwarding
3. **CORS Middleware**: Configurable origin allowlist
4. **Error Boundaries**: Catches and formats errors

### 3. Durable Object (State Management)

**Location**: `src/incident.ts`

**Responsibilities**:
- Persistent per-incident state
- Workflow orchestration
- LLM prompt generation
- Response parsing
- Stage transitions

**State Schema**:

```typescript
{
  incidentId: string;           // Unique identifier
  stage: IncidentStage;         // Current workflow stage
  signals: IncidentSignals;     // Structured data
  conversation: Message[];      // Full chat history
  openQuestions: string[];      // Pending questions
  createdAt: number;            // Timestamp
  updatedAt: number;            // Timestamp
}
```

**Workflow State Machine**:

```
INTAKE ──────────> DIAGNOSE ──────────> RECOMMEND
  │                   │                      │
  │                   │                      │
  └─── Questions      └─── Analysis         └─── Actions
       Signals             Severity              Monitoring
```

**State Transitions**:

1. **INTAKE → DIAGNOSE**: Triggered when minimum signals collected and no more questions
2. **DIAGNOSE → RECOMMEND**: Triggered immediately after diagnosis completes
3. **No Backward Transitions**: Ensures deterministic progress

### 4. LLM Integration (Workers AI)

**Location**: `src/prompts.ts`

**Model**: Llama 3.3 70B FP8 (Fast variant)

**Configuration**:
```typescript
{
  temperature: 0.3,      // Low for consistency
  max_tokens: 1024-2048, // Stage-dependent
  response_format: json  // Structured outputs
}
```

**Prompt Engineering**:

#### Intake Prompt
- **Goal**: Extract signals and ask clarifying questions
- **Output**: JSON with questions, inferredSignals, shortHypothesis
- **Strategy**: Few-shot learning with examples

#### Diagnosis Prompt
- **Goal**: Assess severity and generate hypotheses
- **Output**: JSON with severity, hypotheses, nextSteps, whatToMonitor
- **Strategy**: Chain-of-thought reasoning

**Error Handling**:
- JSON parsing with fallbacks
- Retry logic for transient failures
- Default responses if LLM unavailable

## Data Flow

### Creating an Incident

```
User clicks "New Incident"
    │
    ▼
Frontend: POST /api/incident
    │
    ▼
Worker: Generate UUID
    │
    ▼
Worker: Create Durable Object stub
    │
    ▼
Durable Object: Initialize with default state
    │
    ▼
Worker: Return incident ID
    │
    ▼
Frontend: Store ID in localStorage
    │
    ▼
Frontend: GET /api/incident/:id
    │
    ▼
Durable Object: Return initial state
    │
    ▼
Frontend: Display welcome message
```

### Sending a Message

```
User types message and clicks "Send"
    │
    ▼
Frontend: Optimistically add to UI
    │
    ▼
Frontend: POST /api/message {incidentId, message}
    │
    ▼
Worker: Get Durable Object stub by ID
    │
    ▼
Worker: Forward to Durable Object
    │
    ▼
Durable Object: Add message to conversation
    │
    ▼
Durable Object: Determine current stage
    │
    ├─ INTAKE: Generate intake prompt
    │   │
    │   ▼
    │   Workers AI: Process with LLM
    │   │
    │   ▼
    │   Parse response, update signals
    │   │
    │   ▼
    │   Check if ready for DIAGNOSE
    │
    ├─ DIAGNOSE: Generate diagnosis prompt
    │   │
    │   ▼
    │   Workers AI: Process with LLM
    │   │
    │   ▼
    │   Parse diagnosis, transition to RECOMMEND
    │
    └─ RECOMMEND: Return completion message
    │
    ▼
Durable Object: Save state to storage
    │
    ▼
Durable Object: Return response
    │
    ▼
Worker: Forward response to frontend
    │
    ▼
Frontend: Add assistant message to UI
    │
    ▼
Frontend: Update signals panel
    │
    ▼
Frontend: Update stage indicator
```

## Design Decisions

### Why Durable Objects?

**Alternatives Considered**:
- KV Storage: Too eventually consistent
- D1 Database: Overkill for this use case
- External DB: Adds latency and complexity

**Why Durable Objects Won**:
- Strong consistency per incident
- Automatic scaling and sharding
- Co-location with compute
- No separate database to manage
- Natural fit for per-incident state

### Why Llama 3.3?

**Requirements**:
- Strong reasoning capabilities
- Structured output generation
- Fast inference
- Cost-effective

**Why Llama 3.3 70B**:
- Latest model on Workers AI
- Excellent reasoning
- Fast FP8 variant
- Built-in JSON mode

### Why Three Stages?

**Design Goal**: Predictable, structured workflow

**Alternatives Considered**:
- Free-form chat: Too unstructured
- Single-shot: Misses context gathering
- Five+ stages: Too complex

**Why Three**:
- Natural incident response flow
- Clear progress indicators
- Manageable complexity
- User expectations align

## Performance Characteristics

### Latency

**Cold Start** (first request):
- Worker: ~10-50ms
- Durable Object: ~50-200ms
- Workers AI: ~1-3s

**Warm Path** (subsequent):
- Worker: ~1-5ms
- Durable Object: ~10-50ms
- Workers AI: ~1-2s

**Total Response Time**: ~1-3 seconds per message

### Throughput

- **Workers**: Handle millions of requests/day
- **Durable Objects**: One instance per incident (natural sharding)
- **Workers AI**: Rate limited by plan (10k neurons/day on free tier)

### Storage

- **Per Incident**: ~10-100 KB
- **Conversation History**: Grows with messages
- **Durable Object Limit**: 128 MB per instance (not a concern)

## Security Architecture

### Authentication (Future)

Currently no authentication (demo/prototype).

**Production Considerations**:
- Add Cloudflare Access
- Implement API keys
- Use Workers KV for session management
- Integrate with identity provider

### Data Privacy

- No data leaves Cloudflare network
- Incident data stored server-side only
- No telemetry sent to third parties
- Conversation history in Durable Objects

### CORS Policy

- Configurable allowed origins
- Rejects unauthorized origins
- Preflight handling
- Secure headers

## Observability

### Logging

```typescript
console.log()   // Appears in wrangler tail and Dashboard
console.error() // Captured as Worker errors
```

### Metrics (Built-in)

- Request count
- Error rate
- CPU time
- Durable Object operations
- Workers AI token usage

### Debugging

```bash
# Real-time logs
wrangler tail

# Filter by status
wrangler tail --status error

# Follow specific request
wrangler tail --search "incident-id"
```

## Scalability

### Horizontal Scaling

- **Workers**: Auto-scale globally
- **Durable Objects**: One per incident (natural partitioning)
- **Workers AI**: Shared inference pool

### Geographic Distribution

- Workers deployed to 300+ cities globally
- Durable Objects created near first request
- Workers AI inference in core regions

### Bottlenecks

1. **Workers AI Quota**: Rate limited
   - Mitigation: Upgrade plan, implement queuing
2. **Durable Object Contention**: Single-threaded per incident
   - Non-issue: Incidents are independent

## Testing Strategy

### Unit Tests (Future)

```typescript
// Test Durable Object logic
// Test prompt generation
// Test response parsing
```

### Integration Tests (Future)

```typescript
// Test full Worker flow
// Test Durable Object persistence
// Test LLM integration
```

### Manual Testing

1. Create incident
2. Send various message types
3. Verify stage transitions
4. Check signal extraction
5. Review diagnosis quality

## Future Enhancements

### Short Term

- [ ] Add authentication
- [ ] Implement rate limiting
- [ ] Add more comprehensive error handling
- [ ] Create unit tests

### Medium Term

- [ ] Multi-user support per incident
- [ ] Export incident reports
- [ ] Integrate with monitoring tools
- [ ] Add historical search

### Long Term

- [ ] Real-time log ingestion
- [ ] Automated remediation workflows
- [ ] Team collaboration features
- [ ] Machine learning feedback loops

---

This architecture demonstrates production-grade patterns for building stateful, AI-powered applications on Cloudflare's edge platform.

