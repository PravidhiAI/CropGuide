import React from 'react';
import {
  Activity, CheckCircle, AlertTriangle, AlertCircle, HelpCircle,
  ArrowRight, ShieldAlert, Wrench, RefreshCw, Layers, CheckSquare
} from 'lucide-react';
import { LandAnalysisOutput, StepProtocolItem } from '../types';
import { soundManager } from '../utils/audio';

const TEN_STEP_PROTOCOL: StepProtocolItem[] = [
  {
    step_number: 1,
    title: 'STEP 1 - INPUT ECHO',
    tagline: 'Photo intake and faithful observation echo',
    description: 'Restate the grower’s notes and visible clues without presenting uncertain image details as facts.'
  },
  {
    step_number: 2,
    title: 'STEP 2 - MISSING ANALYSIS',
    tagline: 'Soil archetype and missing field checks',
    description: 'Identify what remains unknown, including season length, frost dates, soil depth, and sunlight; suggest simple checks using household items.'
  },
  {
    step_number: 3,
    title: 'STEP 3 - FIX PROTOCOL',
    tagline: 'Practical terrace and soil improvements',
    description: 'Give practical, measured steps for terrace repair, stone sorting, compost, mulch, and frost protection.'
  },
  {
    step_number: 4,
    title: 'STEP 4 - NEXT ACTION',
    tagline: 'Readiness gate before sowing',
    description: 'Check that the wall is stable, soil is workable, frost protection is ready, and the bed is not too cold before planting.'
  },
  {
    step_number: 5,
    title: 'STEP 5 - CROP SUGGESTIONS',
    tagline: 'Crop choices from the supplied CSV database',
    description: 'Compare plantable crops against the observed season, frost risk, soil, sunlight, water, and growing goal.'
  },
  {
    step_number: 6,
    title: 'STEP 6 - TIMEFRAME',
    tagline: 'Maturity window and cold-growth buffer',
    description: 'Compare each crop’s source growing-season description with the available season; allow extra time for cold conditions and flag uncertainty.'
  },
  {
    step_number: 7,
    title: 'STEP 7 - PLANTING METHOD',
    tagline: 'Sowing, frost cover, and water preparation',
    description: 'Explain plot preparation, seedling protection, and warming very cold irrigation water before use.'
  },
  {
    step_number: 8,
    title: 'STEP 8 - ONGOING CARE',
    tagline: 'Growth stages, cold-soil care, and pest watch',
    description: 'Plan stage-based care, frost-night handling, suitable soil improvement, and monitoring for pests or disease.'
  },
  {
    step_number: 9,
    title: 'STEP 9 - HARVEST',
    tagline: 'Ripeness signs, harvest, and storage',
    description: 'Use visible and touchable maturity signs, harvest before damaging frost where appropriate, and follow crop-specific storage guidance.'
  },
  {
    step_number: 10,
    title: 'STEP 10 - SOIL REGENERATION',
    tagline: 'Post-harvest recovery and terrace upkeep',
    description: 'Restore soil cover, retain healthy residues, and inspect terrace structures before the next season.'
  }
];

interface LandAnalysisViewProps {
  analysis: LandAnalysisOutput | null;
  onProceedToRecommendations: () => void;
  onReevaluateAssessment: () => void;
  onOpenJsonInspector: () => void;
}

