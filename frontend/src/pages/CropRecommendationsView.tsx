import React, { useState } from 'react';
import {
  Sprout, Award, AlertTriangle, ShieldCheck, Calendar, ArrowRight,
  Eye, GitCompare, HelpCircle, BookOpen, Ban, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import { CropRecommendationResponse, CropRecommendationItem, CropExclusionItem } from '../types';
import { soundManager } from '../utils/audio';

interface CropRecommendationsViewProps {
  recommendationData: CropRecommendationResponse | null;
  onSelectCropForPlan: (cropId: string) => void;
  onViewCropDetails: (cropId: string) => void;
  onCompareCrops: (cropIds: string[]) => void;
  onOpenJsonInspector: () => void;
  onReevaluate: () => void;
}

export const CropRecommendationsView: React.FC<CropRecommendationsViewProps> = ({
  recommendationData,
  onSelectCropForPlan,
  onViewCropDetails,
  onCompareCrops,
  onOpenJsonInspector,
  onReevaluate
}) => {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showExclusions, setShowExclusions] = useState<boolean>(true);

  if (!recommendationData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Sprout size={48} color="#2d6a4f" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No Crop Recommendations Available</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Please complete your land assessment to calculate deterministic candidate crop suitability.
        </p>
        <button className="btn btn-primary" onClick={onReevaluate}>
          Start Assessment
        </button>
      </div>
    );
  }

  const { recommended_crops, excluded_crops, land_summary, adaptive_questions } = recommendationData;

  const toggleCompare = (cropId: string) => {
    soundManager.playClick();
    setSelectedForComparison(prev => {
      if (prev.includes(cropId)) {
        return prev.filter(id => id !== cropId);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 crops side-by-side.');
          return prev;
        }
        return [...prev, cropId];
      }
    });
  };

  const handleTriggerCompare = () => {
    if (selectedForComparison.length < 2) {
      alert('Please select at least 2 crops using the compare checkboxes.');
      return;
    }
    soundManager.playClick();
    onCompareCrops(selectedForComparison);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge" style={{ background: '#e8f5e9', color: '#1b4332' }}>
              Deterministic Hill Engine
            </span>
            <span className="badge badge-highly-suitable">
              {recommended_crops.length} Viable Candidates
            </span>
            {excluded_crops.length > 0 && (
              <span className="badge badge-excluded">
                {excluded_crops.length} Excluded Crops
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Candidate Crop Recommendations</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '1rem', marginTop: '4px' }}>
            {land_summary}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedForComparison.length >= 2 && (
            <button className="btn btn-gold" onClick={handleTriggerCompare}>
              <GitCompare size={16} />
              <span>Compare Selected ({selectedForComparison.length})</span>
            </button>
          )}
          <button className="btn btn-outline" onClick={onOpenJsonInspector}>
            Inspect Backend JSON
          </button>
        </div>
      </div>

      {/* Adaptive Clarifying Questions if any */}
      {adaptive_questions && adaptive_questions.length > 0 && (
        <div style={{ padding: '16px 20px', background: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', display: 'flex', gap: '12px' }}>
          <HelpCircle size={22} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#1e40af' }}>Adaptive Question to Refine Results:</strong>
            <p style={{ fontSize: '0.86rem', color: '#1e3a8a', marginTop: '4px' }}>
              {adaptive_questions[0]}
            </p>
          </div>
        </div>
      )}

      {/* Recommended Crops Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {recommended_crops.map((crop, idx) => {
          const isSelected = selectedForComparison.includes(crop.crop_id);
          const badgeClass =
            crop.suitability_category === 'highly_suitable'
              ? 'badge-highly-suitable'
              : (crop.suitability_category === 'moderately_suitable'
                ? 'badge-moderately-suitable'
                : 'badge-conditionally-suitable');

          return (
            <div
              key={crop.crop_id}
              className="card"
              style={{
                border: isSelected ? '2px solid var(--color-sage-accent)' : '1px solid var(--color-border-card)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-sage-hover)', fontFamily: 'var(--font-mono)' }}>
                      #{idx + 1}
                    </span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-forest-dark)' }}>
                      {crop.common_name}
                    </h2>
                    <span style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      ({crop.scientific_name})
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span className={`badge ${badgeClass}`}>
                      {crop.suitability_category.replace('_', ' ').toUpperCase()} ({crop.suitability_score}%)
                    </span>
                    <span className="badge" style={{ background: '#f4f6f0', color: 'var(--color-text-body)' }}>
                      <Calendar size={12} /> {crop.planting_window}
                    </span>
                    <span className="badge" style={{ background: '#f4f6f0', color: 'var(--color-text-body)' }}>
                      Harvest: {crop.estimated_harvest_period}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '6px 10px',
                      background: isSelected ? '#d8f3dc' : 'var(--color-bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-card)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCompare(crop.crop_id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Compare</span>
                  </label>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onViewCropDetails(crop.crop_id)}
                    title="View Full Botanical Specs"
                  >
                    <Eye size={14} />
                    <span>Specs</span>
                  </button>

                  <button
                    className="btn btn-sage btn-sm"
                    onClick={() => onSelectCropForPlan(crop.crop_id)}
                  >
                    <span>Adopt Cultivation Plan</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Spacing & Method Summary */}
              <div style={{ padding: '8px 12px', background: '#fcfbf7', borderRadius: 'var(--radius-sm)', border: '1px solid #eee5d8', fontSize: '0.82rem', color: 'var(--color-earth-dark)', marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div><strong>Establishment:</strong> {crop.cultivation_method}</div>
                <div><strong>Scientific Spacing:</strong> {crop.spacing_summary}</div>
              </div>

              {/* Why Recommended & Matching Conditions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div style={{ padding: '12px 14px', background: '#f8faf7', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #2d6a4f' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#163e27', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                    Why Recommended
                  </strong>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.84rem', color: 'var(--color-text-body)' }}>
                    {crop.reasons_for_recommendation.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8faf7', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #52b788' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#163e27', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                    Matching Land Conditions
                  </strong>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.84rem', color: 'var(--color-text-body)' }}>
                    {crop.matching_land_conditions.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Potential Problems & Care */}
              {crop.potential_problems && crop.potential_problems.length > 0 && (
                <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid #fef3c7', marginBottom: '12px', fontSize: '0.82rem', color: '#92400e' }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <AlertTriangle size={14} color="#b45309" /> Potential Limitations on this Terrace:
                  </strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '2px' }}>
                    {crop.potential_problems.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources Footnote */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                <BookOpen size={12} color="#7f4f24" />
                <span>Verified Sources: {crop.supporting_sources.join(' | ')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Excluded Crops Section - Crucial Hackathon Requirement! */}
      {excluded_crops && excluded_crops.length > 0 && (
        <div className="card" style={{ border: '1px solid #fecaca', background: '#fffafa' }}>
          <div
            onClick={() => setShowExclusions(!showExclusions)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ban size={22} color="#b91c1c" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991b1b' }}>
                  Why Other Crops Were Excluded ({excluded_crops.length} Ruled Out)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#7f1d1d' }}>
                  Transparent physiological exclusion rules preventing catastrophic crop failure
                </p>
              </div>
            </div>
            <button style={{ padding: '6px', color: '#991b1b' }}>
              {showExclusions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {showExclusions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' }}>
              {excluded_crops.map(ex => (
                <div
                  key={ex.crop_id}
                  style={{
                    padding: '14px 16px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fca5a5'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#7f1d1d' }}>{ex.common_name}</strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>({ex.scientific_name})</span>
                    </div>
                    <span className="badge badge-excluded">
                      {ex.primary_exclusion_reason}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#450a0a', lineHeight: 1.5, marginBottom: '6px' }}>
                    {ex.explanation}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {ex.conflicting_conditions.map((conf, ci) => (
                      <span key={ci} style={{ fontSize: '0.74rem', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                        {conf}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
