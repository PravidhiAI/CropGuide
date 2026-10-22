from typing import List, Optional
from pydantic import BaseModel, Field

class LandAssessmentInput(BaseModel):
    # Core Natural Observations (Non-laboratory)
    soil_texture: str = Field(default="unknown", description="sandy_and_gritty, soft_and_powdery, sticky_and_clay_like, crumbly_and_balanced, rocky_or_shallow, unknown")
    drainage: str = Field(default="unknown", description="water_disappears_quickly, water_drains_gradually, water_remains_long, pools_on_surface, unknown")
    soil_moisture: str = Field(default="unknown", description="dry_and_dusty, slightly_moist, moist_not_waterlogged, very_wet, unknown")
    soil_appearance: str = Field(default="unknown", description="dark_brown, light_brown, reddish_or_orange, pale_or_greyish, mixed, unknown")
    organic_material: str = Field(default="unknown", description="decayed_leaves_compost_visible, some_present, very_little_visible, unknown")
    sunlight: str = Field(default="unknown", description="direct_most_of_day, direct_part_of_day, mostly_shaded, seasonal_variation, unknown")
    climate: str = Field(default="unknown", description="cold_days_cold_nights, mild_days_cold_nights, very_cold_conditions, large_temperature_changes, unknown")
    frost: str = Field(default="unknown", description="rare, occasional, frequent, expected_during_growing_period, unknown")
    terrace_slope: str = Field(default="gentle_slope", description="nearly_flat, gentle_slope, steep_slope, uneven_or_rocky")
    water_source: str = Field(default="unknown", description="reliable_irrigation, rainwater_collection, limited_water, seasonal_availability, no_reliable_source")
    growing_season: str = Field(default="unknown", description="short, moderate, long, unknown")

    # Optional Contextual Fields
    region: Optional[str] = Field(default=None, description="General region name e.g. Kullu, Almora, Leh, Shimla")
    altitude_m: Optional[int] = Field(default=None, description="Estimated altitude in meters")
    current_month: Optional[str] = Field(default=None, description="Current month or season")
    space_sqm: Optional[float] = Field(default=None, description="Available terrace area in square meters")
    tools_materials: Optional[str] = Field(default=None, description="Tools and materials available e.g. shovel, compost, fleece, mulch")
    growing_goals: Optional[str] = Field(default=None, description="Goals e.g. subsistence, fresh greens, winter storage, cash crop")
    seeds_available: Optional[str] = Field(default=None, description="Seeds or seedlings the grower already holds")

class PracticalImprovement(BaseModel):
    title: str
    purpose: str
    steps: List[str]
    priority: str # "high", "medium", "optional"

class LandAnalysisOutput(BaseModel):
    assessment_id: str
    plain_language_summary: str
    favorable_conditions: List[str]
    potential_limitations: List[str]
    agricultural_risks: List[str]
    missing_information: List[str]
    practical_improvements: List[PracticalImprovement]
    confidence_level: str # "high", "medium", "low"
    confidence_explanation: str
    conflicts_detected: List[str] = Field(default_factory=list)
    follow_up_questions: List[str] = Field(default_factory=list)
    observed_facts: List[str] = Field(default_factory=list)
    inferred_conditions: List[str] = Field(default_factory=list)

class LandPhotoAnalysisRequest(BaseModel):
    image_base64: Optional[str] = Field(default=None, description="Base64 encoded photo or image data URL")
    image_name: Optional[str] = Field(default="terrace_field_photo.jpg", description="Filename or photo title")
    user_notes: Optional[str] = Field(default="", description="Survivor field notes accompanying the photo")
    current_inputs: Optional[LandAssessmentInput] = None

class LandPhotoAnalysisResponse(BaseModel):
    soil_archetype: str
    visual_features: List[str]
    input_echo: str
    inferred_inputs: LandAssessmentInput
    confidence_level: str
    uncertainties_marked: List[str]

class ChatbotMessageRequest(BaseModel):
    message: str
    conversation_history: List[dict] = Field(default_factory=list)
    current_inputs: Optional[LandAssessmentInput] = None
    selected_crop_id: Optional[str] = None

class ChatbotMessageResponse(BaseModel):
    reply: str
    suggested_followups: List[str]
    detected_input_updates: Optional[dict] = None
    actionable_tip: Optional[str] = None
