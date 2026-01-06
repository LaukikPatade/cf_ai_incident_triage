// Analytics Engine tracking service

import { Env, IncidentState, IncidentStage, DiagnosisResponse } from "../types";

export async function trackIncidentCreated(
  env: Env,
  incident: IncidentState
): Promise<void> {
  // Skip if Analytics Engine is not available
  if (!env.ANALYTICS) {
    console.log(`[ANALYTICS] Incident created: ${incident.incidentId}`);
    return;
  }

  try {
    await env.ANALYTICS.writeDataPoint({
      blobs: [
        incident.incidentId,
        "incident_created",
        incident.signals.service || "unknown",
      ],
      doubles: [Date.now()],
      indexes: [incident.incidentId],
    });
  } catch (error) {
    console.error("Error tracking incident creation:", error);
  }
}

export async function trackStageTransition(
  env: Env,
  incidentId: string,
  fromStage: IncidentStage,
  toStage: IncidentStage,
  service: string
): Promise<void> {
  // Skip if Analytics Engine is not available
  if (!env.ANALYTICS) {
    console.log(`[ANALYTICS] Stage transition: ${fromStage} -> ${toStage}`);
    return;
  }

  try {
    await env.ANALYTICS.writeDataPoint({
      blobs: [
        incidentId,
        `stage_transition_${fromStage}_to_${toStage}`,
        service,
      ],
      doubles: [Date.now()],
      indexes: [incidentId],
    });
  } catch (error) {
    console.error("Error tracking stage transition:", error);
  }
}

export async function trackIncidentCompleted(
  env: Env,
  incident: IncidentState,
  diagnosis: DiagnosisResponse
): Promise<void> {
  // Skip if Analytics Engine is not available
  if (!env.ANALYTICS) {
    console.log(`[ANALYTICS] Incident completed: ${incident.incidentId} (${diagnosis.severity})`);
    return;
  }

  try {
    const duration = Date.now() - incident.createdAt;

    await env.ANALYTICS.writeDataPoint({
      blobs: [
        incident.incidentId,
        "incident_completed",
        incident.signals.service || "unknown",
        diagnosis.severity,
      ],
      doubles: [
        Date.now(), // timestamp
        duration, // duration in ms
        incident.conversation.length, // message count
      ],
      indexes: [incident.incidentId],
    });
  } catch (error) {
    console.error("Error tracking incident completion:", error);
  }
}

export async function trackUserMessage(
  env: Env,
  incidentId: string,
  messageLength: number
): Promise<void> {
  // Skip if Analytics Engine is not available
  if (!env.ANALYTICS) {
    return;
  }

  try {
    await env.ANALYTICS.writeDataPoint({
      blobs: [incidentId, "user_message"],
      doubles: [Date.now(), messageLength],
      indexes: [incidentId],
    });
  } catch (error) {
    console.error("Error tracking user message:", error);
  }
}
