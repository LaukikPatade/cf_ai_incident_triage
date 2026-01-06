import { useState } from 'react';
import './KeyboardHelp.css';

export function KeyboardHelp() {
  const [show, setShow] = useState(false);

  const shortcuts = [
    { keys: ['Ctrl', '1'], description: 'Go to Triage view' },
    { keys: ['Ctrl', '2'], description: 'Go to Analytics view' },
    { keys: ['Ctrl', '3'], description: 'Go to History view' },
    { keys: ['Ctrl', 'N'], description: 'Start new incident' },
    { keys: ['Enter'], description: 'Send message' },
    { keys: ['Ctrl', 'Enter'], description: 'Quick send message' },
  ];

  return (
    <>
      <button className="keyboard-help-button" onClick={() => setShow(!show)} title="Keyboard Shortcuts">
        ⌨️
      </button>

      {show && (
        <>
          <div className="keyboard-help-overlay" onClick={() => setShow(false)} />
          <div className="keyboard-help-modal">
            <div className="keyboard-help-header">
              <h3>⌨️ Keyboard Shortcuts</h3>
              <button onClick={() => setShow(false)}>×</button>
            </div>
            <div className="keyboard-help-content">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="shortcut-row">
                  <div className="shortcut-keys">
                    {shortcut.keys.map((key, j) => (
                      <span key={j}>
                        <kbd>{key}</kbd>
                        {j < shortcut.keys.length - 1 && <span className="plus">+</span>}
                      </span>
                    ))}
                  </div>
                  <div className="shortcut-description">{shortcut.description}</div>
                </div>
              ))}
            </div>
            <div className="keyboard-help-footer">
              <span className="platform-note">
                On Mac, use ⌘ (Cmd) instead of Ctrl
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

