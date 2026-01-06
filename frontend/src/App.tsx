import { useState, useEffect } from 'react';
import { createIncident, sendMessage, getIncident, initializeTemplates } from './api';
import { Message, IncidentStage, IncidentSignals, DiagnosisResponse } from './types';
import ChatInterface from './components/ChatInterface';
import SignalsPanel from './components/SignalsPanel';
import StageIndicator from './components/StageIndicator';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { IncidentHistory } from './components/IncidentHistory';
import { SimilarIncidents } from './components/SimilarIncidents';
import { ExportButton } from './components/ExportButton';
import './App.css';

type View = 'triage' | 'analytics' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<View>('triage');
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [stage, setStage] = useState<IncidentStage>('INTAKE');
  const [messages, setMessages] = useState<Message[]>([]);
  const [signals, setSignals] = useState<IncidentSignals>({});
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);


  async function initializeApp() {
    try {
      // Initialize templates once (idempotent operation)
      const templatesInitialized = localStorage.getItem('templatesInitialized');
      if (!templatesInitialized) {
        try {
          await initializeTemplates();
          localStorage.setItem('templatesInitialized', 'true');
        } catch (error) {
          console.error('Failed to initialize templates:', error);
        }
      }

      // Check if there's an existing incident in localStorage
      const savedIncidentId = localStorage.getItem('currentIncidentId');
      
      if (savedIncidentId) {
        // Try to restore the incident
        try {
          const incident = await getIncident(savedIncidentId);
          setIncidentId(incident.incidentId);
          setStage(incident.stage);
          setMessages(incident.conversation);
          setSignals(incident.signals);
          setOpenQuestions(incident.openQuestions);
        } catch (error) {
          console.error('Failed to restore incident, creating new one');
          await createNewIncident();
        }
      } else {
        await createNewIncident();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsInitializing(false);
    }
  }

  async function createNewIncident() {
    const newIncidentId = await createIncident();
    setIncidentId(newIncidentId);
    localStorage.setItem('currentIncidentId', newIncidentId);
    
    // Get initial state
    const incident = await getIncident(newIncidentId);
    setMessages(incident.conversation);
    setStage(incident.stage);
  }

  async function handleSendMessage(message: string) {
    if (!incidentId || loading) return;

    // Add user message optimistically
    const userMessage: Message = {
      role: 'user',
      content: message,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await sendMessage(incidentId, message);
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update state
      setStage(response.stage);
      setSignals(response.signals);
      setOpenQuestions(response.openQuestions);
      
      if (response.diagnosis) {
        setDiagnosis(response.diagnosis);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleNewIncident() {
    if (confirm('Are you sure you want to start a new incident? Current progress will be lost.')) {
      localStorage.removeItem('currentIncidentId');
      setIncidentId(null);
      setMessages([]);
      setSignals({});
      setOpenQuestions([]);
      setDiagnosis(null);
      setStage('INTAKE');
      setCurrentView('triage');
      initializeApp();
    }
  }

  if (isInitializing) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Initializing incident triage system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>AI Incident Triage Assistant</h1>
          <p className="subtitle">Powered by Cloudflare Workers AI</p>
        </div>
        
        <nav className="app-nav">
          <button
            className={currentView === 'triage' ? 'active' : ''}
            onClick={() => setCurrentView('triage')}
          >
            Triage
          </button>
          <button
            className={currentView === 'analytics' ? 'active' : ''}
            onClick={() => setCurrentView('analytics')}
          >
            Analytics
          </button>
          <button
            className={currentView === 'history' ? 'active' : ''}
            onClick={() => setCurrentView('history')}
          >
            History
          </button>
        </nav>

        <div className="header-actions">
          {currentView === 'triage' && (
            <>
              {incidentId && stage === 'RECOMMEND' && (
                <ExportButton incidentId={incidentId} />
              )}
              <button onClick={handleNewIncident} className="new-incident-btn">
                New Incident
              </button>
            </>
          )}
        </div>
      </header>

      {currentView === 'analytics' && <AnalyticsDashboard />}
      
      {currentView === 'history' && <IncidentHistory />}
      
      {currentView === 'triage' && (
        <div className="app-container">
          <main className="main-content">
            <StageIndicator stage={stage} />
            
            {incidentId && stage !== 'INTAKE' && (
              <SimilarIncidents incidentId={incidentId} />
            )}
            
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
            />
          </main>

          <aside className="sidebar">
            <SignalsPanel
              signals={signals}
              openQuestions={openQuestions}
              diagnosis={diagnosis}
              stage={stage}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;

