import React, { useState } from 'react';
import {
  CheckSquare, Square, Filter, CheckCircle2, Clock, Wrench,
  AlertTriangle, ArrowRight, Calendar, Search, Sparkles
} from 'lucide-react';
import { CultivationPlanResponse, CultivationTask } from '../types';
import { soundManager } from '../utils/audio';

interface OngoingCareChecklistViewProps {
  plan: CultivationPlanResponse | null;
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
  onOpenCultivationPlan: () => void;
}

export const OngoingCareChecklistView: React.FC<OngoingCareChecklistViewProps> = ({
  plan,
  onToggleTask,
  onOpenCultivationPlan
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [filterStage, setFilterStage] = useState<number>(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!plan) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <CheckSquare size={48} color="#2d6a4f" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No Cultivation Journey Selected</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Please select a crop and initialize a cultivation plan to access the care checklist.
        </p>
        <button className="btn btn-primary" onClick={onOpenCultivationPlan}>
          Go to Cultivation Plans
        </button>
      </div>
    );
  }

  // Flatten all tasks
  const allTasks: CultivationTask[] = [];
  plan.stages.forEach(s => {
    s.tasks.forEach(t => allTasks.push(t));
  });

  // Filter tasks
  const filteredTasks = allTasks.filter(t => {
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterStage !== 0 && t.stage_number !== filterStage) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q) ||
        t.stage_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = allTasks.filter(t => !t.completed).length;
  const completedCount = allTasks.filter(t => t.completed).length;

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
              Planting Date: {plan.planting_date}
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Ongoing Field Care Checklist</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.96rem', marginTop: '4px' }}>
            Track and check off sequential tasks. Changes automatically sync to your persistent SQLite record.
          </p>
        </div>

        <button className="btn btn-outline" onClick={onOpenCultivationPlan}>
          <span>View 9-Stage Plan</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #2d6a4f' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Completed Tasks</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-forest-dark)', marginTop: '2px' }}>
            {completedCount}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #d4a373' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tasks Remaining</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7f4f24', marginTop: '2px' }}>
            {pendingCount}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #52b788' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Overall Progress</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#163e27', marginTop: '2px' }}>
            {plan.progress_percentage}%
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Status:
          </span>
          <button
            className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'completed' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({completedCount})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({allTasks.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterStage}
            onChange={e => setFilterStage(parseInt(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.85rem', background: '#fff' }}
          >
            <option value={0}>All Stages (1-9)</option>
            {plan.stages.map(s => (
              <option key={s.stage_number} value={s.stage_number}>
                Stage {s.stage_number}: {s.stage_name}
              </option>
            ))}
          </select>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.85rem' }}
            />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
          </div>
        </div>
      </div>

      {/* Tasks Table / Checklist Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
            No tasks match the active filter criteria.
          </div>
        ) : (
          filteredTasks.map(t => (
            <div
              key={t.task_id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                background: t.completed ? '#f9fafb' : '#ffffff',
                borderLeft: t.completed ? '4px solid #2e7d32' : '4px solid var(--color-forest-medium)'
              }}
            >
              <button
                type="button"
                onClick={() => onToggleTask(t.task_id, !t.completed)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              >
                {t.completed ? <CheckSquare size={22} color="#15803d" /> : <Square size={22} color="#94a3b8" />}
              </button>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge" style={{ background: '#f4f6f0', color: 'var(--color-forest-dark)', fontSize: '0.72rem' }}>
                      {t.stage_name}
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: t.completed ? '#64748b' : 'var(--color-text-title)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                      {t.title}
                    </h4>
                  </div>
                  {t.completed_at && (
                    <span style={{ fontSize: '0.75rem', color: '#166534' }}>
                      Completed {new Date(t.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-body)', marginBottom: '8px' }}>
                  {t.purpose}
                </p>

                {/* Primary instructions preview */}
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Key Instruction:</strong> {t.instructions[0]}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
