
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FlashcardViewer from '../components/FlashcardViewer';
import QuizViewer from '../components/EnhancedQuizViewer.jsx';

const API_URL = 'http://127.0.0.1:8000';

function readStudyData() {
  try {
    const stored = localStorage.getItem('studyData');
    if (!stored) return {};

    const parsed = JSON.parse(stored);

    return parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
      ? parsed
      : {};
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

  const selectedVideo = videoHistory.find(
    (video) => video.video_id === selectedId
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;

    if (!selectedId) {
      setContent({});
      return;
    }

    const studyData = readStudyData();
    const savedContent = studyData[selectedId];

    setContent(
      savedContent &&
        typeof savedContent === 'object' &&
        !Array.isArray(savedContent)
        ? savedContent
        : {}
    );

    setError('');
  }, [selectedId]);

  useEffect(() => {
    if (
      selectedId &&
      !videoHistory.some((video) => video.video_id === selectedId)
    ) {
      setSelectedId('');
      setContent({});
    }
  }, [videoHistory, selectedId]);

  const handleGenerate = async (task) => {
    const videoId = selectedId;

    if (!videoId || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/study/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          task,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'The server returned an invalid response. Please try again.'
        );
      }

      if (!response.ok) {
        const message =
          typeof data?.detail === 'string'
            ? data.detail
            : 'Failed to generate study material.';

        throw new Error(message);
      }

      if (
        typeof data?.content !== 'string' ||
        !data.content.trim()
      ) {
        throw new Error(
          'The AI returned empty content. Please try again.'
        );
      }

      // Save the result under the video that was originally selected.
      const studyData = readStudyData();

      studyData[videoId] = {
        ...(studyData[videoId] || {}),
        [task]: data.content,
      };

      try {
        localStorage.setItem(
          'studyData',
          JSON.stringify(studyData)
        );
      } catch (storageError) {
        console.error('Failed to save study data:', storageError);
        throw new Error(
          'Study material was generated, but could not be saved. Check browser storage.'
        );
      }

      // Do not replace the current screen if another video was selected.
      if (selectedIdRef.current === videoId) {
        setContent((previous) => ({
          ...previous,
          [task]: data.content,
        }));
      }
    } catch (err) {
      console.error('Study material generation failed:', err);

      let message = err.message || 'Something went wrong.';

      if (
        err instanceof TypeError &&
        /fetch/i.test(err.message)
      ) {
        message =
          'Cannot connect to the backend. Make sure FastAPI is running at ' +
          API_URL;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard access is unavailable.');
      }

      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Copy failed:', err);
      setError(
        'Could not copy the content. Check browser permissions or use HTTPS/localhost.'
      );
    }
  };

  const download = (text, filename) => {
    let url;

    try {
      const blob = new Blob([text], {
        type: 'text/plain;charset=utf-8',
      });

      url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed:', err);
      setError('Could not download the study material.');
    } finally {
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  };

  const tabs = [
    { id: 'notes', label: 'Study Notes' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'quiz', label: 'AI Quiz' },
    { id: 'revision', label: 'Revision Sheet' },
  ];

  const activeLabel = tabs.find(
    (tab) => tab.id === activeTab
  )?.label;

  return (
    <section
      className="study-space"
      style={{
        maxWidth: '960px',
        margin: '2rem auto',
        padding: '0 1rem',
      }}
    >
      <h1 style={{ color: 'var(--color-primary)' }}>
        AI Study Space
      </h1>

      <p style={{ color: 'var(--color-text-primary)' }}>
        Turn your videos into learning materials.
      </p>

      {videoHistory.length === 0 ? (
        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
          <p>No videos available yet. Upload a video to get started.</p>

          <button
            onClick={() => {
              window.location.href = '/upload';
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
              <option
                key={video.video_id}
                value={video.video_id}
              >
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

            {loading && (
              <p role="status">
                Generating your study material…
              </p>
            )}

            {error && (
              <p role="alert" style={{ color: '#ef4444' }}>
                {error}
              </p>
            )}

            {!loading && content[activeTab] && (
              <>
                {activeTab === 'notes' ||
                activeTab === 'revision' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content[activeTab]}
                  </ReactMarkdown>
                ) : activeTab === 'flashcards' ? (
                  <FlashcardViewer
                    rawContent={content[activeTab]}
                  />
                ) : activeTab === 'quiz' ? (
                  <QuizViewer
                    rawContent={content[activeTab]}
                    onRegenerate={() => handleGenerate('quiz')}
                    loading={loading}
                  />
                ) : null}

                <div
                  style={{
                    marginTop: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    onClick={() =>
                      copyToClipboard(content[activeTab])
                    }
                  >
                    Copy
                  </button>

                  <button
                    onClick={() => {
                      const filename = (
                        selectedVideo.filename || 'video'
                      )
                        .replace(/\.[^/.]+$/, '')
                        .replace(/[<>:"/\\|?*]/g, '_');

                      download(
                        content[activeTab],
                        `${filename}_${activeTab}.txt`
                      );
                    }}
                  >
                    Download
                  </button>

                  <button
                    onClick={() => handleGenerate(activeTab)}
                    disabled={loading}
                  >
                    {loading ? 'Regenerating…' : 'Regenerate'}
                  </button>
                </div>
              </>
            )}

            {!loading && !content[activeTab] && (
              <div>
                <p>
                  Generate {activeLabel?.toLowerCase()} from
                  this video's content.
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
