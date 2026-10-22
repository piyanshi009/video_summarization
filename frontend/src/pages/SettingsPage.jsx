import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Trash2, 
  Info, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

const SettingsPage = ({ videoHistory = [], setVideoHistory }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', 'offline'
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Check API health
  const checkApiHealth = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch(`${API_URL}/`, { method: 'GET' });
      if (res.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('offline');
      }
    } catch {
      setApiStatus('offline');
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        'Warning: This will clear your saved video history and all generated study notes/flashcards/quizzes from browser storage. Are you sure?'
      )
    ) {
      localStorage.removeItem('videoHistory');
      localStorage.removeItem('studyData');
      if (setVideoHistory) setVideoHistory([]);
      alert('Local storage data has been cleared.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '880px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Platform Settings
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
          Configure appearance, monitor local AI models, and manage your offline study cache.
        </p>
      </div>

      {savedFeedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Section 1: Appearance & Theme */}
        <section className="lumio-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Appearance & Theme</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Customize interface colors for your workspace environment.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '1rem',
            }}
          >
            {/* Dark Theme Button */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              style={{
                flex: '1 1 200px',
                padding: '1.25rem',
                borderRadius: 'var(--radius)',
                border: `2px solid ${theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: '#0F172A',
                color: '#F1F5F9',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: theme === 'dark' ? 'var(--shadow-glow)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Deep Navy</span>
                <Moon size={18} style={{ color: '#60A5FA' }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>
                Deep navy palette (#0F172A) with vibrant blue accents (#3B82F6).
              </p>
            </button>

            {/* Light Theme Button */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              style={{
                flex: '1 1 200px',
                padding: '1.25rem',
                borderRadius: 'var(--radius)',
                border: `2px solid ${theme === 'light' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: '#F7FAFF',
                color: '#1E293B',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: theme === 'light' ? 'var(--shadow-glow)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Arctic Blue</span>
                <Sun size={18} style={{ color: '#2563EB' }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                Clean arctic background (#F7FAFF) with confident blue accents for daylight focus.
              </p>
            </button>
          </div>
        </section>

        {/* Section 2: AI Engine Architecture */}
        <section className="lumio-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Engines & Models</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Active models driving speech-to-text and reasoning synthesis.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Backend API Connection Status */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                  FastAPI Backend Server
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {API_URL}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  className={`lumio-badge ${
                    apiStatus === 'connected' ? 'lumio-badge-success' : 'lumio-badge-neutral'
                  }`}
                >
                  {apiStatus === 'connected' ? '● Connected' : apiStatus === 'checking' ? 'Testing…' : '○ Offline'}
                </span>

                <button
                  type="button"
                  onClick={checkApiHealth}
                  title="Re-check connection"
                  className="lumio-btn-secondary"
                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* Whisper Transcription Model */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                  Speech-to-Text Model
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Faster-Whisper (base model, INT8 CPU quantized)
                </div>
              </div>
              <span className="lumio-badge lumio-badge-primary">Local Engine</span>
            </div>

            {/* Gemini Pro Reasoning */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                  Cognitive & Study Synthesis
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Google Gemini 2.5 Flash API with exponential backoff retry
                </div>
              </div>
              <span className="lumio-badge lumio-badge-primary">Gemini 2.5</span>
            </div>
          </div>
        </section>

        {/* Section 3: Data & Storage */}
        <section className="lumio-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Data & Local Storage</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Manage cached videos, transcripts, and study notes in this browser.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                Cached Video Entries: {videoHistory.length}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Stored locally in browser localStorage under key `videoHistory` and `studyData`.
              </div>
            </div>

            <button
              type="button"
              onClick={clearAllData}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.55rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Trash2 size={15} />
              <span>Clear Cache</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
