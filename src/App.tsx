import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Trophy, 
  Users, 
  Calendar, 
  Settings,
  Waves,
  Sun,
  Moon
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ClubRankings from './pages/ClubRankings';
import SwimmerRankings from './pages/SwimmerRankings';
import EventBrowser from './pages/EventBrowser';
import SettingsPage from './pages/SettingsPage';
import EventDetails from './pages/EventDetails';
import './index.css';

import { useLocation } from 'react-router-dom';

function AnimatedMain() {
  const location = useLocation();
  
  return (
    <main className="main-content">
      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/clubs" element={<ClubRankings />} />
          <Route path="/swimmers" element={<SwimmerRankings />} />
          <Route path="/events" element={<EventBrowser />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </main>
  );
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Waves size={32} />
            <h1>Swimming Scorer</h1>
          </div>
          
          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard />
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink to="/upload" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Upload />
              <span>Upload PDF</span>
            </NavLink>
            
            <NavLink to="/clubs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Trophy />
              <span>Club Rankings</span>
            </NavLink>
            
            <NavLink to="/swimmers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users />
              <span>Swimmers</span>
            </NavLink>
            
            <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Calendar />
              <span>Events</span>
            </NavLink>
            
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings />
              <span>Settings</span>
            </NavLink>
          </nav>

          <div className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun /> : <Moon />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </aside>
        
        <AnimatedMain />
      </div>
    </BrowserRouter>
  );
}

export default App;

