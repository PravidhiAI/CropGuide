// TypeScript interfaces for TERRAFORM Agricultural Intelligence System

export interface ResponseEnvelope<T> {
  success: boolean;
  data: T;
  metadata: {
    engine_version: string;
    knowledge_base_version: string;
    generated_at: string;
    sources: string[];
  };
  warnings: string[];
}

export interface LandAssessmentInput {
  soil_texture: string;
  drainage: string;
  soil_moisture: string;
  soil_appearance: string;
  organic_material: string;
  sunlight: string;
  climate: string;
  frost: string;
  terrace_slope: string;
  water_source: string;
  growing_season: string;
  region?: string;
  altitude_m?: number;
  current_month?: string;
  space_sqm?: number;
  tools_materials?: string;
  growing_goals?: string;
  seeds_available?: string;
}

export interface PracticalImprovement {
  title: string;
  purpose: string;
  steps: string[];
  priority: 'high' | 'medium' | 'optional';
}

export interface LandAnalysisOutput {
  assessment_id: string;
  plain_language_summary: string;
  favorable_conditions: string[];
  potential_limitations: string[];
  agricultural_risks: string[];
  missing_information: string[];
  practical_improvements: PracticalImprovement[];
  confidence_level: 'high' | 'medium' | 'low';
  confidence_explanation: string;
  conflicts_detected: string[];
  follow_up_questions: string[];
  observed_facts: string[];
  inferred_conditions: string[];
}

export interface CropRecommendationItem {
  crop_id: string;
  common_name: string;
  scientific_name: string;
  suitability_category: 'highly_suitable' | 'moderately_suitable' | 'conditionally_suitable';
  suitability_score: number;
  reasons_for_recommendation: string[];
  matching_land_conditions: string[];
  potential_problems: string[];
  required_growing_conditions: string[];
  planting_window: string;
  estimated_harvest_period: string;
  care_requirements: string[];
  confidence_level: string;
  supporting_sources: string[];
  cultivation_method: string;
  spacing_summary: string;
}

export interface CropExclusionItem {
  crop_id: string;
  common_name: string;
  scientific_name: string;
  primary_exclusion_reason: string;
  conflicting_conditions: string[];
  explanation: string;
}

export interface CropRecommendationResponse {
  assessment_id?: string;
  recommended_crops: CropRecommendationItem[];
  excluded_crops: CropExclusionItem[];
  land_summary: string;
  overall_confidence: string;
  adaptive_questions: string[];
}

export interface CropComparisonItem {
  crop_id: string;
  common_name: string;
  scientific_name: string;
  suitability_category: string;
  suitability_score: number;
  growing_days: string;
  water_demand: string;
  frost_tolerance: string;
  soil_flexibility: string;
  maintenance_level: string;
  storage_potential: string;
  key_advantages: string[];
  primary_tradeoffs: string[];
  verdict: string;
}

export interface CropComparisonResponse {
  compared_crops: CropComparisonItem[];
  head_to_head_summary: string;
}

export interface CultivationTask {
  task_id: string;
  step_number: number;
  stage_number: number;
  stage_name: string;
  title: string;
  purpose: string;
  tools_materials: string[];
  instructions: string[];
  expected_result: string;
  safety_notes?: string;
  completed: boolean;
  completed_at?: string;
  notes?: string;
}

export interface CultivationStage {
  stage_number: number;
  stage_name: string;
  stage_description: string;
  estimated_day_range: string;
  tasks: CultivationTask[];
}

export interface CultivationPlanResponse {
  plan_id: string;
  assessment_id?: string;
  crop_id: string;
  crop_name: string;
  scientific_name: string;
  planting_date: string;
  estimated_harvest_window: string;
  total_days_estimate: number;
  total_stages: number;
  total_tasks_count: number;
  completed_tasks_count: number;
  progress_percentage: number;
  stages: CultivationStage[];
  supporting_sources: string[];
}

export interface FieldJournalEntry {
  id: string;
  plan_id: string;
  created_at?: string;
  entry_date: string;
  stage_name: string;
  observation_notes: string;
  watering_done: boolean;
  weather_conditions?: string;
  symptoms_observed: string[];
  photo_notes?: string;
  harvest_yield_kg?: number;
}

export interface PossibleCauseItem {
  disorder_id: string;
  common_name: string;
  scientific_name: string;
  category: string;
  confidence_level: 'high' | 'medium' | 'low';
  match_percentage: number;
  matching_symptoms: string[];
  distinguishing_features: string;
  conducive_weather: string;
  cultural_controls: string[];
  physical_controls: string[];
  biological_controls: string[];
  safe_treatments: string[];
  escalation_criteria: string;
  sources: string[];
}

export interface PestDiagnosisResponse {
  possible_causes: PossibleCauseItem[];
  investigative_summary: string;
  follow_up_questions: string[];
  ipm_general_protocol: string[];
  disclaimer: string;
}

export interface HarvestAssessmentResponse {
  crop_id: string;
  crop_name: string;
  days_since_planting: number;
  estimated_maturity_range: string;
  maturity_percentage: number;
  readiness_status: 'ready_for_harvest' | 'approaching_maturity' | 'too_early' | 'overdue_risk';
  readiness_summary: string;
  observable_signs_evaluated: {
    sign_id: string;
    description: string;
    verified: boolean;
  }[];
  weather_guidance: string;
  reasons_to_delay: string[];
  harvest_tools_needed: string[];
  harvest_steps: string[];
  post_harvest_storage_specs: Record<string, any>;
}

export interface LiveChallengeResponse {
  current_inputs: LandAssessmentInput;
  input_changes: {
    field: string;
    old_value: any;
    new_value: any;
  }[];
  diff_explanation: string[];
  land_analysis: LandAnalysisOutput;
  recommendations: CropRecommendationResponse;
  top_crop: string;
  recommended_count: number;
  excluded_count: number;
}

export interface CsvCropRecord {
  Crop: string;
  Crop_Record_Type: string;
  'Season(s)_in_Source': string;
  Soil_Texture_Preference: string;
  Rainfall_Drainage_Preference: string;
  Soil_Moisture_Preference: string;
  Soil_Appearance_Organic_Matter_Preference: string;
  Frost_Tolerance_Context: string;
  Solar_Exposure_Preference: string;
  Daily_Climate_Preference: string;
  Terrace_Slope_Stability_Preference: string;
  Irrigation_Water_Requirement: string;
  Growing_Season_Length: string;
  Rule_Status: string;
  Notes: string;
  [key: string]: any;
}

export interface CsvDatasetResponse {
  total_records: number;
  csv_file: string;
  records: CsvCropRecord[];
}

export interface LandPhotoAnalysisRequest {
  image_base64?: string;
  image_name?: string;
  user_notes?: string;
  current_inputs?: LandAssessmentInput;
}

export interface LandPhotoAnalysisResponse {
  soil_archetype: string;
  visual_features: string[];
  input_echo: string;
  inferred_inputs: LandAssessmentInput;
  confidence_level: string;
  uncertainties_marked: string[];
}

export interface ChatbotMessageRequest {
  message: string;
  conversation_history?: { sender: 'user' | 'assistant'; text: string }[];
  current_inputs?: LandAssessmentInput;
  selected_crop_id?: string;
}

export interface ChatbotMessageResponse {
  reply: string;
  suggested_followups: string[];
  detected_input_updates?: Partial<LandAssessmentInput>;
  actionable_tip?: string;
}

export interface StepProtocolItem {
  step_number: number;
  title: string;
  tagline: string;
  description: string;
}

