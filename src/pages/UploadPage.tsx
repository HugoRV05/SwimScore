import { useCallback, useState } from 'react';
import { useAppStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function UploadPage() {
  const { loadPDF, isLoading, parseError, meet, rawText } = useAppStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [dragOver, setDragOver] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      loadPDF(file);
    }
  }, [loadPDF]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadPDF(file);
    }
  }, [loadPDF]);
  
  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('upload.title')}</h1>
        <p className="page-subtitle">{t('upload.subtitle')}</p>
      </header>
      
      {/* Upload Zone */}
      <div 
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {isLoading ? (
          <>
            <Loader size={64} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <h3>{t('upload.dropZone.processing')}</h3>
            <p>{t('upload.dropZone.extracting')}</p>
          </>
        ) : (
          <>
            <Upload size={64} strokeWidth={1} />
            <h3>{t('upload.dropZone.dragDrop')}</h3>
            <p>{t('upload.dropZone.browse')}</p>
          </>
        )}
      </div>
      
      {/* Error State */}
      {parseError && (
        <div className="card" style={{ marginTop: 'var(--space-6)', borderColor: 'var(--color-error)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', color: 'var(--color-error)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <h4 style={{ margin: 0 }}>{t('upload.error')}</h4>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginLeft: '0' }}>{parseError}</p>
          </div>
        </div>
      )}
      
      {/* Success State */}
      {meet && !parseError && (
        <div className="card" style={{ marginTop: 'var(--space-6)', borderColor: 'var(--color-success)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', color: 'var(--color-success)' }}>
              <CheckCircle size={24} style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ margin: 0 }}>{t('upload.success.title')}</h4>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                  {t('upload.success.message', { n: meet.events.length })}
                </p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
              {t('upload.success.viewDashboard')}
            </button>
          </div>
        </div>
      )}
      
      {/* Parsed Events Preview */}
      {meet && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-title">{t('upload.preview.title')}</h3>
          </div>
          
          <div className="table-container" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>{t('eventBrowser.table.number')}</th>
                  <th>{t('eventBrowser.table.event')}</th>
                  <th>{t('eventBrowser.filters.distance')}</th>
                  <th>{t('eventBrowser.filters.stroke')}</th>
                  <th>{t('eventBrowser.table.gender')}</th>
                  <th>{t('upload.preview.title').split(' ')[0]} {t('eventBrowser.table.entries')} (Approx)</th>
                </tr>
              </thead>
              <tbody>
                {meet.events.map(event => (
                  <tr key={event.id}>
                    <td>{event.number}</td>
                    <td>
                      {event.isRelay ? `${t('eventBrowser.tags.relay')}` : `${t('eventBrowser.filters.individual')}`}
                    </td>
                    <td>{event.distance}m</td>
                    <td style={{ textTransform: 'capitalize' }}>{event.stroke}</td>
                    <td style={{ textTransform: 'capitalize' }}>{event.gender}</td>
                    <td>{event.results.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Raw Text Preview (Debug) */}
      {rawText && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-title">
              <FileText size={18} style={{ marginRight: 'var(--space-2)' }} />
              {t('upload.preview.raw')}
            </h3>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowRawText(!showRawText)}
              style={{ fontSize: '0.75rem', padding: 'var(--space-2) var(--space-3)' }}
            >
              {showRawText ? t('upload.preview.hide') : t('upload.preview.show')}
            </button>
          </div>
          
          {showRawText && (
            <pre style={{ 
              maxHeight: '400px', 
              overflow: 'auto', 
              padding: 'var(--space-4)', 
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {rawText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
