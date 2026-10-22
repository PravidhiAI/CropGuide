import React from 'react';
import {
  GitCompare, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle,
  Calendar, Droplets, ShieldAlert, Layers, Archive, Award
} from 'lucide-react';
import { CropComparisonResponse } from '../types';
import { soundManager } from '../utils/audio';

interface CropComparisonViewProps {
  comparisonData: CropComparisonResponse | null;
  onBackToRecommendations: () => void;
  onSelectCropForPlan: (cropId: string) => void;
  onOpenJsonInspector: () => void;
}

export const CropComparisonView: React.FC<CropComparisonViewProps> = ({
  comparisonData,
  onBackToRecommendations,
  onSelectCropForPlan,
  onOpenJsonInspector
}) => {
  if (!comparisonData || comparisonData.compared_crops.length < 2) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <GitCompare size={48} color="#2d6a4f" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Crop Comparison Not Loaded</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Select 2 or 3 crops from the Recommendations page using the compare checkboxes.
        </p>
        <button className="btn btn-primary" onClick={onBackToRecommendations}>
          Back to Recommendations
        </button>
      </div>
    );
  }

  const { compared_crops, head_to_head_summary } = comparisonData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <button className="btn btn-outline btn-sm" onClick={onBackToRecommendations} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={14} />
            <span>Back to Crop List</span>
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Side-by-Side Crop Comparison</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.98rem', marginTop: '4px' }}>
            {head_to_head_summary}
          </p>
        </div>

        <button className="btn btn-outline" onClick={onOpenJsonInspector}>
          Inspect Comparison JSON
        </button>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: '20px' }}>
        {compared_crops.map(c => (
          <div
            key={c.crop_id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid var(--color-border-card)',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '14px', marginBottom: '16px' }}>
                <span className="badge" style={{ background: '#e8f5e9', color: '#1b4332', marginBottom: '6px' }}>
                  {c.crop_id.toUpperCase()}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-forest-dark)' }}>
                  {c.common_name}
                </h3>
                <span style={{ fontSize: '0.84rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                  {c.scientific_name}
                </span>
              </div>

              {/* Attributes Comparison Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Growing Window:
                  </span>
                  <strong>{c.growing_days}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={14} /> Frost Tolerance:
                  </span>
                  <span className="badge badge-frost" style={{ fontSize: '0.72rem' }}>
                    {c.frost_tolerance}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplets size={14} /> Water Demand:
                  </span>
                  <strong>{c.water_demand}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={14} /> Soil Flexibility:
                  </span>
                  <strong>{c.soil_flexibility}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Archive size={14} /> Storage Potential:
                  </span>
                  <strong>{c.storage_potential}</strong>
                </div>
              </div>

              {/* Key Advantages */}
              <div style={{ marginBottom: '14px' }}>
                <strong style={{ fontSize: '0.82rem', color: '#163e27', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Key Advantages
                </strong>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--color-text-body)' }}>
                  {c.key_advantages.map((a, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{a}</li>
                  ))}
                </ul>
              </div>

              {/* Primary Tradeoffs */}
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '0.82rem', color: '#7f4f24', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Primary Tradeoffs / Vulnerabilities
                </strong>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--color-text-body)' }}>
                  {c.primary_tradeoffs.map((t, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* Verdict */}
              <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.82rem', marginBottom: '18px' }}>
                <strong>Agronomic Verdict:</strong>
                <p style={{ marginTop: '2px', color: 'var(--color-text-body)' }}>{c.verdict}</p>
              </div>
            </div>

            <button
              className="btn btn-sage"
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => {
                soundManager.playSuccess();
                onSelectCropForPlan(c.crop_id);
              }}
            >
              <span>Adopt {c.common_name} Plan</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
