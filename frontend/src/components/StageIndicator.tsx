import { IncidentStage } from '../types';
import './StageIndicator.css';

interface StageIndicatorProps {
  stage: IncidentStage;
}

export default function StageIndicator({ stage }: StageIndicatorProps) {
  const stages: Array<{ key: IncidentStage; label: string; step: number }> = [
    { key: 'INTAKE', label: 'Gather Information', step: 1 },
    { key: 'DIAGNOSE', label: 'Analyze & Diagnose', step: 2 },
    { key: 'RECOMMEND', label: 'Recommendations', step: 3 },
  ];

  const currentIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="stage-indicator">
      {stages.map((s, idx) => (
        <>
          <div
            key={s.key}
            className={`stage-item ${idx <= currentIndex ? 'active' : ''} ${
              s.key === stage ? 'current' : ''
            }`}
          >
            <div className="stage-icon">{s.step}</div>
            <div className="stage-label">{s.label}</div>
          </div>
          {idx < stages.length - 1 && (
            <div className={`stage-connector ${idx < currentIndex ? 'active' : ''}`} />
          )}
        </>
      ))}
    </div>
  );
}
