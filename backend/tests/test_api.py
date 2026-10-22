import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"
    assert data["data"]["knowledge_base"]["crops_count"] >= 10

def test_list_crops():
    response = client.get("/api/v1/crops")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    crops = data["data"]
    assert len(crops) == 34
    crop_ids = [c["id"] for c in crops]
    assert "bajra" in crop_ids
    assert "barley" in crop_ids

def test_get_crop_details():
    response = client.get("/api/v1/crops/barley")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == "barley"
    assert data["data"]["common_name"] == "Barley (Jau)"

def test_get_crop_not_found():
    response = client.get("/api/v1/crops/nonexistent_crop_xyz")
    assert response.status_code == 404

def test_get_sources():
    response = client.get("/api/v1/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["institutions"]) >= 5

def test_create_and_fetch_land_assessment():
    payload = {
        "soil_texture": "crumbly_and_balanced",
        "drainage": "water_drains_gradually",
        "soil_moisture": "moist_not_waterlogged",
        "soil_appearance": "dark_brown",
        "organic_material": "decayed_leaves_compost_visible",
        "sunlight": "direct_most_of_day",
        "climate": "cold_days_cold_nights",
        "frost": "occasional",
        "terrace_slope": "gentle_slope",
        "water_source": "reliable_irrigation",
        "growing_season": "moderate"
    }
    response = client.post("/api/v1/land-assessments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assessment_id = data["data"]["assessment_id"]
    assert assessment_id.startswith("asm-")

    # Fetch it back
    get_res = client.get(f"/api/v1/land-assessments/{assessment_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["data"]["assessment_id"] == assessment_id
    assert fetched["data"]["inputs"]["soil_texture"] == "crumbly_and_balanced"

def test_recommendations_endpoint():
    payload = {
        "soil_texture": "crumbly_and_balanced",
        "drainage": "water_drains_gradually",
        "soil_moisture": "moist_not_waterlogged",
        "soil_appearance": "dark_brown",
        "organic_material": "decayed_leaves_compost_visible",
        "sunlight": "direct_most_of_day",
        "climate": "cold_days_cold_nights",
        "frost": "occasional",
        "terrace_slope": "gentle_slope",
        "water_source": "reliable_irrigation",
        "growing_season": "moderate"
    }
    response = client.post("/api/v1/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["recommended_crops"]) > 0

def test_crop_comparison_endpoint():
    payload = {
        "crop_ids": ["barley", "lentil"]
    }
    response = client.post("/api/v1/crop-comparisons", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["compared_crops"]) == 2

def test_cultivation_plan_workflow():
    # 1. Create plan
    plan_payload = {
        "crop_id": "barley",
        "planting_date": "2026-04-15"
    }
    create_res = client.post("/api/v1/cultivation-plans", json=plan_payload)
    assert create_res.status_code == 200
    plan_data = create_res.json()["data"]
    plan_id = plan_data["plan_id"]
    assert plan_data["crop_id"] == "barley"
    assert len(plan_data["stages"]) == 9 # 9 sequential stages
    first_task_id = plan_data["stages"][0]["tasks"][0]["task_id"]

    # 2. Get plan
    get_res = client.get(f"/api/v1/cultivation-plans/{plan_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["progress_percentage"] == 0.0

    # 3. Patch task as completed
    patch_payload = {
        "completed": True,
        "notes": "Terrace bunds checked and gravel packed."
    }
    patch_res = client.patch(f"/api/v1/cultivation-plans/{plan_id}/tasks/{first_task_id}", json=patch_payload)
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["completed"] is True
    assert patch_res.json()["data"]["overall_progress_percentage"] > 0

    # 4. Log field journal
    journal_payload = {
        "plan_id": plan_id,
        "entry_date": "2026-04-20",
        "stage_name": "Stage 2: Planting",
        "observation_notes": "Emergent seedlings breaking through fine straw mulch.",
        "watering_done": True,
        "weather_conditions": "Clear sunny morning, cold night -1C"
    }
    j_res = client.post("/api/v1/observations", json=journal_payload)
    assert j_res.status_code == 200
    assert j_res.json()["data"]["watering_done"] is True

    # 5. Fetch journal entries
    j_get = client.get(f"/api/v1/cultivation-plans/{plan_id}/journal")
    assert j_get.status_code == 200
    assert len(j_get.json()["data"]) >= 1

def test_pest_diagnosis_endpoint():
    payload = {
        "crop_id": "potato",
        "symptoms": ["leaf_spots", "rotting_plant_parts"],
        "affected_plant_parts": ["leaves", "stems"],
        "moisture_condition": "damp_dew"
    }
    response = client.post("/api/v1/pest-diagnosis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["possible_causes"]) > 0
    top_cause = data["data"]["possible_causes"][0]
    assert top_cause["disorder_id"] == "late_blight"

def test_harvest_assessment_endpoint():
    payload = {
        "crop_id": "barley",
        "days_since_planting": 105,
        "checklist_answers": {
            "indicator_1": True,
            "indicator_2": True,
            "indicator_3": True
        },
        "weather_forecast": "dry_sunny"
    }
    response = client.post("/api/v1/harvest-assessments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["readiness_status"] == "ready_for_harvest"

def test_live_challenge_endpoint():
    payload = {
        "current_inputs": {
            "soil_texture": "crumbly_and_balanced",
            "drainage": "water_disappears_quickly",
            "soil_moisture": "moist_not_waterlogged",
            "soil_appearance": "dark_brown",
            "organic_material": "some_present",
            "sunlight": "direct_most_of_day",
            "climate": "cold_days_cold_nights",
            "frost": "frequent",
            "terrace_slope": "gentle_slope",
            "water_source": "reliable_irrigation",
            "growing_season": "moderate"
        },
        "previous_inputs": {
            "soil_texture": "crumbly_and_balanced",
            "drainage": "water_disappears_quickly",
            "soil_moisture": "moist_not_waterlogged",
            "soil_appearance": "dark_brown",
            "organic_material": "some_present",
            "sunlight": "direct_most_of_day",
            "climate": "cold_days_cold_nights",
            "frost": "rare",
            "terrace_slope": "gentle_slope",
            "water_source": "reliable_irrigation",
            "growing_season": "moderate"
        }
    }
    response = client.post("/api/v1/live-challenge/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Verify differential explanation detected the frost change
    diff = data["data"]["diff_explanation"]
    assert any("frost" in d.lower() for d in diff)

def test_crop_csv_records_have_clean_headers_and_source_values():
    response = client.get("/api/v1/crops-csv")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total_records"] == 34
    total_pulses = next(row for row in data["records"] if row["Crop"] == "Total Pulses")
    assert total_pulses["Season(s)_in_Source"] == "Kharif; Rabi; Summer"

def test_land_photo_endpoint_does_not_invent_visual_observations():
    response = client.post("/api/v1/land-photo/analyze", json={
        "image_base64": "data:image/jpeg;base64,dGVzdA==",
        "image_name": "terrace.jpg",
        "user_notes": "The bed is on a slope."
    })
    assert response.status_code == 200
    result = response.json()["data"]
    assert result["soil_archetype"] == "Soil type not confirmed from photo"
    assert result["confidence_level"] == "low"
    assert any("not been verified" in feature for feature in result["visual_features"])

def test_ten_step_protocol_has_exactly_ten_steps():
    response = client.get("/api/v1/ten-steps/protocol")
    assert response.status_code == 200
    steps = response.json()["data"]
    assert len(steps) == 10
    assert [step["step_number"] for step in steps] == list(range(1, 11))
