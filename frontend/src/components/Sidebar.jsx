import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Film, 
  Sparkles, 
  BookOpen, 
  MessageSquareText, 
  Settings,
  Cpu,
  Layers
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload Video', icon: UploadCloud },
    { to: '/library', label: 'Video Library', icon: Film },
    { to: '/highlights', label: 'Highlights Studio', icon: Sparkles },
    { to: '/study', label: 'AI Study Space', icon: BookOpen },
    { to: '/ask', label: 'Ask the Video', icon: MessageSquareText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 11, 24, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        className={`lumio-sidebar ${isMobileOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          background: 'var(--color-surface-elevated, #1B1B1B)',
          borderRight: '1px solid var(--color-border)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Logo Section */}
        <div 
          style={{ 
            padding: '1.75rem 1.5rem 1.25rem',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px -2px var(--color-primary-glow)',
                color: 'var(--color-primary-text, #12100C)',
                flexShrink: 0,
              }}
            >
              {/* Geometric Play/AI Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4L19 12L5 20V4Z" fill="currentColor" fillOpacity="0.9" />
                <circle cx="17" cy="7" r="3" fill="var(--color-primary-highlight, #F5C96A)" />
              </svg>
            </div>
            <div>
              <div 
                style={{ 
                  fontWeight: 800, 
                  fontSize: '1.25rem', 
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                Lumio <span style={{ color: 'var(--color-primary-highlight, #F5C96A)' }}>AI</span>
              </div>
              <div 
                style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                  marginTop: '-2px',
                }}
              >
                Learn from any video
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1.25rem 0.85rem', overflowY: 'auto' }}>
          <div 
            style={{ 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              color: 'var(--color-text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em',
              padding: '0 0.75rem 0.6rem',
            }}
          >
            Workspace
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={closeMobileMenu}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--gradient-primary)' : 'transparent',
                    color: isActive ? 'var(--color-primary-text, #12100C)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    position: 'relative',
                    transition: 'all 0.18s ease',
                    boxShadow: isActive ? '0 4px 16px -2px var(--color-primary-glow)' : 'none',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        size={19} 
                        style={{ 
                          color: isActive ? 'var(--color-primary-text, #12100C)' : 'var(--color-primary)',
                          opacity: isActive ? 1 : 0.85,
                          flexShrink: 0,
                        }} 
                      />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {isActive && (
                        <span 
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: 'var(--color-primary-text, #12100C)',
                            boxShadow: '0 0 8px var(--color-primary-text, #12100C)',
                          }} 
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer: Engine Status Widget */}
        <div
          style={{
            padding: '1rem',
            margin: '0.75rem',
            background: 'var(--color-muted-gold, #292318)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={14} color="var(--color-primary)" />
              Local Engine
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              Active
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Faster-Whisper • Gemini Pro
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
