import { useEffect, useState } from 'react';
import { getSimilarIncidents } from '../api';
import { SimilarIncident } from '../types';
import './SimilarIncidents.css';

interface Props {
  incidentId: string;
}

export function SimilarIncidents({ incidentId }: Props) {
  const [similar, setSimilar] = useState<SimilarIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSimilar();
  }, [incidentId]);

  const loadSimilar = async () => {
    try {
      setLoading(true);
      const data = await getSimilarIncidents(incidentId);
      setSimilar(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load similar incidents');
      setSimilar([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="similar-incidents loading">
        <div className="spinner-small"></div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail for similar incidents
  }

  if (!similar || similar.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: '#ef4444',
      HIGH: '#f97316',
      MEDIUM: '#eab308',
      LOW: '#22c55e',
    };
    return colors[severity] || '#6b7280';
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="similar-incidents">
      <h3>Similar Past Incidents</h3>
      <p className="similar-description">
        Found {similar.length} similar incident{similar.length !== 1 ? 's' : ''} based on symptoms and context
      </p>

      <div className="similar-list">
        {similar.map((incident) => (
          <div key={incident.incidentId} className="similar-card">
            <div className="similar-header">
              <span
                className="similar-severity"
                style={{ backgroundColor: getSeverityColor(incident.metadata.severity) }}
              >
                {incident.metadata.severity}
              </span>
              <span className="similar-score">
                {Math.round(incident.similarity * 100)}% match
              </span>
            </div>

            <div className="similar-service">{incident.metadata.service}</div>
            <div className="similar-symptom">{incident.metadata.symptom}</div>

            <div className="similar-footer">
              <span className="similar-date">
                {formatDate(incident.metadata.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
