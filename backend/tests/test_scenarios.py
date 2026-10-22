import pytest
from backend.app.schemas.land_assessment import LandAssessmentInput
from backend.app.engine.land_analysis import land_engine
from backend.app.engine.recommendation import recommendation_engine
from backend.app.knowledge_base.loader import kb

def test_scenario_1_cold_sunny_reliable_water():
    """Scenario 1: Cold, sunny terrace with reliable water and crumbly soil."""
    inputs = LandAssessmentInput(
        soil_texture="crumbly_and_balanced",
        drainage="water_drains_gradually",
        soil_moisture="moist_not_waterlogged",
        soil_appearance="dark_brown",
        organic_material="decayed_leaves_compost_visible",
        sunlight="direct_most_of_day",
        climate="cold_days_cold_nights",
        frost="occasional",
        terrace_slope="gentle_slope",
        water_source="reliable_irrigation",
        growing_season="moderate"
    )
    analysis = land_engine.analyze(inputs)
    rec = recommendation_engine.evaluate(inputs)
    
    assert analysis.confidence_level == "high"
    assert len(rec.recommended_crops) >= 5
    top_ids = [c.crop_id for c in rec.recommended_crops[:3]]
    # Cool-season crops present in the supplied dataset should rank highly.
    assert any(c in top_ids for c in ["barley", "gram", "lentil"])
    aggregate_ids = {crop["id"] for crop in kb.get_all_crops() if crop.get("is_aggregate_group")}
    assert not any(c.crop_id in aggregate_ids for c in rec.recommended_crops)

def test_scenario_2_frequent_frost():
    """Scenario 2: Frequent frost excludes warm-season CSV profiles."""
    inputs = LandAssessmentInput(
        soil_texture="crumbly_and_balanced",
        drainage="water_disappears_quickly",
        soil_moisture="slightly_moist",
        soil_appearance="dark_brown",
        organic_material="some_present",
        sunlight="direct_most_of_day",
        climate="very_cold_conditions",
        frost="frequent",
        terrace_slope="gentle_slope",
        water_source="reliable_irrigation",
        growing_season="moderate"
    )
    rec = recommendation_engine.evaluate(inputs)
    
    # Bajra is marked warm-season and frost-sensitive in the supplied CSV profile.
    excluded_ids = [e.crop_id for e in rec.excluded_crops]
    assert "bajra" in excluded_ids

    frost_exclusion = next(e for e in rec.excluded_crops if e.crop_id == "bajra")
    assert "frost" in frost_exclusion.primary_exclusion_reason.lower()

    # Cool-season candidates in the CSV remain viable.
    rec_ids = [c.crop_id for c in rec.recommended_crops]
    assert "barley" in rec_ids or "lentil" in rec_ids

def test_scenario_3_poor_drainage_and_standing_water():
    """Scenario 3: Poor drainage and standing water conflict with well-drained profiles."""
    inputs = LandAssessmentInput(
        soil_texture="sticky_and_clay_like",
        drainage="pools_on_surface",
        soil_moisture="very_wet",
        soil_appearance="pale_or_greyish",
        organic_material="some_present",
        sunlight="direct_part_of_day",
        climate="cold_days_cold_nights",
        frost="occasional",
        terrace_slope="nearly_flat",
        water_source="reliable_irrigation",
        growing_season="moderate"
    )
    analysis = land_engine.analyze(inputs)
    rec = recommendation_engine.evaluate(inputs)
    
    # Water stagnation risks flagged
    assert any("rot" in r.lower() or "hypoxia" in r.lower() or "drainage" in r.lower() or "stagnation" in r.lower() for r in analysis.agricultural_risks)
    
    # The CSV profiles specify well-drained conditions for these crops.
    excluded_ids = [e.crop_id for e in rec.excluded_crops]
    assert "barley" in excluded_ids
    assert "lentil" in excluded_ids

def test_scenario_4_limited_sunlight():
    """Scenario 4: Limited sunlight favors crops whose profiles tolerate shade."""
    inputs = LandAssessmentInput(
        soil_texture="crumbly_and_balanced",
        drainage="water_drains_gradually",
        soil_moisture="moist_not_waterlogged",
        soil_appearance="dark_brown",
        organic_material="some_present",
        sunlight="mostly_shaded",
        climate="cold_days_cold_nights",
        frost="occasional",
        terrace_slope="gentle_slope",
        water_source="reliable_irrigation",
        growing_season="moderate"
    )
    rec = recommendation_engine.evaluate(inputs)
    excluded_ids = [e.crop_id for e in rec.excluded_crops]
    assert "bajra" in excluded_ids
    
    # Barley tolerates some shade according to its generated profile.
    rec_ids = [c.crop_id for c in rec.recommended_crops]
    assert "barley" in rec_ids

def test_scenario_5_limited_water_no_reliable_source():
    """Scenario 5: Limited water / no reliable source."""
    inputs = LandAssessmentInput(
        soil_texture="sandy_and_gritty",
        drainage="water_disappears_quickly",
        soil_moisture="dry_and_dusty",
        soil_appearance="light_brown",
        organic_material="very_little_visible",
        sunlight="direct_most_of_day",
        climate="cold_days_cold_nights",
        frost="rare",
        terrace_slope="gentle_slope",
        water_source="no_reliable_source",
        growing_season="short"
    )
    rec = recommendation_engine.evaluate(inputs)
    rec_ids = [c.crop_id for c in rec.recommended_crops]
    assert "barley" in rec_ids or "bajra" in rec_ids

def test_scenario_6_short_growing_season():
    """Scenario 6: Short growing season favors the short-cycle source profiles."""
    inputs = LandAssessmentInput(
        soil_texture="crumbly_and_balanced",
        drainage="water_drains_gradually",
        soil_moisture="slightly_moist",
        soil_appearance="dark_brown",
        organic_material="some_present",
        sunlight="direct_most_of_day",
        climate="cold_days_cold_nights",
        frost="occasional",
        terrace_slope="gentle_slope",
        water_source="reliable_irrigation",
        growing_season="short"
    )
    rec = recommendation_engine.evaluate(inputs)
    excluded_ids = [e.crop_id for e in rec.excluded_crops]
    assert "sugarcane" in excluded_ids
    
    # Fast crops in recommendations
    rec_ids = [c.crop_id for c in rec.recommended_crops]
    assert "barley" in rec_ids
    assert "lentil" in rec_ids

def test_scenario_7_rocky_shallow_terrace():
    """Scenario 7: Rocky or shallow terrace soil excludes deeper-rooting profiles."""
    inputs = LandAssessmentInput(
        soil_texture="rocky_or_shallow",
        drainage="water_disappears_quickly",
        soil_moisture="slightly_moist",
        soil_appearance="mixed",
        organic_material="some_present",
        sunlight="direct_most_of_day",
        climate="cold_days_cold_nights",
        frost="occasional",
        terrace_slope="uneven_or_rocky",
        water_source="reliable_irrigation",
        growing_season="moderate"
    )
    rec = recommendation_engine.evaluate(inputs)
    excluded_ids = [e.crop_id for e in rec.excluded_crops]
    assert "sugarcane" in excluded_ids
    ex_crop = next(e for e in rec.excluded_crops if e.crop_id == "sugarcane")
    assert "rock" in ex_crop.explanation.lower() or "deep" in ex_crop.explanation.lower()
