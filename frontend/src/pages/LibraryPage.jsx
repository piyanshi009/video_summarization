import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Film, 
  Search, 
  Filter, 
  Trash2, 
  Copy, 
  BookOpen, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  MessageSquareText
} from 'lucide-react';

const LibraryPage = ({ videoHistory = [], setVideoHistory }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read URL search params if navigated from TopNav search
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filter, setFilter] = useState('all'); // 'all', 'summarized', 'processed'
  const [expandedSummaryId, setExpandedSummaryId] = useState(null);

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const filteredVideos = useMemo(() => {
    return videoHistory.filter((v) => {
      const name = v.filename?.toLowerCase() || '';
      const summary = v.summary?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      const matchesSearch = name.includes(term) || summary.includes(term);

      let matchesFilter = true;
      if (filter === 'summarized') {
        matchesFilter = Boolean(v.summary && v.summary.trim().length > 0);
      } else if (filter === 'processed') {
        matchesFilter = !v.summary || v.summary.trim().length === 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [videoHistory, searchTerm, filter]);

  const copySummary = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard!');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVideo = (id, filename) => {
    if (window.confirm(`Are you sure you want to remove "${filename}" from your library?`)) {
      const updated = videoHistory.filter((v) => v.video_id !== id);
      if (setVideoHistory) {
        setVideoHistory(updated);
      }
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Video Library</h1>
            <span className="lumio-badge lumio-badge-primary" style={{ fontSize: '0.85rem' }}>
              {videoHistory.length} {videoHistory.length === 1 ? 'video' : 'videos'}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Browse processed recordings, examine summaries, and launch learning workspaces.
          </p>
        </div>

        <Link to="/upload" className="lumio-btn-primary" style={{ padding: '0.65rem 1.35rem' }}>
          <UploadCloud size={18} />
          <span>Upload Video</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        className="lumio-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by filename or summary keywords…"
            style={{
              width: '100%',
              paddingLeft: '2.4rem',
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        {/* Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Filter size={17} style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              padding: '0.6rem 1.2rem',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            <option value="all">All Videos ({videoHistory.length})</option>
            <option value="summarized">
              Summarized ({videoHistory.filter((v) => v.summary && v.summary.trim()).length})
            </option>
            <option value="processed">
              Needs Summary ({videoHistory.filter((v) => !v.summary || !v.summary.trim()).length})
            </option>
          </select>
        </div>
      </div>

      {/* Video Cards Grid */}
      {filteredVideos.length === 0 ? (
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
            <Film size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
              {searchTerm ? 'No matching videos found' : 'Your video library is empty'}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '440px' }}>
              {searchTerm
                ? `No videos matched the query "${searchTerm}". Try adjusting your keywords or filter.`
                : 'Upload your first recording to begin building your knowledge base.'}
            </p>
          </div>
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="lumio-btn-secondary"
            >
              Clear Search Filter
            </button>
          ) : (
            <Link to="/upload" className="lumio-btn-primary">
              <UploadCloud size={17} />
              <span>Upload Video</span>
            </Link>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredVideos.map((video) => {
            const isExpanded = expandedSummaryId === video.video_id;

            return (
              <div
                key={video.video_id}
                className="lumio-card lumio-card-interactive"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
              >
                <div>
                  {/* Top Badge & Language */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <span
                      className={`lumio-badge ${
                        video.summary_generated ? 'lumio-badge-success' : 'lumio-badge-primary'
                      }`}
                    >
                      {video.summary_generated ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Summarized</span>
                        </>
                      ) : (
                        <>
                          <Clock size={13} />
                          <span>Processed</span>
                        </>
                      )}
                    </span>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {video.language ? video.language.toUpperCase() : 'EN'}
                    </span>
                  </div>

                  {/* Video Title */}
                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      marginBottom: '0.65rem',
                      lineHeight: 1.35,
                      wordBreak: 'break-word',
                    }}
                  >
                    {video.filename}
                  </h3>

                  {/* Summary Preview */}
                  {video.summary ? (
                    <div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.55,
                          maxHeight: isExpanded ? 'none' : '4.6rem',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {video.summary.replace(/[*#]/g, '')}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedSummaryId(isExpanded ? null : video.video_id)}
                        style={{
                          background: 'transparent',
                          color: 'var(--color-primary)',
                          padding: '0.35rem 0',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginTop: '0.25rem',
                        }}
                      >
                        <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '0.75rem',
                        background: 'var(--color-bg)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      Transcription ready. AI summary not generated yet.
                    </div>
                  )}
                </div>

                {/* Action Toolbar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-border-subtle)',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/study')}
                      className="lumio-btn-primary"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.82rem',
                      }}
                    >
                      <BookOpen size={14} />
                      <span>Study</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/ask')}
                      className="lumio-btn-secondary"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.82rem',
                      }}
                    >
                      <MessageSquareText size={14} />
                      <span>Ask</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {video.summary && (
                      <button
                        type="button"
                        onClick={() => copySummary(video.summary)}
                        title="Copy Summary"
                        style={{
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border-subtle)',
                          color: 'var(--color-text-secondary)',
                          padding: '0.45rem',
                          borderRadius: '6px',
                        }}
                      >
                        <Copy size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteVideo(video.video_id, video.filename)}
                      title="Delete video"
                      style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border-subtle)',
                        color: '#EF4444',
                        padding: '0.45rem',
                        borderRadius: '6px',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
