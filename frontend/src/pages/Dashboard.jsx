import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ videoHistory, setVideoHistory }) => {
  const recentVideos = videoHistory?.slice(-5).reverse() || [];

  return (
    <section className="container">
      <div className="hero" style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h1 className="hero-heading" style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Your videos, understood.
        </h1>
        <p className="hero-subtitle" style={{ marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          AI‑powered video summarization, highlights, and study notes in seconds.
        </p>
        <div className="hero-actions" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/upload" className="button-primary" style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius)' }}>
            Summarize a Video
          </Link>
          <Link to="/library" className="button-secondary" style={{ background: 'var(--color-surface)', color: 'var(--color-primary)', border: `1px solid var(--color-primary)`, padding: '0.6rem 1.2rem', borderRadius: 'var(--radius)' }}>
            Explore Library
          </Link>
        </div>
      </div>

      <div className="stats-section" style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--color-text-h)', marginBottom: '1rem' }}>Statistics</h2>
        <div className="grid grid-2">
          <div className="card">
            <div className="stat-number">{videoHistory?.length ?? 0}</div>
            <p>Videos Processed</p>
          </div>
          <div className="card">
            <div className="stat-number">{videoHistory?.filter(v => v.summary && v.summary.trim()).length ?? 0}</div>
            <p>Summaries Generated</p>
          </div>
          <div className="card">
            <div className="stat-number">0</div>
            <p>Highlights Created</p>
          </div>
          <div className="card">
            <div className="stat-number">0</div>
            <p>Study Notes</p>
          </div>
        </div>
      </div>

      <div className="recent-section" style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--color-text-h)', marginBottom: '1rem' }}>Recent Videos</h2>
        {recentVideos.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recentVideos.map((v) => (
              <li key={v.video_id} style={{ marginBottom: '0.5rem' }}>
                <Link to={`/results/${v.video_id}`} style={{ color: 'var(--color-primary)' }}>
                  {v.filename}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)' }}>No videos processed yet. Upload a video to get started.</p>
        )}
      </div>

      <div className="features-section" style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--color-text-h)', marginBottom: '1rem' }}>Features</h2>
        <div className="grid grid-2">
          <div className="card">
            <h3>AI Video Summaries</h3>
            <p>Instant concise summaries of any video.</p>
          </div>
          <div className="card">
            <h3>Smart Highlights</h3>
            <p>Key moments with timestamps.</p>
          </div>
          <div className="card">
            <h3>AI Study Notes</h3>
            <p>Structured notes for learning.</p>
          </div>
          <div className="card">
            <h3>Ask the Video</h3>
            <p>Query the content with natural language.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
