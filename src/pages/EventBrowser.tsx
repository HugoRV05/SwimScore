import { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Layers } from 'lucide-react';
import type { Event } from '../types';
import Select from '../components/ui/Select';
import { useLanguage } from '../context/LanguageContext';

export default function EventBrowser() {
  const { meet } = useAppStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
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
          <h1 className="page-title">{t('eventBrowser.title')}</h1>
          <p className="page-subtitle">{t('eventBrowser.subtitle')}</p>
        </header>
        
        <div className="empty-state">
          <div className="empty-state-icon">
            <Calendar strokeWidth={1.5} />
          </div>
          <h3>{t('eventBrowser.empty.title')}</h3>
          <p>{t('eventBrowser.empty.message')}</p>
          <Link to="/upload" className="btn btn-primary btn-upload">
            {t('common.uploadPdf')}
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('eventBrowser.title')}</h1>
        <p className="page-subtitle">
          {t('eventBrowser.subtitleWithMeet', { meet: meet.name, n: meet.events.length })}
        </p>
      </header>
      
      {/* Filters */}
      <div className="filters">
        <div className="filter-group" style={{ width: '180px' }}>
          <label>{t('eventBrowser.filters.stroke')}</label>
          <Select 
            value={strokeFilter}
            onChange={setStrokeFilter}
            options={[
              { value: '', label: t('eventBrowser.filters.allStrokes') },
              { value: 'freestyle', label: t('eventBrowser.filters.freestyle') },
              { value: 'backstroke', label: t('eventBrowser.filters.backstroke') },
              { value: 'breaststroke', label: t('eventBrowser.filters.breaststroke') },
              { value: 'butterfly', label: t('eventBrowser.filters.butterfly') },
              { value: 'medley', label: t('eventBrowser.filters.medley') }
            ]}
          />
        </div>

        <div className="filter-group" style={{ width: '140px' }}>
          <label>{t('eventBrowser.filters.distance')}</label>
          <Select 
            value={distanceFilter}
            onChange={setDistanceFilter}
            options={[
              { value: '', label: t('eventBrowser.filters.allDist') },
              ...distances.map(dist => ({ value: dist.toString(), label: `${dist}m` }))
            ]}
          />
        </div>
        
        <div className="filter-group" style={{ width: '140px' }}>
          <label>{t('eventBrowser.filters.gender')}</label>
          <Select 
            value={genderFilter}
            onChange={setGenderFilter}
            options={[
              { value: '', label: t('common.allGenders') },
              { value: 'male', label: t('common.male') },
              { value: 'female', label: t('common.female') },
              { value: 'mixed', label: t('common.mixed') }
            ]}
          />
        </div>
        
        <div className="filter-group" style={{ width: '140px' }}>
          <label>{t('eventBrowser.filters.type')}</label>
          <Select 
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '', label: t('eventBrowser.filters.allTypes') },
              { value: 'individual', label: t('eventBrowser.filters.individual') },
              { value: 'relay', label: t('eventBrowser.filters.relay') }
            ]}
          />
        </div>

        <div className="filter-group" style={{ width: '200px' }}>
          <label>{t('eventBrowser.filters.sortBy')}</label>
          <Select 
            value={`${sortBy}-${sortDirection}`}
            onChange={(val) => {
              const [sort, dir] = val.split('-');
              setSortBy(sort as 'number' | 'distance' | 'entries');
              setSortDirection(dir as 'asc' | 'desc');
            }}
            options={[
              { value: 'number-asc', label: t('eventBrowser.filters.numberAsc') },
              { value: 'number-desc', label: t('eventBrowser.filters.numberDesc') },
              { value: 'distance-asc', label: t('eventBrowser.filters.distanceAsc') },
              { value: 'distance-desc', label: t('eventBrowser.filters.distanceDesc') },
              { value: 'entries-desc', label: t('eventBrowser.filters.entriesDesc') },
              { value: 'entries-asc', label: t('eventBrowser.filters.entriesAsc') }
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
        {t('eventBrowser.showing', { n: filteredEvents.length, m: meet.events.length })}
      </div>
      
      {/* Events Grid */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>{t('eventBrowser.table.number')}</th>
                <th style={{ width: '60px' }}>{t('eventBrowser.table.gender')}</th>
                <th>{t('eventBrowser.table.event')}</th>
                <th style={{ width: '80px' }}>{t('eventBrowser.table.type')}</th>
                <th className="hide-mobile" style={{ width: '80px' }}>{t('eventBrowser.table.category')}</th>
                <th className="hide-mobile" style={{ width: '80px' }}>{t('eventBrowser.table.entries')}</th>
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
                      {event.isRelay ? t('eventBrowser.tags.relay') : t('eventBrowser.tags.indiv')}
                    </span>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {event.category}
                  </td>
                  <td className="hide-mobile" style={{ fontSize: '0.875rem' }}>
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
