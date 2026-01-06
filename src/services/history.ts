// KV-based incident history service

import { Env, IncidentState, DiagnosisResponse, IncidentHistoryEntry } from "../types";

export async function saveIncidentToHistory(
  env: Env,
  incident: IncidentState,
  diagnosis: DiagnosisResponse
): Promise<void> {
  const historyEntry: IncidentHistoryEntry = {
    incidentId: incident.incidentId,
    service: incident.signals.service || "unknown",
    severity: diagnosis.severity,
    symptom: incident.signals.symptom || "unknown",
    createdAt: incident.createdAt,
    completedAt: Date.now(),
    resolution: diagnosis.nextSteps.immediate.join("; "),
  };

  // Store in KV with metadata for listing
  await env.INCIDENT_HISTORY.put(
    `incident:${incident.incidentId}`,
    JSON.stringify({
      ...historyEntry,
      signals: incident.signals,
      diagnosis,
      conversation: incident.conversation,
    }),
    {
      metadata: {
        service: historyEntry.service,
        severity: historyEntry.severity,
        timestamp: historyEntry.completedAt,
      },
    }
  );

  // Also add to service-specific index for faster lookups
  const serviceKey = `service:${historyEntry.service}`;
  const existingList = await env.INCIDENT_HISTORY.get(serviceKey, "json") as string[] || [];
  existingList.unshift(incident.incidentId); // Add to front
  const recentList = existingList.slice(0, 50); // Keep last 50
  
  await env.INCIDENT_HISTORY.put(serviceKey, JSON.stringify(recentList));
}

export async function getRecentIncidents(
  env: Env,
  limit: number = 10
): Promise<IncidentHistoryEntry[]> {
  const list = await env.INCIDENT_HISTORY.list({ prefix: "incident:", limit });
  
  const incidents: IncidentHistoryEntry[] = [];
  for (const key of list.keys) {
    const data = await env.INCIDENT_HISTORY.get(key.name, "json");
    if (data) {
      incidents.push(data as any);
    }
  }
  
  // Sort by completion time, most recent first
  return incidents.sort((a, b) => b.completedAt - a.completedAt);
}

export async function getIncidentsByService(
  env: Env,
  service: string,
  limit: number = 5
): Promise<IncidentHistoryEntry[]> {
  const serviceKey = `service:${service}`;
  const incidentIds = await env.INCIDENT_HISTORY.get(serviceKey, "json") as string[] || [];
  
  const incidents: IncidentHistoryEntry[] = [];
  for (const id of incidentIds.slice(0, limit)) {
    const data = await env.INCIDENT_HISTORY.get(`incident:${id}`, "json");
    if (data) {
      incidents.push(data as any);
    }
  }
  
  return incidents;
}

export async function searchIncidents(
  env: Env,
  query: string
): Promise<IncidentHistoryEntry[]> {
  const list = await env.INCIDENT_HISTORY.list({ prefix: "incident:" });
  const queryLower = query.toLowerCase();
  
  const matches: IncidentHistoryEntry[] = [];
  for (const key of list.keys) {
    const data = await env.INCIDENT_HISTORY.get(key.name, "json") as any;
    if (data) {
      const searchText = `${data.service} ${data.symptom} ${data.severity}`.toLowerCase();
      if (searchText.includes(queryLower)) {
        matches.push(data);
      }
    }
  }
  
  return matches.sort((a, b) => b.completedAt - a.completedAt);
}
