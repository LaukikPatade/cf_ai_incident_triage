import { useState } from 'react';
import { exportIncident } from '../api';
import './ExportButton.css';

interface Props {
  incidentId: string;
  disabled?: boolean;
}

export function ExportButton({ incidentId, disabled }: Props) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'json' | 'md') => {
    try {
      setExporting(true);
      setShowMenu(false);

      const result = await exportIncident(incidentId, format);

      // Get the content to download
      let content: string;
      let mimeType: string;
      
      if (format === 'json') {
        // For JSON, stringify the entire result object
        content = JSON.stringify(result, null, 2);
        mimeType = 'application/json';
      } else {
        // For Markdown, use the markdown field from the response
        content = result.markdown || 'No content available';
        mimeType = 'text/markdown';
      }

      // Create a download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incident-${incidentId.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export incident report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-button-container">
      <button
        className="export-button"
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || exporting}
      >
        {exporting ? 'Exporting...' : 'Export Report'}
      </button>

      {showMenu && (
        <>
          <div className="export-overlay" onClick={() => setShowMenu(false)} />
          <div className="export-menu">
            <button onClick={() => handleExport('json')} className="export-option">
              <div>
                <div className="export-title">JSON</div>
                <div className="export-desc">Machine-readable format</div>
              </div>
            </button>
            <button onClick={() => handleExport('md')} className="export-option">
              <div>
                <div className="export-title">Markdown</div>
                <div className="export-desc">Human-readable report</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
