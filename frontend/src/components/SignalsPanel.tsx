import { IncidentSignals, DiagnosisResponse, IncidentStage } from '../types';
import './SignalsPanel.css';

interface SignalsPanelProps {
  signals: IncidentSignals;
  openQuestions: string[];
  diagnosis: DiagnosisResponse | null;
  stage: IncidentStage;
}

export default function SignalsPanel({ signals, openQuestions, diagnosis, stage }: SignalsPanelProps) {
  const signalEntries = Object.entries(signals);
  const hasSignals = signalEntries.length > 0;

  function formatSignalKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'var(--error)';
      case 'HIGH':
        return 'var(--warning)';
      case 'MEDIUM':
        return 'var(--info)';
      case 'LOW':
        return 'var(--success)';
      default:
        return 'var(--text-secondary)';
    }
  }

  function getConfidenceColor(confidence: string): string {
    switch (confidence) {
      case 'HIGH':
        return 'var(--success)';
      case 'MEDIUM':
        return 'var(--warning)';
      case 'LOW':
        return 'var(--text-secondary)';
      default:
        return 'var(--text-secondary)';
    }
  }

  return (
    <div className="signals-panel">
      <div className="panel-section">
        <h3>Collected Signals</h3>
        {hasSignals ? (
          <div className="signals-list">
            {signalEntries.map(([key, value]) => (
              <div key={key} className="signal-item">
                <span className="signal-key">{formatSignalKey(key)}:</span>
                <span className="signal-value">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No signals collected yet</p>
        )}
      </div>

      {openQuestions.length > 0 && stage === 'INTAKE' && (
        <div className="panel-section">
          <h3>Open Questions</h3>
          <ul className="questions-list">
            {openQuestions.map((question, idx) => (
              <li key={idx}>{question}</li>
            ))}
          </ul>
        </div>
      )}

      {diagnosis && (
        <>
          <div className="panel-section">
            <h3>Diagnosis</h3>
            <div className="severity-badge" style={{ backgroundColor: getSeverityColor(diagnosis.severity) }}>
              {diagnosis.severity}
            </div>

            <div className="hypotheses">
              <h4>Root Cause Hypotheses</h4>
              {diagnosis.hypotheses.map((hyp, idx) => (
                <div key={idx} className="hypothesis-item">
                  <div className="hypothesis-header">
                    <span className="hypothesis-number">{idx + 1}</span>
                    <span
                      className="confidence-badge"
                      style={{ backgroundColor: getConfidenceColor(hyp.confidence) }}
                    >
                      {hyp.confidence}
                    </span>
                  </div>
                  <p className="hypothesis-description">{hyp.description}</p>
                  <p className="hypothesis-reasoning">{hyp.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h3>Immediate Actions</h3>
            <ol className="action-list">
              {diagnosis.nextSteps.immediate.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="panel-section">
            <h3>Investigation Steps</h3>
            <ol className="action-list">
              {diagnosis.nextSteps.deeper.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="panel-section">
            <h3>Metrics to Monitor</h3>
            <ul className="monitor-list">
              {diagnosis.whatToMonitor.map((metric, idx) => (
                <li key={idx}>{metric}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
