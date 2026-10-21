import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './index.css';

import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard.jsx';
import UploadPage from './pages/UploadPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import StudySpace from './pages/StudySpace.jsx';
import HighlightsPage from './pages/HighlightsPage.jsx';

function App() {
  const [videoHistory, setVideoHistory] = useState(() => {
    const stored = localStorage.getItem('videoHistory');
    return stored ? JSON.parse(stored) : [];
  });

  // Persist history to localStorage
  useEffect(() => {
    localStorage.setItem('videoHistory', JSON.stringify(videoHistory));
  }, [videoHistory]);

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TopNav />
          <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
            <Routes>
               <Route path="/" element={<Dashboard videoHistory={videoHistory} setVideoHistory={setVideoHistory} />} />
              <Route path="/upload" element={<UploadPage setVideoHistory={setVideoHistory} />} />
              <Route path="/results/:videoId" element={<ResultsPage videoHistory={videoHistory} setVideoHistory={setVideoHistory} />} />
              <Route path="/library" element={<LibraryPage videoHistory={videoHistory} setVideoHistory={setVideoHistory} />} />
              <Route path="/highlights/:videoId" element={<HighlightsPage />} />
               <Route path="/study" element={<StudySpace videoHistory={videoHistory} setVideoHistory={setVideoHistory} />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
