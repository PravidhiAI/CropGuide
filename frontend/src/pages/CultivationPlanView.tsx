import React, { useState } from 'react';
import {
  Calendar, CheckSquare, Square, Wrench, ShieldAlert, CheckCircle,
  Clock, ArrowRight, ChevronDown, ChevronUp, AlertCircle, BookOpen, Layers
} from 'lucide-react';
import { CultivationPlanResponse, CultivationStage, CultivationTask } from '../types';
import { soundManager } from '../utils/audio';

interface CultivationPlanViewProps {
  plan: CultivationPlanResponse | null;
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
  onOpenCareChecklist: () => void;
  onOpenHarvestReadiness: () => void;
  onOpenJsonInspector: () => void;
  onSelectAnotherCrop: () => void;
}

export const CultivationPlanView: React.FC<CultivationPlanViewProps> = ({
  plan,
  onToggleTask,
  onOpenCareChecklist,
  onOpenHarvestReadiness,
  onOpenJsonInspector,
  onSelectAnotherCrop
}) => {
  const [expandedStages, setExpandedStages] = useState<number[]>([1, 2]);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  if (!plan) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Calendar size={48} color="#2d6a4f" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No Active Cultivation Plan</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Select a recommended crop to generate a customized 9-stage cultivation journey.
        </p>
        <button className="btn btn-primary" onClick={onSelectAnotherCrop}>
          Browse Recommended Crops
        </button>
      </div>
    );
  }

  const toggleStage = (stageNum: number) => {
    soundManager.playClick();
    setExpandedStages(prev =>
      prev.includes(stageNum) ? prev.filter(n => n !== stageNum) : [...prev, stageNum]
    );
  };

  const handleTaskCheckbox = async (task: CultivationTask) => {
    soundManager.playClick();
    setUpdatingTaskId(task.task_id);
    try {
      await onToggleTask(task.task_id, !task.completed);
      if (!task.completed) {
        soundManager.playSuccess();
      }
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Plan Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge" style={{ background: '#e8f5e9', color: '#1b4332' }}>
              Plan ID: {plan.plan_id}
            </span>
            <span className="badge" style={{ background: '#eff6ff', color: '#1e40af' }}>
              Planting: {plan.planting_date}
            </span>
            <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
              Harvest Window: {plan.estimated_harvest_window}
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            9-Stage Cultivation Journey: {plan.crop_name}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Scientific species reference: {plan.scientific_name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={onSelectAnotherCrop}>
            Switch Crop
          </button>
          <button className="btn btn-outline btn-sm" onClick={onOpenJsonInspector}>
            Inspect Plan JSON
          </button>
          <button className="btn btn-sage" onClick={onOpenCareChecklist}>
            <CheckSquare size={16} />
            <span>Daily Care Tracker</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #163e27, #2d6a4f)', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a7f3d0' }}>
              Overall Cultivation Completion
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              {plan.progress_percentage}% Complete
            </h3>
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#d8f3dc' }}>
            {plan.completed_tasks_count} of {plan.total_tasks_count} Tasks Accomplished
          </span>
        </div>

        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${plan.progress_percentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #e9c46a, #52b788)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* 9 Stages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {plan.stages.map(stage => {
          const isExpanded = expandedStages.includes(stage.stage_number);
          const completedInStage = stage.tasks.filter(t => t.completed).length;
          const stageComplete = completedInStage === stage.tasks.length;

          return (
            <div
              key={stage.stage_number}
              className="card"
              style={{
                border: stageComplete ? '1px solid #86efac' : '1px solid var(--color-border-card)',
                padding: '0',
                overflow: 'hidden'
              }}
            >
              {/* Stage Header Banner */}
              <div
                onClick={() => toggleStage(stage.stage_number)}
                style={{
                  padding: '18px 24px',
                  background: stageComplete ? '#f0fdf4' : 'var(--color-bg-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: isExpanded ? '1px solid var(--color-border-subtle)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: stageComplete ? '#2e7d32' : 'var(--color-forest-medium)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}
                  >
                    {stageComplete ? <CheckCircle size={18} /> : stage.stage_number}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                        Stage {stage.stage_number}: {stage.stage_name}
                      </h3>
                      <span className="badge" style={{ background: '#ffffff', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-subtle)' }}>
                        {stage.estimated_day_range}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {stage.stage_description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: stageComplete ? '#2e7d32' : 'var(--color-text-muted)' }}>
                    {completedInStage}/{stage.tasks.length} Completed
                  </span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Stage Tasks List */}
              {isExpanded && (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {stage.tasks.map(task => (
                    <div
                      key={task.task_id}
                      style={{
                        padding: '16px',
                        background: task.completed ? '#f9fafb' : '#ffffff',
                        borderRadius: 'var(--radius-md)',
                        border: task.completed ? '1px solid #d1fae5' : '1px solid var(--color-border-card)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <button
                          type="button"
                          onClick={() => handleTaskCheckbox(task)}
                          disabled={updatingTaskId === task.task_id}
                          style={{
                            marginTop: '2px',
                            color: task.completed ? '#2e7d32' : '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          {task.completed ? (
                            <CheckSquare size={22} color="#15803d" />
                          ) : (
                            <Square size={22} />
                          )}
                        </button>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                            <h4
                              style={{
                                fontSize: '1.02rem',
                                fontWeight: 700,
                                color: task.completed ? '#64748b' : 'var(--color-text-title)',
                                textDecoration: task.completed ? 'line-through' : 'none'
                              }}
                            >
                              Step {task.step_number}: {task.title}
                            </h4>

                            {task.completed && task.completed_at && (
                              <span style={{ fontSize: '0.75rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12} /> Done {new Date(task.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-body)', marginBottom: '8px' }}>
                            <strong>Purpose:</strong> {task.purpose}
                          </p>

                          {/* Tools & Materials */}
                          {task.tools_materials && task.tools_materials.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--color-earth-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Wrench size={12} /> Tools:
                              </span>
                              {task.tools_materials.map((tl, ti) => (
                                <span key={ti} style={{ fontSize: '0.74rem', background: '#f5f5f4', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid #e7e5e4' }}>
                                  {tl}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Instructions */}
                          <div style={{ marginBottom: '10px' }}>
                            <strong style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Execution Steps:
                            </strong>
                            <ol style={{ paddingLeft: '20px', fontSize: '0.84rem', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {task.instructions.map((inst, ii) => (
                                <li key={ii}>{inst}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Expected Result & Safety */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
                            <div style={{ padding: '8px 10px', background: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', color: '#166534' }}>
                              <strong>Expected Result:</strong> {task.expected_result}
                            </div>
                            {task.safety_notes && (
                              <div style={{ padding: '8px 10px', background: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', color: '#991b1b' }}>
                                <strong>Safety / Caution:</strong> {task.safety_notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
