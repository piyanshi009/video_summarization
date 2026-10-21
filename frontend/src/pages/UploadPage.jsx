import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  FileVideo, 
  X, 
  Copy, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Clock, 
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';

const UploadPage = ({ setVideoHistory }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState('summary'); // 'summary' or 'transcript'

  const supportedTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
  const maxFileSize = 500 * 1024 * 1024; // 500 MB

  const handleFiles = (files) => {
    const selected = files[0];
    if (!selected) return;

    const lowerName = selected.name.toLowerCase();
    const isSupportedExt = ['.mp4', '.mov', '.mkv', '.webm'].some(ext => lowerName.endsWith(ext));

    if (!supportedTypes.includes(selected.type) && !isSupportedExt) {
      setError('Unsupported file type. Please upload MP4, MOV, MKV or WebM.');
      setFile(null);
      return;
    }

    if (selected.size > maxFileSize) {
      setError('File is too large. Maximum supported file size is 500 MB.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selected);
    setResult(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setLoadingStage('Uploading video and extracting audio stream…');

    try {
      const form = new FormData();
      form.append('file', file);

      // Simulating stage message updates for genuine pipeline awareness
      const stageTimer1 = setTimeout(() => {
        setLoadingStage('Transcribing speech with local Whisper model…');
      }, 3500);

      const stageTimer2 = setTimeout(() => {
        setLoadingStage('Generating structured AI summary with Gemini…');
      }, 9000);

      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: form,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid server response. Please make sure FastAPI backend is running.');
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Upload processing failed.');
      }

      setResult(data);
      if (setVideoHistory) {
        setVideoHistory((prev) => {
          // Avoid duplicate entries
          const filtered = prev.filter(v => v.video_id !== data.video_id);
          return [...filtered, data];
        });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong during video processing.');
    } finally {
      setLoading(false);
      setLoadingStage('');
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

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="page-container" style={{ maxWidth: '1020px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Upload & Process Video
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
          Upload any lecture, webinar, or recording to extract transcriptions, structured summaries, and learning tools.
        </p>
      </div>

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Drag & Drop Zone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              background: dragOver ? 'var(--color-primary-light)' : 'var(--color-surface)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              position: 'relative',
              boxShadow: dragOver ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
            }}
            onClick={() => document.getElementById('video-file-input')?.click()}
          >
            <input
              id="video-file-input"
              type="file"
              accept=".mp4,.mov,.mkv,.webm,video/*"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />

            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 16px -2px var(--color-primary-glow)',
              }}
            >
              <UploadCloud size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              Choose a video file or drag and drop here
            </h3>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              MP4, MOV, MKV, or WebM • Up to 500 MB per file
            </p>

            <span
              className="lumio-btn-secondary"
              style={{
                pointerEvents: 'none',
                display: 'inline-flex',
                fontSize: '0.88rem',
                padding: '0.5rem 1.25rem',
              }}
            >
              Browse Local Files
            </span>
          </div>

          {/* Error Message */}
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

          {/* Selected File Details Card */}
          {file && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileVideo size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                    {formatSize(file.size)} • {file.type || 'video'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={removeFile}
                  disabled={loading}
                  className="lumio-btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}
                >
                  <X size={15} />
                  <span>Remove</span>
                </button>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading}
                  className="lumio-btn-primary"
                  style={{
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.95rem',
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" style={{ animation: 'spin 1.2s linear infinite' }} />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      <span>Start Processing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Processing Progress Status */}
          {loading && (
            <div
              className="lumio-card"
              style={{
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '3px solid var(--color-border)',
                  borderTopColor: 'var(--color-primary)',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                  Processing Your Video
                </h4>
                <p style={{ color: 'var(--color-lavender)', fontSize: '0.95rem', fontWeight: 600 }}>
                  {loadingStage || 'Extracting speech and computing embeddings…'}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                  This may take 15–45 seconds depending on video length.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Result View Section */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Success Banner */}
          <div
            className="lumio-card"
            style={{
              padding: '1.5rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--color-primary-light) 100%)',
              borderColor: 'rgba(16, 185, 129, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Video Processed Successfully
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                  {result.filename} • Language: {result.language?.toUpperCase() || 'EN'} • ID: {result.video_id?.slice(0, 10)}...
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/study" className="lumio-btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}>
                <BookOpen size={16} />
                <span>Open in Study Space</span>
              </Link>
              <button
                type="button"
                onClick={removeFile}
                className="lumio-btn-secondary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
              >
                Upload Another
              </button>
            </div>
          </div>

          {/* Result Tabs (Summary vs Transcript) */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveResultTab('summary')}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius)',
                background: activeResultTab === 'summary' ? 'var(--color-primary-light)' : 'transparent',
                color: activeResultTab === 'summary' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Sparkles size={17} />
              <span>AI Summary</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveResultTab('transcript')}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius)',
                background: activeResultTab === 'transcript' ? 'var(--color-primary-light)' : 'transparent',
                color: activeResultTab === 'transcript' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Clock size={17} />
              <span>Timestamped Transcript</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div
            className="lumio-card"
            style={{
              padding: '2rem',
              minHeight: '350px',
            }}
          >
            {activeResultTab === 'summary' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Executive AI Summary</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.summary)}
                      className="lumio-btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <Copy size={15} />
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadText(result.summary, `${result.filename || 'video'}_summary.txt`)}
                      className="lumio-btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <Download size={15} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    lineHeight: 1.7,
                    fontSize: '1rem',
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {result.summary || 'No summary generated.'}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Full Transcript Segments</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const text = result.transcript?.segments
                        ?.map((s) => `[${s.start}s - ${s.end}s] ${s.text}`)
                        .join('\n') || '';
                      downloadText(text, `${result.filename || 'video'}_transcript.txt`);
                    }}
                    className="lumio-btn-secondary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    <Download size={15} />
                    <span>Download Transcript</span>
                  </button>
                </div>

                {result.transcript?.segments && result.transcript.segments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '500px', overflowY: 'auto' }}>
                    {result.transcript.segments.map((seg, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border-subtle)',
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            fontFamily: 'var(--font-mono)',
                            padding: '0.2rem 0.5rem',
                            background: 'var(--color-primary-light)',
                            borderRadius: '4px',
                            flexShrink: 0,
                          }}
                        >
                          {Math.floor(seg.start)}s – {Math.floor(seg.end)}s
                        </span>
                        <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', margin: 0 }}>
                          {seg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    No timestamped segments found in transcript.
                  </p>
                )}
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
};

export default UploadPage;
