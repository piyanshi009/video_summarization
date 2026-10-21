import React from 'react';
import { Film } from 'lucide-react';

const HighlightsPage = () => {
  return (
    <div className="page-container" style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            marginBottom: '0.35rem',
            color: 'var(--color-text-primary)',
          }}
        >
          Highlights Studio
        </h1>
      </div>

      {/* Minimal Obsidian Gold Empty State Card */}
      <div
        className="lumio-card"
        style={{
          padding: '5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '360px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Subtle, tasteful video icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-muted-gold, #292318)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px -2px var(--color-primary-glow)',
          }}
        >
          <Film size={28} />
        </div>

        {/* Message */}
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '0.45rem',
          }}
        >
          This workspace is not available yet.
        </h2>

        {/* Supporting text */}
        <p
          style={{
            fontSize: '1.02rem',
            color: 'var(--color-text-secondary)',
            maxWidth: '440px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          More capabilities are on the way.
        </p>
      </div>
    </div>
  );
};

export default HighlightsPage;
