// LLM prompt templates for different stages

import { IncidentState, IncidentSignals } from "./types";

export function generateIntakePrompt(
  incident: IncidentState,
  userMessage: string
): string {
  const signalsContext = formatSignals(incident.signals);

  return `You are an expert incident triage assistant. Your goal is to gather high-signal context about a production incident.

Current signals collected:
${signalsContext}

Recent conversation:
${formatRecentConversation(incident.conversation.slice(-6))}

User's latest message: "${userMessage}"

Your task:
1. Extract any new structured signals from the user's message (service, symptom, scope, recentDeploy, trafficSpike, primaryError, dependencies, environment)
2. Generate 2-4 high-signal clarifying questions to fill gaps (avoid redundant questions)
3. Provide a short hypothesis if possible

Respond ONLY with valid JSON in this exact format:
{
  "questions": ["question 1", "question 2"],
  "inferredSignals": {
    "service": "value if mentioned",
    "symptom": "value if mentioned"
  },
  "shortHypothesis": "brief hypothesis or empty string"
}

Keep questions focused on: affected services, symptoms, scope, recent changes, and error patterns.`;
}

export function generateDiagnosisPrompt(incident: IncidentState): string {
  const signalsContext = formatSignals(incident.signals);

  return `You are an expert SRE performing incident diagnosis. Analyze the following incident data and provide structured triage output.

Collected signals:
${signalsContext}

Full conversation context:
${formatRecentConversation(incident.conversation)}

Your task:
1. Assess severity (CRITICAL, HIGH, MEDIUM, LOW)
2. Generate 2-4 ranked hypotheses with confidence levels
3. Provide immediate and deeper investigation steps
4. Recommend key metrics to monitor

Respond ONLY with valid JSON in this exact format:
{
  "severity": "HIGH",
  "hypotheses": [
    {
      "description": "Most likely root cause",
      "confidence": "HIGH",
      "reasoning": "Why this is likely"
    }
  ],
  "nextSteps": {
    "immediate": ["Action to take right now", "Another immediate action"],
    "deeper": ["Investigation step 1", "Investigation step 2"]
  },
  "whatToMonitor": ["Metric 1", "Metric 2", "Metric 3"]
}

Be specific and actionable. Focus on practical steps the engineer can take immediately.`;
}

function formatSignals(signals: IncidentSignals): string {
  if (Object.keys(signals).length === 0) {
    return "No signals collected yet";
  }

  return Object.entries(signals)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

function formatRecentConversation(
  messages: Array<{ role: string; content: string }>
): string {
  return messages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");
}

