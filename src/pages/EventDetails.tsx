import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { secondsToTime } from '../lib/textParser';

export default function EventDetails() {
  const { eventId } = useParams();
  const { meet } = useAppStore();
  const { t } = useLanguage();

  if (!meet) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <h2>{t('eventDetails.noMeet')}</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
          {t('eventDetails.goHome')}
        </Link>
      </div>
    );
  }

  const event = meet.events.find(e => e.id === eventId);

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <h2>{t('eventDetails.notFound')}</h2>
        <Link to="/events" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
          {t('eventDetails.backToEvents')}
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
    // If disqualified
    if (result.disqualified) {
       return { text: t('eventDetails.status.dq'), color: "var(--color-destructive)", icon: <XCircle size={14} /> };
    }

    // Scoring in both
    if (result.openEligible && result.openPoints > 0) {
      if (result.categoryEligible && result.categoryPoints > 0) {
        return { text: t('eventDetails.status.scoringOpenCat'), color: "var(--color-success)", icon: <CheckCircle size={14} /> };
      }
      return { text: t('eventDetails.status.scoringOpen'), color: "var(--color-success)", icon: <CheckCircle size={14} /> };
    }
    
    // Scoring only in Category
    if (result.categoryEligible && result.categoryPoints > 0) {
      // If open failed, might want to show why? But usually "Scoring Cat" implies open failed.
      // We can check why open failed if we really want, but simpler is keep "Scoring Cat" positive.
      return { text: t('eventDetails.status.scoringCat'), color: "var(--color-info)", icon: <CheckCircle size={14} /> };
    }

    // Not scoring... check reasons
    // Check Open reason first if it exists and is negative
    if (result.openStatusReason && result.openStatusReason !== 'ok') {
       if (result.openStatusReason === 'time_limit') return { text: t('eventDetails.status.timeLimit'), color: "var(--color-warning)", icon: <AlertCircle size={14} /> };
       if (result.openStatusReason === 'club_limit') return { text: t('eventDetails.status.clubLimit'), color: "var(--color-text-muted)", icon: <XCircle size={14} /> };
       if (result.openStatusReason === 'dq') return { text: t('eventDetails.status.dq'), color: "var(--color-destructive)", icon: <XCircle size={14} /> };
    }

    // Check Category reason
    if (result.categoryStatusReason && result.categoryStatusReason !== 'ok') {
       if (result.categoryStatusReason === 'time_limit') return { text: t('eventDetails.status.timeLimit'), color: "var(--color-warning)", icon: <AlertCircle size={14} /> };
       if (result.categoryStatusReason === 'club_limit') return { text: t('eventDetails.status.clubLimit'), color: "var(--color-text-muted)", icon: <XCircle size={14} /> };
    }

    if (result.swimmerCategory === 'open' && !result.openEligible) {
      return { text: t('eventDetails.status.notEligible'), color: "var(--color-text-muted)", icon: <XCircle size={14} /> };
    }
    
    // Explicit not eligible reasons would be better if we tracked them, but for now:
    if (!result.openEligible && !result.categoryEligible) {
      return { text: t('eventDetails.status.noPoints'), color: "var(--color-text-muted)", icon: <XCircle size={14} /> };
    }

    return { text: t('eventDetails.status.seePoints'), color: "var(--color-text-secondary)", icon: <AlertCircle size={14} /> };
  };

  return (
    <div>
      <header className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/events" className="back-button">
          <ArrowLeft size={20} /> {t('eventDetails.backToEvents')}
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
            {event.gender === 'male' ? t('common.male') : event.gender === 'female' ? t('common.female') : t('common.mixed')}
          </span>
        </div>
        <p className="page-subtitle" style={{ marginTop: 'var(--space-2)' }}>
          {t('eventDetails.entries', { n: event.results.length })} • {event.category} • {event.isRelay ? t('eventDetails.relayEvent') : t('eventDetails.individualEvent')}
        </p>
      </header>

      {/* Qualifying Times Info */}
      {event.qualifyingTimes && (
          <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
              {t('eventBrowser.qualifyingTimes.title')}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
              {event.qualifyingTimes.open && (
                <div style={{ color: 'var(--color-accent)' }}>
                  <span style={{ fontWeight: '600' }}>{t('eventBrowser.qualifyingTimes.open')}</span> {secondsToTime(event.qualifyingTimes.open)}
                </div>
              )}
              {event.qualifyingTimes.byAge && Object.entries(event.qualifyingTimes.byAge).map(([age, time]) => (
                <div key={age} style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ fontWeight: '600' }}>{t('eventBrowser.qualifyingTimes.age', { age })}</span> {secondsToTime(time as number)}
                </div>
              ))}
            </div>
          </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>{t('common.pos')}</th>
                <th>{event.isRelay ? t('eventDetails.table.clubTeam') : t('common.swimmer')}</th>
                {!event.isRelay && <th>{t('swimmerRankings.table.year')}</th>}
                {!event.isRelay && <th>{t('swimmerRankings.table.cat')}</th>}
                {!event.isRelay && <th>{t('common.club')}</th>}
                <th style={{ fontFamily: 'monospace' }}>{t('eventDetails.table.time')}</th>
                <th>{t('swimmerRankings.table.openPts')}</th>
                {!event.isRelay && <th>{t('swimmerRankings.table.catPts')}</th>}
                <th>{t('eventDetails.table.status')}</th>
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
                          ? `${result.club.name} ${result.relayTeamNumber ? `(${t('common.team')} ${result.relayTeamNumber})` : ''}`
                          : result.swimmer?.name || t('common.unknown')
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
