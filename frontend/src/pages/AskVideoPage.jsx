import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareText, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Video, 
  RefreshCw, 
  AlertCircle,
  Copy,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = 'http://127.0.0.1:8000';

const AskVideoPage = ({ videoHistory = [] }) => {
  const [selectedId, setSelectedId] = useState(videoHistory[0]?.video_id || '');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-select latest video
  useEffect(() => {
    if (!selectedId && videoHistory.length > 0) {
      setSelectedId(videoHistory[videoHistory.length - 1].video_id);
    }
  }, [videoHistory, selectedId]);

  const selectedVideo = videoHistory.find((v) => v.video_id === selectedId);

  // Reset conversation when video changes
  useEffect(() => {
    if (selectedVideo) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Hi! I'm your AI video study partner for **${selectedVideo.filename}**. Ask me any question about topics, definitions, or moments covered in this video.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([]);
    }
    setError('');
  }, [selectedId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text || !selectedId || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: selectedId, message: text }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned an invalid response.');
      }

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to fetch AI response.');
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'No answer returned from AI.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      let msg = err.message || 'Failed to send message.';
      if (err instanceof TypeError && /fetch/i.test(err.message)) {
        msg = `Cannot connect to backend server at ${API_URL}. Ensure FastAPI is running.`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const starterPrompts = [
    'What are the core concepts covered in this video?',
    'Summarize the key takeaways in 3 bullet points.',
    'Explain the most important term mentioned.',
    'Were any specific examples or case studies discussed?',
  ];

  const clearChat = () => {
    if (selectedVideo) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Chat cleared. Ask me anything about **${selectedVideo.filename}**!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '960px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="lumio-badge lumio-badge-primary" style={{ marginBottom: '0.35rem' }}>
              <Sparkles size={12} />
              <span>Transcript-Anchored Q&A</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Ask the Video</h1>
          </div>

          {/* Video Selector */}
          {videoHistory.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  maxWidth: '300px',
                }}
              >
                {videoHistory.map((v) => (
                  <option key={v.video_id} value={v.video_id}>
                    {v.filename}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearChat}
                title="Clear conversation"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {videoHistory.length === 0 ? (
        <div
          className="lumio-card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            margin: 'auto',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquareText size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>No video selected for Q&A</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '420px' }}>
              Upload a video to ask questions directly to its transcript using Gemini AI.
            </p>
          </div>
          <button
            type="button"
            onClick={() => (window.location.href = '/upload')}
            className="lumio-btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            Upload Video
          </button>
        </div>
      ) : (
        /* Chat Workspace */
        <div
          className="lumio-card"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Messages Thread Container */}
          <div
            style={{
              flex: 1,
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '0.85rem',
                    alignItems: 'flex-start',
                    alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                  }}
                >
                  {isAssistant && (
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 10px -2px var(--color-primary-glow)',
                      }}
                    >
                      <Bot size={18} />
                    </div>
                  )}

                  <div>
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius)',
                        background: isAssistant ? 'var(--color-bg)' : 'var(--gradient-primary)',
                        color: isAssistant ? 'var(--color-text-primary)' : '#FFFFFF',
                        border: isAssistant ? '1px solid var(--color-border)' : 'none',
                        lineHeight: 1.6,
                        fontSize: '0.96rem',
                        boxShadow: isAssistant ? 'var(--shadow-sm)' : '0 4px 16px -2px var(--color-primary-glow)',
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '0.25rem',
                        textAlign: isAssistant ? 'left' : 'right',
                        padding: '0 0.4rem',
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-lavender)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <User size={18} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Assistant Typing / Thinking State */}
            {loading && (
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={18} />
                </div>
                <div
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <RefreshCw size={14} className="spin-icon" style={{ animation: 'spin 1.2s linear infinite' }} />
                  <span>Searching transcript and composing response…</span>
                </div>
              </div>
            )}

            {/* Error Message in Chat */}
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter Prompts Bar (when only welcome message exists) */}
          {messages.length <= 1 && (
            <div
              style={{
                padding: '0.75rem 1.25rem',
                background: 'var(--color-bg)',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
              }}
            >
              {starterPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(p)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '999px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Message Composer Input */}
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: '0.75rem' }}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask anything about "${selectedVideo?.filename || 'video'}"…`}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.95rem',
                }}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="lumio-btn-primary"
                style={{
                  padding: '0.75rem 1.35rem',
                  opacity: !inputMessage.trim() || loading ? 0.6 : 1,
                }}
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AskVideoPage;
