import React, { useState } from 'react';
import {
  Bug, ShieldAlert, AlertTriangle, CheckCircle, HelpCircle,
  Sparkles, Layers, ArrowRight, ShieldCheck, Thermometer, Droplets
} from 'lucide-react';
import { PestDiagnosisResponse, PossibleCauseItem } from '../types';
import { api } from '../services/api';
import { soundManager } from '../utils/audio';

interface PestAssistantViewProps {
  cropId?: string;
  cropName?: string;
  onOpenJsonInspector: () => void;
}

const SYMPTOM_OPTIONS = [
  { id: 'holes_in_leaves', label: 'Holes in Leaves', desc: 'Shot-holes or skeletonized irregular margins' },
  { id: 'yellowing', label: 'Yellowing (Chlorosis)', desc: 'Pale yellowing of lower or upper foliage' },
  { id: 'wilting', label: 'Wilting / Drooping', desc: 'Stems or foliage sagging despite soil moisture' },
  { id: 'leaf_spots', label: 'Leaf Spots / Lesions', desc: 'Water-soaked, dark brown or concentric spots' },
  { id: 'white_powdery_growth', label: 'White Powdery Growth', desc: 'Talcum-like floury dusting on leaves or pods' },
  { id: 'stunted_growth', label: 'Stunted / Dwarf Growth', desc: 'Plants fail to bulk or remain dwarf' },
  { id: 'damaged_roots', label: 'Damaged / Mushy Roots', desc: 'Brown, rotted, or clubbed deformed roots' },
  { id: 'rotting_plant_parts', label: 'Rotting Plant Parts', desc: 'Water-soaked soft brown decay with foul odor' },
  { id: 'visible_insects', label: 'Visible Insects / Larvae', desc: 'Clusters of aphids, jumping beetles, or caterpillars' },
  { id: 'sticky_residue', label: 'Sticky Residue / Sooty Mold', desc: 'Sweet honeydew excretion attracting black mold' },
  { id: 'chewed_stems', label: 'Chewed / Severed Stems', desc: 'Seedlings severed cleanly at ground level overnight' },
  { id: 'poor_germination', label: 'Poor Germination / Collapse', desc: 'Seeds rotting in cold soil or emergent sprouts collapsing' }
];

