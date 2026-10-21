import React, { useMemo } from 'react';
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
      highlightsCreated: 0, // Feature currently in development
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
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero Welcome Section */}
      <section
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '2.75rem 2.25rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          backgroundImage: 'var(--gradient-card-glow)',
        }}
      >
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <div
            className="lumio-badge lumio-badge-primary"
            style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            <Sparkles size={13} />
            <span>Next-Gen Video Intelligence</span>
          </div>

          <h1
            style={{
              fontSize: '2.6rem',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.18,
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Turn any video into <span style={{ color: 'var(--color-primary-highlight, #F5C96A)' }}>actionable knowledge</span>
          </h1>

          <p
            style={{
              fontSize: '1.08rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '1.85rem',
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

        {/* Decorative background glow */}
        <div
          style={{
            position: 'absolute',
            right: '-80px',
            top: '-80px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </section>

      {/* Metrics Row (Derived from Real Application Data) */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Card 1: Videos Processed */}
          <div className="lumio-card" style={{ padding: '1.5rem' }}>
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
              {metrics.videosProcessed}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              {metrics.videosProcessed > 0 ? 'Ready in local library' : 'No uploads yet'}
            </div>
          </div>

          {/* Card 2: Summaries Generated */}
          <div className="lumio-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Summaries Generated
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {metrics.summariesGenerated}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              Generated via Gemini 2.5 Flash
            </div>
          </div>

          {/* Card 3: Highlights Created */}
          <div className="lumio-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Highlights Created
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {metrics.highlightsCreated}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              Highlights Studio preview active
            </div>
          </div>

          {/* Card 4: Study Materials */}
          <div className="lumio-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Study Materials
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(167, 139, 250, 0.2)',
                  color: 'var(--color-lavender)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {metrics.studyNotes}
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
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Recent Processed Videos</h2>
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
              padding: '3rem 1.5rem',
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
              <UploadCloud size={30} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>No videos processed yet</h3>
              <p style={{ maxWidth: '420px', color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
                Upload an MP4, MOV, MKV or WebM video to automatically generate timestamped transcripts and AI study materials.
              </p>
            </div>
            <Link to="/upload" className="lumio-btn-primary" style={{ marginTop: '0.5rem' }}>
              <UploadCloud size={17} />
              <span>Upload Your First Video</span>
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
                className="lumio-card"
                style={{
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-lavender)',
                        }}
                      >
                        <Film size={18} />
                      </div>
                      <span
                        className={`lumio-badge ${video.summary_generated ? 'lumio-badge-success' : 'lumio-badge-primary'}`}
                      >
                        {video.summary_generated ? 'Summarized' : 'Processed'}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {video.language ? video.language.toUpperCase() : 'EN'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={video.filename}
                  >
                    {video.filename}
                  </h3>

                  {video.summary ? (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.45,
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
                    onClick={() => navigate('/study')}
                    style={{
                      background: 'transparent',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0,
                    }}
                  >
                    <span>Open in Study Space</span>
                    <ArrowRight size={14} />
                  </button>

                  {video.summary && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(video.summary)}
                      title="Copy Summary"
                      style={{
                        background: 'transparent',
                        color: 'var(--color-text-muted)',
                        padding: '0.3rem',
                        borderRadius: '4px',
                      }}
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Capabilities Overview Grid */}
      <section>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Platform Capabilities</h2>
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
          <div className="lumio-card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem' }}>AI Video Summaries</h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              Distill hours of video lectures, webinars, or tutorials into crystal-clear executive summaries and timestamped key moments.
            </p>
          </div>

          <div className="lumio-card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <BookOpen size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem' }}>AI Study Space</h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              Interactive workspace with markdown study notes, 3D flip flashcards, concept revision sheets, and self-scoring quizzes.
            </p>
          </div>

          <div className="lumio-card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(167, 139, 250, 0.2)',
                color: 'var(--color-lavender)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <MessageSquareText size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem' }}>Ask the Video</h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              Chat directly with any processed video. Ask questions, seek clarification, and receive answers anchored directly to the transcript.
            </p>
          </div>

          <div className="lumio-card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem' }}>Highlights Studio</h3>
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
