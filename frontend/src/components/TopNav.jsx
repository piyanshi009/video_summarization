import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Menu, X, Sparkles } from 'lucide-react';

const TopNav = ({ toggleMobileMenu, isMobileOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return true; // default dark for futuristic midnight theme
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.75rem',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        gap: '1rem',
      }}
    >
      {/* Left: Mobile hamburger & Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '640px' }}>
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Global Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          style={{ 
            position: 'relative', 
            width: '100%',
          }}
        >
          <Search 
            size={17} 
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
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your videos, notes, or ask anything..."
            style={{
              width: '100%',
              padding: '0.55rem 3.5rem 0.55rem 2.4rem',
              borderRadius: 'var(--radius)',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.88rem',
              color: 'var(--color-text-primary)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '0.65rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
            }}
          >
            ⌘K
          </span>
        </form>
      </div>

      {/* Right: Actions & Theme toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
          }}
        >
          {isDark ? (
            <Sun size={18} style={{ color: '#FBBF24' }} />
          ) : (
            <Moon size={18} style={{ color: 'var(--color-primary)' }} />
          )}
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
