import React from 'react';
import { X, Sprout, Calendar, Droplets, Thermometer, ShieldAlert, Award, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface CropDetailModalProps {
  crop: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForPlan?: (cropId: string) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  isOpen,
  onClose,
  onSelectForPlan
}) => {
  if (!isOpen || !crop) return null;

  const cult = crop.cultivation_specs || {};
  const storage = crop.storage_requirements || {};
  const climate = crop.suitable_climatic_conditions || {};
  const frost = crop.frost_sensitivity || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #163e27, #2d6a4f)', color: '#fff' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                {crop.id.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#d8f3dc', fontStyle: 'italic' }}>
                {crop.scientific_name}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800 }}>{crop.common_name}</h2>
          </div>
          <button onClick={onClose} style={{ color: '#fff', padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '14px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Thermometer size={14} color="#2d6a4f" /> Altitude Range
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-text-title)' }}>
                {crop.altitude_range_m ? `${crop.altitude_range_m.min}m - ${crop.altitude_range_m.max}m` : '1200m - 3200m'}
              </div>
            </div>

            <div style={{ padding: '14px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="#2d6a4f" /> Growing Season
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-text-title)' }}>
                {crop.growing_season?.min_days} - {crop.growing_season?.max_days} Days
              </div>
            </div>

            <div style={{ padding: '14px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} color="#0369a1" /> Frost Tolerance
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-text-title)' }}>
                {frost.rating?.replace('_', ' ').toUpperCase()} ({frost.foliage_damage_temp_c}°C)
              </div>
            </div>

            <div style={{ padding: '14px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Droplets size={14} color="#0284c7" /> Water Demand
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-text-title)' }}>
                {crop.water_needs?.demand_level?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Cultivation Specs */}
          <div style={{ padding: '18px', background: '#fcfbf7', borderRadius: 'var(--radius-md)', border: '1px solid #ebd9c8' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-earth-dark)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sprout size={16} /> Verified Sowing & Spacing Specifications
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div><strong>Method:</strong> {cult.method?.replace('_', ' ').toUpperCase()}</div>
              <div><strong>Depth:</strong> {cult.planting_depth_cm} cm</div>
              <div><strong>Plant Spacing:</strong> {cult.plant_spacing_cm} cm</div>
              <div><strong>Row Spacing:</strong> {cult.row_spacing_cm} cm</div>
              <div><strong>Germination:</strong> {cult.germination_days}</div>
            </div>
            {cult.seed_prep && (
              <p style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                <strong>Seed Prep:</strong> {cult.seed_prep}
              </p>
            )}
          </div>

          {/* Growth Stages Timeline */}
          {crop.growth_stages && crop.growth_stages.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-title)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="#2d6a4f" /> Crop Developmental Stages
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {crop.growth_stages.map((st: any) => (
                  <div key={st.stage} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <span className="badge" style={{ background: '#1b4332', color: '#fff', alignSelf: 'flex-start' }}>
                      Stage {st.stage}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.88rem' }}>{st.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Days {st.days}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-body)', marginTop: '2px' }}>{st.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Specs */}
          <div style={{ padding: '16px', background: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px' }}>
              Cold Storage & Post-Harvest Specs
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.82rem' }}>
              <div><strong>Optimal Temp:</strong> {storage.long_term_temp_c || '0-4°C'}</div>
              <div><strong>Relative Humidity:</strong> {storage.humidity_percent || '85-95%'}</div>
              <div><strong>Shelf Life:</strong> {storage.shelf_life_months || '1-3 months'}</div>
              <div><strong>Light:</strong> {storage.light_condition || 'Dark'}</div>
            </div>
            {storage.curing && (
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#1e40af' }}>
                <strong>Curing Protocol:</strong> {storage.curing}
              </p>
            )}
          </div>

          {/* Research References */}
          {crop.agricultural_sources && (
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <BookOpen size={14} color="#7f4f24" /> Verified Agricultural Research Sources
              </h4>
              <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {crop.agricultural_sources.map((src: string, i: number) => (
                  <li key={i}>{src}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {onSelectForPlan && (
            <button
              className="btn btn-sage"
              onClick={() => {
                onSelectForPlan(crop.id);
                onClose();
              }}
            >
              <span>Adopt this Crop Plan</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
