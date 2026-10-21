import { NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const TopNav = () => {
  // Initialize theme from localStorage or default to light mode
  const storedTheme = localStorage.getItem('theme');
  const initialDark = storedTheme ? storedTheme === 'dark' : false;
  const [dark, setDark] = useState(initialDark);

  // Apply theme to document and persist
  const applyTheme = (isDark) => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const toggleTheme = () => {
    setDark((prev) => !prev);
  };

  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  // Ensure theme is applied on initial render
  useEffect(() => {
    applyTheme(dark);
  }, []);

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)' }}>Lumio AI</h1>
      <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)' }} aria-label="Toggle theme">
        {dark ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  );
};

export default TopNav;
