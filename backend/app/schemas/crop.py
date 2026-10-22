from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class CropRecommendationItem(BaseModel):
    crop_id: str
    common_name: str
    scientific_name: str
    suitability_category: str # "highly_suitable", "moderately_suitable", "conditionally_suitable"
    suitability_score: int # 0 - 100
    reasons_for_recommendation: List[str]
    matching_land_conditions: List[str]
    potential_problems: List[str]
    required_growing_conditions: List[str]
    planting_window: str
    estimated_harvest_period: str
    care_requirements: List[str]
    confidence_level: str # "high", "medium"
    supporting_sources: List[str]
    cultivation_method: str
    spacing_summary: str

class CropExclusionItem(BaseModel):
    crop_id: str
    common_name: str
    scientific_name: str
    primary_exclusion_reason: str
    conflicting_conditions: List[str]
    explanation: str

class CropRecommendationResponse(BaseModel):
    assessment_id: Optional[str] = None
    recommended_crops: List[CropRecommendationItem]
    excluded_crops: List[CropExclusionItem]
    land_summary: str
    overall_confidence: str
    adaptive_questions: List[str] = Field(default_factory=list)

class CropComparisonRequest(BaseModel):
    crop_ids: List[str] = Field(min_length=2, max_length=3)
    assessment_id: Optional[str] = None

class CropComparisonItem(BaseModel):
    crop_id: str
    common_name: str
    scientific_name: str
    suitability_category: str
    suitability_score: int
    growing_days: str
    water_demand: str
    frost_tolerance: str
    soil_flexibility: str
    maintenance_level: str
    storage_potential: str
    key_advantages: List[str]
    primary_tradeoffs: List[str]
    verdict: str

class CropComparisonResponse(BaseModel):
    compared_crops: List[CropComparisonItem]
    head_to_head_summary: str
