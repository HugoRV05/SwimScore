import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function EventDetails() {
  const { eventId } = useParams();
  const { meet } = useAppStore();

  if (!meet) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <h2>No meet loaded</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
          Go Home
        </Link>
      </div>
    );
  }

  const event = meet.events.find(e => e.id === eventId);

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <h2>Event not found</h2>
        <Link to="/events" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
          Back to Events
        </Link>
      </div>
    );
  }

  const getEventName = (evt: typeof event) => {
    const prefix = evt.isRelay ? `${evt.relaySize || 4}x` : '';
    const distance = evt.isRelay ? evt.distance / (evt.relaySize || 4) : evt.distance;
    const strokeName = {
      freestyle: 'Libre',
      backstroke: 'Espalda',
      breaststroke: 'Braza',
      butterfly: 'Mariposa',
      medley: 'Estilos'
    }[evt.stroke] || evt.stroke;
    
    return `${prefix}${distance}m ${strokeName}`;
  };

  const getStatus = (result: typeof event.results[0]) => {
    if (result.openEligible && result.openPoints > 0) {
      if (result.categoryEligible && result.categoryPoints > 0) {
        return { text: "Scoring (Open & Cat)", color: "var(--color-success)", icon: <CheckCircle size={14} /> };
      }
      return { text: "Scoring (Open Only)", color: "var(--color-success)", icon: <CheckCircle size={14} /> };
    }
    
    if (result.categoryEligible && result.categoryPoints > 0) {
      return { text: "Scoring (Category Only)", color: "var(--color-info)", icon: <CheckCircle size={14} /> };
    }

    if (result.swimmerCategory === 'open' && !result.openEligible) {
      return { text: "Not Eligible (Open)", color: "var(--color-text-muted)", icon: <XCircle size={14} /> };
    }
    
    // Explicit not eligible reasons would be better if we tracked them, but for now:
    if (!result.openEligible && !result.categoryEligible) {
      return { text: "No Points", color: "var(--color-text-muted)", icon: <XCircle size={14} /> };
    }

    return { text: "See Points", color: "var(--color-text-secondary)", icon: <AlertCircle size={14} /> };
  };

  return (
    <div>
      <header className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/events" className="back-button">
          <ArrowLeft size={20} /> Back to Events
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {getEventName(event)}
          </h1>
          <span style={{ 
            padding: '4px 12px', 
            background: 'var(--color-bg-tertiary)', 
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            #{event.number}
          </span>
          <span style={{ 
            padding: '4px 12px', 
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
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {event.gender === 'male' ? 'Male' : event.gender === 'female' ? 'Female' : 'Mixed'}
          </span>
        </div>
        <p className="page-subtitle" style={{ marginTop: 'var(--space-2)' }}>
          {event.results.length} total entries • {event.category} • {event.isRelay ? 'Relay Event' : 'Individual Event'}
        </p>
      </header>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Pos</th>
                <th>{event.isRelay ? 'Club / Team' : 'Swimmer'}</th>
                {!event.isRelay && <th>Year</th>}
                {!event.isRelay && <th>Cat</th>}
                {!event.isRelay && <th>Club</th>}
                <th style={{ fontFamily: 'monospace' }}>Time</th>
                <th>Open Pts</th>
                {!event.isRelay && <th>Cat Pts</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {event.results.map((result, index) => {
                const status = getStatus(result);
                return (
                  <tr key={index} style={{ opacity: (result.openEligible || result.categoryEligible) ? 1 : 0.6 }}>
                    <td>
                      <span className={`position-badge ${index < 3 ? `position-${index + 1}` : ''}`}>
                        {result.position}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem' }}>
                        {event.isRelay 
                          ? `${result.club.name} ${result.relayTeamNumber ? `(Team ${result.relayTeamNumber})` : ''}`
                          : result.swimmer?.name || 'Unknown'
                        }
                      </strong>
                    </td>
                    {!event.isRelay && <td>{result.swimmer?.birthYear}</td>}
                    {!event.isRelay && (
                      <td>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: result.swimmerCategory === 'u14' 
                            ? 'var(--color-warning)' 
                            : result.swimmerCategory === 'junior' 
                              ? 'var(--color-info)' 
                              : 'var(--color-bg-tertiary)',
                          color: result.swimmerCategory === 'open' ? 'var(--color-text-muted)' : 'white'
                        }}>
                          {result.swimmerCategory?.toUpperCase() || 'OPEN'}
                        </span>
                      </td>
                    )}
                    {!event.isRelay && (
                      <td style={{ color: 'var(--color-text-secondary)' }}>
                        {result.club.name}
                      </td>
                    )}
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{result.time}</td>
                    <td>
                      {result.openPoints > 0 ? (
                        <span className="points">{result.openPoints}</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>
                    {!event.isRelay && (
                       <td>
                        {result.categoryPoints > 0 ? (
                          <span className="points" style={{ color: 'var(--color-text-primary)' }}>{result.categoryPoints}</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                        )}
                      </td>
                    )}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: status.color, fontSize: '0.8rem', fontWeight: '500' }}>
                        {status.icon}
                        {status.text}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
