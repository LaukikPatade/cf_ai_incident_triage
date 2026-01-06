import { useEffect, useState } from 'react';
import { getAnalyticsStats } from '../api';
import { AnalyticsStats } from '../types';
import './AnalyticsDashboard.css';

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAnalyticsStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard error">
        <p>{error}</p>
        <button onClick={loadStats}>Retry</button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const severityColors: Record<string, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };

  const topServices = Object.entries(stats.byService || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const criticalPercentage = stats.total > 0
    ? ((stats.bySeverity['CRITICAL'] || 0) / stats.total) * 100
    : 0;

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div className="header-text">
          <h2>Incident Analytics</h2>
          <div className="header-subtitle">Real-time insights into incident patterns</div>
        </div>
        <button onClick={loadStats} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        {/* Total Incidents */}
        <div className="stat-card total">
          <div className="stat-label">Total Incidents</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-trend">All time</div>
        </div>

        {/* Last 24 Hours */}
        <div className="stat-card recent">
          <div className="stat-label">Last 24 Hours</div>
          <div className="stat-value">{(stats as any).last24Hours || 0}</div>
          <div className="stat-trend">Recent activity</div>
        </div>

        {/* Last 7 Days */}
        <div className="stat-card week">
          <div className="stat-label">Last 7 Days</div>
          <div className="stat-value">{(stats as any).last7Days || 0}</div>
          <div className="stat-trend">Weekly trend</div>
        </div>

        {/* Critical Rate */}
        <div className="stat-card critical">
          <div className="stat-label">Critical Rate</div>
          <div className="stat-value">{criticalPercentage.toFixed(1)}%</div>
          <div className="stat-trend">{stats.bySeverity['CRITICAL'] || 0} critical incidents</div>
        </div>
      </div>

      <div className="charts-row">
        {/* Severity Breakdown */}
        <div className="chart-section">
          <h3>Incidents by Severity</h3>
          <div className="severity-chart">
          {severityOrder.map((severity) => {
            const count = stats.bySeverity[severity] || 0;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

            return (
              <div key={severity} className="severity-row">
                <div className="severity-label">
                  <span
                    className="severity-dot"
                    style={{ backgroundColor: severityColors[severity] }}
                  ></span>
                  {severity}
                </div>
                <div className="severity-bar-container">
                  <div
                    className="severity-bar"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: severityColors[severity],
                    }}
                  ></div>
                </div>
                <div className="severity-count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

        {/* Top Services */}
        {topServices.length > 0 && (
          <div className="chart-section">
            <h3>Top Affected Services</h3>
            <div className="service-list">
            {topServices.map(([service, count], index) => (
              <div key={service} className="service-item">
                <div className="service-rank">#{index + 1}</div>
                <div className="service-name">{service}</div>
                <div className="service-count">{count} incidents</div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
