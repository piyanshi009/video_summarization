import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardCopy, Eye, Trash2 } from 'lucide-react';

// Video Library component

// Debug: log when component renders
const LibraryPage = ({ videoHistory = [], setVideoHistory }) => {
  // Debug: log video history updates
  useEffect(() => {
    console.log('LibraryPage rendered, video count:', videoHistory.length);
  }, [videoHistory]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, summarized, needs_summary
  const [expandedId, setExpandedId] = useState(null);

  // Filter and search logic
  const filteredVideos = videoHistory.filter((v) => {
    const matchesSearch = v.filename?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (filter === 'summarized') {
      matchesFilter = !!v.summary && v.summary.trim().length > 0;
    } else if (filter === 'needs_summary') {
      matchesFilter = !v.summary || v.summary.trim().length === 0;
    }
    return matchesSearch && matchesFilter;
  });

  const copySummary = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard');
    } catch (e) {
      console.error(e);
      alert('Failed to copy');
    }
  };

  const deleteVideo = (id) => {
    if (window.confirm('Are you sure you want to delete this video entry?')) {
      const newHistory = videoHistory.filter((v) => v.video_id !== id);
      setVideoHistory && setVideoHistory(newHistory);
    }
  };

  return (
    <section className="library-page" style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Video Library</h2>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by filename…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 200px', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
        />
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Videos</option>
          <option value="summarized">Summarized</option>
          <option value="needs_summary">Needs Summary</option>
        </select>
        <Link
          to="/upload"
          className="button-primary"
          style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius)', textDecoration: 'none' }}
        >
          Upload Video
        </Link>
      </div>

      {filteredVideos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
          <p>No videos found.</p>
          <Link to="/upload" style={{ marginTop: '1rem', display: 'inline-block', color: 'var(--color-primary)' }}>
            Upload a video to get started
          </Link>
        </div>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredVideos.map((v) => (
            <div key={v.video_id} className="card" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid var(--color-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>{v.filename}</h4>
              <p style={{ margin: '0.2rem 0', color: 'var(--color-text-secondary)' }}>
                Status: {v.summary_generated ? 'Summarized' : 'Processed'}
              </p>
              <p style={{ margin: '0.2rem 0', color: 'var(--color-text-secondary)' }}>Language: {v.language || '—'}</p>
              <p style={{ margin: '0.2rem 0', color: 'var(--color-text-secondary)' }}>ID: {v.video_id}</p>
              {v.summary && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Summary preview:</strong>
                  <p style={{ color: 'var(--color-text-primary)', maxHeight: expandedId === v.video_id ? 'none' : '3rem', overflow: 'hidden' }}>
                    {v.summary}
                  </p>
                  <button
                    onClick={() => setExpandedId(expandedId === v.video_id ? null : v.video_id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}
                  >
                    {expandedId === v.video_id ? 'Show less' : 'Show more'}
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                {v.summary && (
                  <>
                    <button
                      onClick={() => copySummary(v.summary)}
                      title="Copy Summary"
                      style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '0.3rem 0.5rem', cursor: 'pointer' }}
                    >
                      <ClipboardCopy size={16} />
                    </button>
                    <button
                      onClick={() => setExpandedId(v.video_id)}
                      title="View Summary"
                      style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '0.3rem 0.5rem', cursor: 'pointer' }}
                    >
                      <Eye size={16} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteVideo(v.video_id)}
                  title="Delete"
                  style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '0.3rem 0.5rem', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default LibraryPage;
