import { NavLink } from 'react-router-dom';
import { Home, Upload, Folder, Video, Settings, BookOpen, MessageSquare } from 'lucide-react';
import * as React from 'react';

const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/upload', label: 'Upload Video', icon: Upload },
    { to: '/library', label: 'Video Library', icon: Folder },
    { to: '/highlights', label: 'Highlights Studio', icon: Video },
    { to: '/study', label: 'AI Study Space', icon: BookOpen },
    { to: '/ask', label: 'Ask the Video', icon: MessageSquare },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar" style={{ width: '240px', background: 'var(--color-surface)', padding: '1.5rem', borderRight: '1px solid var(--color-border)', minHeight: '100vh' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '2rem', fontSize: '1.5rem' }}>Lumio AI</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <li key={item.to} style={{ marginBottom: '0.75rem' }}>
              <NavLink
                to={item.to}
                end
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 0.9rem',
                  borderRadius: 'var(--radius)',
                  background: isActive ? 'var(--color-primary-light)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-text-primary)',
                  textDecoration: 'none',
                })}
              >
                {React.createElement(item.icon, { size: 20 })}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
