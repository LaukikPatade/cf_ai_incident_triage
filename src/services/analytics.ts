// Analytics Engine tracking service

import { Env, IncidentState, IncidentStage, DiagnosisResponse } from "../types";

export async function trackIncidentCreated(
  env: Env,
  incident: IncidentState
): Promise<void> {
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
