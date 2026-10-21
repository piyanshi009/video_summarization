import React, { useState } from 'react';
import { Sparkles, Video, Clock, Scissors, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HighlightsPage = ({ videoHistory = [] }) => {
  const [selectedId, setSelectedId] = useState(videoHistory[0]?.video_id || '');

  return (
    <div className="page-container" style={{ maxWidth: '980px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="lumio-badge lumio-badge-primary" style={{ marginBottom: '0.65rem' }}>
          <Sparkles size={13} />
          <span>Timeline Synthesis</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Highlights Studio
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
          Identify key moments, key takeaways, and critical timestamps from long-form content.
        </p>
      </div>

      {/* Feature In Development Card */}
      <div
        className="lumio-card"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Scissors size={30} />
        </div>

        <div>
          <span
            className="lumio-badge"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#F59E0B',
              marginBottom: '0.65rem',
            }}
          >
            Coming in Lumio v1.5
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            Automated Video Clipping & Highlights
          </h2>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.98rem',
              maxWidth: '540px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Highlight clip generation requires server-side FFmpeg scene extraction, which is currently undergoing performance benchmarking.
            In the meantime, you can explore instant timestamped summaries in the Upload workspace and generate full study guides in AI Study Space.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Link to="/study" className="lumio-btn-primary">
            <span>Go to AI Study Space</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/library" className="lumio-btn-secondary">
            <span>Browse Library Transcripts</span>
          </Link>
        </div>
      </div>

      {/* Planned Feature Architecture Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="lumio-card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            <Clock size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Key Moment Timestamps</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Automated semantic segmentation based on transcript topic shifts to jump directly to core ideas.
          </p>
        </div>

        <div className="lumio-card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--color-lavender)', marginBottom: '0.75rem' }}>
            <Sparkles size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Automated Chaptering</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Exportable chapter markers for YouTube, LMS platforms, and classroom presentations.
          </p>
        </div>

        <div className="lumio-card" style={{ padding: '1.5rem' }}>
          <div style={{ color: '#10B981', marginBottom: '0.75rem' }}>
            <Video size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Short Reel Cuts</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Generate 60-second vertical summary clips of the most crucial concepts for quick mobile review.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HighlightsPage;
