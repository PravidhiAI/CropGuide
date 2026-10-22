import json
import uuid
import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.db import get_db
from backend.app.database.models import (
    LandAssessmentModel, RecommendationHistoryModel,
    CultivationPlanModel, PlanTaskModel, FieldJournalEntryModel,
    PestDiagnosisModel, HarvestAssessmentModel
)
import csv
import os
from backend.app.schemas.common import ResponseEnvelope, MetadataSchema
from backend.app.schemas.land_assessment import (
    LandAssessmentInput, LandAnalysisOutput,
    LandPhotoAnalysisRequest, LandPhotoAnalysisResponse,
    ChatbotMessageRequest, ChatbotMessageResponse
)
from backend.app.schemas.crop import (
    CropRecommendationResponse, CropComparisonRequest, CropComparisonResponse
)
from backend.app.schemas.cultivation import (
    CultivationPlanCreateRequest, CultivationPlanResponse, TaskPatchRequest,
    FieldJournalEntryCreate, FieldJournalEntryResponse, CultivationStageSchema,
    CultivationTaskSchema
)
from backend.app.schemas.pest import (
    PestDiagnosisRequest, PestDiagnosisResponse,
    HarvestAssessmentRequest, HarvestAssessmentResponse
)
from backend.app.knowledge_base.loader import kb
from backend.app.engine.land_analysis import land_engine
from backend.app.engine.recommendation import recommendation_engine
from backend.app.engine.cultivation_planner import cultivation_planner
from backend.app.engine.pest_engine import pest_engine
from backend.app.engine.harvest_engine import harvest_engine
from backend.app.engine.land_photo_assistant import land_assistant

router = APIRouter(prefix="/api/v1")

def make_envelope(data: Any, sources: List[str] = None, warnings: List[str] = None) -> Dict[str, Any]:
    return {
        "success": True,
        "data": data,
        "metadata": {
            "engine_version": "1.0",
            "knowledge_base_version": "1.0",
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "sources": sources or [
                "ICAR-VPKAS Almora Mountain Agriculture Research",
                "ICAR-CPRI Shimla Hill Potato Agronomy",
                "ICAR-IARI Katrain Temperate Vegetable Science",
                "ICAR-IIWBR Karnal Hill Barley Program"
            ]
        },
        "warnings": warnings or []
    }

# ---------------- 1. Health ----------------
@router.get("/health")
def health_check():
    return make_envelope({
        "status": "healthy",
        "service": "TERRAFORM Agricultural Intelligence Engine",
        "scenario": "High-Altitude Cold Terrace",
        "knowledge_base": {
            "crops_count": len(kb.get_all_crops()),
            "pests_count": len(kb.get_all_pests()),
            "methods_count": len(kb.get_methods())
        }
    })

# ---------------- 2. Crops ----------------
@router.get("/crops")
def list_crops():
    crops = kb.get_all_crops()
    return make_envelope(crops)

