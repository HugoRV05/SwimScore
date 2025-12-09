import { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Layers } from 'lucide-react';
import type { Event } from '../types';
import Select from '../components/ui/Select';

export default function EventBrowser() {
  const { meet } = useAppStore();
  const navigate = useNavigate();
  const [strokeFilter, setStrokeFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [distanceFilter, setDistanceFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'number' | 'distance' | 'entries'>('number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const distances = useMemo(() => {
    if (!meet) return [];
    const distSet = new Set(meet.events.map(e => e.distance));
    return Array.from(distSet).sort((a, b) => a - b);
  }, [meet]);
  
  const filteredEvents = useMemo(() => {
    if (!meet) return [];
    
    let events = meet.events.filter(event => {
      if (strokeFilter && event.stroke !== strokeFilter) return false;
      if (genderFilter && event.gender !== genderFilter) return false;
      if (typeFilter === 'relay' && !event.isRelay) return false;
      if (typeFilter === 'individual' && event.isRelay) return false;
      if (distanceFilter && event.distance !== parseInt(distanceFilter)) return false;
      return true;
    });

    // Sort events
    events.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case 'distance':
          aVal = a.distance;
          bVal = b.distance;
          break;
        case 'entries':
          aVal = a.results.length;
          bVal = b.results.length;
          break;
        default:
          aVal = a.number;
          bVal = b.number;
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return events;
  }, [meet, strokeFilter, genderFilter, typeFilter, distanceFilter, sortBy, sortDirection]);
  
  const getEventName = (event: Event) => {
    const prefix = event.isRelay ? `${event.relaySize || 4}x` : '';
    const distance = event.isRelay ? event.distance / (event.relaySize || 4) : event.distance;
    const strokeName = {
      freestyle: 'Libre',
      backstroke: 'Espalda',
      breaststroke: 'Braza',
      butterfly: 'Mariposa',
      medley: 'Estilos'
    }[event.stroke] || event.stroke;
    
    return `${prefix}${distance}m ${strokeName}`;
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'M';
      case 'female': return 'F';
      case 'mixed': return 'Mix';
      default: return gender;
    }
  };
  
  if (!meet) {
    return (
      <div>
        <header className="page-header">
          <h1 className="page-title">Event Browser</h1>
          <p className="page-subtitle">Browse all events and their results</p>
        </header>
        
        <div className="empty-state">
          <div className="empty-state-icon">
            <Calendar strokeWidth={1.5} />
          </div>
          <h3>No Meet Loaded</h3>
          <p>Upload a PDF file to browse events and view detailed results.</p>
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
        <h1 className="page-title">Event Browser</h1>
        <p className="page-subtitle">
          {meet.name} • {meet.events.length} events
        </p>
      </header>
      
      {/* Filters */}
      <div className="filters">
        <div className="filter-group" style={{ width: '180px' }}>
          <label>Stroke</label>
          <Select 
            value={strokeFilter}
            onChange={setStrokeFilter}
            options={[
              { value: '', label: 'All Strokes' },
              { value: 'freestyle', label: 'Libre (Freestyle)' },
              { value: 'backstroke', label: 'Espalda (Backstroke)' },
              { value: 'breaststroke', label: 'Braza (Breaststroke)' },
              { value: 'butterfly', label: 'Mariposa (Butterfly)' },
              { value: 'medley', label: 'Estilos (Medley)' }
            ]}
          />
        </div>

        <div className="filter-group" style={{ width: '140px' }}>
          <label>Distance</label>
          <Select 
            value={distanceFilter}
            onChange={setDistanceFilter}
            options={[
              { value: '', label: 'All Dist' },
              ...distances.map(dist => ({ value: dist.toString(), label: `${dist}m` }))
            ]}
          />
        </div>
        
        <div className="filter-group" style={{ width: '140px' }}>
          <label>Gender</label>
          <Select 
            value={genderFilter}
            onChange={setGenderFilter}
            options={[
              { value: '', label: 'All' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'mixed', label: 'Mixed' }
            ]}
          />
        </div>
        
        <div className="filter-group" style={{ width: '140px' }}>
          <label>Type</label>
          <Select 
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '', label: 'All Types' },
              { value: 'individual', label: 'Individual' },
              { value: 'relay', label: 'Relay' }
            ]}
          />
        </div>

        <div className="filter-group" style={{ width: '200px' }}>
          <label>Sort By</label>
          <Select 
            value={`${sortBy}-${sortDirection}`}
            onChange={(val) => {
              const [sort, dir] = val.split('-');
              setSortBy(sort as 'number' | 'distance' | 'entries');
              setSortDirection(dir as 'asc' | 'desc');
            }}
            options={[
              { value: 'number-asc', label: 'Event # (Asc)' },
              { value: 'number-desc', label: 'Event # (Desc)' },
              { value: 'distance-asc', label: 'Distance (Short first)' },
              { value: 'distance-desc', label: 'Distance (Long first)' },
              { value: 'entries-desc', label: 'Most Entries' },
              { value: 'entries-asc', label: 'Least Entries' }
            ]}
          />
        </div>
      </div>

      {/* Results Count */}
      <div style={{ 
        marginBottom: 'var(--space-4)', 
        fontSize: '0.875rem', 
        color: 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}>
        <Layers size={16} />
        Showing {filteredEvents.length} of {meet.events.length} events
      </div>
      
      {/* Events Grid */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '60px' }}>Gender</th>
                <th>Event</th>
                <th style={{ width: '80px' }}>Type</th>
                <th style={{ width: '80px' }}>Category</th>
                <th style={{ width: '80px' }}>Entries</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr 
                  key={event.id} 
                  onClick={() => navigate(`/events/${event.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: 'var(--color-accent-subtle)', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: 'var(--color-accent)'
                    }}>
                      {event.number}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '2px 8px', 
                      background: event.gender === 'male' 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : event.gender === 'female' 
                          ? 'rgba(236, 72, 153, 0.15)' 
                          : 'rgba(168, 85, 247, 0.15)',
                      color: event.gender === 'male' 
                        ? '#3b82f6' 
                        : event.gender === 'female' 
                          ? '#ec4899' 
                          : '#a855f7',
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {getGenderLabel(event.gender)}
                    </span>
                  </td>
                  <td>
                    <strong>{getEventName(event)}</strong>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '2px 8px', 
                      background: event.isRelay ? 'rgba(34, 197, 94, 0.15)' : 'var(--color-bg-tertiary)',
                      color: event.isRelay ? '#22c55e' : 'var(--color-text-muted)',
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {event.isRelay ? 'Relay' : 'Indiv'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {event.category}
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>
                    {event.results.length}
                  </td>
                  <td>
                    <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
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
