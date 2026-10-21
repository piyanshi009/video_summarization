import React, { useState } from 'react';
import { Upload, FileVideo, X, ClipboardCheck, List, BookOpen, Clock } from 'lucide-react';

const UploadPage = ({ setVideoHistory }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

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
      setError('File is too large (max 500 MB).');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
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
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: form,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Upload failed');
      }
      const data = await response.json();
      setResult(data);
      if (setVideoHistory) {
        setVideoHistory(prev => [...prev, data]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (size) => `${(size / (1024 * 1024)).toFixed(2)} MB`;

  // Simple markdown renderer for Gemini summary
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];
    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (!line) return;
      // Heading detection: line wrapped in **
      if (/^\*\*.+\*\*$/.test(line)) {
        if (listItems.length) {
          elements.push(
            <ul key={'list-' + idx} style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
              {listItems.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.3rem' }} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
          listItems = [];
        }
        const heading = line.replace(/^\*\*/, '').replace(/\*\*$/, '');
        elements.push(
          <h4 key={'h' + idx} style={{ margin: '0.8rem 0', color: 'var(--color-primary)' }}>{heading}</h4>
        );
      } else if (/^[\-\*]\s+/.test(line)) {
        const item = line.replace(/^[\-\*]\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        listItems.push(item);
      } else {
        if (listItems.length) {
          elements.push(
            <ul key={'list-' + idx} style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
              {listItems.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.3rem' }} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
          listItems = [];
        }
        const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <p key={'p' + idx} style={{ margin: '0.4rem 0', color: 'var(--color-text-primary)' }} dangerouslySetInnerHTML={{ __html: html }} />
        );
      }
    });
    if (listItems.length) {
      elements.push(
        <ul key={'list-final'} style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ marginBottom: '0.3rem' }} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
    }
    return elements;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (e) {
      console.error(e);
      alert('Failed to copy');
    }
  };

  const downloadSummary = (summary) => {
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section style={{ maxWidth: '720px', margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Create your video summary</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Transform long videos into summaries, notes, and key moments.
      </p>

      {/* Upload area */}
      {!result && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            border: `2px ${dragOver ? 'solid' : 'dashed'} var(--color-primary)`,
            borderRadius: 'var(--radius)',
            padding: '2rem',
            cursor: 'pointer',
            background: 'var(--color-surface)',
            transition: 'border-color 0.2s, background 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ background: 'rgba(109,60,245,0.1)', borderRadius: '50%', padding: '0.6rem' }}>
              <Upload size={48} color="var(--color-primary)" />
            </div>
            <p style={{ color: 'var(--color-text-primary)', margin: 0, fontWeight: 500, fontSize: '1.1rem' }}>Drop your video here</p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
              Drag and drop your file, or browse your computer
            </p>
          </div>

          <button
            type="button"
            style={{
              marginTop: '1rem',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }}
          >
            Browse Files
          </button>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Supported formats: MP4, MOV, MKV, WebM
          </p>
          <input
            id="fileInput"
            type="file"
            accept=".mp4,.mov,.mkv,.webm"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>
      )}

      {/* Selected file view */}
      {file && !result && (
        <div style={{ marginTop: '1.5rem', textAlign: 'left', background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FileVideo size={24} color="var(--color-primary)" />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: 'var(--color-text-primary)' }}><strong>{file.name}</strong> ({formatSize(file.size)})</p>
          </div>
          <button onClick={removeFile} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--color-text-secondary)" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {file && !result && (
        <button
          type="button"
          onClick={upload}
          disabled={loading}
          style={{
            marginTop: '1rem',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--radius)',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing…' : 'Upload & Summarize'}
        </button>
      )}

      {/* Error */}
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {/* What you'll get */}
      <section style={{ marginTop: '3rem', textAlign: 'left' }}>
        <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>What you’ll get</h3>
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={20} color="var(--color-primary)" />
              <strong style={{ color: 'var(--color-text-primary)' }}>AI Summary</strong>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>A concise overview with key take‑aways.</p>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <List size={20} color="var(--color-primary)" />
              <strong style={{ color: 'var(--color-text-primary)' }}>Timestamped Transcript</strong>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Searchable transcript with timestamps.</p>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--color-primary)" />
              <strong style={{ color: 'var(--color-text-primary)' }}>Study Notes</strong>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Bullet‑point notes for revision (coming soon).</p>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--color-primary)" />
              <strong style={{ color: 'var(--color-text-primary)' }}>Key Moments</strong>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Important sections highlighted (coming soon).</p>
          </div>
        </div>
      </section>

      {/* Result display */}
      {result && (
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          {/* Header with filename */}
          <div style={{ padding: '0.8rem', background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{result.filename}</h3>
            <p style={{ margin: '0.3rem 0 0', color: 'var(--color-text-secondary)' }}>Processing completed</p>
          </div>

          {/* Summary Card */}
          <div className="card" style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Summary</h4>
            <div>{renderMarkdown(result.summary)}</div>
            <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.6rem' }}>
              <button onClick={() => copyToClipboard(result.summary)} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Copy Summary</button>
              <button onClick={() => downloadSummary(result.summary)} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Download Summary</button>
            </div>
          </div>

          {/* Transcript Card */}
          <div className="card" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Transcript</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--color-bg)', padding: '0.8rem', borderRadius: 'var(--radius)' }}>
              {Array.isArray(result.transcript) && result.transcript.length > 0 ? (
                result.transcript.map((seg, idx) => (
                  <p key={idx} style={{ margin: '0.2rem 0', color: 'var(--color-text-primary)' }}>
                    <span style={{ fontWeight: '500', marginRight: '0.4rem' }}>[{seg.start}s - {seg.end}s]</span>{seg.text}
                  </p>
                ))
              ) : (
                <p style={{ color: 'var(--color-text-secondary)' }}>No transcript available.</p>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div style={{ marginTop: '1rem' }}>
            <ul style={{ color: 'var(--color-text-primary)', listStyle: 'none', paddingLeft: 0 }}>
              <li><strong>Language:</strong> {result.language}</li>
              <li><strong>Video ID:</strong> {result.video_id}</li>
              <li><strong>Filename:</strong> {result.filename}</li>
            </ul>
          </div>

          {/* Actions */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem' }}>
            <button onClick={() => { setFile(null); setResult(null); }} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Upload Another Video</button>
          </div>

        </div>
      )}

    </section >
  );
};

export default UploadPage;