@router.get("/crops/{crop_id}")
def get_crop_details(crop_id: str):
    crop = kb.get_crop(crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop with ID '{crop_id}' not found.")
    return make_envelope(crop)

# ---------------- 3. Sources ----------------
@router.get("/sources")
def get_sources():
    sources = kb.get_sources()
    return make_envelope(sources)

# ---------------- 4. Land Assessments ----------------
@router.post("/land-assessments")
def create_land_assessment(inputs: LandAssessmentInput, db: Session = Depends(get_db)):
    assessment_id = f"asm-{uuid.uuid4().hex[:8]}"
    analysis = land_engine.analyze(inputs, assessment_id=assessment_id)

    # Persist in DB
    db_assessment = LandAssessmentModel(
        id=assessment_id,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        soil_texture=inputs.soil_texture,
        drainage=inputs.drainage,
        soil_moisture=inputs.soil_moisture,
        soil_appearance=inputs.soil_appearance,
        organic_material=inputs.organic_material,
        sunlight=inputs.sunlight,
        climate=inputs.climate,
        frost=inputs.frost,
        terrace_slope=inputs.terrace_slope,
        water_source=inputs.water_source,
        growing_season=inputs.growing_season,
        region=inputs.region,
        altitude_m=inputs.altitude_m,
        current_month=inputs.current_month,
        space_sqm=inputs.space_sqm,
        tools_materials=inputs.tools_materials,
        goals=inputs.growing_goals,
        seeds_available=inputs.seeds_available,
        analysis_json=json.dumps(analysis.model_dump())
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    return make_envelope(analysis.model_dump(), warnings=analysis.conflicts_detected)

@router.get("/land-assessments/{assessment_id}")
def get_land_assessment(assessment_id: str, db: Session = Depends(get_db)):
    db_assessment = db.query(LandAssessmentModel).filter(LandAssessmentModel.id == assessment_id).first()
    if not db_assessment:
        raise HTTPException(status_code=404, detail=f"Assessment '{assessment_id}' not found.")

    analysis_data = json.loads(db_assessment.analysis_json) if db_assessment.analysis_json else {}
    return make_envelope({
        "assessment_id": db_assessment.id,
        "created_at": db_assessment.created_at.isoformat() if db_assessment.created_at else None,
        "inputs": {
            "soil_texture": db_assessment.soil_texture,
            "drainage": db_assessment.drainage,
            "soil_moisture": db_assessment.soil_moisture,
            "soil_appearance": db_assessment.soil_appearance,
            "organic_material": db_assessment.organic_material,
            "sunlight": db_assessment.sunlight,
            "climate": db_assessment.climate,
            "frost": db_assessment.frost,
            "terrace_slope": db_assessment.terrace_slope,
            "water_source": db_assessment.water_source,
            "growing_season": db_assessment.growing_season,
            "region": db_assessment.region,
            "altitude_m": db_assessment.altitude_m,
            "current_month": db_assessment.current_month,
            "space_sqm": db_assessment.space_sqm,
            "tools_materials": db_assessment.tools_materials,
            "growing_goals": db_assessment.goals,
            "seeds_available": db_assessment.seeds_available
        },
        "analysis": analysis_data
    })

# ---------------- 5. Recommendations ----------------
@router.post("/recommendations")
def get_recommendations(inputs: LandAssessmentInput, assessment_id: Optional[str] = None, db: Session = Depends(get_db)):
    rec_result = recommendation_engine.evaluate(inputs, assessment_id=assessment_id)

    # Persist in DB if assessment_id exists
    if assessment_id:
        rec_history = RecommendationHistoryModel(
            id=f"rec-{uuid.uuid4().hex[:8]}",
            assessment_id=assessment_id,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            recommended_crops_json=json.dumps([r.model_dump() for r in rec_result.recommended_crops]),
            excluded_crops_json=json.dumps([e.model_dump() for e in rec_result.excluded_crops])
        )
        db.add(rec_history)
        db.commit()

    return make_envelope(rec_result.model_dump())

# ---------------- 6. Crop Comparison ----------------
@router.post("/crop-comparisons")
def compare_crops(req: CropComparisonRequest):
    try:
        comparison = recommendation_engine.compare_crops(req.crop_ids, assessment_id=req.assessment_id)
        return make_envelope(comparison.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- 7. Cultivation Plans ----------------
@router.post("/cultivation-plans")
def create_cultivation_plan(req: CultivationPlanCreateRequest, db: Session = Depends(get_db)):
    try:
        plan_response = cultivation_planner.generate_plan(
            crop_id=req.crop_id,
            planting_date_str=req.planting_date,
            assessment_id=req.assessment_id
        )

        # Persist plan
        db_plan = CultivationPlanModel(
            id=plan_response.plan_id,
            assessment_id=req.assessment_id,
            crop_id=plan_response.crop_id,
            crop_name=plan_response.crop_name,
            planting_date=plan_response.planting_date,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
            stages_json=json.dumps([s.model_dump() for s in plan_response.stages])
        )
        db.add(db_plan)

        # Persist tasks
        for stage in plan_response.stages:
            for task in stage.tasks:
                db_task = PlanTaskModel(
                    id=task.task_id,
                    plan_id=plan_response.plan_id,
                    stage_number=task.stage_number,
                    stage_name=task.stage_name,
                    task_id=task.task_id,
                    step_number=task.step_number,
                    title=task.title,
                    purpose=task.purpose,
                    tools_materials_json=json.dumps(task.tools_materials),
                    instructions_json=json.dumps(task.instructions),
                    expected_result=task.expected_result,
                    safety_notes=task.safety_notes,
                    completed=False
                )
                db.add(db_task)

        db.commit()
        db.refresh(db_plan)

        return make_envelope(plan_response.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/cultivation-plans/{plan_id}")
def get_cultivation_plan(plan_id: str, db: Session = Depends(get_db)):
    db_plan = db.query(CultivationPlanModel).filter(CultivationPlanModel.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail=f"Cultivation plan '{plan_id}' not found.")

    tasks = db.query(PlanTaskModel).filter(PlanTaskModel.plan_id == plan_id).all()
    tasks_by_id = {t.id: t for t in tasks}

    stages_data = json.loads(db_plan.stages_json)
    completed_count = 0
    total_count = 0

    reconstructed_stages = []
    for s in stages_data:
        reconstructed_tasks = []
        for t in s["tasks"]:
            total_count += 1
            db_t = tasks_by_id.get(t["task_id"])
            if db_t and db_t.completed:
                completed_count += 1
                t["completed"] = True
                t["completed_at"] = db_t.completed_at.isoformat() if db_t.completed_at else None
                t["notes"] = db_t.notes
            else:
                t["completed"] = False
                t["completed_at"] = None
                t["notes"] = db_t.notes if db_t else None
            reconstructed_tasks.append(t)
        s["tasks"] = reconstructed_tasks
        reconstructed_stages.append(s)

    crop = kb.get_crop(db_plan.crop_id) or {}
    progress_pct = round((completed_count / max(1, total_count)) * 100, 1)

    return make_envelope({
        "plan_id": db_plan.id,
        "assessment_id": db_plan.assessment_id,
        "crop_id": db_plan.crop_id,
        "crop_name": db_plan.crop_name,
        "scientific_name": crop.get("scientific_name", ""),
        "planting_date": db_plan.planting_date,
        "estimated_harvest_window": f"{crop.get('growing_season', {}).get('min_days', 60)}-{crop.get('growing_season', {}).get('max_days', 90)} days",
        "total_days_estimate": crop.get("growing_season", {}).get("max_days", 90),
        "total_stages": len(reconstructed_stages),
        "total_tasks_count": total_count,
        "completed_tasks_count": completed_count,
        "progress_percentage": progress_pct,
        "stages": reconstructed_stages,
        "supporting_sources": crop.get("agricultural_sources", [])
    })

@router.patch("/cultivation-plans/{plan_id}/tasks/{task_id}")
def update_plan_task(plan_id: str, task_id: str, req: TaskPatchRequest, db: Session = Depends(get_db)):
    db_task = db.query(PlanTaskModel).filter(
        PlanTaskModel.plan_id == plan_id,
        PlanTaskModel.id == task_id
    ).first()

    if not db_task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' for plan '{plan_id}' not found.")

    db_task.completed = req.completed
    if req.completed:
        db_task.completed_at = datetime.datetime.now(datetime.timezone.utc)
    else:
        db_task.completed_at = None

    if req.notes is not None:
        db_task.notes = req.notes

    db.commit()
    db.refresh(db_task)

    # Recalculate plan overall progress
    all_tasks = db.query(PlanTaskModel).filter(PlanTaskModel.plan_id == plan_id).all()
    completed_count = sum(1 for t in all_tasks if t.completed)
    progress_pct = round((completed_count / max(1, len(all_tasks))) * 100, 1)

    return make_envelope({
        "task_id": db_task.id,
        "plan_id": plan_id,
        "completed": db_task.completed,
        "completed_at": db_task.completed_at.isoformat() if db_task.completed_at else None,
        "notes": db_task.notes,
        "overall_progress_percentage": progress_pct
    })

# ---------------- 8. Observations & Field Journal ----------------
@router.post("/observations")
def log_field_observation(entry: FieldJournalEntryCreate, db: Session = Depends(get_db)):
    journal_id = f"jrn-{uuid.uuid4().hex[:8]}"
    db_entry = FieldJournalEntryModel(
        id=journal_id,
        plan_id=entry.plan_id,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        entry_date=entry.entry_date,
        stage_name=entry.stage_name,
        observation_notes=entry.observation_notes,
        watering_done=entry.watering_done,
        weather_conditions=entry.weather_conditions,
        symptoms_observed_json=json.dumps(entry.symptoms_observed),
        photo_notes=entry.photo_notes,
        harvest_yield_kg=entry.harvest_yield_kg
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    return make_envelope({
        "id": db_entry.id,
        "plan_id": db_entry.plan_id,
        "created_at": db_entry.created_at.isoformat(),
        "entry_date": db_entry.entry_date,
        "stage_name": db_entry.stage_name,
        "observation_notes": db_entry.observation_notes,
        "watering_done": db_entry.watering_done,
        "weather_conditions": db_entry.weather_conditions,
        "symptoms_observed": json.loads(db_entry.symptoms_observed_json),
        "photo_notes": db_entry.photo_notes,
        "harvest_yield_kg": db_entry.harvest_yield_kg
    })

@router.get("/cultivation-plans/{plan_id}/journal")
def get_journal_entries(plan_id: str, db: Session = Depends(get_db)):
    entries = db.query(FieldJournalEntryModel).filter(FieldJournalEntryModel.plan_id == plan_id).order_by(FieldJournalEntryModel.created_at.desc()).all()
    results = []
    for e in entries:
        results.append({
            "id": e.id,
            "plan_id": e.plan_id,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "entry_date": e.entry_date,
            "stage_name": e.stage_name,
            "observation_notes": e.observation_notes,
            "watering_done": e.watering_done,
            "weather_conditions": e.weather_conditions,
            "symptoms_observed": json.loads(e.symptoms_observed_json) if e.symptoms_observed_json else [],
            "photo_notes": e.photo_notes,
            "harvest_yield_kg": e.harvest_yield_kg
        })
    return make_envelope(results)

# ---------------- 9. Pest & Disease Diagnosis ----------------
@router.post("/pest-diagnosis")
def diagnose_pest_disease(req: PestDiagnosisRequest, db: Session = Depends(get_db)):
    diagnosis = pest_engine.diagnose(req)

    # Persist record
    db_rec = PestDiagnosisModel(
        id=f"pst-{uuid.uuid4().hex[:8]}",
        assessment_id=req.assessment_id,
        crop_id=req.crop_id,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        symptoms_json=json.dumps(req.symptoms),
        affected_parts_json=json.dumps(req.affected_plant_parts),
        weather_notes=req.moisture_condition,
        diagnosis_result_json=json.dumps(diagnosis.model_dump())
    )
    db.add(db_rec)
    db.commit()

    return make_envelope(diagnosis.model_dump())

# ---------------- 10. Harvest Assessment ----------------
@router.post("/harvest-assessments")
def assess_harvest_readiness(req: HarvestAssessmentRequest, db: Session = Depends(get_db)):
    try:
        assessment = harvest_engine.assess(req)

        # Persist record
        db_rec = HarvestAssessmentModel(
            id=f"hrv-{uuid.uuid4().hex[:8]}",
            plan_id=req.plan_id,
            crop_id=req.crop_id,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            days_since_planting=req.days_since_planting,
            checklist_answers_json=json.dumps(req.checklist_answers),
            maturity_percentage=assessment.maturity_percentage,
            readiness_status=assessment.readiness_status,
            assessment_result_json=json.dumps(assessment.model_dump())
        )
        db.add(db_rec)
        db.commit()

        return make_envelope(assessment.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- 11. Live Challenge Mode (Judges' Engine) ----------------
from pydantic import BaseModel

class LiveChallengeEvaluationRequest(BaseModel):
    current_inputs: LandAssessmentInput
    previous_inputs: Optional[LandAssessmentInput] = None
    preset_scenario_name: Optional[str] = None

@router.post("/live-challenge/evaluate")
def evaluate_live_challenge(req: LiveChallengeEvaluationRequest):
    # 1. Analyze land
    analysis = land_engine.analyze(req.current_inputs)
    
    # 2. Evaluate recommendations
    rec_result = recommendation_engine.evaluate(req.current_inputs)
    
    # 3. Calculate differences if previous_inputs was supplied
    diff_explanation: List[str] = []
    input_changes: List[Dict[str, Any]] = []
    
    if req.previous_inputs:
        curr_dict = req.current_inputs.model_dump()
        prev_dict = req.previous_inputs.model_dump()
        
        for k in curr_dict:
            if curr_dict[k] != prev_dict[k]:
                input_changes.append({
                    "field": k,
                    "old_value": prev_dict[k],
                    "new_value": curr_dict[k]
                })
                diff_explanation.append(
                    f"Observation '{k.replace('_', ' ')}' changed from '{str(prev_dict[k]).replace('_', ' ')}' to '{str(curr_dict[k]).replace('_', ' ')}'."
                )
        
        # Calculate what changed in recommendations
        prev_rec = recommendation_engine.evaluate(req.previous_inputs)
        prev_crop_ids = [c.crop_id for c in prev_rec.recommended_crops]
        curr_crop_ids = [c.crop_id for c in rec_result.recommended_crops]

        newly_excluded = [cid for cid in prev_crop_ids if cid not in curr_crop_ids]
        newly_admitted = [cid for cid in curr_crop_ids if cid not in prev_crop_ids]

        if newly_excluded:
            for nex in newly_excluded:
                ex_match = next((e for e in rec_result.excluded_crops if e.crop_id == nex), None)
                reason = ex_match.primary_exclusion_reason if ex_match else "Violated new physiological constraints"
                diff_explanation.append(f"⛔ Crop '{nex.title()}' was previously viable but is now EXCLUDED: {reason}.")

        if newly_admitted:
            for nad in newly_admitted:
                diff_explanation.append(f"✅ Crop '{nad.title()}' became viable under the revised environmental conditions.")

        if not newly_excluded and not newly_admitted:
            diff_explanation.append("Rankings and suitability scores shifted according to revised environmental alignment.")
    else:
        diff_explanation.append("Initial challenge assessment evaluated. Modify any parameter to see real-time differential reasoning.")

    return make_envelope({
        "current_inputs": req.current_inputs.model_dump(),
        "input_changes": input_changes,
        "diff_explanation": diff_explanation,
        "land_analysis": analysis.model_dump(),
        "recommendations": rec_result.model_dump(),
        "top_crop": rec_result.recommended_crops[0].common_name if rec_result.recommended_crops else "None",
        "recommended_count": len(rec_result.recommended_crops),
        "excluded_count": len(rec_result.excluded_crops)
    })

# ---------------- 13. CSV Dataset Endpoint ----------------
@router.get("/crops-csv")
def get_crops_csv_dataset():
    data_dir = kb._resolve_data_dir()
    csv_path = os.path.join(data_dir, "crops.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="crops.csv file not found in data directory")
    
    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    return make_envelope({
        "total_records": len(rows),
        "csv_file": "crops.csv",
        "records": rows
    })

# ---------------- 14. Photo Land Analysis Endpoint ----------------
@router.post("/land-photo/analyze")
def analyze_land_photo(req: LandPhotoAnalysisRequest):
    result = land_assistant.analyze_photo(req)
    return make_envelope(result.model_dump())

# ---------------- 15. Survivor Chatbot Endpoint ----------------
@router.post("/chatbot/message")
def chatbot_message(req: ChatbotMessageRequest):
    result = land_assistant.answer_chatbot(req)
    return make_envelope(result.model_dump())

# ---------------- 16. Ten-Step Protocol Structure ----------------
@router.get("/ten-steps/protocol")
def get_ten_steps_protocol():
    steps = [
        {
            "step_number": 1,
            "title": "STEP 1 - INPUT ECHO",
            "tagline": "Faithful observation echoing & photo soil intake with interactive chatbot",
            "description": "Restates the description and image faithfully (height clues, frost, when the sun is lost, soil, stream, wall condition, vegetation) and keeps uncertain facts marked as uncertain."
        },
        {
            "step_number": 2,
            "title": "STEP 2 - MISSING ANALYSIS",
            "tagline": "Soil archetype identification & no-equipment field diagnostics",
            "description": "Identifies the soil archetype (thin stony mountain soil) and names what is missing: season length, frost dates, soil depth, sunlight. Gives simple no-equipment ways to find out (e.g., marking the shade line with stones at the same time each day, asking locals when frost and snow arrive, a stone-share check of a bucketful of soil)."
        },
        {
            "step_number": 3,
            "title": "STEP 3 - FIX PROTOCOL",
            "tagline": "Practical physical steps with hand-measured amounts",
            "description": "Gives practical steps with hand-measured amounts (e.g., rebuild the fallen wall, pick out stones bigger than a fist, add buckets of compost per bed, place stones as warm mulch, build a simple low cover)."
        },
        {
            "step_number": 4,
            "title": "STEP 4 - NEXT ACTION",
            "tagline": "Readiness gate verified by hand before sowing",
            "description": "Sets a readiness gate the survivor can check by hand: wall holds when pushed, soil loose to a hand's depth, frost cover ready, soil not painfully cold to the hand at midday."
        },
        {
            "step_number": 5,
            "title": "STEP 5 - CROP SUGGESTIONS",
            "tagline": "Fast, frost-tolerant, short-season crops from CSV database",
            "description": "Offers several fast, frost-tolerant, short-season crops justified by the season and frost risk, presented so the user can choose."
        },
        {
            "step_number": 6,
            "title": "STEP 6 - TIMEFRAME",
            "tagline": "Crop maturity plus cold-slowed growth buffer",
            "description": "Gives crop maturity plus an explicit buffer for cold-slowed growth, compared against the season available, and says plainly if a crop will not fit."
        },
        {
            "step_number": 7,
            "title": "STEP 7 - PLANTING METHOD",
            "tagline": "Plot sowing, frost cover, and stream water solar warming",
            "description": "Specifies how to prepare and sow the plot, how to protect seedlings from frost, and how to warm very cold stream water (e.g., let it sit in the sun) before using it."
        },
        {
            "step_number": 8,
            "title": "STEP 8 - ONGOING CARE",
            "tagline": "Growth stages, frost night protocol, cold-soil bio-fertility & pest watch",
            "description": "Lays out the crop journey by growth stage, with frost-night handling, fertilizer for cold soil, a pest and disease watch for cool damp conditions, and bio-pesticide options."
        },
        {
            "step_number": 9,
            "title": "STEP 9 - HARVEST",
            "tagline": "Ripeness indicators by eye and hand, pre-freeze harvest & storage",
            "description": "Gives ripeness signs the survivor can see and feel, harvest before a hard freeze, storage, and soil regeneration afterward (cover crop, wall upkeep)."
        },
        {
            "step_number": 10,
            "title": "STEP 10 - SOIL REGENERATION & SURVIVOR AUDIT",
            "tagline": "Post-harvest restorative cover crops, winter upkeep & zero-instrument compliance",
            "description": "Official Evaluator Verification: All checks must use only eyes, hands, and household items. Restorative winter cover cropping, stone wall winter inspection, and multi-season terrace stewardship."
        }
    ]
    return make_envelope(steps)


