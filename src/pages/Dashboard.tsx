import { useAppStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp,
  FileSearch,
  Medal,
  Award,
  ChevronRight,
  Timer
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import '../dashboard.css';

export default function Dashboard() {
  const { meet, clubStandings, swimmerStandings, scoringConfig } = useAppStore();
  const { t } = useLanguage();
  
  // -- Empty State --
  if (!meet) {
    return (
      <div className="dashboard-container">
        <header className="page-header center-text">
          <h1 className="hero-title">{t('dashboard.welcome.title')}</h1>
          <p className="hero-subtitle">{t('dashboard.welcome.message')}</p>
        </header>
        
        <div className="empty-state-card">
          <div className="empty-icon-wrapper">
            <FileSearch size={48} strokeWidth={1} />
          </div>
          <h3>{t('dashboard.ready.title')}</h3>
          <p>{t('dashboard.ready.message')}</p>
          <Link to="/upload" className="btn btn-primary btn-lg btn-upload">
            {t('common.uploadPdf')}
          </Link>
        </div>
      </div>
    );
  }
  
  // -- Data Prep --
  const totalEvents = meet.events.length;
  const totalClubs = clubStandings.length;
  const totalSwimmers = swimmerStandings.length;

  // Chart Data: Top 5 Clubs
  const chartData = clubStandings.slice(0, 5).map(c => ({
    name: c.club.name.length > 15 ? c.club.name.substring(0, 12) + '...' : c.club.name,
    points: c.totalPoints,
    fullname: c.club.name
  }));

  const top3Clubs = clubStandings.slice(0, 3);
  const topSwimmers = swimmerStandings.slice(0, 5);

  return (
    <div className="dashboard-wrapper">
      {/* -- Hero Section -- */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="meet-badge">
            <span className="live-dot"></span>
            {t('dashboard.live')}
          </div>
          <h1 className="meet-title">{meet.name}</h1>
          <div className="meet-meta">
            <span><Calendar size={14} /> {meet.date}</span>
            <span className="separator">•</span>
            <span><Timer size={14} /> {scoringConfig.name}</span>
          </div>
        </div>
        <div className="hero-stats">
           <div className="mini-stat">
             <span className="label">{t('dashboard.stats.events')}</span>
             <span className="value">{totalEvents}</span>
           </div>
           <div className="mini-stat">
             <span className="label">{t('dashboard.stats.athletes')}</span>
             <span className="value">{totalSwimmers}</span>
           </div>
           <div className="mini-stat">
             <span className="label">{t('dashboard.stats.clubs')}</span>
             <span className="value">{totalClubs}</span>
           </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* -- Left Col: Podium & Chart -- */}
        <div className="main-col">
          
          {/* Podium Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <Trophy className="section-icon gold" />
                <h3>{t('dashboard.podium.title')}</h3>
              </div>
              <Link to="/clubs" className="text-link">{t('dashboard.podium.viewFull')} <ChevronRight size={14} /></Link>
            </div>
            
            <div className="podium-container">
              {/* 2nd Place */}
              {top3Clubs[1] && (
                <div className="podium-step step-2">
                  <div className="podium-rank">2</div>
                  <div className="podium-pillar">
                    <div className="pillar-content">
                      <span className="score">{top3Clubs[1].totalPoints.toFixed(0)}</span>
                      <span className="pts-label">{t('dashboard.podium.pts')}</span>
                    </div>
                  </div>
                  <div className="podium-info">
                    <span className="club-name">{top3Clubs[1].club.name}</span>
                    <div className="medals-row">
                      <span className="medal-pill silver">{top3Clubs[1].goldMedals} G</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 1st Place */}
              {top3Clubs[0] && (
                <div className="podium-step step-1">
                  <Award className="crown-icon" />
                  <div className="podium-rank">1</div>
                  <div className="podium-pillar">
                     <div className="pillar-content">
                      <span className="score">{top3Clubs[0].totalPoints.toFixed(0)}</span>
                      <span className="pts-label">{t('dashboard.podium.pts')}</span>
                    </div>
                  </div>
                  <div className="podium-info">
                    <span className="club-name highlight">{top3Clubs[0].club.name}</span>
                    <div className="medals-row">
                      <span className="medal-pill gold">{top3Clubs[0].goldMedals} G</span>
                    </div>
                  </div>
                </div>
               )}

              {/* 3rd Place */}
              {top3Clubs[2] && (
                <div className="podium-step step-3">
                  <div className="podium-rank">3</div>
                  <div className="podium-pillar">
                    <div className="pillar-content">
                      <span className="score">{top3Clubs[2].totalPoints.toFixed(0)}</span>
                      <span className="pts-label">{t('dashboard.podium.pts')}</span>
                    </div>
                  </div>
                  <div className="podium-info">
                    <span className="club-name">{top3Clubs[2].club.name}</span>
                    <div className="medals-row">
                      <span className="medal-pill bronze">{top3Clubs[2].goldMedals} G</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Points Distribution Chart */}
          <section className="dashboard-section glass-panel">
            <div className="section-header">
               <div className="section-title-wrapper">
                <TrendingUp className="section-icon" />
                <h3>{t('dashboard.charts.pointsVariance')}</h3>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-elevated)', 
                      borderColor: 'var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--color-text-primary)'
                    }}
                    itemStyle={{ color: 'var(--color-accent)' }}
                  />
                  <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-accent)' : 'var(--color-accent-subtle)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

        </div>

        {/* -- Right Col: Swimmers "Leaderboard" -- */}
        <div className="side-col">
          <section className="dashboard-panel full-height">
             <div className="panel-header">
               <Users size={20} className="text-secondary" />
               <h3>{t('dashboard.topAthletes.title')}</h3>
               <Link to="/swimmers" className="icon-btn" aria-label={t('dashboard.topClubs.viewAll')}>
                 <ChevronRight size={16} />
               </Link>
             </div>
             
             <div className="mini-list">
               {topSwimmers.map((swimmer, idx) => (
                 <div key={swimmer.swimmer.id} className="mini-list-item">
                   <div className={`rank-dot rank-${idx + 1}`}>{idx + 1}</div>
                   <div className="item-content">
                     <span className="item-name">{swimmer.swimmer.name}</span>
                     <span className="item-sub">{swimmer.club.name} • {swimmer.swimmer.birthYear}</span>
                   </div>
                   <div className="item-stats">
                     <span className="points-badge">{swimmer.totalPoints.toFixed(0)}</span>
                     {swimmer.goldMedals > 0 && (
                        <span className="medal-mini">
                          <Medal size={10} className="text-gold" /> {swimmer.goldMedals}
                        </span>
                     )}
                   </div>
                 </div>
               ))}
               
               {/* "See More" pseudo-item if needed */}
               <div className="mini-list-footer">
                  <Link to="/swimmers" className="btn btn-ghost btn-sm btn-block">
                    {t('dashboard.topAthletes.seeAll')}
                  </Link>
               </div>
             </div>
          </section>
        </div>
      </div>
      
      {/* -- Inline Styles for Dashboard Specific elements -- */}
      {/* 
         In a real production app, I'd move these to index.css or a module.
         For this "creative sprint", I'm keeping them scoped here or will add to index.css next tool call.
         I'll add the necessary classes to index.css in the next step to ensure clean code.
      */}
    </div>
  );
}
