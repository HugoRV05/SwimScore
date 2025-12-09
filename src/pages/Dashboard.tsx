import { useAppStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp,
  FileSearch
} from 'lucide-react';

export default function Dashboard() {
  const { meet, clubStandings, swimmerStandings, scoringConfig } = useAppStore();
  
  if (!meet) {
    return (
      <div>
        <header className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Swimming Point Scorer - Competition Analysis</p>
        </header>
        
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileSearch strokeWidth={1.5} />
          </div>
          <h3>No Meet Loaded</h3>
          <p>Upload a PDF file to start analyzing competition results and view detailed standings.</p>
          <Link to="/upload" className="btn btn-primary">
            Upload PDF
          </Link>
        </div>
      </div>
    );
  }
  
  const totalPoints = clubStandings.reduce((sum, c) => sum + c.totalPoints, 0);
  const totalEvents = meet.events.length;
  const totalClubs = clubStandings.length;
  const totalSwimmers = swimmerStandings.length;
  
  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{meet.name}</h1>
        <p className="page-subtitle">
          {meet.date} • Scoring: {scoringConfig.name}
        </p>
      </header>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <h3>{totalEvents}</h3>
            <p>Events</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Trophy />
          </div>
          <div className="stat-content">
            <h3>{totalClubs}</h3>
            <p>Clubs</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            <Users />
          </div>
          <div className="stat-content">
            <h3>{totalSwimmers}</h3>
            <p>Swimmers</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>{totalPoints.toFixed(0)}</h3>
            <p>Total Points</p>
          </div>
        </div>
      </div>
      
      {/* Top Clubs */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Trophy size={18} /> Top 5 Clubs
          </h3>
          <Link to="/clubs" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: 'var(--space-2) var(--space-3)' }}>
            View All
          </Link>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Club</th>
                <th>Ind.</th>
                <th>Relay</th>
                <th>Total</th>
                <th>Medals</th>
              </tr>
            </thead>
            <tbody>
              {clubStandings.slice(0, 5).map((standing, index) => (
                <tr key={standing.club.id}>
                  <td>
                    <span className={`position-badge ${index < 3 ? `position-${index + 1}` : ''}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td>
                    <strong>{standing.club.name}</strong>
                  </td>
                  <td>{standing.individualPoints.toFixed(1)}</td>
                  <td>{standing.relayPoints.toFixed(1)}</td>
                  <td className="points">{standing.totalPoints.toFixed(1)}</td>
                  <td>
                    <div className="medals">
                      {standing.goldMedals > 0 && <span className="medal medal-gold">G {standing.goldMedals}</span>}
                      {standing.silverMedals > 0 && <span className="medal medal-silver">S {standing.silverMedals}</span>}
                      {standing.bronzeMedals > 0 && <span className="medal medal-bronze">B {standing.bronzeMedals}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Top Swimmers */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Users size={18} /> Top 5 Swimmers
          </h3>
          <Link to="/swimmers" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: 'var(--space-2) var(--space-3)' }}>
            View All
          </Link>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Swimmer</th>
                <th>Club</th>
                <th>Events</th>
                <th>Points</th>
                <th>Medals</th>
              </tr>
            </thead>
            <tbody>
              {swimmerStandings.slice(0, 5).map((standing, index) => (
                <tr key={standing.swimmer.id}>
                  <td>
                    <span className={`position-badge ${index < 3 ? `position-${index + 1}` : ''}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td>
                    <strong>{standing.swimmer.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {standing.swimmer.birthYear}
                    </div>
                  </td>
                  <td>{standing.club.shortName || standing.club.name}</td>
                  <td>{standing.eventCount}</td>
                  <td className="points">{standing.totalPoints.toFixed(1)}</td>
                  <td>
                    <div className="medals">
                      {standing.goldMedals > 0 && <span className="medal medal-gold">G {standing.goldMedals}</span>}
                      {standing.silverMedals > 0 && <span className="medal medal-silver">S {standing.silverMedals}</span>}
                      {standing.bronzeMedals > 0 && <span className="medal medal-bronze">B {standing.bronzeMedals}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