export const PestAssistantView: React.FC<PestAssistantViewProps> = ({
  cropId,
  cropName,
  onOpenJsonInspector
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['holes_in_leaves']);
  const [affectedParts, setAffectedParts] = useState<string[]>(['leaves']);
  const [moistureCondition, setMoistureCondition] = useState<string>('damp_dew');
  const [visibleInsects, setVisibleInsects] = useState<string>('none_seen');
  const [selectedDisorder, setSelectedDisorder] = useState<PossibleCauseItem | null>(null);

  const [diagnosisResult, setDiagnosisResult] = useState<PestDiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSymptom = (id: string) => {
    soundManager.playClick();
    setSelectedSymptoms(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(s => s !== id) : prev) : [...prev, id]
    );
  };

  const togglePart = (part: string) => {
    soundManager.playClick();
    setAffectedParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    );
  };

  const handleRunDiagnosis = async () => {
    soundManager.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.diagnosePest({
        crop_id: cropId,
        symptoms: selectedSymptoms,
        affected_plant_parts: affectedParts,
        moisture_condition: moistureCondition,
        visible_insects: visibleInsects
      });
      setDiagnosisResult(res);
      if (res.possible_causes && res.possible_causes.length > 0) {
        setSelectedDisorder(res.possible_causes[0]);
      }
      soundManager.playSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Diagnostic service error');
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
              IPM Diagnostic Engine
            </span>
            {cropName && (
              <span className="badge" style={{ background: '#f4f6f0', color: 'var(--color-text-body)' }}>
                Target Crop: {cropName}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Pest, Disease & Stress Assistant</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.96rem', marginTop: '4px' }}>
            Investigate crop abnormalities through observable symptoms. Receive Integrated Pest Management (IPM) guidance, safe biological controls, and escalation warnings.
          </p>
        </div>

        {diagnosisResult && (
          <button className="btn btn-outline" onClick={onOpenJsonInspector}>
            Inspect Diagnosis JSON
          </button>
        )}
      </div>

      {/* Symptom Selector Grid */}
      <div className="card">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Bug size={18} color="#2d6a4f" /> Step 1: Select Observable Symptoms (Tap to toggle)
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Choose all signs currently visible on your terrace plants:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
          {SYMPTOM_OPTIONS.map(sym => {
            const isSelected = selectedSymptoms.includes(sym.id);
            return (
              <div
                key={sym.id}
                onClick={() => toggleSymptom(sym.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-sage-accent)' : '1px solid var(--color-border-card)',
                  background: isSelected ? 'rgba(82, 183, 136, 0.1)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: isSelected ? '5px solid var(--color-sage-primary)' : '2px solid #cbd5e1',
                    background: '#ffffff',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? 'var(--color-forest-dark)' : 'var(--color-text-title)' }}>
                    {sym.label}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {sym.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plant Part & Weather Context */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Affected Plant Parts:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['leaves', 'stems', 'roots', 'collar', 'curds_fruits'].map(part => {
                const isChecked = affectedParts.includes(part);
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => togglePart(part)}
                    className={`btn btn-sm ${isChecked ? 'btn-sage' : 'btn-outline'}`}
                  >
                    {part.replace('_', ' ').toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Terrace Moisture Conditions:
            </label>
            <select
              value={moistureCondition}
              onChange={e => setMoistureCondition(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.85rem', background: '#fff' }}
            >
              <option value="damp_dew">Persistent Mountain Dew / Foggy Wet Leaves</option>
              <option value="dry">Dry Brisk Mountain Air</option>
              <option value="soggy_flooded">Cold Saturated / Standing Mud</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-gold btn-lg"
            onClick={handleRunDiagnosis}
            disabled={isLoading}
          >
            <Sparkles size={18} />
            <span>{isLoading ? 'Comparing Agricultural Knowledge Base...' : 'Run Diagnostic Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{ padding: '16px', background: '#fee2e2', borderRadius: 'var(--radius-md)', color: '#991b1b', border: '1px solid #fecaca' }}>
          {errorMsg}
        </div>
      )}

      {/* Diagnosis Results Section */}
      {diagnosisResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Banner */}
          <div style={{ padding: '16px 20px', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', display: 'flex', gap: '12px' }}>
            <CheckCircle size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.94rem', color: '#166534' }}>Diagnostic Investigation Summary:</strong>
              <p style={{ fontSize: '0.88rem', color: '#14532d', marginTop: '2px' }}>
                {diagnosisResult.investigative_summary}
              </p>
            </div>
          </div>

          {/* Clarifying Follow-Up Questions */}
          {diagnosisResult.follow_up_questions && diagnosisResult.follow_up_questions.length > 0 && (
            <div style={{ padding: '16px', background: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 700, marginBottom: '6px' }}>
                <HelpCircle size={18} />
                <span>Field Clarifying Follow-Up:</span>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.86rem', color: '#1e3a8a' }}>
                {diagnosisResult.follow_up_questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Causes List & Selected Cause Inspector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* List of Possible Causes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                Matching Disorders & Stresses
              </h3>

              {diagnosisResult.possible_causes.map(cause => {
                const isSelected = selectedDisorder?.disorder_id === cause.disorder_id;
                const isAbiotic = cause.category === 'abiotic_stress';
                const isInsect = cause.category === 'pest_insect';

                return (
                  <div
                    key={cause.disorder_id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedDisorder(cause);
                    }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-forest-medium)' : '1px solid var(--color-border-card)',
                      background: isSelected ? '#ffffff' : '#fcfbf7',
                      cursor: 'pointer',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--color-text-title)' }}>
                          {cause.common_name}
                        </strong>
                        <span style={{ fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>
                          {cause.scientific_name}
                        </span>
                      </div>
                      <span className={`badge ${cause.match_percentage >= 60 ? 'badge-highly-suitable' : 'badge-moderately-suitable'}`}>
                        {cause.match_percentage}% Match
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      <span className="badge" style={{ background: isAbiotic ? '#e0f2fe' : (isInsect ? '#fef3c7' : '#fee2e2'), color: isAbiotic ? '#0369a1' : (isInsect ? '#b45309' : '#991b1b'), fontSize: '0.7rem' }}>
                        {cause.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                        Confidence: {cause.confidence_level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Cause Detail & IPM Recommendations */}
            {selectedDisorder && (
              <div className="card" style={{ border: '2px solid var(--color-forest-medium)' }}>
                <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '12px', marginBottom: '14px' }}>
                  <span className="badge" style={{ background: '#e8f5e9', color: '#1b4332', marginBottom: '4px' }}>
                    Detailed IPM Profile
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-forest-dark)' }}>
                    {selectedDisorder.common_name}
                  </h3>
                  <span style={{ fontSize: '0.84rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                    ({selectedDisorder.scientific_name})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem' }}>
                  {/* Distinguishing Features */}
                  <div>
                    <strong style={{ color: 'var(--color-forest-dark)', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                      Diagnostic Distinguishing Features:
                    </strong>
                    <p style={{ marginTop: '2px', color: 'var(--color-text-body)' }}>
                      {selectedDisorder.distinguishing_features}
                    </p>
                  </div>

                  {/* Conducive Weather */}
                  <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--color-earth-amber)' }}>
                      Conducive Weather:
                    </strong>
                    <p style={{ marginTop: '2px', fontSize: '0.82rem' }}>{selectedDisorder.conducive_weather}</p>
                  </div>

                  {/* Cultural Controls */}
                  <div>
                    <strong style={{ color: '#166534', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} /> 1. Cultural & Sanitation Practices:
                    </strong>
                    <ul style={{ paddingLeft: '18px', marginTop: '4px', fontSize: '0.82rem' }}>
                      {selectedDisorder.cultural_controls.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Physical & Biological */}
                  <div>
                    <strong style={{ color: '#1d4ed8', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} /> 2. Physical Barriers & Biological Controls:
                    </strong>
                    <ul style={{ paddingLeft: '18px', marginTop: '4px', fontSize: '0.82rem' }}>
                      {[...selectedDisorder.physical_controls, ...selectedDisorder.biological_controls].map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Safe Treatments */}
                  {selectedDisorder.safe_treatments && selectedDisorder.safe_treatments.length > 0 && (
                    <div style={{ padding: '8px 12px', background: '#fefce8', borderRadius: 'var(--radius-sm)', border: '1px solid #fef08a' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#854d0e' }}>
                        3. Compliant Botanical / Organic Treatments:
                      </strong>
                      <ul style={{ paddingLeft: '18px', marginTop: '4px', fontSize: '0.82rem', color: '#713f12' }}>
                        {selectedDisorder.safe_treatments.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Escalation Warning */}
                  <div style={{ padding: '10px 12px', background: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.8rem' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} /> Official Escalation Threshold:
                    </strong>
                    <p style={{ marginTop: '2px' }}>{selectedDisorder.escalation_criteria}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer Footnote */}
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '10px 16px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <strong>Scientific Disclaimer:</strong> {diagnosisResult.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
