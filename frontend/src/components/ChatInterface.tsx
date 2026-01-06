import { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import './ChatInterface.css';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
}

export default function ChatInterface({ messages, onSendMessage, loading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }

  function formatMessage(content: string) {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i}>{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={i}>{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i}><strong>{line.slice(2, -2)}</strong></p>;
      } else if (line.startsWith('- ')) {
        return <li key={i}>{line.substring(2)}</li>;
      } else if (line.match(/^\d+\.\s/)) {
        return <li key={i}>{line.substring(line.indexOf('.') + 2)}</li>;
      } else if (line.trim() === '') {
        return <br key={i} />;
      } else {
        return <p key={i}>{line}</p>;
      }
    });
  }

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? 'U' : 'AI'}
            </div>
            <div className="message-content">
              <div className="message-text">
                {formatMessage(msg.content)}
              </div>
              <div className="message-timestamp">
                {new Date(msg.ts).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">AI</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the incident..."
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
