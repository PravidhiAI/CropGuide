// TERRAFORM API Client with real backend integration and JSON Inspector trace recording
import {
  ResponseEnvelope,
  LandAssessmentInput,
  LandAnalysisOutput,
  CropRecommendationResponse,
  CropComparisonResponse,
  CultivationPlanResponse,
  FieldJournalEntry,
  PestDiagnosisResponse,
  HarvestAssessmentResponse,
  LiveChallengeResponse,
  LandPhotoAnalysisResponse,
  ChatbotMessageResponse
} from '../types';

export interface RecordedApiCall {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  requestPayload: any;
  responsePayload: any;
  status: number;
  durationMs: number;
  success: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiService {
  private recordedCalls: RecordedApiCall[] = [];
  private listeners: ((call: RecordedApiCall) => void)[] = [];

  constructor() {
    const saved = localStorage.getItem('terraform_recorded_api_calls');
    if (saved) {
      try {
        this.recordedCalls = JSON.parse(saved);
      } catch {
        this.recordedCalls = [];
      }
    }
  }

  public subscribeToCalls(listener: (call: RecordedApiCall) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getRecordedCalls(): RecordedApiCall[] {
    return [...this.recordedCalls];
  }

  public getLastCall(): RecordedApiCall | null {
    return this.recordedCalls.length > 0 ? this.recordedCalls[0] : null;
  }

  public clearRecordedCalls() {
    this.recordedCalls = [];
    localStorage.removeItem('terraform_recorded_api_calls');
  }

  private recordCall(call: RecordedApiCall) {
    this.recordedCalls.unshift(call);
    if (this.recordedCalls.length > 50) {
      this.recordedCalls.pop();
    }
    localStorage.setItem('terraform_recorded_api_calls', JSON.stringify(this.recordedCalls));
    this.listeners.forEach(l => l(call));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const startTime = performance.now();
    const callId = `call-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const method = options.method || 'GET';
    let requestPayload = null;

    if (options.body && typeof options.body === 'string') {
      try {
        requestPayload = JSON.parse(options.body);
        if (endpoint === '/api/v1/land-photo/analyze' && requestPayload?.image_base64) {
          requestPayload.image_base64 = '[image omitted]';
        }
      } catch {
        requestPayload = options.body;
      }
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      const response = await fetch(url, {
        ...options,
        headers
      });

      const durationMs = Math.round(performance.now() - startTime);
      const text = await response.text();
      let responsePayload: any = null;

      try {
        responsePayload = text ? JSON.parse(text) : null;
      } catch {
        responsePayload = text;
      }

      const recorded: RecordedApiCall = {
        id: callId,
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        requestPayload,
        responsePayload,
        status: response.status,
        durationMs,
        success: response.ok
      };
      this.recordCall(recorded);

      if (!response.ok) {
        const errorMsg = responsePayload?.detail || `Server returned HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const envelope: ResponseEnvelope<T> = responsePayload;
      return envelope.data;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const recorded: RecordedApiCall = {
        id: callId,
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        requestPayload,
        responsePayload: { error: err.message },
        status: 0,
        durationMs,
        success: false
      };
      this.recordCall(recorded);

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Ensure the FastAPI server is running with 'uvicorn backend.app.main:app --reload'.`);
      }
      throw err;
    }
  }

  // Health
  public async checkHealth(): Promise<any> {
    return this.request<any>('/api/v1/health');
  }

  // Crops & Sources
  public async getCrops(): Promise<any[]> {
    return this.request<any[]>('/api/v1/crops');
  }

  public async getCrop(cropId: string): Promise<any> {
    return this.request<any>(`/api/v1/crops/${cropId}`);
  }

  public async getSources(): Promise<any> {
    return this.request<any>('/api/v1/sources');
  }

  // Land Assessments
  public async submitLandAssessment(inputs: LandAssessmentInput): Promise<LandAnalysisOutput> {
    return this.request<LandAnalysisOutput>('/api/v1/land-assessments', {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  }

  public async getLandAssessment(assessmentId: string): Promise<any> {
    return this.request<any>(`/api/v1/land-assessments/${assessmentId}`);
  }

  // Recommendations
  public async getRecommendations(inputs: LandAssessmentInput, assessmentId?: string): Promise<CropRecommendationResponse> {
    const url = assessmentId ? `/api/v1/recommendations?assessment_id=${encodeURIComponent(assessmentId)}` : '/api/v1/recommendations';
    return this.request<CropRecommendationResponse>(url, {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  }

  // Crop Comparisons
  public async compareCrops(cropIds: string[], assessmentId?: string): Promise<CropComparisonResponse> {
    return this.request<CropComparisonResponse>('/api/v1/crop-comparisons', {
      method: 'POST',
      body: JSON.stringify({ crop_ids: cropIds, assessment_id: assessmentId })
    });
  }

  // Cultivation Plans
  public async createCultivationPlan(cropId: string, plantingDate: string, assessmentId?: string): Promise<CultivationPlanResponse> {
    return this.request<CultivationPlanResponse>('/api/v1/cultivation-plans', {
      method: 'POST',
      body: JSON.stringify({
        crop_id: cropId,
        planting_date: plantingDate,
        assessment_id: assessmentId
      })
    });
  }

  public async getCultivationPlan(planId: string): Promise<CultivationPlanResponse> {
    return this.request<CultivationPlanResponse>(`/api/v1/cultivation-plans/${planId}`);
  }

  public async updatePlanTask(planId: string, taskId: string, completed: boolean, notes?: string): Promise<any> {
    return this.request<any>(`/api/v1/cultivation-plans/${planId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed, notes })
    });
  }

  // Field Journal Observations
  public async logFieldObservation(entry: {
    plan_id: string;
    entry_date: string;
    stage_name: string;
    observation_notes: string;
    watering_done: boolean;
    weather_conditions?: string;
    symptoms_observed?: string[];
    photo_notes?: string;
    harvest_yield_kg?: number;
  }): Promise<FieldJournalEntry> {
    return this.request<FieldJournalEntry>('/api/v1/observations', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  }

  public async getFieldJournal(planId: string): Promise<FieldJournalEntry[]> {
    return this.request<FieldJournalEntry[]>(`/api/v1/cultivation-plans/${planId}/journal`);
  }

  // Pest Diagnosis
  public async diagnosePest(req: {
    crop_id?: string;
    symptoms: string[];
    affected_plant_parts?: string[];
    moisture_condition?: string;
    visible_insects?: string;
    progression?: string;
  }): Promise<PestDiagnosisResponse> {
    return this.request<PestDiagnosisResponse>('/api/v1/pest-diagnosis', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  // Harvest Assessment
  public async assessHarvestReadiness(req: {
    crop_id: string;
    days_since_planting: number;
    checklist_answers: Record<string, boolean>;
    weather_forecast?: string;
  }): Promise<HarvestAssessmentResponse> {
    return this.request<HarvestAssessmentResponse>('/api/v1/harvest-assessments', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  // Live Challenge Mode
  public async evaluateLiveChallenge(req: {
    current_inputs: LandAssessmentInput;
    previous_inputs?: LandAssessmentInput;
    preset_scenario_name?: string;
  }): Promise<LiveChallengeResponse> {
    return this.request<LiveChallengeResponse>('/api/v1/live-challenge/evaluate', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  // Master CSV Dataset
  public async getCropsCsvData(): Promise<{ total_records: number; csv_file: string; records: any[] }> {
    return this.request<{ total_records: number; csv_file: string; records: any[] }>('/api/v1/crops-csv');
  }

  // Photo Land Analysis (Step 1)
  public async analyzeLandPhoto(req: {
    image_base64?: string;
    image_name?: string;
    user_notes?: string;
    current_inputs?: LandAssessmentInput;
  }): Promise<LandPhotoAnalysisResponse> {
    return this.request<LandPhotoAnalysisResponse>('/api/v1/land-photo/analyze', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  // Interactive Survivor Chatbot (Step 1)
  public async sendChatbotMessage(req: {
    message: string;
    conversation_history?: { sender: 'user' | 'assistant'; text: string }[];
    current_inputs?: LandAssessmentInput;
    selected_crop_id?: string;
  }): Promise<ChatbotMessageResponse> {
    return this.request<ChatbotMessageResponse>('/api/v1/chatbot/message', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  // Ten-Step Protocol Structure
  public async getTenStepsProtocol(): Promise<any[]> {
    return this.request<any[]>('/api/v1/ten-steps/protocol');
  }
}

export const api = new ApiService();
