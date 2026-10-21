import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FlashcardViewer from '../components/FlashcardViewer';
import QuizViewer from '../components/EnhancedQuizViewer.jsx';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  CheckSquare, 
  FileText, 
  Copy, 
  Download, 
  RefreshCw, 
  Sparkles, 
  UploadCloud, 
  Video, 
  AlertCircle 
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

function readStudyData() {
  try {
    const stored = localStorage.getItem('studyData');
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('Failed to read study data:', error);
    return {};
  }
}

function StudySpace({ videoHistory = [] }) {
  const [selectedId, setSelectedId] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const selectedIdRef = useRef('');

  // Auto-select first video if available and none selected
  useEffect(() => {
    if (!selectedId && videoHistory.length > 0) {
      setSelectedId(videoHistory[videoHistory.length - 1].video_id);
    }
  }, [videoHistory, selectedId]);

  const selectedVideo = videoHistory.find((video) => video.video_id === selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (!selectedId) {
      setContent({});
      return;
    }

    const studyData = readStudyData();
    const savedContent = studyData[selectedId];

    setContent(
      savedContent && typeof savedContent === 'object' && !Array.isArray(savedContent)
        ? savedContent
        : {}
    );
    setError('');
  }, [selectedId]);

  const handleGenerate = async (task) => {
    const videoId = selectedId;
    if (!videoId || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/study/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId, task }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('The server returned an invalid response. Please verify FastAPI backend.');
      }

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to generate study material.');
      }

      if (typeof data?.content !== 'string' || !data.content.trim()) {
        throw new Error('The AI returned empty content. Please try again.');
      }

      // Save under videoId without overwriting other tabs
      const studyData = readStudyData();
      studyData[videoId] = {
        ...(studyData[videoId] || {}),
        [task]: data.content,
      };

      try {
        localStorage.setItem('studyData', JSON.stringify(studyData));
      } catch (storageError) {
        console.error('Failed to save study data:', storageError);
      }

      if (selectedIdRef.current === videoId) {
        setContent((previous) => ({
          ...previous,
          [task]: data.content,
        }));
      }
    } catch (err) {
      let message = err.message || 'Something went wrong.';
      if (err instanceof TypeError && /fetch/i.test(err.message)) {
        message = `Cannot connect to backend at ${API_URL}. Please ensure FastAPI is running.`;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error(err);
    }
  };

  const downloadText = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'notes', label: 'Study Notes', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'AI Quiz', icon: HelpCircle },
    { id: 'revision', label: 'Revision Sheet', icon: CheckSquare },
  ];

  const activeTabMeta = tabs.find((t) => t.id === activeTab);

  return (
    <div className="page-container" style={{ maxWidth: '1060px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="lumio-badge lumio-badge-primary" style={{ marginBottom: '0.65rem' }}>
          <Sparkles size={13} />
          <span>Interactive Learning Suite</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          AI Study Space
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.02rem' }}>
          Turn your videos into personalized learning materials powered by AI.
        </p>
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
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={30} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>No videos available for study</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '420px' }}>
              Upload and transcribe a video first to generate study notes, interactive flashcards, quizzes, and revision guides.
            </p>
          </div>
          <button
            type="button"
            onClick={() => (window.location.href = '/upload')}
            className="lumio-btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            <UploadCloud size={17} />
            <span>Upload Video</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Video Selector Card */}
          <div
            className="lumio-card"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 300px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Video size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="video-select-dropdown"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.2rem',
                  }}
                >
                  Selected Video Context
                </label>
                <select
                  id="video-select-dropdown"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontWeight: 600,
                    padding: '0.55rem 0.85rem',
                  }}
                >
                  {videoHistory.map((video) => (
                    <option key={video.video_id} value={video.video_id}>
                      {video.filename} {video.summary_generated ? '• (Summarized)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedVideo && (
              <span
                className={`lumio-badge ${
                  selectedVideo.summary_generated ? 'lumio-badge-success' : 'lumio-badge-primary'
                }`}
              >
                {selectedVideo.summary_generated ? 'AI Summary Ready' : 'Transcribed'}
              </span>
            )}
          </div>

          {/* 4 Interactive Learning Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.65rem',
              overflowX: 'auto',
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const hasData = Boolean(content[tab.id]);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                  }}
                  style={{
                    padding: '0.65rem 1.15rem',
                    borderRadius: 'var(--radius)',
                    background: isActive ? 'var(--gradient-primary)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.92rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: isActive ? '0 4px 16px -2px var(--color-primary-glow)' : 'none',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <tab.icon size={17} style={{ color: isActive ? '#FFFFFF' : 'var(--color-lavender)' }} />
                  <span>{tab.label}</span>
                  {hasData && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isActive ? '#FFFFFF' : 'var(--color-primary)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Tab Workspace Panel */}
          <div
            className="lumio-card"
            style={{
              padding: '2rem',
              minHeight: '380px',
            }}
          >
            {/* Loading State */}
            {loading && (
              <div
                style={{
                  padding: '4rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '3px solid var(--color-border)',
                    borderTopColor: 'var(--color-primary)',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Generating {activeTabMeta?.label}…
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
                    Gemini AI is analyzing the video transcript and synthesizing personalized study material.
                  </p>
                </div>
              </div>
            )}

            {/* Generated Content Available */}
            {!loading && content[activeTab] && (
              <div>
                {/* Top Action Row for Content */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    paddingBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {activeTabMeta?.label}
                    </span>
                    <span className="lumio-badge lumio-badge-success">Saved</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(content[activeTab])}
                      className="lumio-btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <Copy size={15} />
                      <span>Copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const safeName = (selectedVideo?.filename || 'video').replace(/\.[^/.]+$/, '');
                        downloadText(content[activeTab], `${safeName}_${activeTab}.txt`);
                      }}
                      className="lumio-btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <Download size={15} />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerate(activeTab)}
                      disabled={loading}
                      className="lumio-btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                      title="Regenerate this study material"
                    >
                      <RefreshCw size={15} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>

                {/* Tab Specific Viewers */}
                {activeTab === 'notes' || activeTab === 'revision' ? (
                  <div
                    className="lumio-study-markdown"
                    style={{
                      maxWidth: '820px',
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content[activeTab]}
                    </ReactMarkdown>
                  </div>
                ) : activeTab === 'flashcards' ? (
                  <FlashcardViewer
                    rawContent={content[activeTab]}
                    onRegenerate={() => handleGenerate('flashcards')}
                    loading={loading}
                  />
                ) : activeTab === 'quiz' ? (
                  <QuizViewer
                    rawContent={content[activeTab]}
                    onRegenerate={() => handleGenerate('quiz')}
                    loading={loading}
                  />
                ) : null}
              </div>
            )}

            {/* Empty State for Tab */}
            {!loading && !content[activeTab] && (
              <div
                style={{
                  padding: '3.5rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
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
                  <Sparkles size={28} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Generate {activeTabMeta?.label}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '440px' }}>
                    Transform this video's speech transcript into custom {activeTabMeta?.label.toLowerCase()} tailored for fast revision and active recall.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerate(activeTab)}
                  disabled={loading}
                  className="lumio-btn-primary"
                  style={{ marginTop: '0.5rem', padding: '0.75rem 1.6rem' }}
                >
                  <Sparkles size={17} />
                  <span>Generate {activeTabMeta?.label}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default StudySpace;
