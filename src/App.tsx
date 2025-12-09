import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Trophy, 
  Users, 
  Calendar, 
  Settings,
  Waves,
  Sun,
  Moon,
  Menu,
  X
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

import { LanguageProvider, useLanguage } from './context/LanguageContext';

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

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const { t } = useLanguage();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    {/* HashRouter keeps routing working on static hosts like GitHub Pages */}
    <HashRouter>
      <div className="app-container">
        {/* Mobile Header */}
        <div className="mobile-header">
          <div className="mobile-header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="mobile-logo">
              <Waves size={24} style={{ color: 'var(--color-accent)' }} />
              <span className="mobile-brand">SwimScore</span>
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isMobileMenuOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <Waves size={32} style={{ color: 'var(--color-accent)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.25rem', margin: 0 }}>SwimScore</h1>
                <span style={{ 
                  fontSize: '0.625rem', 
                  background: 'var(--color-accent)', 
                  color: 'white', 
                  padding: '1px 6px', 
                  borderRadius: '12px', 
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>PRO</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Professional Meet Analytics</span>
            </div>
          </div>
          
          
          <nav className="sidebar-nav">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard />
              <span>{t('nav.dashboard')}</span>
            </NavLink>
            
            <NavLink 
              to="/upload" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Upload />
              <span>{t('nav.upload')}</span>
            </NavLink>
            
            <NavLink 
              to="/clubs" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Trophy />
              <span>{t('nav.clubs')}</span>
            </NavLink>
            
            <NavLink 
              to="/swimmers" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users />
              <span>{t('nav.swimmers')}</span>
            </NavLink>
            
            <NavLink 
              to="/events" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Calendar />
              <span>{t('nav.events')}</span>
            </NavLink>
            
            <NavLink 
              to="/settings" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings />
              <span>{t('nav.settings')}</span>
            </NavLink>
          </nav>

          <div className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun /> : <Moon />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          
          <div style={{ 
            marginTop: 'var(--space-4)', 
            paddingTop: 'var(--space-4)', 
            borderTop: '1px solid var(--glass-border)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>
              SwimScore v1.0<br/>
              <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Professionally Crafted</span>
            </p>
          </div>
        </aside>
        
        <AnimatedMain />
      </div>
    </HashRouter>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;

