// Core type definitions for the Incident Triage Assistant

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

export interface IncidentState {
  incidentId: string;
  stage: IncidentStage;
  signals: IncidentSignals;
  conversation: Message[];
  openQuestions: string[];
  createdAt: number;
  updatedAt: number;
}

// LLM Response Types
export interface IntakeResponse {
  questions: string[];
  inferredSignals: Partial<IncidentSignals>;
  shortHypothesis: string;
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

// API Request/Response Types
export interface SendMessageRequest {
  incidentId: string;
  message: string;
}

export interface SendMessageResponse {
  incidentId: string;
  stage: IncidentStage;
  response: string;
  signals: IncidentSignals;
  openQuestions: string[];
  diagnosis?: DiagnosisResponse;
}

export interface GetIncidentResponse {
  incident: IncidentState;
}

// Environment bindings
export interface Env {
  INCIDENT: DurableObjectNamespace;
  AI: any;
  INCIDENT_HISTORY: KVNamespace;
  TEMPLATES: KVNamespace;
  VECTORIZE: VectorizeIndex;
  ANALYTICS?: AnalyticsEngineDataset; // Optional - requires enabling
  NOTIFICATION_QUEUE?: Queue; // Optional - requires paid plan
  INCIDENT_REPORTS: R2Bucket;
  ALLOWED_ORIGINS?: string;
}

// Additional types for new features
export interface IncidentHistoryEntry {
  incidentId: string;
  service: string;
  severity: string;
  symptom: string;
  createdAt: number;
  completedAt: number;
  resolution?: string;
}

export interface IncidentTemplate {
  id: string;
  name: string;
  description: string;
  suggestedQuestions: string[];
  commonCauses: string[];
  runbookUrl?: string;
}

export interface NotificationMessage {
  type: 'slack' | 'email' | 'pagerduty';
  incidentId: string;
  severity: string;
  service: string;
  summary: string;
  timestamp: number;
}

export interface AnalyticsDataPoint {
  incidentId: string;
  service: string;
  severity: string;
  stage: IncidentStage;
  duration: number;
  timestamp: number;
}

