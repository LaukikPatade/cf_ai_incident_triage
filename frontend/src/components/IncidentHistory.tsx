import { useEffect, useState } from 'react';
import { getIncidentHistory } from '../api';
import { IncidentHistoryEntry } from '../types';
import './IncidentHistory.css';

export function IncidentHistory() {
  const [incidents, setIncidents] = useState<IncidentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  useEffect(() => {
    loadHistory();
  }, [serviceFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getIncidentHistory(serviceFilter || undefined);
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load incident history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      incident.service.toLowerCase().includes(query) ||
      incident.symptom.toLowerCase().includes(query) ||
      incident.severity.toLowerCase().includes(query)
    );
  });

  const uniqueServices = Array.from(new Set(incidents.map((i) => i.service))).sort();

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
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: number, end: number) => {
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="incident-history loading">
        <div className="spinner"></div>
        <p>Loading incident history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="incident-history error">
        <p>{error}</p>
        <button onClick={loadHistory}>Retry</button>
      </div>
    );
  }

  return (
    <div className="incident-history">
      <div className="history-header">
        <h2>Incident History</h2>
        <div className="history-controls">
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="service-filter"
          >
            <option value="">All Services</option>
            {uniqueServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <button onClick={loadHistory} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="no-incidents">
          <p>No incidents found</p>
        </div>
      ) : (
        <div className="incidents-list">
          {filteredIncidents.map((incident) => (
            <div key={incident.incidentId} className="incident-card">
              <div className="incident-header-row">
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(incident.severity) }}
                >
                  {incident.severity}
                </span>
                <span className="incident-service">{incident.service}</span>
                <span className="incident-duration">
                  {formatDuration(incident.createdAt, incident.completedAt)}
                </span>
              </div>

              <div className="incident-symptom">{incident.symptom}</div>

              {incident.resolution && (
                <div className="incident-resolution">
                  <strong>Resolution:</strong> {incident.resolution}
                </div>
              )}

              <div className="incident-footer">
                <span className="incident-date">
                  {formatDate(incident.completedAt)}
                </span>
                <span className="incident-id">ID: {incident.incidentId.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
