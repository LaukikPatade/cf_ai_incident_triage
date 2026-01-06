// Vectorize-based semantic search service

import { Env, IncidentState, DiagnosisResponse } from "../types";

export async function storeIncidentEmbedding(
  env: Env,
  incident: IncidentState,
  diagnosis: DiagnosisResponse
): Promise<void> {
  try {
    // Create a rich text representation for embedding
    const textForEmbedding = `
      Service: ${incident.signals.service || "unknown"}
      Symptom: ${incident.signals.symptom || "unknown"}
      Error: ${incident.signals.primaryError || "unknown"}
      Scope: ${incident.signals.scope || "unknown"}
      Severity: ${diagnosis.severity}
      Hypotheses: ${diagnosis.hypotheses.map(h => h.description).join(". ")}
    `.trim();

    // Generate embedding using Workers AI
    const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: [textForEmbedding]
    });

    const vector = embeddings.data[0];

    // Store in Vectorize
    await env.VECTORIZE.upsert([
      {
        id: incident.incidentId,
        values: vector,
        metadata: {
          service: incident.signals.service || "unknown",
          severity: diagnosis.severity,
          symptom: incident.signals.symptom || "unknown",
          createdAt: incident.createdAt,
        },
      },
    ]);

    console.log(`Stored embedding for incident ${incident.incidentId}`);
  } catch (error) {
    console.error("Error storing embedding:", error);
    // Don't fail the whole operation if embedding fails
  }
}

export async function findSimilarIncidents(
  env: Env,
  currentIncident: IncidentState,
  topK: number = 3
): Promise<Array<{ incidentId: string; similarity: number; metadata: any }>> {
  try {
    // Create embedding for current incident
    const textForEmbedding = `
      Service: ${currentIncident.signals.service || "unknown"}
      Symptom: ${currentIncident.signals.symptom || "unknown"}
      Error: ${currentIncident.signals.primaryError || "unknown"}
    `.trim();

    const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: [textForEmbedding]
    });

    const vector = embeddings.data[0];

    // Query Vectorize for similar incidents
    const results = await env.VECTORIZE.query(vector, {
      topK: topK + 1, // +1 because it might include itself
      returnMetadata: true,
    });

    // Filter out the current incident if present
    const similar = results.matches
      .filter(match => match.id !== currentIncident.incidentId)
      .slice(0, topK)
      .map(match => ({
        incidentId: match.id,
        similarity: match.score,
        metadata: match.metadata,
      }));

    return similar;
  } catch (error) {
    console.error("Error finding similar incidents:", error);
    return [];
  }
}
