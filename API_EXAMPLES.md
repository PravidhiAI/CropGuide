# TERRAFORM API EXAMPLES & RESPONSES

All API requests adhere to the deterministic REST specification using JSON and the standard response envelope:

```json
{
  "success": true,
  "data": {},
  "metadata": {
    "engine_version": "1.0",
    "knowledge_base_version": "1.0",
    "generated_at": "ISO-8601 timestamp",
    "sources": []
  },
  "warnings": []
}
```

---

## 1. System Health Check
**Endpoint:** `GET /api/v1/health`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "TERRAFORM Agricultural Intelligence Engine",
    "scenario": "High-Altitude Cold Terrace",
    "knowledge_base": {
      "crops_count": 12,
      "pests_count": 9,
      "methods_count": 5
    }
  },
  "metadata": {
    "engine_version": "1.0",
    "knowledge_base_version": "1.0",
    "generated_at": "2026-10-15T08:40:53.531267+00:00",
    "sources": [
      "ICAR-VPKAS Almora Mountain Agriculture Research",
      "ICAR-CPRI Shimla Hill Potato Agronomy",
      "ICAR-IARI Katrain Temperate Vegetable Science",
      "ICAR-IIWBR Karnal Hill Barley Program"
    ]
  },
  "warnings": []
}
```

---

## 2. Natural Field Observation Land Assessment
**Endpoint:** `POST /api/v1/land-assessments`

**Request Payload:**
```json
{
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
  "growing_season": "moderate",
  "region": "Almora Terraces",
  "altitude_m": 2100
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "assessment_id": "asm-f72f29f9",
    "plain_language_summary": "A gentle slope high-altitude terrace featuring crumbly and balanced soil with water drains gradually and occasional frost conditions.",
    "favorable_conditions": [
      "Gentle terrace slope facilitates natural gravitational drainage without high erosion shear.",
      "Crumbly, balanced soil (loam) offers optimal root aeration, moisture retention, and easy root expansion.",
      "Gradual drainage retains vital capillary moisture without waterlogging root zones.",
      "Occasional light frost sweetens brassica and root vegetables without terminating growth.",
      "Full day solar radiation maximizes daytime soil thermal storage and photosynthetic bulking.",
      "Reliable irrigation ensures uninterrupted crop development during critical flowering and tuberization."
    ],
    "potential_limitations": [
      "Cold night temperatures requiring resilient cultivars"
    ],
    "agricultural_risks": [
      "Unseasonal cold snaps or heavy rain runoff"
    ],
    "missing_information": [],
    "practical_improvements": [],
    "confidence_level": "high",
    "confidence_explanation": "Comprehensive natural observations provided across soil, climate, water, and exposure with no conflicting data points.",
    "conflicts_detected": [],
    "follow_up_questions": [],
    "observed_facts": [
      "Soil texture observed as: crumbly and balanced",
      "Drainage behavior: water drains gradually",
      "Frost occurrence: occasional",
      "Solar exposure: direct most of day",
      "Water source: reliable irrigation"
    ],
    "inferred_conditions": [
      "Balanced texture supports the widest spectrum of both root tubers and leafy crops."
    ]
  },
  "metadata": {
    "engine_version": "1.0",
    "knowledge_base_version": "1.0",
    "generated_at": "2026-10-15T08:41:00.000000Z",
    "sources": [
      "ICAR-VPKAS Almora Mountain Agriculture Research"
    ]
  },
  "warnings": []
}
```

---

## 3. Crop Recommendations & Exclusions
**Endpoint:** `POST /api/v1/recommendations`

**Request Payload:**
```json
{
  "soil_texture": "crumbly_and_balanced",
  "drainage": "water_disappears_quickly",
  "frost": "frequent",
  "water_source": "reliable_irrigation",
  "growing_season": "moderate"
}
```

**Example Response (Snippet highlighting exclusion reasoning):**
```json
{
  "success": true,
  "data": {
    "recommended_crops": [
      {
        "crop_id": "turnip",
        "common_name": "Highland Turnip (Shalgam)",
        "scientific_name": "Brassica rapa subsp. rapa",
        "suitability_category": "highly_suitable",
        "suitability_score": 92,
        "reasons_for_recommendation": [
          "Withstands sub-zero radiation frosts common on cold terraces (down to -6.0°C).",
          "Specially adapted to rigorous high-altitude thermal regimes."
        ],
        "matching_land_conditions": [
          "Soil texture 'crumbly and balanced' perfectly suits Highland Turnip (Shalgam) root architecture.",
          "High frost tolerance (very_hardy) makes it resilient to mountain night chills.",
          "Drainage 'water disappears quickly' meets root aeration criteria.",
          "Reliable irrigation ensures critical growth stages are well supported."
        ],
        "potential_problems": [],
        "required_growing_conditions": [
          "Temperature: 10-15°C optimal; highly tolerant of near-freezing mountain conditions",
          "Sunlight: Minimum 4.5 hours/day",
          "Soil: crumbly and balanced, sandy and gritty, soft and powdery, rocky or shallow"
        ],
        "planting_window": "April to July in high cold terraces",
        "estimated_harvest_period": "45-65 days (short cycle)",
        "care_requirements": [
          "Earthing/Mounding: Thin seedlings when 5 cm tall to 10-12 cm apart",
          "Water Strategy: Water every 5-7 days; steady moisture prevents root woodiness",
          "Organic Fertility: Incorporate 15 tonnes/ha compost and moderate wood ash"
        ],
        "confidence_level": "high",
        "supporting_sources": [
          "ICAR - IARI Regional Station Katrain Root Crops Guide",
          "KVK Leh High Altitude Mountain Vegetables Bulletin"
        ],
        "cultivation_method": "Direct Sowing",
        "spacing_summary": "Plant depth: 1.0 cm | Spacing: 12 cm x 25 cm"
      }
    ],
    "excluded_crops": [
      {
        "crop_id": "buckwheat",
        "common_name": "Tartary Buckwheat (Ogla / Phaphra)",
        "scientific_name": "Fagopyrum tataricum / esculentum",
        "primary_exclusion_reason": "Hard Frost Lethality",
        "conflicting_conditions": [
          "Observed Frost: frequent",
          "Crop Tolerance: sensitive"
        ],
        "explanation": "Tartary Buckwheat (Ogla / Phaphra) foliage and flowers suffer instant cellular necrosis below -0.5°C. With expected or frequent frost, catastrophic crop loss is guaranteed without heated greenhouses."
      }
    ],
    "land_summary": "Identified viable cold-terrace candidate crops. 1 crops were ruled out based on physiological limits.",
    "overall_confidence": "high",
    "adaptive_questions": []
  }
}
```

---

## 4. Live Challenge Mode with Differential Reasoning
**Endpoint:** `POST /api/v1/live-challenge/evaluate`

**Request Payload:**
```json
{
  "current_inputs": {
    "soil_texture": "rocky_or_shallow",
    "drainage": "water_disappears_quickly",
    "frost": "frequent",
    "water_source": "limited_water"
  },
  "previous_inputs": {
    "soil_texture": "crumbly_and_balanced",
    "drainage": "water_drains_gradually",
    "frost": "occasional",
    "water_source": "reliable_irrigation"
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "input_changes": [
      { "field": "soil_texture", "old_value": "crumbly_and_balanced", "new_value": "rocky_or_shallow" },
      { "field": "drainage", "old_value": "water_drains_gradually", "new_value": "water_disappears_quickly" },
      { "field": "frost", "old_value": "occasional", "new_value": "frequent" },
      { "field": "water_source", "old_value": "reliable_irrigation", "new_value": "limited_water" }
    ],
    "diff_explanation": [
      "Observation 'soil texture' changed from 'crumbly and balanced' to 'rocky or shallow'.",
      "Observation 'drainage' changed from 'water drains gradually' to 'water disappears quickly'.",
      "Observation 'frost' changed from 'occasional' to 'frequent'.",
      "Observation 'water source' changed from 'reliable irrigation' to 'limited water'.",
      "⛔ Crop 'Carrot' was previously viable but is now EXCLUDED: Physical Root Impedance.",
      "⛔ Crop 'Buckwheat' was previously viable but is now EXCLUDED: Hard Frost Lethality."
    ],
    "top_crop": "Highland Turnip (Shalgam)",
    "recommended_count": 8,
    "excluded_count": 2
  }
}
```
