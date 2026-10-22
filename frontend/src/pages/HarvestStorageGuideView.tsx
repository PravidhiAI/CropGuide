import React from 'react';
import {
  BookOpen, Thermometer, Droplets, Sun, Wind, ShieldAlert,
  Archive, CheckCircle2, AlertTriangle, ArrowRight, Layers
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HarvestStorageGuideProps {
  cropName?: string;
  onOpenFieldJournal: () => void;
  onOpenCultivationPlan: () => void;
}

export const HarvestStorageGuideView: React.FC<HarvestStorageGuideProps> = ({
  cropName = 'High-Altitude Cold Terrace Crops',
  onOpenFieldJournal,
  onOpenCultivationPlan
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e8f5e9', color: '#1b4332', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
            <Archive size={14} /> Post-Harvest Preservation Protocol
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Harvesting & Long-Term Cold Storage Guide</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.96rem', marginTop: '4px' }}>
            Detailed step-by-step guidelines for harvesting without bruising, field sorting, curing, and mountain root cellar preservation.
          </p>
        </div>

        <button className="btn btn-sage" onClick={onOpenFieldJournal}>
          <span>Log Harvest in Field Journal</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 2 Main Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Stage 7: Reaping & Field Handling */}
        <div className="card" style={{ borderTop: '4px solid var(--color-forest-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', background: '#e8f5e9', borderRadius: '8px', color: '#163e27' }}>
              <Sun size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#163e27', textTransform: 'uppercase' }}>Stage 7</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Field Harvesting Execution</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <strong>1. Timing & Environmental Window:</strong>
              <p style={{ marginTop: '2px', color: 'var(--color-text-body)' }}>
                Harvest strictly during clear, crisp morning hours (8 AM - 11 AM) once dew has naturally evaporated from foliage. Never harvest during persistent rain, fog, or midday heat.
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <strong>2. Tool Technique & Bruise Prevention:</strong>
              <p style={{ marginTop: '2px', color: 'var(--color-text-body)' }}>
                Insert digging forks at least 25 cm away from the plant stem to prevent piercing tubers or roots. Gently loosen the soil before lifting the crown. Avoid dropping or throwing produce into collection crates.
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <strong>3. Field Sorting & Grading:</strong>
              <p style={{ marginTop: '2px', color: 'var(--color-text-body)' }}>
                Segregate produce immediately into two distinct containers:
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                <li><strong>Grade A (Long Storage):</strong> Completely sound, blemish-free, unbruised, and firm.</li>
                <li><strong>Grade B (Immediate Consumption):</strong> Minor fork cuts or insect damage (cook within 3-5 days).</li>
              </ul>
            </div>

            <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', color: '#991b1b' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} /> Do Not Wash Root Crops with Water!
              </strong>
              <p style={{ marginTop: '2px', fontSize: '0.82rem' }}>
                Washing raw roots before storage strips protective natural microorganisms and saturates pores, triggering rapid fungal soft rot in cold cellars. Simply brush off dry loose terrace dirt.
              </p>
            </div>
          </div>
        </div>

        {/* Stage 8: Curing & Root Cellar Storage */}
        <div className="card" style={{ borderTop: '4px solid var(--color-earth-amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px', color: '#b45309' }}>
              <Archive size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Stage 8</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Curing & Cold Cellar Storage</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <strong>1. The Curing Phase (First 10-14 Days):</strong>
              <p style={{ marginTop: '2px', color: 'var(--color-text-body)' }}>
                Place sound produce in a shaded, well-ventilated room at 15-18°C and 85% humidity. This process thickens outer skins, heals micro-abrasions, and converts surplus surface sugars.
              </p>
            </div>

            <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#1e40af' }}>2. High-Altitude Root Cellar Standards:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', fontSize: '0.82rem' }}>
                <div><strong>Temperature:</strong> 1°C - 4°C</div>
                <div><strong>Relative Humidity:</strong> 90% - 95%</div>
                <div><strong>Light Level:</strong> Total Darkness</div>
                <div><strong>Ventilation:</strong> Low passive draft</div>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <strong>3. Sand-Lined Box Technique:</strong>
              <p style={{ marginTop: '2px', color: 'var(--color-text-body)' }}>
                For root vegetables (carrots, turnips, radishes): Pack roots in alternating layers with clean, slightly damp mountain river sand in wooden crates. Prevents shriveling and preserves crispness for 4-6 months.
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <strong>4. Bi-Weekly Spoilage Patrol:</strong>
              <p style={{ marginTop: '2px', color: 'var(--color-text-body)' }}>
                Inspect storage bins every 14 days. One spoiling or soft potato emits ethylene gas and moisture that rots an entire crate within days. Remove culls immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
