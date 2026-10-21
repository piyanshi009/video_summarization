import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Film, 
  FileText, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  UploadCloud, 
  Clock, 
  CheckCircle2, 
  MessageSquareText,
  Copy,
  FolderOpen
} from 'lucide-react';

/**
 * AnimatedNumber Component
 * Smooth count-up from 0 to value with ease-out cubic curve.
 * Avoids replaying on unrelated re-renders and respects reduced motion.
 */
function AnimatedNumber({ value, duration = 850 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    let startTimestamp = null;
    const startVal = hasAnimatedRef.current ? displayValue : 0;
    const endVal = Number(value) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Smooth ease-out cubic curve: 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        hasAnimatedRef.current = true;
      }
    };

    const rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <>{displayValue}</>;
}

/**
 * Video Card Skeleton Loader
 */
export function VideoCardSkeleton() {
  return (
    <div
      className="lumio-card"
      style={{
        padding: '1.35rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      <div className="lumio-skeleton" style={{ height: '100px', width: '100%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div className="lumio-skeleton" style={{ height: '18px', width: '35%' }} />
        <div className="lumio-skeleton" style={{ height: '18px', width: '15%' }} />
      </div>
      <div className="lumio-skeleton" style={{ height: '20px', width: '80%' }} />
      <div className="lumio-skeleton" style={{ height: '15px', width: '95%' }} />
      <div className="lumio-skeleton" style={{ height: '15px', width: '60%' }} />
    </div>
  );
}

const Dashboard = ({ videoHistory = [] }) => {
  const navigate = useNavigate();

  // Compute real application metrics from real data
  const metrics = useMemo(() => {
    const totalVideos = videoHistory.length;
    const summariesGenerated = videoHistory.filter(
      (v) => v.summary && v.summary.trim().length > 0
    ).length;

    // Read real study data from localStorage
    let totalStudyNotes = 0;
    try {
      const storedStudy = localStorage.getItem('studyData');
      if (storedStudy) {
        const parsed = JSON.parse(storedStudy);
        if (parsed && typeof parsed === 'object') {
          Object.values(parsed).forEach((tasks) => {
            if (tasks && typeof tasks === 'object') {
              totalStudyNotes += Object.values(tasks).filter(Boolean).length;
            }
          });
        }
      }
    } catch {
      totalStudyNotes = 0;
    }

    return {
      videosProcessed: totalVideos,
      summariesGenerated,
      highlightsCreated: 0,
      studyNotes: totalStudyNotes,
    };
  }, [videoHistory]);

  const recentVideos = useMemo(() => {
    return [...videoHistory].reverse().slice(0, 4);
  }, [videoHistory]);

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* Hero Welcome Section - Polished Obsidian Gold Banner with Ambient Slow Glow */}
      <section
        className="lumio-hero-enter"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '2.1rem 2.25rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          backgroundImage: 'var(--gradient-card-glow)',
        }}
      >
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <div
            className="lumio-badge lumio-badge-primary"
            style={{ marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            <Sparkles size={13} />
            <span>Next-Gen Video Intelligence</span>
          </div>

          <h1
            style={{
              fontSize: '2.15rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.24,
              marginBottom: '0.85rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Turn any video into <span style={{ color: 'var(--color-primary-highlight, #F5C96A)' }}>actionable knowledge</span>
          </h1>

          <p
            style={{
              fontSize: '1.02rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.58,
              marginBottom: '1.5rem',
            }}
          >
            Transcribe with high-precision Whisper, synthesize deep summaries with Gemini AI, 
            and generate interactive flashcards and quizzes in seconds.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/upload" className="lumio-btn-primary">
              <UploadCloud size={18} />
              <span>Summarize a Video</span>
            </Link>
            <Link to="/library" className="lumio-btn-secondary">
              <FolderOpen size={18} />
              <span>Explore Library</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow with slow-moving ambient breathing */}
        <div
          className="lumio-hero-glow"
          style={{
            position: 'absolute',
            right: '-70px',
            top: '-70px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </section>

      {/* Metrics Row - Staggered entrance, hover lift & smooth number count-up */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Card 1: Videos Processed */}
          <div className="lumio-card lumio-stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Videos Processed
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--color-primary-light)',
                  border: '1px solid rgba(212, 168, 83, 0.25)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Film size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              <AnimatedNumber value={metrics.videosProcessed} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              {metrics.videosProcessed > 0 ? 'Ready in local library' : 'No uploads yet'}
            </div>
          </div>

          {/* Card 2: Summaries Generated */}
          <div className="lumio-card lumio-stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Summaries Generated
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--color-primary-light)',
                  border: '1px solid rgba(212, 168, 83, 0.25)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              <AnimatedNumber value={metrics.summariesGenerated} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              Generated via Gemini 2.5 Flash
            </div>
          </div>

          {/* Card 3: Highlights Created */}
          <div className="lumio-card lumio-stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Highlights Created
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              <AnimatedNumber value={metrics.highlightsCreated} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              Highlights Studio workspace
            </div>
          </div>

          {/* Card 4: Study Materials */}
          <div className="lumio-card lumio-stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Study Materials
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(212, 168, 83, 0.12)',
                  border: '1px solid rgba(212, 168, 83, 0.22)',
                  color: 'var(--color-primary-highlight, #F5C96A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              <AnimatedNumber value={metrics.studyNotes} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              Notes, Flashcards & Quizzes saved
            </div>
          </div>
        </div>
      </section>

      {/* Recent Videos Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Recent Processed Videos
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              Access transcripts, summaries, and learning sets directly.
            </p>
          </div>
          {videoHistory.length > 0 && (
            <Link
              to="/library"
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>View all ({videoHistory.length})</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {recentVideos.length === 0 ? (
          <div
            className="lumio-card"
            style={{
              padding: '3.5rem 1.75rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--color-muted-gold, #292318)',
                border: '1px solid rgba(212, 168, 83, 0.3)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 16px -2px var(--color-primary-glow)',
              }}
            >
              <Film size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--color-text-primary)' }}>
              No videos processed yet
            </h3>
            <p style={{ maxWidth: '440px', color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Upload an MP4, MOV, MKV or WebM video to automatically generate timestamped speech transcripts, AI summaries, and interactive flashcards.
            </p>
            <Link to="/upload" className="lumio-btn-primary" style={{ padding: '0.7rem 1.5rem' }}>
              <UploadCloud size={17} />
              <span>Summarize a Video</span>
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {recentVideos.map((video) => (
              <div
                key={video.video_id}
                className="lumio-card lumio-card-interactive"
                style={{
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  {/* Thumbnail / Video Preview Header */}
                  {video.thumbnail ? (
                    <div
                      style={{
                        position: 'relative',
                        height: '140px',
                        width: '100%',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        marginBottom: '0.85rem',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.filename}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {video.duration && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: 'rgba(16, 16, 16, 0.85)',
                            color: '#FAF7F0',
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {video.duration}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        height: '96px',
                        width: '100%',
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-bg) 100%)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.85rem',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--color-primary-light)',
                          border: '1px solid rgba(212, 168, 83, 0.25)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Film size={20} />
                      </div>
                      {video.duration && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '8px',
                            background: 'rgba(16, 16, 16, 0.85)',
                            color: '#FAF7F0',
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {video.duration}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status & Language Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span
                      className={`lumio-badge ${video.summary_generated ? 'lumio-badge-success' : 'lumio-badge-primary'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      {video.summary_generated ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Summarized</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>Transcribed</span>
                        </>
                      )}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {video.language ? video.language.toUpperCase() : 'EN'}
                    </span>
                  </div>

                  {/* Video Title */}
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      marginBottom: '0.45rem',
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={video.filename}
                  >
                    {video.filename}
                  </h3>

                  {/* Summary Snippet or Status */}
                  {video.summary ? (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.48,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {video.summary.replace(/[*#]/g, '').slice(0, 140)}...
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      Transcript extracted. Ready for AI Study Space.
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/study/${video.video_id}`)}
                    style={{
                      background: 'transparent',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0,
                    }}
                  >
                    <span>Open in Study Space</span>
                    <ArrowRight size={14} />
                  </button>

                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    {video.summary && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(video.summary)}
                        title="Copy Summary"
                        style={{
                          background: 'var(--color-surface-hover)',
                          color: 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border)',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Capabilities Overview Grid - Obsidian Gold Styled */}
      <section>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Platform Capabilities
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
            Everything you need to turn raw media into structured mastery.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div className="lumio-card lumio-feature-card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--color-primary-light)',
                border: '1px solid rgba(212, 168, 83, 0.25)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem', color: 'var(--color-text-primary)' }}>
              AI Video Summaries
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              Distill hours of video lectures, webinars, or tutorials into crystal-clear executive summaries and timestamped key moments.
            </p>
          </div>

          <div className="lumio-card lumio-feature-card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--color-primary-light)',
                border: '1px solid rgba(212, 168, 83, 0.25)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <BookOpen size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem', color: 'var(--color-text-primary)' }}>
              AI Study Space
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              Interactive workspace with markdown study notes, 3D flip flashcards, concept revision sheets, and self-scoring quizzes.
            </p>
          </div>

          <div className="lumio-card lumio-feature-card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--color-primary-light)',
                border: '1px solid rgba(212, 168, 83, 0.25)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <MessageSquareText size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem', color: 'var(--color-text-primary)' }}>
              Ask the Video
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              Chat directly with any processed video. Ask questions, seek clarification, and receive answers anchored directly to the transcript.
            </p>
          </div>

          <div className="lumio-card lumio-feature-card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary-highlight, #F5C96A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem', color: 'var(--color-text-primary)' }}>
              Highlights Studio
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              Automated scene and topic segmentation to extract pivotal moments, formulas, and conclusions from long-form video.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
