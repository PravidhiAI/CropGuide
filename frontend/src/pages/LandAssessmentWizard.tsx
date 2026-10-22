import React, { useState } from 'react';
import {
  Compass, ArrowLeft, ArrowRight, CheckCircle2, HelpCircle,
  AlertCircle, Sparkles, MapPin, Ruler, Sprout, ShieldCheck, Thermometer
} from 'lucide-react';
import { LandAssessmentInput } from '../types';
import { soundManager } from '../utils/audio';
import { PhotoChatIntake } from '../components/PhotoChatIntake';

interface LandAssessmentWizardProps {
  initialValues: LandAssessmentInput;
  onSubmit: (inputs: LandAssessmentInput) => void;
  isSubmitting: boolean;
  onViewAnalysis: () => void;
  hasExistingAnalysis: boolean;
}

export const LandAssessmentWizard: React.FC<LandAssessmentWizardProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  onViewAnalysis,
  hasExistingAnalysis
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<LandAssessmentInput>(initialValues);

  const updateField = (field: keyof LandAssessmentInput, value: any) => {
    soundManager.playClick();
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    soundManager.playClick();
    setStep(prev => Math.min(4, prev + 1));
  };

  const handlePrev = () => {
    soundManager.playClick();
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    onSubmit(formData);
  };

  const renderOption = (
    field: keyof LandAssessmentInput,
    value: string,
    label: string,
    description?: string
  ) => {
    const isSelected = formData[field] === value;
    return (
      <div
        key={value}
        onClick={() => updateField(field, value)}
        style={{
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          border: isSelected ? '2px solid var(--color-sage-accent)' : '1px solid var(--color-border-card)',
          background: isSelected ? 'rgba(82, 183, 136, 0.08)' : '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          transition: 'all var(--transition-fast)'
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: isSelected ? '6px solid var(--color-sage-primary)' : '2px solid #cbd5e1',
            background: '#ffffff',
            marginTop: '2px',
            flexShrink: 0
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: isSelected ? 'var(--color-forest-dark)' : 'var(--color-text-title)' }}>
            {label}
          </div>
          {description && (
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {description}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Wizard Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Natural Field Assessment</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              Observe your mountain terrace with your own eyes and hands. No chemical soil tests or laboratory pH meters required.
            </p>
          </div>

          {hasExistingAnalysis && (
            <button className="btn btn-outline btn-sm" onClick={onViewAnalysis}>
              <span>View Latest Analysis</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Step Progress Pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {[
            { num: 1, title: '1. Soil & Drainage' },
            { num: 2, title: '2. Climate & Sun' },
            { num: 3, title: '3. Terrace & Water' },
            { num: 4, title: '4. Regional Context' }
          ].map(s => (
            <div
              key={s.num}
              onClick={() => {
                soundManager.playClick();
                setStep(s.num);
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: step === s.num ? 'var(--color-forest-medium)' : (step > s.num ? '#e8f5e9' : 'var(--color-bg-subtle)'),
                color: step === s.num ? '#ffffff' : (step > s.num ? '#2e7d32' : 'var(--color-text-muted)'),
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {step > s.num && <CheckCircle2 size={13} color="#2e7d32" />}
              <span>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <PhotoChatIntake
          currentInputs={formData}
          onInputUpdate={updates => setFormData(previous => ({ ...previous, ...updates }))}
          isActive={step === 1}
        />
        {/* STEP 1: Soil Texture, Drainage, Moisture & Appearance */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Soil Texture */}
            <div className="card">
              <h3 className="card-title">
                What does the soil feel like when rubbed between your fingers?
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                Pick up a moist handful from 10 cm deep. Squeeze and rub it between your thumb and index finger.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('soil_texture', 'sandy_and_gritty', 'Sandy & Gritty', 'Rough grains felt easily; falls apart when ball is released')}
                {renderOption('soil_texture', 'soft_and_powdery', 'Soft & Powdery', 'Silky flour-like smooth feel with very few coarse grains')}
                {renderOption('soil_texture', 'sticky_and_clay_like', 'Sticky & Clay-Like', 'Can be rolled into a long shiny ribbon; sticks firmly to fingers')}
                {renderOption('soil_texture', 'crumbly_and_balanced', 'Crumbly & Balanced (Loam)', 'Forms a soft moist ball that crumbles gently when pressed')}
                {renderOption('soil_texture', 'rocky_or_shallow', 'Rocky or Shallow Shelf', 'Abundant sharp stones and pebbles; spade hits bedrock quickly')}
                {renderOption('soil_texture', 'unknown', 'I Don\'t Know', 'Unable to determine texture with confidence')}
              </div>
            </div>

            {/* Drainage Behavior */}
            <div className="card">
              <h3 className="card-title">
                How does water behave on the terrace after heavy rainfall?
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                Reflects soil percolation and whether underground drainage furrows are active.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('drainage', 'water_disappears_quickly', 'Water Disappears Quickly', 'No standing water even 15 minutes after heavy rain')}
                {renderOption('drainage', 'water_drains_gradually', 'Water Drains Gradually', 'Soil stays moist but surface puddles disappear within a few hours')}
                {renderOption('drainage', 'water_remains_long', 'Water Remains for a Long Time', 'Soil stays soggy and squelchy for more than 24-48 hours')}
                {renderOption('drainage', 'pools_on_surface', 'Water Pools on the Surface', 'Persistent stagnant puddles form across the terrace bed')}
                {renderOption('drainage', 'unknown', 'I Don\'t Know', 'Drainage has not been monitored yet')}
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="card">
              <h3 className="card-title">
                Current Soil Moisture Condition
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('soil_moisture', 'dry_and_dusty', 'Dry and Dusty', 'Powdery, cracks visible, no moisture on touch')}
                {renderOption('soil_moisture', 'slightly_moist', 'Slightly Moist', 'Cool to touch, darkens slightly when pressed')}
                {renderOption('soil_moisture', 'moist_not_waterlogged', 'Moist but Not Waterlogged', 'Holds a cohesive ball without dripping water')}
                {renderOption('soil_moisture', 'very_wet', 'Very Wet / Saturated', 'Water glistens or squeezes out like a wet sponge')}
                {renderOption('soil_moisture', 'unknown', 'I Don\'t Know', 'Moisture has not been assessed')}
              </div>
            </div>

            {/* Soil Appearance & Organic Material */}
            <div className="card">
              <h3 className="card-title">
                Soil Appearance & Organic Residue
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                {renderOption('soil_appearance', 'dark_brown', 'Dark Brown or Blackish', 'High organic humus content')}
                {renderOption('soil_appearance', 'light_brown', 'Light Brown / Tan', 'Moderate organic content')}
                {renderOption('soil_appearance', 'reddish_or_orange', 'Reddish or Orange', 'Iron-rich mountain clay/lateritic')}
                {renderOption('soil_appearance', 'pale_or_greyish', 'Pale or Greyish', 'Leached or low organic vitality')}
                {renderOption('soil_appearance', 'mixed', 'Mixed / Motley', 'Patchy mountain strata')}
                {renderOption('soil_appearance', 'unknown', 'Unknown Appearance')}
              </div>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text-title)', marginBottom: '8px' }}>
                Visible Organic Material:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('organic_material', 'decayed_leaves_compost_visible', 'Decayed Leaves / Compost Visible', 'Rich fibrous matter and earthworms visible')}
                {renderOption('organic_material', 'some_present', 'Some Organic Material Present', 'Occasional bits of roots or dried mulch')}
                {renderOption('organic_material', 'very_little_visible', 'Very Little Visible', 'Bare mineral soil with minimal residue')}
                {renderOption('organic_material', 'unknown', 'Unknown')}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Climate, Frost & Sunlight */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Frost */}
            <div className="card">
              <h3 className="card-title">
                Frost Incidence During Anticipated Growing Period
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                Radiation frost creates ice crystals inside plant leaves. This is a critical factor for hard exclusion rules.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('frost', 'rare', 'Rare / None Expected', 'Night temperatures reliably stay above 2°C')}
                {renderOption('frost', 'occasional', 'Occasional Frost (1-2 times/month)', 'Occasional light frost melts quickly after sunrise')}
                {renderOption('frost', 'frequent', 'Frequent Frost (Several nights/week)', 'Repeated nocturnal freezing below 0°C')}
                {renderOption('frost', 'expected_during_growing_period', 'Expected During Growing Period', 'Sub-zero temperatures guaranteed throughout crop cycle')}
                {renderOption('frost', 'unknown', 'I Don\'t Know', 'Local frost history unfamiliar')}
              </div>
            </div>

            {/* Sunlight Exposure */}
            <div className="card">
              <h3 className="card-title">
                Solar Exposure on the Terrace
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                Mountain terrain, peaks, and terrace walls create significant shade shadows.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('sunlight', 'direct_most_of_day', 'Direct Sunlight Most of the Day (6+ hours)', 'Unobstructed southern or eastern terrace exposure')}
                {renderOption('sunlight', 'direct_part_of_day', 'Direct Sunlight Part of the Day (3-5 hours)', 'Morning or afternoon direct sun only')}
                {renderOption('sunlight', 'mostly_shaded', 'Mostly Shaded (<3 hours direct sun)', 'North-facing terrace or overshadowed by mountain ridge')}
                {renderOption('sunlight', 'seasonal_variation', 'Seasonal Variation', 'Shaded in spring, full sun in summer')}
                {renderOption('sunlight', 'unknown', 'I Don\'t Know')}
              </div>
            </div>

            {/* Climate & Temperature */}
            <div className="card">
              <h3 className="card-title">
                General Daily Climate Characteristics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('climate', 'cold_days_cold_nights', 'Cold Days & Cold Nights', 'Consistently cold (<12°C day, <4°C night)')}
                {renderOption('climate', 'mild_days_cold_nights', 'Mild Days & Cold Nights', 'Comfortable sun during day (15-20°C), brisk nights (2-8°C)')}
                {renderOption('climate', 'very_cold_conditions', 'Very Cold High Alpine Regime', 'Near-freezing daytime, severe sub-zero nights')}
                {renderOption('climate', 'large_temperature_changes', 'Large Day-to-Night Fluctuation', 'Intense high UV daytime sun, sudden freezing nocturnal drop')}
                {renderOption('climate', 'unknown', 'Unknown Climate')}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Terrace Slope & Water Source */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Terrace Slope */}
            <div className="card">
              <h3 className="card-title">
                Terrace Bed Slope & Stability
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                Determines erosion hazard, runoff speed, and need for stone wall maintenance.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('terrace_slope', 'nearly_flat', 'Nearly Flat Terrace (<2° slope)', 'Minimal runoff speed; prone to water stagnation if drainage is slow')}
                {renderOption('terrace_slope', 'gentle_slope', 'Gentle Slope (3-6° slope)', 'Optimal natural drainage gradient without high erosion hazard')}
                {renderOption('terrace_slope', 'steep_slope', 'Steep Terrace (>7° slope)', 'High runoff shear; risk of topsoil wash-off and wall blowout')}
                {renderOption('terrace_slope', 'uneven_or_rocky', 'Uneven, Broken or Rocky Bed', 'Irregular ledges and rocky shelves')}
              </div>
            </div>

            {/* Water Availability */}
            <div className="card">
              <h3 className="card-title">
                Water Availability for Irrigation
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                Compare water availability with each crop’s irrigation and moisture preferences in the supplied crop dataset.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('water_source', 'reliable_irrigation', 'Reliable Irrigation Source', 'Nearby spring, gravity channel (kuhl), or piped water')}
                {renderOption('water_source', 'rainwater_collection', 'Rainwater Harvesting / Tanks', 'Storage ponds or barrel collection available')}
                {renderOption('water_source', 'limited_water', 'Limited Water Supply', 'Manual carry only; rationed watering')}
                {renderOption('water_source', 'seasonal_availability', 'Seasonal Availability', 'Water available during snowmelt/monsoon only')}
                {renderOption('water_source', 'no_reliable_source', 'No Reliable Water Source', 'Strictly rainfed farming regime')}
              </div>
            </div>

            {/* Growing Season Length */}
            <div className="card">
              <h3 className="card-title">
                Estimated Growing Season Length
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {renderOption('growing_season', 'short', 'Short Season (60-80 Days)', 'Brief frost-free window between late spring and early autumn')}
                {renderOption('growing_season', 'moderate', 'Moderate Season (85-115 Days)', 'Standard mountain growing season')}
                {renderOption('growing_season', 'long', 'Long Season (120+ Days)', 'Extended mild valley conditions')}
                {renderOption('growing_season', 'unknown', 'I Don\'t Know')}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Optional Mountain Context */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#2d6a4f" /> Optional Mountain Geographic Context
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                These optional parameters fine-tune specific regional variety recommendations (ICAR-VPKAS, CPRI, SKUAST).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    General Region / Valley (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kullu, Almora, Leh, Shimla, Chamoli"
                    value={formData.region || ''}
                    onChange={e => updateField('region', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Estimated Altitude in Meters (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2200"
                    value={formData.altitude_m || ''}
                    onChange={e => updateField('altitude_m', e.target.value ? parseInt(e.target.value) : undefined)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Available Terrace Area in m² (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={formData.space_sqm || ''}
                    onChange={e => updateField('space_sqm', e.target.value ? parseFloat(e.target.value) : undefined)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Current Month / Season (Optional)
                  </label>
                  <select
                    value={formData.current_month || ''}
                    onChange={e => updateField('current_month', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="">Select current month...</option>
                    <option value="March">March (Early Spring)</option>
                    <option value="April">April (Spring Sowing)</option>
                    <option value="May">May (High Mountain Summer)</option>
                    <option value="June">June (Summer)</option>
                    <option value="July">July (Monsoon/Summer)</option>
                    <option value="August">August (Late Summer)</option>
                    <option value="September">September (Autumn Sowing)</option>
                    <option value="October">October (Overwintering)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">
                Growing Goals & Tools Available
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Primary Growing Goal
                  </label>
                  <select
                    value={formData.growing_goals || ''}
                    onChange={e => updateField('growing_goals', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="family_subsistence">Family Subsistence & Food Security</option>
                    <option value="winter_cellar_storage">Long-Term Winter Cellar Storage (Potatoes/Roots)</option>
                    <option value="fast_fresh_greens">Quick Harvest Fresh Greens (Spinach/Rai)</option>
                    <option value="cash_crop">Hill Commercial Market Crop (Peas/Snowball Cauliflower)</option>
                    <option value="soil_rejuvenation">Terrace Soil Rejuvenation (Legume Nitrogen Fixation)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Tools & Materials on Hand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spade, khurpa, straw mulch, FYM compost, agrifleece"
                    value={formData.tools_materials || ''}
                    onChange={e => updateField('tools_materials', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', background: '#fef3c7', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', display: 'flex', gap: '12px' }}>
              <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.84rem', color: '#92400e' }}>
                <strong>Field Observation Notice:</strong> Natural observations provide valuable clues regarding soil texture, drainage, and frost exposure, but cannot replace laboratory chemical tests for exact nitrogen, phosphorus, or potassium ppm. Recommendations are deterministic based on observed physical traits and verified agronomic research.
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
          {step > 1 ? (
            <button type="button" className="btn btn-outline" onClick={handlePrev}>
              <ArrowLeft size={16} />
              <span>Previous Step</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '12px' }}>
            {step < 4 ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-gold btn-lg" disabled={isSubmitting}>
                <Sparkles size={18} />
                <span>{isSubmitting ? 'Analyzing Land Conditions...' : 'Submit Assessment to Engine'}</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
