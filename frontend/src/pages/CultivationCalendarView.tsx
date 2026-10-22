import React from 'react';
import {
  Calendar as CalendarIcon, Clock, ArrowRight, CheckCircle2,
  AlertCircle, Sun, CloudSnow, Sprout, Layers
} from 'lucide-react';
import { CultivationPlanResponse } from '../types';
import { soundManager } from '../utils/audio';

interface CultivationCalendarViewProps {
  plan: CultivationPlanResponse | null;
  onOpenCultivationPlan: () => void;
  onOpenOngoingCare: () => void;
}

export const CultivationCalendarView: React.FC<CultivationCalendarViewProps> = ({
  plan,
  onOpenCultivationPlan,
  onOpenOngoingCare
}) => {
  if (!plan) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <CalendarIcon size={48} color="#2d6a4f" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No Cultivation Plan Active</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Initialize a cultivation plan to view the sequential calendar timeline.
        </p>
        <button className="btn btn-primary" onClick={onOpenCultivationPlan}>
          Go to Cultivation Plans
        </button>
      </div>
    );
  }

  // Parse planting date
  const baseDate = new Date(plan.planting_date);

  const STAGE_SCHEDULE = [
    { num: 1, name: 'Land Preparation', dayOffsetStart: -14, dayOffsetEnd: 0, color: '#3f2615', bg: '#fdf8f4', border: '#e8d4c2', icon: 'soil' },
    { num: 2, name: 'Sowing & Mulching', dayOffsetStart: 0, dayOffsetEnd: 5, color: '#163e27', bg: '#f0fdf4', border: '#bbf7d0', icon: 'seed' },
    { num: 3, name: 'Emergence & Thinning', dayOffsetStart: 6, dayOffsetEnd: 22, color: '#2d6a4f', bg: '#f0fdf4', border: '#86efac', icon: 'sprout' },
    { num: 4, name: 'Ongoing Care & Earthing', dayOffsetStart: 23, dayOffsetEnd: Math.round(plan.total_days_estimate * 0.7), color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', icon: 'care' },
    { num: 5, name: 'IPM Pest Scouting', dayOffsetStart: 15, dayOffsetEnd: plan.total_days_estimate, color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: 'scout' },
    { num: 6, name: 'Harvest Readiness Checks', dayOffsetStart: Math.round(plan.total_days_estimate * 0.85), dayOffsetEnd: plan.total_days_estimate, color: '#7f4f24', bg: '#fefce8', border: '#fef08a', icon: 'check' },
    { num: 7, name: 'Reaping & Harvesting', dayOffsetStart: plan.total_days_estimate, dayOffsetEnd: plan.total_days_estimate + 10, color: '#15803d', bg: '#f0fdf4', border: '#86efac', icon: 'harvest' },
    { num: 8, name: 'Curing & Cellar Storage', dayOffsetStart: plan.total_days_estimate + 11, dayOffsetEnd: plan.total_days_estimate + 25, color: '#432818', bg: '#faf5f0', border: '#ebd9c8', icon: 'store' },
    { num: 9, name: 'Season Review & Cover Crop', dayOffsetStart: plan.total_days_estimate + 26, dayOffsetEnd: plan.total_days_estimate + 35, color: '#1b4332', bg: '#f0fdf4', border: '#95d5b2', icon: 'review' }
  ];

  const calculateDate = (offset: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-highly-suitable">
              Crop: {plan.crop_name}
            </span>
            <span className="badge" style={{ background: '#f4f6f0', color: 'var(--color-text-body)' }}>
              Total Duration: ~{plan.total_days_estimate} Days
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Cultivation Calendar & Lifecycle Timeline</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.96rem', marginTop: '4px' }}>
            Calibrated stage milestone dates calculated from your verified planting date ({plan.planting_date}).
          </p>
        </div>

        <button className="btn btn-sage" onClick={onOpenOngoingCare}>
          <span>Open Daily Checklist</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Visual Gantt Stages Timeline */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> Sequential Timeline of the 9 Mountain Terrace Stages
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {STAGE_SCHEDULE.map(st => {
            const startDateStr = calculateDate(st.dayOffsetStart);
            const endDateStr = calculateDate(st.dayOffsetEnd);

            return (
              <div
                key={st.num}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: st.bg,
                  border: `1px solid ${st.border}`,
                  gap: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: st.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}
                  >
                    {st.num}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                      Stage {st.num}: {st.name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Days {st.dayOffsetStart} to {st.dayOffsetEnd} from planting
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                      {startDateStr} — {endDateStr}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-forest-medium)', background: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      {Math.max(1, st.dayOffsetEnd - st.dayOffsetStart)} Day Span
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
