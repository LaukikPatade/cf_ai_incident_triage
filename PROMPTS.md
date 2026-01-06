# AI Prompts Used in Development

This document contains the AI prompts used during the development of the AI Incident Triage Assistant. The project was developed using Claude (via Cursor IDE) with a focus on leveraging Cloudflare's full platform capabilities.

## Development Approach

The project was designed from the ground up to showcase **native Cloudflare platform integration**. Rather than building a generic application and bolting on Cloudflare services, each architectural decision was made to align with Cloudflare's edge-first philosophy:

- **Durable Objects** for strongly consistent, per-incident state (not external databases)
- **Workers AI** for inference at the edge (not external LLM APIs)
- **KV** for eventually consistent history (matching its intended use case)
- **Vectorize** for semantic search (native embedding storage)
- **R2** for report persistence (S3-compatible object storage)

---

## Phase 1: Architecture & Core Implementation

### Prompt 1: Initial System Design

**Goal**: Design an incident triage system that demonstrates Cloudflare's AI and stateful edge capabilities.

```
Design an AI incident triage assistant using Cloudflare's platform:

Requirements:
1. Stateful conversation with per-incident isolation
2. Structured workflow: intake → diagnosis → recommendations
3. LLM-powered signal extraction and analysis
4. Persistent incident history

Cloudflare services to integrate:
- Workers AI (Llama 3.3) for inference
- Durable Objects for state management
- Workers for API routing

Design the architecture, data flow, and implementation approach.
```

**Outcome**: Complete system architecture with Durable Object state machine, task-specific prompts, and React frontend scaffold.

### Prompt 2: Durable Object Implementation

```
Implement the IncidentDurableObject class:
1. Maintain incident state (signals, conversation, workflow stage)
2. Route messages based on current stage (INTAKE, DIAGNOSE, RECOMMEND)
3. Call Workers AI with task-specific prompts
4. Handle JSON extraction from LLM responses
5. Manage stage transitions based on collected signals
```

**Outcome**: Full Durable Object with stage-based workflow and AI integration.

### Prompt 3: LLM Prompt Engineering

```
Create prompts for Llama 3.3 that:
1. INTAKE: Extract structured signals (service, symptom, scope, errors) as JSON
2. DIAGNOSE: Generate severity, hypotheses, and recommendations

Requirements:
- Reliable JSON output
- SRE-focused analysis
- Actionable recommendations
```

**Outcome**: Task-specific prompts with structured output requirements.

---

## Phase 2: Platform Service Integration

### Prompt 4: Expanding Cloudflare Integration

**Goal**: Maximize use of Cloudflare's platform beyond the core requirements.

```
Extend the application to use additional Cloudflare services:
- KV for incident history storage
- Vectorize for semantic search of similar past incidents
- R2 for storing exported incident reports
- Analytics Engine for tracking incident metrics
- Queues for async notification delivery

Implement service integrations with proper error handling and fallbacks.
```

**Outcome**: Six additional service integrations with corresponding API endpoints and frontend components.

### Prompt 5: Semantic Search with Vectorize

```
Implement semantic search for similar incidents:
1. Generate embeddings using Workers AI (bge-base-en-v1.5)
2. Store in Vectorize index
3. Query for similar incidents based on symptom/service
4. Return ranked results with similarity scores
```

**Outcome**: Vector-based incident similarity search with embedding generation.

---

## Phase 3: Workflow Refinement

### Prompt 6: Stage Transition Logic

**Context**: Initial implementation was too conservative with transitions.

```
The intake stage keeps asking questions indefinitely. Modify the transition logic to:
1. Transition after collecting 4+ signals
2. Transition after 3+ user messages
3. Execute diagnosis immediately upon stage change
4. Maintain quality while improving responsiveness
```

**Outcome**: Balanced transition logic that gathers sufficient context without over-questioning.

### Prompt 7: Immediate Diagnosis Execution

```
When transitioning from INTAKE to DIAGNOSE, the diagnosis wasn't appearing.
Fix: Execute handleDiagnoseStage() immediately upon transition rather than 
waiting for the next user message.
```

**Outcome**: Seamless stage transition with immediate diagnosis display.

---

## Phase 4: UI/UX Polish

### Prompt 8: Design System Implementation

```
Implement a professional, minimalist UI:
1. Dark theme with proper contrast
2. Remove decorative elements (emojis)
3. Full-width layouts for dashboards
4. Consistent typography and spacing
5. Smooth transitions and hover states
```

**Outcome**: Clean, professional interface with dark theme and responsive layouts.

### Prompt 9: Dashboard Layout

```
Fix the analytics dashboard layout:
- Cards should spread across full width
- Use flexbox with equal distribution
- Maintain responsiveness on different screen sizes
```

**Outcome**: Full-width dashboard with proper card distribution.

---

## Application Prompts

The application uses two main prompts for the AI assistant:

### Intake Prompt (Signal Extraction)

```typescript
export function getIntakePrompt(
  conversation: Message[],
  signals: IncidentSignals
): string {
  return `You are an expert SRE incident triage assistant. 
Your task is to extract key signals from the user's description.

CURRENT SIGNALS COLLECTED:
${JSON.stringify(signals, null, 2)}

CONVERSATION SO FAR:
${conversation.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

Extract NEW information about:
- service: Which service/component is affected?
- symptom: What is the observable problem?
- scope: Is it global, regional, or affecting specific users?
- recentDeploy: Were there any recent deployments?
- primaryError: What error messages are being seen?
- dependencies: What upstream/downstream services might be involved?

RESPOND WITH VALID JSON ONLY:
{
  "extractedSignals": { /* only NEW information */ },
  "followUpQuestion": "clarifying question or null",
  "readyForDiagnosis": true/false
}`;
}
```

### Diagnosis Prompt (Analysis Generation)

```typescript
export function getDiagnosisPrompt(
  conversation: Message[],
  signals: IncidentSignals
): string {
  return `You are an expert SRE providing incident diagnosis.

SIGNALS:
${JSON.stringify(signals, null, 2)}

CONVERSATION:
${conversation.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

Provide diagnosis as JSON:
{
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "hypotheses": [
    {
      "description": "potential root cause",
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "reasoning": "explanation"
    }
  ],
  "nextSteps": {
    "immediate": ["action 1", "action 2"],
    "deeper": ["investigation 1", "investigation 2"]
  },
  "whatToMonitor": ["metric 1", "metric 2"]
}`;
}
```

---

## Summary

Development followed a systematic approach:

1. **Architecture First**: Designed around Cloudflare's platform capabilities
2. **Core Implementation**: Built the state machine and AI integration
3. **Platform Expansion**: Added KV, Vectorize, R2, and other services
4. **Refinement**: Optimized workflow transitions and user experience
5. **Polish**: Implemented professional UI with dark theme

The iterative prompting approach allowed for rapid development while maintaining alignment with Cloudflare's edge-first philosophy.

---

## Tools Used

- **Claude (Anthropic)**: Primary AI assistant via Cursor IDE
- **Cursor**: AI-integrated development environment
