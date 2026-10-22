import React, { useState, useEffect } from 'react';
import {
  Clock, Plus, Droplets, Cloud, FileText, CheckCircle2,
  Calendar, Award, Camera, AlertCircle, ArrowRight
} from 'lucide-react';
import { FieldJournalEntry } from '../types';
import { api } from '../services/api';
import { soundManager } from '../utils/audio';

interface FieldJournalViewProps {
  planId?: string;
  cropName?: string;
  onOpenCultivationPlan: () => void;
  onOpenJsonInspector: () => void;
}

export const FieldJournalView: React.FC<FieldJournalViewProps> = ({
  planId = 'default-plan',
  cropName = 'Mountain Crop',
  onOpenCultivationPlan,
  onOpenJsonInspector
}) => {
  const [entries, setEntries] = useState<FieldJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form state
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stageName, setStageName] = useState<string>('Stage 4: Ongoing Care');
  const [observationNotes, setObservationNotes] = useState<string>('');
  const [wateringDone, setWateringDone] = useState<boolean>(true);
  const [weatherConditions, setWeatherConditions] = useState<string>('Sunny morning (14°C), nocturnal radiation frost (-1.5°C)');
  const [photoNotes, setPhotoNotes] = useState<string>('');
  const [harvestYieldKg, setHarvestYieldKg] = useState<string>('');

  useEffect(() => {
    loadJournal();
  }, [planId]);

  const loadJournal = async () => {
    setIsLoading(true);
    try {
      if (planId && planId !== 'default-plan') {
        const data = await api.getFieldJournal(planId);
        setEntries(data);
      } else {
        // Fallback local entries if plan not yet initialized
        const saved = localStorage.getItem('terraform_local_journal');
        if (saved) {
          setEntries(JSON.parse(saved));
        } else {
          setEntries([
            {
              id: 'demo-1',
              plan_id: 'demo',
              entry_date: '2026-04-12',
              stage_name: 'Stage 1: Land Preparation',
              observation_notes: 'Inspected dry-stone terrace bunds. Loosened upper 20 cm of crumbly balanced loam. Blended 25 kg mature compost.',
              watering_done: false,
              weather_conditions: 'Crisp spring sunlight (12°C), calm wind',
              symptoms_observed: [],
              photo_notes: 'Photo taken of contour raised bed profiles'
            }
          ]);
        }
      }
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationNotes.trim()) return;

    soundManager.playClick();
    const newEntryPayload = {
      plan_id: planId,
      entry_date: entryDate,
      stage_name: stageName,
      observation_notes: observationNotes,
      watering_done: wateringDone,
      weather_conditions: weatherConditions,
      symptoms_observed: [],
      photo_notes: photoNotes || undefined,
      harvest_yield_kg: harvestYieldKg ? parseFloat(harvestYieldKg) : undefined
    };

    try {
      if (planId && planId !== 'default-plan') {
        const created = await api.logFieldObservation(newEntryPayload);
        setEntries(prev => [created, ...prev]);
      } else {
        const localEntry: FieldJournalEntry = {
          id: `jrn-${Date.now()}`,
          ...newEntryPayload,
          created_at: new Date().toISOString()
        };
        const updated = [localEntry, ...entries];
        setEntries(updated);
        localStorage.setItem('terraform_local_journal', JSON.stringify(updated));
      }

      soundManager.playSuccess();
      setObservationNotes('');
      setPhotoNotes('');
      setHarvestYieldKg('');
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || 'Error saving journal entry');
    }
  };

  const totalYield = entries.reduce((acc, curr) => acc + (curr.harvest_yield_kg || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-highly-suitable">
              Crop: {cropName}
            </span>
            <span className="badge" style={{ background: '#f4f6f0', color: 'var(--color-text-body)' }}>
              {entries.length} Entries Logged
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Field Journal & Harvest Records</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.96rem', marginTop: '4px' }}>
            Log daily microclimate conditions, watering events, morphological developments, and final terrace yields.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={onOpenJsonInspector}>
            Inspect Journal JSON
          </button>
          <button className="btn btn-sage" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} />
            <span>{showAddForm ? 'Close Form' : 'New Log Entry'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #2d6a4f' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Log Entries</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-forest-dark)', marginTop: '2px' }}>
            {entries.length}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #d4a373' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Harvest Yield</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7f4f24', marginTop: '2px' }}>
            {totalYield > 0 ? `${totalYield} kg` : 'In Progress'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #52b788' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Recent Activity</span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#163e27', marginTop: '6px' }}>
            {entries.length > 0 ? entries[0].entry_date : 'No entries'}
          </div>
        </div>
      </div>

      {/* Add Entry Form Modal / Accordion */}
      {showAddForm && (
        <form onSubmit={handleCreateEntry} className="card" style={{ border: '2px solid var(--color-forest-medium)' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>
            Record New Terrace Observation
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Observation Date:
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Active Cultivation Stage:
              </label>
              <select
                value={stageName}
                onChange={e => setStageName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="Stage 1: Land Preparation">Stage 1: Land Preparation</option>
                <option value="Stage 2: Planting">Stage 2: Planting</option>
                <option value="Stage 3: Seedling Establishment">Stage 3: Seedling Establishment</option>
                <option value="Stage 4: Ongoing Care">Stage 4: Ongoing Care</option>
                <option value="Stage 5: Pest & Disease Scouting">Stage 5: Pest & Disease Scouting</option>
                <option value="Stage 6: Harvest Readiness">Stage 6: Harvest Readiness</option>
                <option value="Stage 7: Harvesting">Stage 7: Harvesting</option>
                <option value="Stage 8: Post-Harvest & Curing">Stage 8: Post-Harvest & Curing</option>
                <option value="Stage 9: Season Review">Stage 9: Season Review</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Weather & Temperature Notes:
              </label>
              <input
                type="text"
                value={weatherConditions}
                onChange={e => setWeatherConditions(e.target.value)}
                placeholder="e.g. Sunny morning, frosty night (-2°C), brisk wind"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Detailed Field Observations & Plant Health Notes:
            </label>
            <textarea
              rows={3}
              value={observationNotes}
              onChange={e => setObservationNotes(e.target.value)}
              placeholder="Describe seedling height, leaf color, soil moisture feel, weeding done, insect sightings..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
                <input
                  type="checkbox"
                  checked={wateringDone}
                  onChange={e => setWateringDone(e.target.checked)}
                />
                <span>Watering / Furrow Irrigation Performed Today</span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Harvest Yield (kg) - if applicable:
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 18.5"
                value={harvestYieldKg}
                onChange={e => setHarvestYieldKg(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Photo Description / Label:
              </label>
              <input
                type="text"
                placeholder="e.g. Photo 1: Leaf canopy cover"
                value={photoNotes}
                onChange={e => setPhotoNotes(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-card)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-sage">
              Save Entry to Database
            </button>
          </div>
        </form>
      )}

      {/* Chronological Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-forest-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> Observation History Timeline
        </h3>

        {entries.map(entry => (
          <div
            key={entry.id}
            className="card"
            style={{ padding: '18px 20px', borderLeft: '4px solid var(--color-sage-accent)' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: '#e8f5e9', color: '#163e27' }}>
                  {entry.entry_date}
                </span>
                <strong style={{ fontSize: '0.98rem', color: 'var(--color-text-title)' }}>
                  {entry.stage_name}
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {entry.watering_done && (
                  <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                    <Droplets size={12} /> Watered
                  </span>
                )}
                {entry.harvest_yield_kg && (
                  <span className="badge badge-gold" style={{ background: '#fef3c7', color: '#92400e' }}>
                    Harvest: {entry.harvest_yield_kg} kg
                  </span>
                )}
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)', lineHeight: 1.5, marginBottom: '8px' }}>
              {entry.observation_notes}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {entry.weather_conditions && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Cloud size={13} color="#64748b" /> Weather: {entry.weather_conditions}
                </span>
              )}
              {entry.photo_notes && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Camera size={13} color="#2d6a4f" /> Photo: {entry.photo_notes}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
