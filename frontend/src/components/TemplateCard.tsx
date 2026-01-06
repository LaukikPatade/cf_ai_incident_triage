import { IncidentTemplate } from '../types';
import './TemplateCard.css';

interface TemplateCardProps {
  template: IncidentTemplate;
  onApply?: (template: IncidentTemplate) => void;
}

export function TemplateCard({ template, onApply }: TemplateCardProps) {
  return (
    <div className="template-card">
      <div className="template-header">
        <h4>{template.name}</h4>
        {onApply && (
          <button className="apply-button" onClick={() => onApply(template)}>
            Apply
          </button>
        )}
      </div>

      <p className="template-description">{template.description}</p>

      {template.suggestedQuestions.length > 0 && (
        <div className="template-section">
          <div className="template-section-title">💡 Key Questions:</div>
          <ul className="template-list">
            {template.suggestedQuestions.slice(0, 3).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {template.commonCauses.length > 0 && (
        <div className="template-section">
          <div className="template-section-title">🔍 Common Causes:</div>
          <ul className="template-list">
            {template.commonCauses.map((cause, i) => (
              <li key={i}>{cause}</li>
            ))}
          </ul>
        </div>
      )}

      {template.runbookUrl && (
        <a
          href={template.runbookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="runbook-link"
        >
          📚 View Runbook →
        </a>
      )}
    </div>
  );
}

