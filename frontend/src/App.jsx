import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';

import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard.jsx';
import UploadPage from './pages/UploadPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import StudySpace from './pages/StudySpace.jsx';
import HighlightsPage from './pages/HighlightsPage.jsx';
import AskVideoPage from './pages/AskVideoPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';

function App() {
  const [videoHistory, setVideoHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('videoHistory');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('videoHistory', JSON.stringify(videoHistory));
    } catch (err) {
      console.error('Failed to persist video history:', err);
    }
  }, [videoHistory]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          closeMobileMenu={closeMobileMenu} 
        />

        <div className="app-main-content">
          <TopNav 
            toggleMobileMenu={toggleMobileMenu} 
            isMobileOpen={isMobileMenuOpen} 
          />

          <main style={{ flex: 1, overflowY: 'auto' }}>
            <Routes>
              <Route
                path="/"
                element={<Dashboard videoHistory={videoHistory} setVideoHistory={setVideoHistory} />}
              />
              <Route
                path="/upload"
                element={<UploadPage setVideoHistory={setVideoHistory} />}
              />
              <Route
                path="/library"
                element={<LibraryPage videoHistory={videoHistory} setVideoHistory={setVideoHistory} />}
              />
              <Route
                path="/study"
                element={<StudySpace videoHistory={videoHistory} setVideoHistory={setVideoHistory} />}
              />
              <Route
                path="/study/:videoId"
                element={<StudySpace videoHistory={videoHistory} setVideoHistory={setVideoHistory} />}
              />
              <Route
                path="/highlights"
                element={<HighlightsPage videoHistory={videoHistory} />}
              />
              <Route
                path="/highlights/:videoId"
                element={<HighlightsPage videoHistory={videoHistory} />}
              />
              <Route
                path="/ask"
                element={<AskVideoPage videoHistory={videoHistory} />}
              />
              <Route
                path="/ask/:videoId"
                element={<AskVideoPage videoHistory={videoHistory} />}
              />
              <Route
                path="/settings"
                element={<SettingsPage videoHistory={videoHistory} setVideoHistory={setVideoHistory} />}
              />
              <Route
                path="/results/:videoId"
                element={<ResultsPage videoHistory={videoHistory} setVideoHistory={setVideoHistory} />}
              />
              <Route
                path="*"
                element={
                  <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Page Not Found</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                      The requested route does not exist or has been moved.
                    </p>
                    <Link to="/" className="lumio-btn-primary">
                      Return to Dashboard
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
