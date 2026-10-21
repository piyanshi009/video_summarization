
import React, { useState, useEffect } from 'react';

function StudySpace({ videoHistory = [] }) {
  const [selectedId, setSelectedId] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedVideo = videoHistory.find(
    (video) => video.video_id === selectedId
  );

  useEffect(() => {
    if (!selectedId) {
      setContent({});
      return;
    }

    try {
      const stored = localStorage.getItem('studyData');
      const studyData = stored ? JSON.parse(stored) : {};
      setContent(studyData[selectedId] || {});
    } catch (err) {
      console.error('Failed to load study data:', err);
      setContent({});
      setError('Could not load saved study materials.');
    }
  }, [selectedId]);

  const handleGenerate = async (task) => {
    if (!selectedId || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/study/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: selectedId,
          task,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error generating study material.');
      }

      if (typeof data.content !== 'string' || !data.content.trim()) {
        throw new Error('The AI returned empty content. Please try again.');
      }

      const updatedContent = {
        ...content,
        [task]: data.content,
      };

      setContent(updatedContent);

      const stored = localStorage.getItem('studyData');
      const studyData = stored ? JSON.parse(stored) : {};

      studyData[selectedId] = {
        ...(studyData[selectedId] || {}),
        [task]: data.content,
      };

      localStorage.setItem('studyData', JSON.stringify(studyData));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch {
      setError('Could not copy. Please check your browser permissions.');
    }
  };

  const download = (text, filename) => {
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
    { id: 'notes', label: 'Study Notes' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'quiz', label: 'AI Quiz' },
    { id: 'revision', label: 'Revision Sheet' },
  ];

  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <section
      className="study-space"
      style={{
        maxWidth: '960px',
        margin: '2rem auto',
        padding: '0 1rem',
      }}
    >
      <h1 style={{ color: 'var(--color-primary)' }}>AI Study Space</h1>
      <p style={{ color: 'var(--color-text-primary)' }}>
        Turn your videos into learning materials.
      </p>

      {videoHistory.length === 0 ? (
        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-primary)' }}>
            No videos available yet. Upload a video to get started.
          </p>
          <button
            onClick={() => {
              window.location.href = '/upload';
            }}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '0.7rem 1rem',
              cursor: 'pointer',
            }}
          >
            Upload Video
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="video-select"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Select a processed video:
          </label>

          <select
            id="video-select"
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setError('');
            }}
            style={{
              display: 'block',
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">-- Choose a video --</option>
            {videoHistory.map((video) => (
              <option key={video.video_id} value={video.video_id}>
                {video.filename}
                {video.summary_generated ? ' (Summarized)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedId && selectedVideo && (
        <>
          <div
            className="study-tabs"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                }}
                aria-pressed={activeTab === tab.id}
                style={{
                  background:
                    activeTab === tab.id
                      ? 'var(--color-primary)'
                      : 'var(--color-surface)',
                  color:
                    activeTab === tab.id
                      ? '#fff'
                      : 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--radius)',
                  padding: '0.6rem 0.9rem',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="study-tab-content"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
              minHeight: '220px',
              color: 'var(--color-text-primary)',
            }}
          >
            <h2>{activeLabel}</h2>

            {loading && <p>Generating your study material…</p>}

            {error && (
              <p role="alert" style={{ color: '#ef4444' }}>
                {error}
              </p>
            )}

            {!loading && content[activeTab] && (
              <>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    fontFamily: 'inherit',
                    lineHeight: 1.7,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {content[activeTab]}
                </pre>

                <div
                  style={{
                    marginTop: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    onClick={() => copyToClipboard(content[activeTab])}
                    style={{
                      background: 'var(--color-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      padding: '0.6rem 0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>

                  <button
                    onClick={() =>
                      download(
                        content[activeTab],
                        `${(selectedVideo.filename || 'video')
                          .replace(/\.[^/.]+$/, '')
                          .replace(/[<>:"/\\|?*]/g, '_')}_${activeTab}.txt`
                      )
                    }
                    style={{
                      background: 'var(--color-surface)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-primary)',
                      borderRadius: 'var(--radius)',
                      padding: '0.6rem 0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    Download
                  </button>
                </div>
              </>
            )}

            {!loading && !content[activeTab] && (
              <div>
                <p>
                  Generate {activeLabel?.toLowerCase()} from this video's
                  content.
                </p>
                <button
                  onClick={() => handleGenerate(activeTab)}
                  disabled={loading}
                  style={{
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    padding: '0.7rem 1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  Generate {activeLabel}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default StudySpace;
