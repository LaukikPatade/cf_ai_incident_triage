// Frontend type definitions

export type IncidentStage = "INTAKE" | "DIAGNOSE" | "RECOMMEND";

export interface IncidentSignals {
  service?: string;
  symptom?: string;
  scope?: "regional" | "global";
  recentDeploy?: "yes" | "no";
  trafficSpike?: "yes" | "no";
  primaryError?: string;
  dependencies?: string;
  environment?: "prod" | "staging";
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

export interface Hypothesis {
  description: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasoning: string;
}

export interface DiagnosisResponse {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  hypotheses: Hypothesis[];
  nextSteps: {
    immediate: string[];
    deeper: string[];
  };
  whatToMonitor: string[];
}

export interface SendMessageResponse {
  incidentId: string;
  stage: IncidentStage;
  response: string;
  signals: IncidentSignals;
  openQuestions: string[];
  diagnosis?: DiagnosisResponse;
}

export interface IncidentState {
  incidentId: string;
  stage: IncidentStage;
  signals: IncidentSignals;
  conversation: Message[];
  openQuestions: string[];
  createdAt: number;
  updatedAt: number;
}

export interface IncidentHistoryEntry {
  incidentId: string;
  service: string;
  severity: string;
  symptom: string;
  createdAt: number;
  completedAt: number;
  resolution?: string;
}

export interface SimilarIncident {
  incidentId: string;
  similarity: number;
  metadata: {
    service: string;
    symptom: string;
    severity: string;
    timestamp: number;
  };
}

export interface IncidentTemplate {
  id: string;
  name: string;
  description: string;
  suggestedQuestions: string[];
  commonCauses: string[];
  runbookUrl?: string;
}

export interface AnalyticsStats {
  total: number;
  bySeverity: Record<string, number>;
  byService: Record<string, number>;
}

