import React, { useState } from 'react';
import {
  ShieldAlert, CheckCircle, AlertTriangle, Calendar, Droplets,
  ArrowRight, Wrench, Clock, CheckSquare, Square, Thermometer
} from 'lucide-react';
import { HarvestAssessmentResponse } from '../types';
import { api } from '../services/api';
import { soundManager } from '../utils/audio';

interface HarvestReadinessViewProps {
  cropId?: string;
  cropName?: string;
  plantingDate?: string;
  onOpenStorageGuide: () => void;
  onOpenJsonInspector: () => void;
}

export const HarvestReadinessView: React.FC<HarvestReadinessViewProps> = ({
  cropId = 'barley',
  cropName = 'Barley (Jau)',
  plantingDate,
  onOpenStorageGuide,
  onOpenJsonInspector
}) => {
  // Calculate approximate days since planting
  const defaultDays = 95;
  const [daysSincePlanting, setDaysSincePlanting] = useState<number>(defaultDays);
  const [weatherForecast, setWeatherForecast] = useState<string>('dry_sunny');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    indicator_1: true,
    indicator_2: true,
    indicator_3: false
  });

  const [assessmentResult, setAssessmentResult] = useState<HarvestAssessmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleCheck = (key: string) => {
    soundManager.playClick();
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEvaluateReadiness = async () => {
    soundManager.playClick();
    setIsLoading(true);
    try {
      const res = await api.assessHarvestReadiness({
        crop_id: cropId,
        days_since_planting: daysSincePlanting,
        checklist_answers: checklist,
        weather_forecast: weatherForecast
      });
      setAssessmentResult(res);
      soundManager.playSuccess();
    } catch (err: any) {
      alert(err.message || 'Error evaluating readiness');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-highly-suitable">
              Crop: {cropName}
            </span>
            {plantingDate && (
              <span className="badge" style={{ background: '#f4f6f0', color: 'var(--color-text-body)' }}>
                Planting: {plantingDate}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Harvest Readiness Assessment</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.96rem', marginTop: '4px' }}>
            Inspect observable morphological cues and local mountain weather to avoid premature picking or storage spoilage.
          </p>
        </div>

        {assessmentResult && (
          <button className="btn btn-outline" onClick={onOpenJsonInspector}>
            Inspect Harvest JSON
          </button>
        )}
      </div>

      {/* Input Parameters Card */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          Maturity Verification Parameters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
              Days Elapsed Since Planting:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                min={10}
                max={200}
                value={daysSincePlanting}
                onChange={e => setDaysSincePlanting(parseInt(e.target.value) || 0)}
                style={{ width: '110px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '1rem', fontWeight: 700 }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Days in terrace soil
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
              Expected Weather Forecast (Next 48 Hours):
            </label>
            <select
              value={weatherForecast}
              onChange={e => setWeatherForecast(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem', background: '#fff' }}
            >
              <option value="dry_sunny">Clear, Dry & Sunny Mountain Weather (Ideal)</option>
              <option value="impending_rain">Impending Heavy Rain / Monsoon Downpour</option>
              <option value="impending_frost">Severe Nocturnal Frost / Snow Warning</option>
            </select>
          </div>
        </div>

        {/* Observable Signs Checklist */}
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: '10px' }}>
          Observable Morphological Indicators (Check all confirmed):
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {[
            { key: 'indicator_1', label: 'Primary Foliage Senescence', desc: 'Foliage naturally turning yellow/drying down (>75% haulm death or outer leaves yellowing)' },
            { key: 'indicator_2', label: 'Firmness & Dimension Standard', desc: 'Tubers/heads resist thumb depression, reach characteristic size, and feel dense' },
            { key: 'indicator_3', label: 'Skin / Rind Slip Test', desc: 'Outer skin does not slip or peel when rubbed firmly with thumb (critical for storage)' }
          ].map(ind => (
            <div
              key={ind.key}
              onClick={() => toggleCheck(ind.key)}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: checklist[ind.key] ? '#f0fdf4' : 'var(--color-bg-subtle)',
                border: checklist[ind.key] ? '1px solid #86efac' : '1px solid var(--color-border-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {checklist[ind.key] ? <CheckSquare size={20} color="#16a34a" /> : <Square size={20} color="#94a3b8" />}
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-title)' }}>{ind.label}</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{ind.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-gold btn-lg" onClick={handleEvaluateReadiness} disabled={isLoading}>
            <span>{isLoading ? 'Calculating Readiness...' : 'Evaluate Harvest Readiness'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Results Section */}
      {assessmentResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Banner */}
          <div
            className="card"
            style={{
              background: assessmentResult.readiness_status === 'ready_for_harvest'
                ? 'linear-gradient(135deg, #163e27, #2d6a4f)'
                : (assessmentResult.readiness_status === 'approaching_maturity' ? '#fffbeb' : '#fef2f2'),
              color: assessmentResult.readiness_status === 'ready_for_harvest' ? '#ffffff' : 'inherit',
              border: '1px solid var(--color-border-card)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.25)', color: assessmentResult.readiness_status === 'ready_for_harvest' ? '#fff' : '#1e3a8a', marginBottom: '6px' }}>
                  {assessmentResult.readiness_status.replace('_', ' ').toUpperCase()}
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {assessmentResult.maturity_percentage}% Ready for Harvest
                </h3>
                <p style={{ fontSize: '0.92rem', marginTop: '4px', maxWidth: '650px' }}>
                  {assessmentResult.readiness_summary}
                </p>
              </div>

              {assessmentResult.readiness_status === 'ready_for_harvest' && (
                <button
                  className="btn btn-gold"
                  onClick={onOpenStorageGuide}
                >
                  <span>Step-by-Step Harvesting Guide</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Weather Guidance & Reasons to Delay */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
              <strong style={{ fontSize: '0.86rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Droplets size={16} /> Weather & Soil Condition Advice
              </strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-body)' }}>
                {assessmentResult.weather_guidance}
              </p>
            </div>

            {assessmentResult.reasons_to_delay && assessmentResult.reasons_to_delay.length > 0 && (
              <div className="card" style={{ borderLeft: '4px solid #b45309' }}>
                <strong style={{ fontSize: '0.86rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <AlertTriangle size={16} /> Reasons to Delay Harvest
                </strong>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--color-text-body)' }}>
                  {assessmentResult.reasons_to_delay.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Harvest Tools Needed */}
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={16} color="#2d6a4f" /> Required Harvest Tools:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {assessmentResult.harvest_tools_needed.map((tool, ti) => (
                <span key={ti} className="badge" style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-forest-dark)', padding: '6px 12px', fontSize: '0.82rem' }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
