import { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Users } from 'lucide-react';
import Select from '../components/ui/Select';

export default function SwimmerRankings() {
  const { meet, swimmerStandings } = useAppStore();
  const [sortBy, setSortBy] = useState<'totalPoints' | 'openPoints' | 'categoryPoints' | 'medals' | 'events' | 'avgPos'>('totalPoints');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pointsView, setPointsView] = useState<'total' | 'open' | 'category'>('total');
  
  const clubs = useMemo(() => {
    const clubSet = new Set(swimmerStandings.map(s => s.club.name));
    return Array.from(clubSet).sort();
  }, [swimmerStandings]);

  const categories = useMemo(() => {
    const catSet = new Set(swimmerStandings.map(s => s.category).filter(Boolean));
    return Array.from(catSet).sort();
  }, [swimmerStandings]);
  
  const sortedStandings = useMemo(() => {
    let standings = [...swimmerStandings];
    
    // Filter by search
    if (searchTerm) {
      standings = standings.filter(s => 
        s.swimmer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by club
    if (clubFilter) {
      standings = standings.filter(s => s.club.name === clubFilter);
    }

    // Filter by category
    if (categoryFilter) {
      standings = standings.filter(s => s.category === categoryFilter);
    }
    
    // Sort
    standings.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case 'medals':
          aVal = a.goldMedals * 100 + a.silverMedals * 10 + a.bronzeMedals;
          bVal = b.goldMedals * 100 + b.silverMedals * 10 + b.bronzeMedals;
          break;
        case 'events':
          aVal = a.eventCount;
          bVal = b.eventCount;
          break;
        case 'avgPos':
          aVal = a.averagePosition || 999;
          bVal = b.averagePosition || 999;
          // Lower is better for position, so flip the comparison
          return sortDirection === 'desc' ? aVal - bVal : bVal - aVal;
        case 'openPoints':
          aVal = a.openPoints || 0;
          bVal = b.openPoints || 0;
          break;
        case 'categoryPoints':
          aVal = a.categoryPoints || 0;
          bVal = b.categoryPoints || 0;
          break;
        case 'totalPoints':
        default:
          if (pointsView === 'open') {
             aVal = a.openPoints || 0;
             bVal = b.openPoints || 0;
          } else if (pointsView === 'category') {
             aVal = a.categoryPoints || 0;
             bVal = b.categoryPoints || 0;
          } else {
             aVal = a.totalPoints;
             bVal = b.totalPoints;
          }
      }
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
    
    return standings;
  }, [swimmerStandings, sortBy, sortDirection, searchTerm, clubFilter, categoryFilter, pointsView]);
  
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortDirection(column === 'avgPos' ? 'asc' : 'desc');
    }
  };
  
  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null;
    return sortDirection === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  const getDisplayPoints = (standing: typeof swimmerStandings[0]) => {
     if (pointsView === 'open') return standing.openPoints || 0;
     if (pointsView === 'category') return standing.categoryPoints || 0;
     return standing.totalPoints;
  };
  
  if (!meet) {
    return (
      <div>
        <header className="page-header">
          <h1 className="page-title">Swimmer Rankings</h1>
          <p className="page-subtitle">View individual swimmer standings</p>
        </header>
        
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users strokeWidth={1.5} />
          </div>
          <h3>No Meet Loaded</h3>
          <p>Upload a PDF file to view swimmer rankings and individual performances.</p>
          <Link to="/upload" className="btn btn-primary">
            Upload PDF
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Swimmer Rankings</h1>
        <p className="page-subtitle">
          {meet.name} • {swimmerStandings.length} swimmers
        </p>
      </header>
      
      {/* Filters */}
      <div className="filters">
        <div className="filter-group" style={{ flex: 1, maxWidth: '280px' }}>
          <label>Search Swimmers</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>
        
        <div className="filter-group" style={{ width: '200px' }}>
          <label>Club</label>
          <Select 
            value={clubFilter}
            onChange={setClubFilter}
            options={[
              { value: '', label: 'All Clubs' },
              ...clubs.map(club => ({ value: club, label: club }))
            ]}
          />
        </div>

        <div className="filter-group" style={{ width: '180px' }}>
          <label>Category</label>
          <Select 
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map(cat => ({ value: (cat as string), label: (cat as string).toUpperCase() }))
            ]}
          />
        </div>

        <div className="filter-group" style={{ width: '200px' }}>
          <label>Points View</label>
          <Select 
            value={pointsView}
            onChange={(val) => setPointsView(val as 'total' | 'open' | 'category')}
            options={[
              { value: 'total', label: 'Total Points' },
              { value: 'open', label: 'Open Points Only' },
              { value: 'category', label: 'Category Points Only' }
            ]}
          />
        </div>
      </div>
      
      {/* Rankings Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Swimmer</th>
                <th>Club</th>
                <th>Year</th>
                <th>Cat</th>
                <th 
                  onClick={() => handleSort('events')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Evts <SortIcon column="events" />
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('avgPos')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    AvgPos <SortIcon column="avgPos" />
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('totalPoints')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {pointsView === 'open' ? 'Open Pts' : pointsView === 'category' ? 'Cat Pts' : 'Points'} <SortIcon column="totalPoints" />
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('medals')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Medals <SortIcon column="medals" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStandings.map((standing, index) => (
                <tr key={standing.swimmer.id}>
                  <td>
                    <span className={`position-badge ${index < 3 ? `position-${index + 1}` : ''}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td>
                    <strong>{standing.swimmer.name}</strong>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {standing.club.name}
                  </td>
                  <td>{standing.swimmer.birthYear}</td>
                  <td>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      background: standing.category === 'u14' 
                        ? 'var(--color-warning)' 
                        : standing.category === 'junior' 
                          ? 'var(--color-info)' 
                          : 'var(--color-bg-tertiary)',
                      color: standing.category === 'open' ? 'var(--color-text-muted)' : 'white'
                    }}>
                      {standing.category?.toUpperCase() || 'OPEN'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{standing.eventCount}</td>
                  <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    {standing.averagePosition.toFixed(1)}
                  </td>
                  <td className="points" style={{ textAlign: 'center' }}>
                    {getDisplayPoints(standing).toFixed(0)}
                  </td>
                  <td>
                    <div className="medals">
                      {standing.goldMedals > 0 && (
                        <span className="medal medal-gold">G {standing.goldMedals}</span>
                      )}
                      {standing.silverMedals > 0 && (
                        <span className="medal medal-silver">S {standing.silverMedals}</span>
                      )}
                      {standing.bronzeMedals > 0 && (
                        <span className="medal medal-bronze">B {standing.bronzeMedals}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="stats-grid" style={{ marginTop: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{sortedStandings.length}</h3>
            <p>Total Swimmers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{sortedStandings.filter(s => s.goldMedals > 0).length}</h3>
            <p>Gold Medal Winners</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {sortedStandings.length > 0 
                ? (sortedStandings.reduce((sum, s) => sum + s.eventCount, 0) / sortedStandings.length).toFixed(1)
                : '0'
              }
            </h3>
            <p>Avg Events per Swimmer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