export const LandAnalysisView: React.FC<LandAnalysisViewProps> = ({
  analysis,
  onProceedToRecommendations,
  onReevaluateAssessment,
  onOpenJsonInspector
}) => {
  if (!analysis) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Activity size={48} color="#2d6a4f" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No Active Land Assessment</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Please complete the natural field assessment questionnaire first to generate an engineering land analysis.
        </p>
        <button className="btn btn-primary" onClick={onReevaluateAssessment}>
          Start Land Assessment
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Overview Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge" style={{ background: '#e8f5e9', color: '#1b4332' }}>
              Assessment ID: {analysis.assessment_id}
            </span>
            <span className={`badge ${analysis.confidence_level === 'high' ? 'badge-highly-suitable' : (analysis.confidence_level === 'medium' ? 'badge-moderately-suitable' : 'badge-conditionally-suitable')}`}>
              Confidence: {analysis.confidence_level.toUpperCase()}
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Terrace Land Analysis</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '1.05rem', marginTop: '6px' }}>
            {analysis.plain_language_summary}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={onReevaluateAssessment}>
            <RefreshCw size={14} />
            <span>Edit Observations</span>
          </button>
          <button className="btn btn-sage" onClick={onProceedToRecommendations}>
            <span>View Recommended Crops</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Conflicting Inputs / Follow-up Questions Warning */}
      {analysis.conflicts_detected && analysis.conflicts_detected.length > 0 && (
        <div style={{ padding: '18px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', fontWeight: 700, marginBottom: '8px' }}>
            <AlertTriangle size={20} />
            <span>Observation Conflicts Detected</span>
          </div>
          <ul style={{ paddingLeft: '24px', fontSize: '0.88rem', color: '#7f1d1d', marginBottom: '12px' }}>
            {analysis.conflicts_detected.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          {analysis.follow_up_questions && analysis.follow_up_questions.length > 0 && (
            <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5' }}>
              <strong style={{ fontSize: '0.84rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={15} /> Clarifying Question to Resolve Conflict:
              </strong>
              <p style={{ fontSize: '0.86rem', color: '#450a0a', marginTop: '4px' }}>
                {analysis.follow_up_questions[0]}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Observed Facts vs Inferred Conditions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-forest-dark)' }}>
            <CheckCircle size={18} color="#2d6a4f" /> Observed Physical Facts
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.observed_facts.map((fact, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#2d6a4f', marginTop: '2px' }}>•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-earth-dark)' }}>
            <Layers size={18} color="#7f4f24" /> Inferred Agricultural Conditions
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.inferred_conditions.map((inf, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#7f4f24', marginTop: '2px' }}>•</span>
                <span>{inf}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Favorable vs Limitations vs Risks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Favorable */}
        <div className="card" style={{ borderTop: '4px solid #2d6a4f' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: '#1b4332' }}>
            Favorable Conditions
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.favorable_conditions.map((f, i) => (
              <li key={i} style={{ fontSize: '0.86rem', color: '#2b3a2f', display: 'flex', gap: '6px' }}>
                <span style={{ color: '#2d6a4f' }}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Potential Limitations */}
        <div className="card" style={{ borderTop: '4px solid #d4a373' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: '#7f4f24' }}>
            Potential Limitations
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.potential_limitations.map((l, i) => (
              <li key={i} style={{ fontSize: '0.86rem', color: '#2b3a2f', display: 'flex', gap: '6px' }}>
                <span style={{ color: '#d4a373' }}>⚠</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Agricultural Risks */}
        <div className="card" style={{ borderTop: '4px solid #e76f51' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: '#991b1b' }}>
            Agricultural Risks
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.agricultural_risks.map((r, i) => (
              <li key={i} style={{ fontSize: '0.86rem', color: '#2b3a2f', display: 'flex', gap: '6px' }}>
                <span style={{ color: '#e76f51' }}>!</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="card" aria-labelledby="ten-step-title">
        <div style={{ marginBottom: '16px' }}>
          <h2 id="ten-step-title" className="card-title">The 10-step field response</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
            Crop options and cultivation details are checked against the supplied crop dataset. Photo-only clues stay unconfirmed until verified in the field.
          </p>
        </div>
        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {TEN_STEP_PROTOCOL.map(item => (
            <li
              key={item.step_number}
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.75fr) minmax(0, 2fr)', gap: '14px', alignItems: 'center', padding: '13px 15px', borderRadius: 'var(--radius-md)', background: '#f2f7f1', border: '1px solid #d9e8db' }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.83rem', color: 'var(--color-forest-dark)' }}>{item.title}</strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-sage-primary)' }}>{item.tagline}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-body)' }}>{item.description}</p>
            </li>
          ))}
        </ol>
        <p style={{ marginTop: '14px', padding: '12px', background: '#fff7e6', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#704214' }}>
          Field checks should use observable conditions and household items. Confirm local crop timing and practices with an agricultural extension worker; CSV profiles are qualitative starting points, not guarantees.
        </p>
      </section>

      {/* Practical Improvements */}
      {analysis.practical_improvements && analysis.practical_improvements.length > 0 && (
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Wrench size={20} color="#2d6a4f" /> Practical Terrace Improvements
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {analysis.practical_improvements.map((imp, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                    {imp.title}
                  </h4>
                  <span className={`badge ${imp.priority === 'high' ? 'badge-conditionally-suitable' : 'badge-moderately-suitable'}`}>
                    {imp.priority} priority
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                  {imp.purpose}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {imp.steps.map((st, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-body)' }}>
                      <CheckSquare size={14} color="#2d6a4f" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-card)' }}>
        <button className="btn btn-outline" onClick={onOpenJsonInspector}>
          Inspect Analysis JSON
        </button>

        <button className="btn btn-primary btn-lg" onClick={onProceedToRecommendations}>
          <span>Proceed to Crop Recommendations</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
