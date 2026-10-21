import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Film, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Copy, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquareText 
} from 'lucide-react';

const ResultsPage = ({ videoHistory = [] }) => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  const video = videoHistory.find((v) => v.video_id === videoId);

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

  if (!video) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Video Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          The requested video could not be found in your local history.
        </p>
        <Link to="/library" className="lumio-btn-primary">
          Back to Video Library
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1020px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="lumio-btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>
      </div>

      {/* Video Details Header Card */}
      <div
        className="lumio-card"
        style={{
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Film size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>{video.filename}</h1>
              <span className={`lumio-badge ${video.summary_generated ? 'lumio-badge-success' : 'lumio-badge-primary'}`}>
                {video.summary_generated ? 'Summarized' : 'Processed'}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Language: {video.language?.toUpperCase() || 'EN'} • ID: {video.video_id}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Link to="/study" className="lumio-btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.88rem' }}>
            <BookOpen size={16} />
            <span>Study Space</span>
          </Link>
          <Link to="/ask" className="lumio-btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.88rem' }}>
            <MessageSquareText size={16} />
            <span>Ask Video</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--radius)',
            background: activeTab === 'summary' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'summary' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
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
          onClick={() => setActiveTab('transcript')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--radius)',
            background: activeTab === 'transcript' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'transcript' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Clock size={17} />
          <span>Transcript</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="lumio-card" style={{ padding: '2rem', minHeight: '300px' }}>
        {activeTab === 'summary' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Executive AI Summary</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => copyToClipboard(video.summary)}
                  className="lumio-btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <Copy size={15} />
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadText(video.summary, `${video.filename}_summary.txt`)}
                  className="lumio-btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <Download size={15} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div style={{ lineHeight: 1.7, fontSize: '1rem', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
              {video.summary || 'No summary generated yet.'}
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Transcript</h3>
            {video.transcript?.segments ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '500px', overflowY: 'auto' }}>
                {video.transcript.segments.map((seg, i) => (
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
                Transcript segments unavailable in local memory.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
