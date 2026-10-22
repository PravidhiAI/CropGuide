import pytest
from backend.app.schemas.land_assessment import LandAssessmentInput
from backend.app.engine.land_analysis import land_engine
from backend.app.engine.recommendation import recommendation_engine
from backend.app.engine.cultivation_planner import cultivation_planner
from backend.app.engine.pest_engine import pest_engine
from backend.app.schemas.pest import PestDiagnosisRequest

def test_conflict_detection_rapid_drainage_and_very_wet():
    inputs = LandAssessmentInput(
        soil_texture="crumbly_and_balanced",
        drainage="water_disappears_quickly",
        soil_moisture="very_wet",
        frost="rare",
        water_source="reliable_irrigation"
    )
    analysis = land_engine.analyze(inputs)
    assert len(analysis.conflicts_detected) > 0
    assert len(analysis.follow_up_questions) > 0
    assert any("drain" in q.lower() or "pool" in q.lower() for q in analysis.follow_up_questions)

def test_missing_information_reporting():
    inputs = LandAssessmentInput(
        soil_texture="unknown",
        drainage="unknown",
        frost="unknown"
    )
    analysis = land_engine.analyze(inputs)
    assert len(analysis.missing_information) >= 2
    assert analysis.confidence_level == "low"

def test_nine_stage_cultivation_plan_completeness():
    plan = cultivation_planner.generate_plan("barley", "2026-04-10")
    assert plan.total_stages == 9
    stage_names = [s.stage_name for s in plan.stages]
    assert "Land Preparation" in stage_names[0]
    assert "Planting" in stage_names[1]
    assert "Seedling Establishment" in stage_names[2]
    assert "Ongoing Care" in stage_names[3]
    assert "Pest" in stage_names[4]
    assert "Harvest Readiness" in stage_names[5]
    assert "Harvesting" in stage_names[6]
    assert "Post-Harvest" in stage_names[7]
    assert "Season Review" in stage_names[8]
    
    # Check that each task has required fields
    for stage in plan.stages:
        for task in stage.tasks:
            assert task.task_id
            assert task.title
            assert task.purpose
            assert len(task.instructions) > 0
            assert task.expected_result

def test_pest_diagnostic_ranking_and_ipm():
    req = PestDiagnosisRequest(
        crop_id="cabbage",
        symptoms=["holes_in_leaves", "visible_insects"],
        affected_plant_parts=["leaves"]
    )
    res = pest_engine.diagnose(req)
    assert len(res.possible_causes) > 0
    top = res.possible_causes[0]
    assert top.disorder_id in ["cabbage_white_caterpillar", "flea_beetle"]
    assert len(top.cultural_controls) > 0
    assert len(top.biological_controls) > 0
    assert len(res.ipm_general_protocol) == 5
