from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class CultivationTaskSchema(BaseModel):
    task_id: str
    step_number: int
    stage_number: int
    stage_name: str
    title: str
    purpose: str
    tools_materials: List[str]
    instructions: List[str]
    expected_result: str
    safety_notes: Optional[str] = None
    completed: bool = False
    completed_at: Optional[str] = None
    notes: Optional[str] = None

class CultivationStageSchema(BaseModel):
    stage_number: int
    stage_name: str
    stage_description: str
    estimated_day_range: str
    tasks: List[CultivationTaskSchema]

class CultivationPlanCreateRequest(BaseModel):
    assessment_id: Optional[str] = None
    crop_id: str
    planting_date: str = Field(description="ISO format YYYY-MM-DD or standard date string")

class CultivationPlanResponse(BaseModel):
    plan_id: str
    assessment_id: Optional[str] = None
    crop_id: str
    crop_name: str
    scientific_name: str
    planting_date: str
    estimated_harvest_window: str
    total_days_estimate: int
    total_stages: int
    total_tasks_count: int
    completed_tasks_count: int
    progress_percentage: float
    stages: List[CultivationStageSchema]
    supporting_sources: List[str]

class TaskPatchRequest(BaseModel):
    completed: bool
    notes: Optional[str] = None

class FieldJournalEntryCreate(BaseModel):
    plan_id: str
    entry_date: str
    stage_name: str
    observation_notes: str
    watering_done: bool = False
    weather_conditions: Optional[str] = None
    symptoms_observed: List[str] = Field(default_factory=list)
    photo_notes: Optional[str] = None
    harvest_yield_kg: Optional[float] = None

class FieldJournalEntryResponse(BaseModel):
    id: str
    plan_id: str
    created_at: str
    entry_date: str
    stage_name: str
    observation_notes: str
    watering_done: bool
    weather_conditions: Optional[str]
    symptoms_observed: List[str]
    photo_notes: Optional[str]
    harvest_yield_kg: Optional[float]
