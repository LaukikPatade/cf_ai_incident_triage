// Incident templates and runbooks service

import { Env, IncidentTemplate, IncidentSignals } from "../types";

// Predefined templates for common incident types
const DEFAULT_TEMPLATES: IncidentTemplate[] = [
  {
    id: "database-timeout",
    name: "Database Connection Timeout",
    description: "Issues related to database connectivity and timeouts",
    suggestedQuestions: [
      "What is the database CPU and memory usage?",
      "Have there been recent schema changes or migrations?",
      "Are connection pools properly configured?",
      "Is this affecting all database queries or specific ones?",
    ],
    commonCauses: [
      "Connection pool exhaustion",
      "Slow queries causing locks",
      "Database server resource constraints",
      "Network connectivity issues",
    ],
    runbookUrl: "https://runbooks.example.com/database-timeout",
  },
  {
    id: "deployment-failure",
    name: "Post-Deployment Issues",
    description: "Problems occurring after a recent deployment",
    suggestedQuestions: [
      "What changed in this deployment?",
      "Was there a previous deployment that worked?",
      "Are error rates elevated compared to before deployment?",
      "Can the deployment be rolled back quickly?",
    ],
    commonCauses: [
      "Configuration errors",
      "Incompatible dependencies",
      "Database migration issues",
      "Breaking API changes",
    ],
    runbookUrl: "https://runbooks.example.com/deployment-rollback",
  },
  {
    id: "api-degradation",
    name: "API Performance Degradation",
    description: "Slow response times or timeouts in API services",
    suggestedQuestions: [
      "What is the P99 latency?",
      "Are there specific endpoints that are slow?",
      "Is there elevated traffic or unusual patterns?",
      "Are downstream dependencies responding slowly?",
    ],
    commonCauses: [
      "N+1 query problems",
      "Inefficient algorithms",
      "Third-party API slowness",
      "Resource contention",
    ],
    runbookUrl: "https://runbooks.example.com/api-performance",
  },
  {
    id: "authentication-failure",
    name: "Authentication/Authorization Failures",
    description: "Users unable to log in or access resources",
    suggestedQuestions: [
      "Are all users affected or specific user segments?",
      "What authentication errors are being logged?",
      "Have there been changes to identity provider configuration?",
      "Are tokens expiring unexpectedly?",
    ],
    commonCauses: [
      "Token/session expiration issues",
      "Identity provider outage",
      "Certificate expiration",
      "Misconfigured permissions",
    ],
    runbookUrl: "https://runbooks.example.com/auth-issues",
  },
];

export async function initializeTemplates(env: Env): Promise<void> {
  for (const template of DEFAULT_TEMPLATES) {
    await env.TEMPLATES.put(
      `template:${template.id}`,
      JSON.stringify(template)
    );
  }
  console.log(`Initialized ${DEFAULT_TEMPLATES.length} templates`);
}

export async function getTemplate(
  env: Env,
  templateId: string
): Promise<IncidentTemplate | null> {
  const data = await env.TEMPLATES.get(`template:${templateId}`, "json");
  return data as IncidentTemplate | null;
}

export async function getAllTemplates(env: Env): Promise<IncidentTemplate[]> {
  const list = await env.TEMPLATES.list({ prefix: "template:" });
  const templates: IncidentTemplate[] = [];

  for (const key of list.keys) {
    const data = await env.TEMPLATES.get(key.name, "json");
    if (data) {
      templates.push(data as IncidentTemplate);
    }
  }

  return templates;
}

export async function matchTemplate(
  env: Env,
  signals: IncidentSignals
): Promise<IncidentTemplate | null> {
  const templates = await getAllTemplates(env);

  // Simple matching logic - can be enhanced with ML
  const symptomLower = (signals.symptom || "").toLowerCase();
  const errorLower = (signals.primaryError || "").toLowerCase();

  // Check for database-related issues
  if (symptomLower.includes("database") || 
      symptomLower.includes("timeout") || 
      errorLower.includes("connection")) {
    return templates.find(t => t.id === "database-timeout") || null;
  }

  // Check for deployment-related issues
  if (signals.recentDeploy === "yes" || symptomLower.includes("deploy")) {
    return templates.find(t => t.id === "deployment-failure") || null;
  }

  // Check for API/performance issues
  if (symptomLower.includes("slow") || 
      symptomLower.includes("latency") || 
      symptomLower.includes("timeout")) {
    return templates.find(t => t.id === "api-degradation") || null;
  }

  // Check for auth issues
  if (symptomLower.includes("auth") || 
      symptomLower.includes("login") || 
      symptomLower.includes("permission")) {
    return templates.find(t => t.id === "authentication-failure") || null;
  }

  return null;
}

export async function suggestQuestionsFromTemplate(
  env: Env,
  signals: IncidentSignals
): Promise<string[]> {
  const template = await matchTemplate(env, signals);
  return template?.suggestedQuestions || [];
}
