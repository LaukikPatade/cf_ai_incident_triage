# AI Prompts Used in Development

This document contains the AI prompts used during the development of the AI Incident Triage Assistant. AI-assisted coding was used extensively throughout the project.

## Table of Contents

1. [Initial Design & Planning](#initial-design--planning)
2. [Core Implementation](#core-implementation)
3. [Feature Development](#feature-development)
4. [Bug Fixes & Debugging](#bug-fixes--debugging)
5. [UI/UX Design](#uiux-design)

---

## Initial Design & Planning

### Prompt 1: Project Architecture Design

**Context**: Starting the project from scratch with requirements for a Cloudflare-based AI application.

**Prompt**:
```
The Cloudflare software internship application has a take home assignment attached to it. 
I asked ChatGPT for ideas and this is what it came up with. Help me implement it please:

# AI Incident Triage Assistant — Design Document

## Executive Summary
A stateful, AI-powered incident triage assistant that lives at the edge. 
It guides an on-call engineer through a deterministic workflow—intake → diagnose → recommend—
using task-specific prompts, strong typing and Durable Objects for per-incident memory.

[Full design document with architecture, workflow states, prompt engineering details, etc.]
```

**Result**: Complete project scaffold with Worker, Durable Objects, React frontend, and all service integrations.

---

## Core Implementation

### Prompt 2: Durable Object State Management

**Context**: Implementing the core incident state machine.

**Prompt**:
```
Implement the IncidentDurableObject class that:
1. Maintains incident state (signals, conversation, stage)
2. Handles message routing based on current stage
3. Calls Workers AI for intake extraction and diagnosis generation
4. Uses task-specific prompts for each stage
```

**Result**: Full Durable Object implementation with stage-based workflow and AI integration.

### Prompt 3: LLM Prompt Engineering

**Context**: Creating effective prompts for the Llama 3.3 model.

**Prompt**:
```
Create prompts for:
1. INTAKE stage - Extract structured signals from user messages (service, symptom, scope, etc.)
   Output must be valid JSON
2. DIAGNOSE stage - Generate diagnosis with severity, hypotheses, and recommendations
   Based on all collected signals and conversation context
```

**Result**: Task-specific prompts with structured JSON output requirements and few-shot examples.

---

## Feature Development

### Prompt 4: Implementing Additional Cloudflare Services

**Context**: Expanding beyond the core functionality.

**Prompt**:
```
Let's think of more features. Maybe we can use the KV feature to cache incidents? 
Are there any more features you can think of implementing?
```

**AI Response** (summarized):
- KV for incident history storage
- Vectorize for semantic search of similar incidents
- Analytics Engine for incident metrics
- Queues for notification delivery
- R2 for report storage
- Templates for common incident types

**Follow-up Prompt**:
```
Let's implement all of them.
```

**Result**: Full implementation of 6 additional Cloudflare services with corresponding API endpoints and frontend components.

### Prompt 5: Seeding Demo Data

**Context**: Testing with realistic data.

**Prompt**:
```
1. The report is not being generated properly, it's empty
2. We can definitely improve the dashboard and the history page
3. I need you to seed the system with more incidents
```

**Result**: Demo data seeding functionality with 15 realistic incident scenarios spanning different services, severities, and resolutions.

---

## Bug Fixes & Debugging

### Prompt 6: Workflow Transition Issue

**Context**: The application was stuck in the "Information Gathering" stage.

**Prompt**:
```
The problem is that the application keeps demanding more details and never moves on to the diagnosis step.
```

**Result**: Modified transition logic to be more aggressive:
- Transition after 4+ signals collected
- Transition after 3+ user messages
- Immediate diagnosis execution upon stage transition

### Prompt 7: Frontend Rendering Error

**Context**: Blank page after adding new components.

**Prompt**:
```
[Error] ReferenceError: Can't find variable: KeyboardHelp
App (App.tsx:248)
```

**Result**: Added missing component import.

### Prompt 8: API Response Mismatch

**Context**: SimilarIncidents component crashing.

**Prompt**:
```
[Error] TypeError: undefined is not an object (evaluating 'similar.length')
SimilarIncidents (SimilarIncidents.tsx:56)
```

**Result**: Updated frontend types and API client to match backend response structure (`incidentId` and `similarity` instead of `id` and `score`).

### Prompt 9: Export Functionality Bug

**Context**: Exported reports were empty.

**Prompt**:
```
The report is not being generated properly, its empty @/Users/.../incident-1cdbc649.md
```

**Result**: Fixed ExportButton to correctly extract `result.markdown` from API response.

---

## UI/UX Design

### Prompt 10: Initial UI Concerns

**Context**: The UI had visibility and design issues.

**Prompt**:
```
The title of the incident history and incident analytics is faded into the background. 
We can definitely improve the colour scheme. 
The constant appearance of emoticons makes the application look unprofessional. 
I would like it to be functional with a sleek and minimalistic design.
```

**Result**: Complete dark theme redesign with:
- White titles on dark backgrounds
- Removed all emojis from UI code
- Dark card backgrounds with subtle borders
- Professional typography

### Prompt 11: Layout Issues

**Context**: Analytics dashboard not using full width.

**Prompt**:
```
The incident analytics still looks centered and narrow but the incident history page is spread out and nice.
```

**Follow-up**:
```
Now the cards are in a single column. Just have the content occupy the entire page man how difficult is it.
```

**Result**: Switched from CSS Grid to Flexbox with `flex: 1` for equal distribution, ensuring 4 stat cards and 2 charts spread across full width.

### Prompt 12: Final Polish

**Context**: Making the app presentation-ready.

**Prompt**:
```
See if you can make any cosmetic changes to the application and make it appear 
a bit more sleek and presentable with a minimalist design.
```

**Result**: Comprehensive visual refresh:
- Custom fonts (Outfit + JetBrains Mono)
- Refined color palette with CSS variables
- Custom scrollbars
- Smooth transitions and hover effects
- Consistent spacing and typography
- Text-based avatars instead of emojis

---

## LLM Prompts in the Application

The application itself uses two main prompts for the AI assistant:

### Intake Prompt (Signal Extraction)

```typescript
export function getIntakePrompt(
  conversation: Message[],
  signals: IncidentSignals
): string {
  return `You are an expert SRE incident triage assistant. Your task is to extract key signals from the user's description.

CURRENT SIGNALS COLLECTED:
${JSON.stringify(signals, null, 2)}

CONVERSATION SO FAR:
${conversation.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

Based on the latest user message, extract any NEW information about:
- service: Which service/component is affected?
- symptom: What is the observable problem?
- scope: Is it global, regional, or affecting specific users?
- recentDeploy: Were there any recent deployments?
- primaryError: What error messages are being seen?
- dependencies: What upstream/downstream services might be involved?
- environment: Is this prod, staging, etc.?

RESPOND WITH VALID JSON ONLY in this format:
{
  "extractedSignals": { /* only include fields with NEW information */ },
  "followUpQuestion": "A clarifying question if more information is needed, or null if sufficient",
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
  return `You are an expert SRE providing incident diagnosis. Based on all the information gathered, provide a comprehensive diagnosis.

SIGNALS:
${JSON.stringify(signals, null, 2)}

CONVERSATION:
${conversation.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

Provide your diagnosis in this JSON format:
{
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "hypotheses": [
    {
      "description": "Brief description of potential root cause",
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "reasoning": "Why this might be the cause"
    }
  ],
  "nextSteps": {
    "immediate": ["Action 1", "Action 2"],
    "deeper": ["Investigation step 1", "Investigation step 2"]
  },
  "whatToMonitor": ["Metric 1", "Metric 2"]
}`;
}
```

---

## Summary

AI assistance was used throughout the development process for:
- **Architecture design**: Translating requirements into a technical implementation plan
- **Code generation**: Implementing Workers, Durable Objects, React components
- **Debugging**: Identifying and fixing runtime errors and logic issues
- **UI/UX refinement**: Iterating on the visual design based on feedback
- **Documentation**: Creating this README and PROMPTS.md

The prompts evolved through conversation, with follow-up questions and error messages providing context for refinements. This iterative approach allowed rapid development while maintaining code quality.

---

## Tools Used

- **Claude (Anthropic)**: Primary AI assistant for code generation and debugging
- **Cursor IDE**: AI-integrated development environment
- **ChatGPT (OpenAI)**: Initial brainstorming for project ideas

