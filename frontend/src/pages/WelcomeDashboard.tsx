import React from 'react';
import {
  Mountain, Compass, Zap, Sprout, ArrowRight, ShieldCheck,
  Award, CloudSnow, Layers, Droplets, BookOpen, ExternalLink
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WelcomeDashboardProps {
  onStartAssessment: () => void;
  onOpenLiveChallenge: () => void;
  onExploreCrops: () => void;
  isBackendOnline: boolean;
  totalCropsCount: number;
}

export const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({
  onStartAssessment,
  onOpenLiveChallenge,
  onExploreCrops,
  isBackendOnline,
  totalCropsCount
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0e2a1b 0%, #163e27 60%, #2d6a4f 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 40px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(82, 183, 136, 0.25)'
        }}
      >
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212, 163, 115, 0.2)', border: '1px solid #d4a373', padding: '4px 12px', borderRadius: 'var(--radius-full)', color: '#e9c46a', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
            <Mountain size={14} /> Assigned Land Scenario: High-Altitude Cold Terrace
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px', lineHeight: 1.15 }}>
            TERRAFORM
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#d8f3dc', lineHeight: 1.6, marginBottom: '28px' }}>
            An intelligent, explainable decision-support system guiding anyone—from beginner to mountain farmer—from natural field observation to crop selection, sequential terrace cultivation, biological pest IPM, and winter storage.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <button
              className="btn btn-gold btn-lg"
              onClick={() => {
                soundManager.playClick();
                onStartAssessment();
              }}
            >
              <Compass size={20} />
              <span>Start Land Assessment</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
              onClick={() => {
                soundManager.playClick();
                onOpenLiveChallenge();
              }}
            >
              <Zap size={20} color="#e9c46a" />
              <span>Judge Live Challenge Mode</span>
            </button>

            <button
              className="btn btn-lg"
              style={{ background: 'transparent', color: '#a7f3d0', border: '1px solid #52b788' }}
              onClick={() => {
                soundManager.playClick();
                onExploreCrops();
              }}
            >
              <Sprout size={20} />
              <span>Explore Crop Profiles{totalCropsCount ? ` (${totalCropsCount})` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Altitude Cold Terrace Characteristics */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="#2d6a4f" /> High-Altitude Cold Terrace Constraints & Reasoning
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1' }}>
                <CloudSnow size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Thermal Deficit & Frost Hazard</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-body)' }}>
              Nocturnal radiation frost threatens tender foliage. The recommendation engine applies hard exclusions against frost-sensitive species while tailoring micro-cloche and thermal stone solutions.
            </p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #b45309' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px', color: '#b45309' }}>
                <Mountain size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Terrace Slope & Erosion Dynamics</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-body)' }}>
              Mountain slopes risk topsoil wash-off and terrace riser slump during sudden snowmelt or downpours. Incorporates dry-stone batter stabilization and contour planting beds.
            </p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #15803d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px', color: '#15803d' }}>
                <Sprout size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Non-Laboratory Field Observations</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-body)' }}>
              Eliminates barriers of expensive chemical soil labs. Relies on tactile feel, water drainage behavior, soil color, and natural vegetation to infer fertility and physical structure.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Research Foundation */}
      <div className="card" style={{ background: '#fcfbf7', border: '1px solid #e5d8c5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <ShieldCheck size={22} color="#163e27" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-earth-dark)' }}>
            Agricultural Data &amp; Local Validation
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)', marginBottom: '16px' }}>
          Crop preferences shown in recommendations come from the supplied qualitative CSV and require local agronomic validation. Separate terrace, pest, and storage guidance is provided as decision support, not as a substitute for local extension advice:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-card)' }}>
            <strong style={{ fontSize: '0.88rem', color: 'var(--color-forest-dark)' }}>ICAR-CPRI Shimla</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Hill potato agronomy, late blight forecasting, and cold subterranean tuber storage.</p>
          </div>
          <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-card)' }}>
            <strong style={{ fontSize: '0.88rem', color: 'var(--color-forest-dark)' }}>ICAR-VPKAS Almora</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Mountain vegetable packages, terrace erosion control, and high-altitude peas/radish.</p>
          </div>
          <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-card)' }}>
            <strong style={{ fontSize: '0.88rem', color: 'var(--color-forest-dark)' }}>ICAR-IARI Katrain (Kullu)</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Temperate cruciferous breeding, snowball cauliflower, turnip, and cabbage agronomy.</p>
          </div>
          <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-card)' }}>
            <strong style={{ fontSize: '0.88rem', color: 'var(--color-forest-dark)' }}>ICAR-IIWBR & KVK Leh</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>High Himalayan hulless barley (Grim) and mountain pulse nitrogen fixation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
