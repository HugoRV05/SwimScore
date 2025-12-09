import { useCallback, useState } from 'react';
import { useAppStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function UploadPage() {
  const { loadPDF, isLoading, parseError, meet, rawText } = useAppStore();
  const navigate = useNavigate();
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
        <h1 className="page-title">Upload Results PDF</h1>
        <p className="page-subtitle">Upload a Splash Meet Manager PDF to analyze competition results</p>
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
            <h3>Processing PDF...</h3>
            <p>Extracting text and parsing results</p>
          </>
        ) : (
          <>
            <Upload size={64} strokeWidth={1} />
            <h3>Drag & Drop PDF Here</h3>
            <p>or click to browse files</p>
          </>
        )}
      </div>
      
      {/* Error State */}
      {parseError && (
        <div className="card" style={{ marginTop: 'var(--space-6)', borderColor: 'var(--color-error)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-error)' }}>
            <AlertCircle />
            <div>
              <h4>Error Parsing PDF</h4>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>{parseError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Success State */}
      {meet && !parseError && (
        <div className="card" style={{ marginTop: 'var(--space-6)', borderColor: 'var(--color-success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-success)' }}>
            <CheckCircle />
            <div style={{ flex: 1 }}>
              <h4>PDF Loaded Successfully!</h4>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                Found {meet.events.length} events with results
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              View Dashboard
            </button>
          </div>
        </div>
      )}
      
      {/* Parsed Events Preview */}
      {meet && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-title">📋 Parsed Events</h3>
          </div>
          
          <div className="table-container" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Distance</th>
                  <th>Stroke</th>
                  <th>Gender</th>
                  <th>Results</th>
                </tr>
              </thead>
              <tbody>
                {meet.events.map(event => (
                  <tr key={event.id}>
                    <td>{event.number}</td>
                    <td>
                      {event.isRelay ? '🏁 Relay' : '🏊 Individual'}
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
              Raw Extracted Text
            </h3>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowRawText(!showRawText)}
              style={{ fontSize: '0.75rem', padding: 'var(--space-2) var(--space-3)' }}
            >
              {showRawText ? 'Hide' : 'Show'}
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
