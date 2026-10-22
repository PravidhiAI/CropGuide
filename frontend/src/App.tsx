import React, { useState, useEffect } from 'react';
import {
  Mountain, AlertCircle, RefreshCw, Code, CheckCircle, Volume2,
  VolumeX, ArrowRight, Zap, Sparkles, ExternalLink
} from 'lucide-react';

import { Navbar, PageId } from './components/Navbar';
import { JSONInspectorModal } from './components/JSONInspectorModal';
import { CropDetailModal } from './components/CropDetailModal';

// Pages
import { WelcomeDashboard } from './pages/WelcomeDashboard';
import { LandAssessmentWizard } from './pages/LandAssessmentWizard';
import { LandAnalysisView } from './pages/LandAnalysisView';
import { CropRecommendationsView } from './pages/CropRecommendationsView';
import { CropComparisonView } from './pages/CropComparisonView';
import { CultivationPlanView } from './pages/CultivationPlanView';
import { OngoingCareChecklistView } from './pages/OngoingCareChecklistView';
import { PestAssistantView } from './pages/PestAssistantView';
import { HarvestReadinessView } from './pages/HarvestReadinessView';
import { HarvestStorageGuideView } from './pages/HarvestStorageGuideView';
import { FieldJournalView } from './pages/FieldJournalView';
import { CultivationCalendarView } from './pages/CultivationCalendarView';
import { LiveChallengeView } from './pages/LiveChallengeView';
import { JSONInspectorView } from './pages/JSONInspectorView';
import { SettingsExportView } from './pages/SettingsExportView';

// API & Types
import { api, RecordedApiCall } from './services/api';
import { soundManager } from './utils/audio';
import {
  LandAssessmentInput, LandAnalysisOutput,
  CropRecommendationResponse, CropComparisonResponse,
  CultivationPlanResponse
} from './types';

