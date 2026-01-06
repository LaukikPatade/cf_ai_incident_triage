// API client for backend communication

import { 
  SendMessageResponse, 
  IncidentState, 
  IncidentHistoryEntry,
  SimilarIncident,
  IncidentTemplate,
  AnalyticsStats
} from './types';

const API_BASE = '/api';

export async function createIncident(): Promise<string> {
  const response = await fetch(`${API_BASE}/incident`, {
    method: 'POST',
  });
  const data = await response.json();
  return data.incidentId;
}

export async function sendMessage(
  incidentId: string,
  message: string
): Promise<SendMessageResponse> {
  const response = await fetch(`${API_BASE}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ incidentId, message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}

export async function getIncident(incidentId: string): Promise<IncidentState> {
  const response = await fetch(`${API_BASE}/incident/${incidentId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get incident');
  }

  const data = await response.json();
  return data.incident;
}

// History and Search APIs

export async function getIncidentHistory(service?: string): Promise<IncidentHistoryEntry[]> {
  const url = service 
    ? `${API_BASE}/history?service=${encodeURIComponent(service)}`
    : `${API_BASE}/history`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to get incident history');
  }

  const data = await response.json();
  return data.incidents;
}

export async function getSimilarIncidents(incidentId: string): Promise<SimilarIncident[]> {
  const response = await fetch(`${API_BASE}/incident/${incidentId}/similar`);
  
  if (!response.ok) {
    throw new Error('Failed to get similar incidents');
  }

  const data = await response.json();
  return data.similar || [];
}

// Template APIs

export async function getTemplates(): Promise<IncidentTemplate[]> {
  const response = await fetch(`${API_BASE}/templates`);
  
  if (!response.ok) {
    throw new Error('Failed to get templates');
  }

  const data = await response.json();
  return data.templates;
}

export async function initializeTemplates(): Promise<void> {
  const response = await fetch(`${API_BASE}/templates/init`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to initialize templates');
  }
}

export async function getSuggestedTemplate(incidentId: string): Promise<IncidentTemplate | null> {
  const response = await fetch(`${API_BASE}/incident/${incidentId}/template`);
  
  if (!response.ok) {
    throw new Error('Failed to get suggested template');
  }

  const data = await response.json();
  return data.template;
}

// Analytics APIs

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const response = await fetch(`${API_BASE}/analytics/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to get analytics stats');
  }

  return response.json();
}

// Export APIs

export async function exportIncident(
  incidentId: string, 
  format: 'json' | 'md'
): Promise<{ key: string; url: string; markdown?: string }> {
  const response = await fetch(`${API_BASE}/incident/${incidentId}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ format }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to export incident');
  }

  return response.json();
}
