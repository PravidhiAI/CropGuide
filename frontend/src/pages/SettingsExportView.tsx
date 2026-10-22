import React, { useState } from 'react';
import {
  Settings, Download, Volume2, VolumeX, RefreshCw, CheckCircle2,
  AlertTriangle, Server, FileText, Database, Trash2
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsExportViewProps {
  isBackendOnline: boolean;
  onCheckHealth: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  fullDataPayload?: any;
}

export const SettingsExportView: React.FC<SettingsExportViewProps> = ({
  isBackendOnline,
  onCheckHealth,
  isMuted,
  onToggleMute,
  fullDataPayload
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleExportFullJSON = () => {
    soundManager.playClick();
    const dataToExport = fullDataPayload || {
      exported_at: new Date().toISOString(),
      scenario: 'HIGH-ALTITUDE COLD TERRACE',
      note: 'TERRAFORM Agricultural Intelligence Platform Data'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terraform-assessment-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleClearAllLocalData = () => {
    if (confirm('Are you sure you want to clear your local session cache? This will reset your in-progress inputs.')) {
      soundManager.playClick();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '850px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Platform Settings & Data Export</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.96rem', marginTop: '4px' }}>
          Configure audio preferences, inspect local FastAPI service connectivity, and export full assessment datasets.
        </p>
      </div>

      {/* Export Section */}
      <div className="card">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Download size={20} color="#2d6a4f" /> Complete System Export
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Download your complete agricultural assessment dossier including land analysis, ranked recommendations, exclusions, 9-stage cultivation plan, and task checklists as a portable JSON package.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-sage btn-lg" onClick={handleExportFullJSON}>
            <Download size={18} />
            <span>Export Complete Assessment JSON</span>
          </button>
          {downloadSuccess && (
            <span style={{ fontSize: '0.85rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Export downloaded successfully!
            </span>
          )}
        </div>
      </div>

      {/* Audio Preferences */}
      <div className="card">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          {isMuted ? <VolumeX size={20} color="#64748b" /> : <Volume2 size={20} color="#2d6a4f" />}
          Sound Effects & Navigation Audio
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Synthesized Web Audio API feedback for step transitions, task completions, and button interactions.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <strong>Interactive Sound Effects</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Status: {isMuted ? 'Muted' : 'Enabled'}
            </p>
          </div>

          <button
            type="button"
            className={`btn ${isMuted ? 'btn-outline' : 'btn-primary'}`}
            onClick={onToggleMute}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isMuted ? 'Enable Sound' : 'Mute Sound'}</span>
          </button>
        </div>
      </div>

      {/* Backend Diagnostics */}
      <div className="card">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Server size={20} color="#0284c7" /> FastAPI Backend Diagnostics
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Live connection status with local REST API and SQLite persistence engine.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Configured Endpoint:</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`badge ${isBackendOnline ? 'badge-highly-suitable' : 'badge-excluded'}`}>
                {isBackendOnline ? 'ONLINE (200 OK)' : 'OFFLINE'}
              </span>
              <button className="btn btn-outline btn-sm" onClick={onCheckHealth}>
                <RefreshCw size={14} />
                <span>Ping</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            <span>Database: SQLite (local disk)</span>
            <span>API Docs: <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--color-forest-medium)', fontWeight: 600 }}>http://127.0.0.1:8000/docs</a></span>
          </div>
        </div>
      </div>

      {/* Reset Session Cache */}
      <div className="card" style={{ border: '1px solid #fee2e2' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#991b1b', marginBottom: '8px' }}>
          Reset Local Session Data
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
          Clears local browser cache and returns the questionnaire to default state. Does not delete SQLite database tables.
        </p>

        <button className="btn btn-outline btn-sm" style={{ color: '#b91c1c', borderColor: '#fca5a5' }} onClick={handleClearAllLocalData}>
          <Trash2 size={14} />
          <span>Clear Local Session</span>
        </button>
      </div>
    </div>
  );
};
