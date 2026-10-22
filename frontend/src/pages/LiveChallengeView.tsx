import React, { useState } from 'react';
import {
  Zap, RefreshCw, ArrowRight, CheckCircle2, AlertTriangle,
  Code, Copy, Check, Download, Layers, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import { LandAssessmentInput, LiveChallengeResponse } from '../types';
import { api } from '../services/api';
import { soundManager } from '../utils/audio';

interface LiveChallengeViewProps {
  onOpenCropDetails: (cropId: string) => void;
  onAdoptCropPlan: (cropId: string) => void;
}

const PRESET_SCENARIOS: { name: string; label: string; desc: string; inputs: LandAssessmentInput }[] = [
  {
    name: 'cold_sunny_water',
    label: '1. Cold Sunny + Water',
    desc: 'Gentle slope, crumbly loam, reliable irrigation, occasional frost. (Ideal hill conditions for Potato & Peas)',
    inputs: {
      soil_texture: 'crumbly_and_balanced',
      drainage: 'water_drains_gradually',
      soil_moisture: 'moist_not_waterlogged',
      soil_appearance: 'dark_brown',
      organic_material: 'decayed_leaves_compost_visible',
      sunlight: 'direct_most_of_day',
      climate: 'cold_days_cold_nights',
      frost: 'occasional',
      terrace_slope: 'gentle_slope',
      water_source: 'reliable_irrigation',
      growing_season: 'moderate'
    }
  },
  {
    name: 'frequent_frost_test',
    label: '2. High Frost Alert',
    desc: 'Sub-zero freezing expected. Tests hard exclusion of frost-sensitive Buckwheat while favoring Turnip & Spinach.',
    inputs: {
      soil_texture: 'crumbly_and_balanced',
      drainage: 'water_disappears_quickly',
      soil_moisture: 'slightly_moist',
      soil_appearance: 'dark_brown',
      organic_material: 'some_present',
      sunlight: 'direct_most_of_day',
      climate: 'very_cold_conditions',
      frost: 'frequent',
      terrace_slope: 'gentle_slope',
      water_source: 'reliable_irrigation',
      growing_season: 'moderate'
    }
  },
  {
    name: 'waterlogged_bog_test',
    label: '3. Waterlogged Terrace',
    desc: 'Surface pools, sticky clay, poor drainage. Tests root hypoxia exclusion of Barley, Potato & Carrot.',
    inputs: {
      soil_texture: 'sticky_and_clay_like',
      drainage: 'pools_on_surface',
      soil_moisture: 'very_wet',
      soil_appearance: 'pale_or_greyish',
      organic_material: 'some_present',
      sunlight: 'direct_part_of_day',
      climate: 'cold_days_cold_nights',
      frost: 'occasional',
      terrace_slope: 'nearly_flat',
      water_source: 'reliable_irrigation',
      growing_season: 'moderate'
    }
  },
  {
    name: 'rocky_shelf_test',
    label: '4. Rocky Terrace Shelf',
    desc: 'Rocky shallow soil with sharp stones. Tests root impedance exclusion of deep Carrots while favoring shallow Turnips.',
    inputs: {
      soil_texture: 'rocky_or_shallow',
      drainage: 'water_disappears_quickly',
      soil_moisture: 'slightly_moist',
      soil_appearance: 'mixed',
      organic_material: 'some_present',
      sunlight: 'direct_most_of_day',
      climate: 'cold_days_cold_nights',
      frost: 'occasional',
      terrace_slope: 'uneven_or_rocky',
      water_source: 'reliable_irrigation',
      growing_season: 'moderate'
    }
  },
  {
    name: 'deep_shade_test',
    label: '5. Deep Shaded North Face',
    desc: 'Mostly shaded mountain wall. Tests exclusion of full-sun Barley/Buckwheat while recommending shade-tolerant Spinach.',
    inputs: {
      soil_texture: 'crumbly_and_balanced',
      drainage: 'water_drains_gradually',
      soil_moisture: 'moist_not_waterlogged',
      soil_appearance: 'dark_brown',
      organic_material: 'some_present',
      sunlight: 'mostly_shaded',
      climate: 'cold_days_cold_nights',
      frost: 'occasional',
      terrace_slope: 'gentle_slope',
      water_source: 'reliable_irrigation',
      growing_season: 'moderate'
    }
  }
];

export const LiveChallengeView: React.FC<LiveChallengeViewProps> = ({
  onOpenCropDetails,
  onAdoptCropPlan
}) => {
  const [currentInputs, setCurrentInputs] = useState<LandAssessmentInput>(PRESET_SCENARIOS[0].inputs);
  const [previousInputs, setPreviousInputs] = useState<LandAssessmentInput | undefined>(undefined);
  const [activePreset, setActivePreset] = useState<string>('cold_sunny_water');

  const [challengeResult, setChallengeResult] = useState<LiveChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    soundManager.playClick();
    setActivePreset(preset.name);
    // Keep current as previous to demonstrate diff!
    setPreviousInputs({ ...currentInputs });
    setCurrentInputs({ ...preset.inputs });
  };

  const handleFieldChange = (field: keyof LandAssessmentInput, value: any) => {
    soundManager.playClick();
    setActivePreset('custom');
    setCurrentInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleEvaluate = async () => {
    soundManager.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.evaluateLiveChallenge({
        current_inputs: currentInputs,
        previous_inputs: previousInputs,
        preset_scenario_name: activePreset
      });
      setChallengeResult(res);
      // Update previous inputs for subsequent changes
      setPreviousInputs({ ...currentInputs });
      soundManager.playSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Evaluation error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    setCurrentInputs(PRESET_SCENARIOS[0].inputs);
    setPreviousInputs(undefined);
    setChallengeResult(null);
    setActivePreset('cold_sunny_water');
  };

  const handleCopyJson = () => {
    soundManager.playClick();
    if (!challengeResult) return;
    navigator.clipboard.writeText(JSON.stringify(challengeResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #3f2615 0%, #7f4f24 60%, #99582a 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 36px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: 'var(--radius-full)', color: '#ffe8d6', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
          <Zap size={14} color="#ffe8d6" /> Dedicated Hackathon Judge Live Challenge Mode
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
          Live Agricultural Reasoning Engine
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#eddcd2', maxWidth: '850px', lineHeight: 1.5 }}>
          Test the decision-support system with <strong>any unseen combination of terrace land conditions</strong>. The deterministic backend evaluates hard physiological exclusions, ranks candidate crops, and highlights exactly <strong>what changed and why</strong> between iterations.
        </p>
      </div>

      {/* Preset Demonstrations Row */}
      <div className="card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-title)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#d4a373" /> Quick Demonstration Scenarios (or customize below):
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {PRESET_SCENARIOS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleSelectPreset(p)}
              style={{
                padding: '12px 14px',
                textAlign: 'left',
                borderRadius: 'var(--radius-md)',
                border: activePreset === p.name ? '2px solid #7f4f24' : '1px solid var(--color-border-card)',
                background: activePreset === p.name ? '#fcf8f5' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <strong style={{ fontSize: '0.86rem', color: activePreset === p.name ? '#583115' : 'var(--color-text-title)', display: 'block' }}>
                {p.label}
              </strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Editable Inputs Matrix */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card-title">
            Editable Field Observation Parameters
          </h3>
          <button className="btn btn-outline btn-sm" onClick={handleReset}>
            <RefreshCw size={14} />
            <span>Reset to Baseline</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Soil Texture */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Soil Texture:
            </label>
            <select
              value={currentInputs.soil_texture}
              onChange={e => handleFieldChange('soil_texture', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="crumbly_and_balanced">Crumbly & Balanced (Loam)</option>
              <option value="sandy_and_gritty">Sandy & Gritty</option>
              <option value="sticky_and_clay_like">Sticky & Clay-Like</option>
              <option value="soft_and_powdery">Soft & Powdery</option>
              <option value="rocky_or_shallow">Rocky or Shallow Shelf</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Drainage */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Drainage Behavior:
            </label>
            <select
              value={currentInputs.drainage}
              onChange={e => handleFieldChange('drainage', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="water_drains_gradually">Water Drains Gradually</option>
              <option value="water_disappears_quickly">Water Disappears Quickly</option>
              <option value="water_remains_long">Water Remains for Long Time</option>
              <option value="pools_on_surface">Water Pools on Surface (Standing)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Frost */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Frost Occurrence:
            </label>
            <select
              value={currentInputs.frost}
              onChange={e => handleFieldChange('frost', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="occasional">Occasional Light Frost</option>
              <option value="rare">Rare / None Expected</option>
              <option value="frequent">Frequent Frost (Sub-zero Nights)</option>
              <option value="expected_during_growing_period">Expected Throughout Growing Period</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Sunlight */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Sunlight Exposure:
            </label>
            <select
              value={currentInputs.sunlight}
              onChange={e => handleFieldChange('sunlight', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="direct_most_of_day">Direct Sun Most of the Day (6+ hrs)</option>
              <option value="direct_part_of_day">Direct Sun Part of Day (3-5 hrs)</option>
              <option value="mostly_shaded">Mostly Shaded (&lt;3 hrs direct sun)</option>
              <option value="seasonal_variation">Seasonal Variation</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Water Availability */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Water Source:
            </label>
            <select
              value={currentInputs.water_source}
              onChange={e => handleFieldChange('water_source', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="reliable_irrigation">Reliable Irrigation Channel</option>
              <option value="rainwater_collection">Rainwater Harvesting Tank</option>
              <option value="limited_water">Limited Water (Manual Rationing)</option>
              <option value="seasonal_availability">Seasonal Spring / Snowmelt</option>
              <option value="no_reliable_source">No Reliable Source (Rainfed Only)</option>
            </select>
          </div>

          {/* Terrace Slope */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Terrace Slope:
            </label>
            <select
              value={currentInputs.terrace_slope}
              onChange={e => handleFieldChange('terrace_slope', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="gentle_slope">Gentle Slope (3-6°)</option>
              <option value="nearly_flat">Nearly Flat (&lt;2°)</option>
              <option value="steep_slope">Steep Slope (&gt;7°)</option>
              <option value="uneven_or_rocky">Uneven / Rocky</option>
            </select>
          </div>

          {/* Growing Season Length */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Growing Season Length:
            </label>
            <select
              value={currentInputs.growing_season}
              onChange={e => handleFieldChange('growing_season', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="moderate">Moderate Season (85-115 Days)</option>
              <option value="short">Short Season (60-80 Days)</option>
              <option value="long">Long Season (120+ Days)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Soil Moisture */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Soil Moisture Condition:
            </label>
            <select
              value={currentInputs.soil_moisture}
              onChange={e => handleFieldChange('soil_moisture', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="moist_not_waterlogged">Moist but Not Waterlogged</option>
              <option value="slightly_moist">Slightly Moist</option>
              <option value="dry_and_dusty">Dry and Dusty</option>
              <option value="very_wet">Very Wet / Saturated</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-gold btn-lg"
            onClick={handleEvaluate}
            disabled={isLoading}
          >
            <Zap size={18} />
            <span>{isLoading ? 'Running Backend Reasoning Engine...' : 'Evaluate Live Challenge'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{ padding: '16px', background: '#fee2e2', borderRadius: 'var(--radius-md)', color: '#991b1b', border: '1px solid #fecaca' }}>
          {errorMsg}
        </div>
      )}

      {/* Live Challenge Results */}
      {challengeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Differential Reasoning Box: What Changed & Why */}
          <div
            style={{
              padding: '20px 24px',
              background: '#fffdf5',
              border: '2px solid #d4a373',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="#b45309" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-earth-dark)' }}>
                  Differential Reasoning: What Changed and Why
                </h3>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowJsonInspector(!showJsonInspector)}
              >
                <Code size={14} />
                <span>{showJsonInspector ? 'Hide Raw JSON' : 'Inspect Raw JSON'}</span>
              </button>
            </div>

            <ul style={{ paddingLeft: '22px', fontSize: '0.92rem', color: 'var(--color-text-body)', lineHeight: 1.6 }}>
              {challengeResult.diff_explanation.map((diff, di) => (
                <li key={di} style={{ marginBottom: '4px' }}>{diff}</li>
              ))}
            </ul>
          </div>

          {/* Optional In-line JSON Inspector */}
          {showJsonInspector && (
            <div className="card" style={{ background: '#111a14', color: '#a7f3d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#74c69d' }}>
                  POST /api/v1/live-challenge/evaluate
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleCopyJson}
                  style={{ color: '#fff', borderColor: '#2d6a4f' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="json-code" style={{ maxHeight: '400px' }}>
                {JSON.stringify(challengeResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Top Recommendations Grid */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest-dark)', marginBottom: '14px' }}>
              Re-calculated Recommended Crops ({challengeResult.recommended_count} Viable Candidates)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {challengeResult.recommendations.recommended_crops.map((crop, idx) => (
                <div
                  key={crop.crop_id}
                  className="card"
                  style={{
                    borderLeft: idx === 0 ? '4px solid #16a34a' : '4px solid #52b788',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a' }}>
                          RANK #{idx + 1}
                        </span>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-forest-dark)' }}>
                          {crop.common_name}
                        </h4>
                        <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          ({crop.scientific_name})
                        </span>
                      </div>
                      <span className="badge badge-highly-suitable">
                        {crop.suitability_score}%
                      </span>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text-body)', marginTop: '8px', marginBottom: '10px' }}>
                      <strong>Primary Reason:</strong> {crop.reasons_for_recommendation[0]}
                    </p>

                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                      <strong>Required Window:</strong> {crop.estimated_harvest_period} | {crop.planting_window}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onOpenCropDetails(crop.crop_id)}
                    >
                      Botanical Specs
                    </button>
                    <button
                      className="btn btn-sage btn-sm"
                      onClick={() => onAdoptCropPlan(crop.crop_id)}
                      style={{ flex: 1 }}
                    >
                      <span>Adopt Plan</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Excluded Crops Panel */}
          {challengeResult.recommendations.excluded_crops.length > 0 && (
            <div className="card" style={{ border: '1px solid #fecaca', background: '#fffafa' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', marginBottom: '10px' }}>
                Excluded Crops Under This Exact Scenario ({challengeResult.excluded_count} Ruled Out)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {challengeResult.recommendations.excluded_crops.map(ex => (
                  <div
                    key={ex.crop_id}
                    style={{
                      padding: '12px',
                      background: '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #fca5a5'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>{ex.common_name}</strong>
                      <span className="badge badge-excluded" style={{ fontSize: '0.7rem' }}>
                        {ex.primary_exclusion_reason}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#450a0a' }}>
                      {ex.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
