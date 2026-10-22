import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.db import Base

class LandAssessmentModel(Base):
    __tablename__ = "land_assessments"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Natural field observations
    soil_texture = Column(String, default="unknown")
    drainage = Column(String, default="unknown")
    soil_moisture = Column(String, default="unknown")
    soil_appearance = Column(String, default="unknown")
    organic_material = Column(String, default="unknown")
    sunlight = Column(String, default="unknown")
    climate = Column(String, default="unknown")
    frost = Column(String, default="unknown")
    terrace_slope = Column(String, default="gentle_slope")
    water_source = Column(String, default="unknown")
    growing_season = Column(String, default="unknown")
    
    # Optional parameters
    region = Column(String, nullable=True)
    altitude_m = Column(Integer, nullable=True)
    current_month = Column(String, nullable=True)
    space_sqm = Column(Float, nullable=True)
    tools_materials = Column(Text, nullable=True)
    goals = Column(String, nullable=True)
    seeds_available = Column(String, nullable=True)
    
    # JSON results of land analysis
    analysis_json = Column(Text, nullable=True)

    recommendations = relationship("RecommendationHistoryModel", back_populates="assessment", cascade="all, delete-orphan")
    cultivation_plans = relationship("CultivationPlanModel", back_populates="assessment", cascade="all, delete-orphan")


class RecommendationHistoryModel(Base):
    __tablename__ = "recommendation_histories"

    id = Column(String, primary_key=True, index=True)
    assessment_id = Column(String, ForeignKey("land_assessments.id"), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    recommended_crops_json = Column(Text, nullable=False)
    excluded_crops_json = Column(Text, nullable=False)

    assessment = relationship("LandAssessmentModel", back_populates="recommendations")


class CultivationPlanModel(Base):
    __tablename__ = "cultivation_plans"

    id = Column(String, primary_key=True, index=True)
    assessment_id = Column(String, ForeignKey("land_assessments.id"), index=True, nullable=True)
    crop_id = Column(String, index=True, nullable=False)
    crop_name = Column(String, nullable=False)
    planting_date = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    stages_json = Column(Text, nullable=False)

    assessment = relationship("LandAssessmentModel", back_populates="cultivation_plans")
    tasks = relationship("PlanTaskModel", back_populates="plan", cascade="all, delete-orphan")
    journal_entries = relationship("FieldJournalEntryModel", back_populates="plan", cascade="all, delete-orphan")


class PlanTaskModel(Base):
    __tablename__ = "plan_tasks"

    id = Column(String, primary_key=True, index=True)
    plan_id = Column(String, ForeignKey("cultivation_plans.id"), index=True)
    stage_number = Column(Integer, nullable=False)
    stage_name = Column(String, nullable=False)
    task_id = Column(String, index=True, nullable=False)
    step_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    purpose = Column(Text, nullable=False)
    tools_materials_json = Column(Text, default="[]")
    instructions_json = Column(Text, default="[]")
    expected_result = Column(Text, nullable=False)
    safety_notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    plan = relationship("CultivationPlanModel", back_populates="tasks")


class FieldJournalEntryModel(Base):
    __tablename__ = "field_journal_entries"

    id = Column(String, primary_key=True, index=True)
    plan_id = Column(String, ForeignKey("cultivation_plans.id"), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    entry_date = Column(String, nullable=False)
    stage_name = Column(String, nullable=False)
    observation_notes = Column(Text, nullable=False)
    watering_done = Column(Boolean, default=False)
    weather_conditions = Column(String, nullable=True)
    symptoms_observed_json = Column(Text, default="[]")
    photo_notes = Column(Text, nullable=True)
    harvest_yield_kg = Column(Float, nullable=True)

    plan = relationship("CultivationPlanModel", back_populates="journal_entries")


class PestDiagnosisModel(Base):
    __tablename__ = "pest_diagnoses"

    id = Column(String, primary_key=True, index=True)
    assessment_id = Column(String, ForeignKey("land_assessments.id"), nullable=True)
    crop_id = Column(String, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    symptoms_json = Column(Text, nullable=False)
    affected_parts_json = Column(Text, default="[]")
    weather_notes = Column(String, nullable=True)
    diagnosis_result_json = Column(Text, nullable=False)


class HarvestAssessmentModel(Base):
    __tablename__ = "harvest_assessments"

    id = Column(String, primary_key=True, index=True)
    plan_id = Column(String, ForeignKey("cultivation_plans.id"), nullable=True)
    crop_id = Column(String, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    days_since_planting = Column(Integer, nullable=True)
    checklist_answers_json = Column(Text, nullable=False)
    maturity_percentage = Column(Integer, default=0)
    readiness_status = Column(String, nullable=False) # e.g. "ready", "almost_ready", "too_early"
    assessment_result_json = Column(Text, nullable=False)
