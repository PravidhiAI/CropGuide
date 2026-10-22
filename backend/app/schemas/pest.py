from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class PestDiagnosisRequest(BaseModel):
    assessment_id: Optional[str] = None
    crop_id: Optional[str] = None
    symptoms: List[str] = Field(min_length=1, description="List of observed symptoms like holes_in_leaves, yellowing, wilting, leaf_spots, white_powdery_growth, stunted_growth, damaged_roots, rotting_plant_parts, visible_insects, sticky_residue, chewed_stems, poor_germination")
    affected_plant_parts: List[str] = Field(default_factory=list, description="leaves, stems, roots, collar, flowers, fruits_curds")
    moisture_condition: Optional[str] = None # dry, damp_dew, soggy_flooded
    visible_insects: Optional[str] = None # green_aphids, caterpillars, flea_beetles, none_seen
    progression: Optional[str] = None # rapid_overnight, gradual_over_week

class PossibleCauseItem(BaseModel):
    disorder_id: str
    common_name: str
    scientific_name: str
    category: str # "pest_insect", "disease_fungal", "disease_fungal_like", "disease_fungal_soilborne", "abiotic_stress"
    confidence_level: str # "high", "medium", "low"
    match_percentage: int
    matching_symptoms: List[str]
    distinguishing_features: str
    conducive_weather: str
    cultural_controls: List[str]
    physical_controls: List[str]
    biological_controls: List[str]
    safe_treatments: List[str]
    escalation_criteria: str
    sources: List[str]

class PestDiagnosisResponse(BaseModel):
    possible_causes: List[PossibleCauseItem]
    investigative_summary: str
    follow_up_questions: List[str]
    ipm_general_protocol: List[str]
    disclaimer: str

class HarvestAssessmentRequest(BaseModel):
    plan_id: Optional[str] = None
    crop_id: str
    days_since_planting: int
    checklist_answers: Dict[str, bool] = Field(description="Dictionary of boolean checks e.g. foliage_yellowing: true, head_firm: true")
    weather_forecast: Optional[str] = None # dry_sunny, impending_rain, impending_frost

class HarvestAssessmentResponse(BaseModel):
    crop_id: str
    crop_name: str
    days_since_planting: int
    estimated_maturity_range: str
    maturity_percentage: int
    readiness_status: str # "ready_for_harvest", "approaching_maturity", "too_early", "overdue_risk"
    readiness_summary: str
    observable_signs_evaluated: List[Dict[str, Any]]
    weather_guidance: str
    reasons_to_delay: List[str]
    harvest_tools_needed: List[str]
    harvest_steps: List[str]
    post_harvest_storage_specs: Dict[str, Any]
