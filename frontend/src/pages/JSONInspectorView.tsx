import React, { useState } from 'react';
import {
  Code, Copy, Check, Download, RefreshCw, Layers, CheckCircle2,
  ExternalLink, ArrowUpRight, Search, FileJson
} from 'lucide-react';
import { RecordedApiCall } from '../services/api';
import { soundManager } from '../utils/audio';

interface JSONInspectorViewProps {
  recordedCalls: RecordedApiCall[];
  onClearHistory: () => void;
}

export const JSONInspectorView: React.FC<JSONInspectorViewProps> = ({
  recordedCalls,
  onClearHistory
}) => {
  const [selectedCallId, setSelectedCallId] = useState<string>(
    recordedCalls.length > 0 ? recordedCalls[0].id : ''
  );
  const [activeTab, setActiveTab] = useState<'response' | 'request' | 'full'>('response');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedCall = recordedCalls.find(c => c.id === selectedCallId) || recordedCalls[0];

  let displayData: any = {};
  if (selectedCall) {
    if (activeTab === 'response') {
      displayData = selectedCall.responsePayload;
    } else if (activeTab === 'request') {
      displayData = selectedCall.requestPayload;
    } else {
      displayData = {
        endpoint: selectedCall.endpoint,
        method: selectedCall.method,
        status: selectedCall.status,
        timestamp: selectedCall.timestamp,
        duration_ms: selectedCall.durationMs,
        request: selectedCall.requestPayload,
        response: selectedCall.responsePayload
      };
    }
  }

  const jsonString = JSON.stringify(displayData, null, 2);

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundManager.playClick();
    const endpointName = selectedCall ? selectedCall.endpoint.replace(/[^a-zA-Z0-9]/g, '_') : 'api_data';
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terraform-${endpointName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e8f5e9', color: '#1b4332', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
            <FileJson size={14} /> Full API Telemetry & Payload Inspector
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Backend JSON Inspector</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.96rem', marginTop: '4px' }}>
            Inspect genuine structured JSON responses emitted from the FastAPI SQLite services. No mock data.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={onClearHistory}>
            <RefreshCw size={14} />
            <span>Clear Trace History</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleCopy}>
            {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button className="btn btn-sage btn-sm" onClick={handleDownload}>
            <Download size={14} />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {recordedCalls.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <Code size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>No Recorded API Calls Yet</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Interact with the Land Assessment, Recommendations, Cultivation Plan, or Live Challenge to populate live telemetry.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: '20px' }}>
          {/* History Sidebar */}
          <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '75vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: '8px' }}>
              Recorded Exchange History ({recordedCalls.length})
            </h3>

            {recordedCalls.map(c => {
              const isSelected = (selectedCall?.id === c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedCallId(c.id);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--color-forest-medium)' : 'var(--color-bg-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-title)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '1px solid var(--color-forest-dark)' : '1px solid var(--color-border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {c.method}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: c.status === 200 ? (isSelected ? 'rgba(255,255,255,0.25)' : '#dcfce7') : '#fee2e2',
                        color: c.status === 200 ? (isSelected ? '#fff' : '#15803d') : '#991b1b',
                        fontWeight: 700
                      }}
                    >
                      HTTP {c.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 600, wordBreak: 'break-all' }}>
                    {c.endpoint}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: isSelected ? '#a7f3d0' : 'var(--color-text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{new Date(c.timestamp).toLocaleTimeString()}</span>
                    <span>{c.durationMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Call Inspector */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: '#1b4332', color: '#a7f3d0', fontFamily: 'var(--font-mono)' }}>
                  {selectedCall?.endpoint}
                </span>
                <span className="badge" style={{ background: selectedCall?.status === 200 ? '#e8f5e9' : '#fee2e2', color: selectedCall?.status === 200 ? '#15803d' : '#991b1b' }}>
                  Status: {selectedCall?.status}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Latency: {selectedCall?.durationMs}ms
                </span>
              </div>

              <div style={{ display: 'flex', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', overflow: 'hidden' }}>
                <button
                  className={`btn btn-sm ${activeTab === 'response' ? 'btn-primary' : ''}`}
                  onClick={() => setActiveTab('response')}
                >
                  Response
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'request' ? 'btn-primary' : ''}`}
                  onClick={() => setActiveTab('request')}
                >
                  Request
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'full' ? 'btn-primary' : ''}`}
                  onClick={() => setActiveTab('full')}
                >
                  Full Exchange
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, maxHeight: '68vh', overflowY: 'auto', background: '#111a14' }}>
              <pre className="json-code" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                {jsonString}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