const DEFAULT_ASSESSMENT_INPUTS: LandAssessmentInput = {
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
  growing_season: 'moderate',
  region: 'Kullu Valley / Almora Terraces',
  altitude_m: 2100,
  current_month: 'April',
  space_sqm: 120,
  tools_materials: 'Khurpa, spade, clean mountain straw, compost',
  growing_goals: 'winter_cellar_storage',
  seeds_available: 'Barley, Lentil, Rapeseed & Mustard'
};

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('welcome');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted());
  const [backendError, setBackendError] = useState<string | null>(null);

  // State data
  const [assessmentInputs, setAssessmentInputs] = useState<LandAssessmentInput>(DEFAULT_ASSESSMENT_INPUTS);
  const [landAnalysis, setLandAnalysis] = useState<LandAnalysisOutput | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendationResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<CropComparisonResponse | null>(null);
  const [cultivationPlan, setCultivationPlan] = useState<CultivationPlanResponse | null>(null);
  const [selectedCropModal, setSelectedCropModal] = useState<any | null>(null);

  // JSON Inspector state
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [recordedCalls, setRecordedCalls] = useState<RecordedApiCall[]>([]);
  const [allCrops, setAllCrops] = useState<any[]>([]);

  useEffect(() => {
    checkBackendHealth();
    loadInitialCrops();

    // Subscribe to recorded API calls
    const unsubscribe = api.subscribeToCalls(call => {
      setRecordedCalls(api.getRecordedCalls());
    });
    setRecordedCalls(api.getRecordedCalls());

    return () => unsubscribe();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await api.checkHealth();
      setIsBackendOnline(true);
      setBackendError(null);
    } catch (err: any) {
      setIsBackendOnline(false);
      setBackendError(err.message);
    }
  };

  const loadInitialCrops = async () => {
    try {
      const crops = await api.getCrops();
      setAllCrops(crops.filter(crop => !crop.is_aggregate_group));
    } catch {
      // Ignored if backend offline
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // 1. Submit Land Assessment
  const handleSubmitAssessment = async (inputs: LandAssessmentInput) => {
    setAssessmentInputs(inputs);
    try {
      const analysis = await api.submitLandAssessment(inputs);
      setLandAnalysis(analysis);
      soundManager.playSuccess();
      setActivePage('land_analysis');

      // Pre-fetch recommendations
      const recs = await api.getRecommendations(inputs, analysis.assessment_id);
      setRecommendations(recs);
    } catch (err: any) {
      alert(`Backend Error: ${err.message}`);
    }
  };

  // 2. Fetch or view recommendations
  const handleProceedToRecommendations = async () => {
    soundManager.playClick();
    if (!recommendations) {
      try {
        const recs = await api.getRecommendations(assessmentInputs, landAnalysis?.assessment_id);
        setRecommendations(recs);
      } catch (err: any) {
        alert(err.message);
      }
    }
    setActivePage('recommendations');
  };

  // 3. Compare crops
  const handleCompareCrops = async (cropIds: string[]) => {
    try {
      const comp = await api.compareCrops(cropIds, landAnalysis?.assessment_id);
      setComparisonData(comp);
      setActivePage('crop_comparison');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 4. Adopt / generate Cultivation Plan
  const handleSelectCropForPlan = async (cropId: string) => {
    soundManager.playClick();
    const plantingDate = new Date().toISOString().split('T')[0];
    try {
      const plan = await api.createCultivationPlan(cropId, plantingDate, landAnalysis?.assessment_id);
      setCultivationPlan(plan);
      soundManager.playSuccess();
      setActivePage('cultivation_plan');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 5. Toggle task completion in Cultivation Plan
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!cultivationPlan) return;
    try {
      await api.updatePlanTask(cultivationPlan.plan_id, taskId, completed);
      // Reload refreshed plan
      const refreshed = await api.getCultivationPlan(cultivationPlan.plan_id);
      setCultivationPlan(refreshed);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 6. View Crop Botanical Details Modal
  const handleViewCropDetails = async (cropId: string) => {
    soundManager.playClick();
    try {
      const crop = await api.getCrop(cropId);
      setSelectedCropModal(crop);
    } catch {
      const fallback = allCrops.find(c => c.id === cropId);
      if (fallback) setSelectedCropModal(fallback);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isBackendOnline={isBackendOnline}
        onOpenJsonInspector={() => setIsJsonModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        assessmentCompleted={landAnalysis !== null}
        hasActivePlan={cultivationPlan !== null}
      />

      {/* Main Content Viewport */}
      <div className="main-wrapper">
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-forest-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Himalayan Decision Support
              </span>
              <span style={{ color: 'var(--color-border-card)' }}>|</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Target Scenario: High-Altitude Cold Terrace
              </span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Quick Live Challenge Button for Judges */}
            <button
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #7f4f24, #d4a373)',
                color: '#ffffff',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)'
              }}
              onClick={() => {
                soundManager.playClick();
                setActivePage('live_challenge');
              }}
            >
              <Zap size={14} />
              <span>Live Challenge Mode</span>
            </button>

            {/* Quick JSON Inspector Button */}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                soundManager.playClick();
                setIsJsonModalOpen(true);
              }}
            >
              <Code size={14} />
              <span>View API JSON</span>
            </button>
          </div>
        </header>

        {/* Backend Offline Alert Banner */}
        {!isBackendOnline && (
          <div style={{ padding: '12px 32px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>
                <strong>Backend Disconnected:</strong> Cannot reach <code>{import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}</code>. Make sure the FastAPI service is running.
              </span>
            </div>
            <button
              className="btn btn-sm"
              style={{ background: '#991b1b', color: '#ffffff', padding: '4px 10px' }}
              onClick={checkBackendHealth}
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Page Content Body */}
        <main className="content-container">
          {activePage === 'welcome' && (
            <WelcomeDashboard
              onStartAssessment={() => setActivePage('assessment_wizard')}
              onOpenLiveChallenge={() => setActivePage('live_challenge')}
              onExploreCrops={() => setActivePage('recommendations')}
              isBackendOnline={isBackendOnline}
              totalCropsCount={allCrops.length}
            />
          )}

          {activePage === 'assessment_wizard' && (
            <LandAssessmentWizard
              initialValues={assessmentInputs}
              onSubmit={handleSubmitAssessment}
              isSubmitting={false}
              onViewAnalysis={() => setActivePage('land_analysis')}
              hasExistingAnalysis={landAnalysis !== null}
            />
          )}

          {activePage === 'land_analysis' && (
            <LandAnalysisView
              analysis={landAnalysis}
              onProceedToRecommendations={handleProceedToRecommendations}
              onReevaluateAssessment={() => setActivePage('assessment_wizard')}
              onOpenJsonInspector={() => setIsJsonModalOpen(true)}
            />
          )}

          {activePage === 'recommendations' && (
            <CropRecommendationsView
              recommendationData={recommendations}
              onSelectCropForPlan={handleSelectCropForPlan}
              onViewCropDetails={handleViewCropDetails}
              onCompareCrops={handleCompareCrops}
              onOpenJsonInspector={() => setIsJsonModalOpen(true)}
              onReevaluate={() => setActivePage('assessment_wizard')}
            />
          )}

          {activePage === 'crop_comparison' && (
            <CropComparisonView
              comparisonData={comparisonData}
              onBackToRecommendations={() => setActivePage('recommendations')}
              onSelectCropForPlan={handleSelectCropForPlan}
              onOpenJsonInspector={() => setIsJsonModalOpen(true)}
            />
          )}

          {activePage === 'cultivation_plan' && (
            <CultivationPlanView
              plan={cultivationPlan}
              onToggleTask={handleToggleTask}
              onOpenCareChecklist={() => setActivePage('ongoing_care')}
              onOpenHarvestReadiness={() => setActivePage('harvest_readiness')}
              onOpenJsonInspector={() => setIsJsonModalOpen(true)}
              onSelectAnotherCrop={() => setActivePage('recommendations')}
            />
          )}

          {activePage === 'ongoing_care' && (
            <OngoingCareChecklistView
              plan={cultivationPlan}
              onToggleTask={handleToggleTask}
              onOpenCultivationPlan={() => setActivePage('cultivation_plan')}
            />
          )}

          {activePage === 'pest_assistant' && (
            <PestAssistantView
              cropId={cultivationPlan?.crop_id}
              cropName={cultivationPlan?.crop_name}
              onOpenJsonInspector={() => setIsJsonModalOpen(true)}
            />
          )}

          {activePage === 'harvest_readiness' && (
            <HarvestReadinessView
              cropId={cultivationPlan?.crop_id || 'barley'}
              cropName={cultivationPlan?.crop_name || 'Barley (Jau)'}
              plantingDate={cultivationPlan?.planting_date}
              onOpenStorageGuide={() => setActivePage('harvest_storage')}
              onOpenJsonInspector={() => setIsJsonModalOpen(true)}
            />
          )}

          {activePage === 'harvest_storage' && (
            <HarvestStorageGuideView
              cropName={cultivationPlan?.crop_name}
              onOpenFieldJournal={() => setActivePage('field_journal')}
              onOpenCultivationPlan={() => setActivePage('cultivation_plan')}
            />
          )}

          {activePage === 'field_journal' && (
            <FieldJournalView
              planId={cultivationPlan?.plan_id}
              cropName={cultivationPlan?.crop_name}
              onOpenCultivationPlan={() => setActivePage('cultivation_plan')}
              onOpenJsonInspector={() => setIsJsonModalOpen(true)}
            />
          )}

          {activePage === 'calendar' && (
            <CultivationCalendarView
              plan={cultivationPlan}
              onOpenCultivationPlan={() => setActivePage('cultivation_plan')}
              onOpenOngoingCare={() => setActivePage('ongoing_care')}
            />
          )}

          {activePage === 'live_challenge' && (
            <LiveChallengeView
              onOpenCropDetails={handleViewCropDetails}
              onAdoptCropPlan={handleSelectCropForPlan}
            />
          )}

          {activePage === 'json_inspector' && (
            <JSONInspectorView
              recordedCalls={recordedCalls}
              onClearHistory={() => api.clearRecordedCalls()}
            />
          )}

          {activePage === 'settings_export' && (
            <SettingsExportView
              isBackendOnline={isBackendOnline}
              onCheckHealth={checkBackendHealth}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              fullDataPayload={{
                assessment: landAnalysis,
                recommendations: recommendations,
                plan: cultivationPlan
              }}
            />
          )}
        </main>
      </div>

      {/* Floating JSON Inspector Modal */}
      <JSONInspectorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        recordedCalls={recordedCalls}
        activePayload={
          activePage === 'recommendations'
            ? recommendations
            : (activePage === 'land_analysis'
              ? landAnalysis
              : (activePage === 'cultivation_plan' ? cultivationPlan : null))
        }
        activeEndpointName={
          activePage === 'recommendations'
            ? '/api/v1/recommendations'
            : (activePage === 'land_analysis'
              ? '/api/v1/land-assessments'
              : (activePage === 'cultivation_plan' ? '/api/v1/cultivation-plans' : undefined))
        }
      />

      {/* Botanical Crop Specs Modal */}
      <CropDetailModal
        crop={selectedCropModal}
        isOpen={selectedCropModal !== null}
        onClose={() => setSelectedCropModal(null)}
        onSelectForPlan={handleSelectCropForPlan}
      />
    </div>
  );
};

export default App;
