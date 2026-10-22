import copy
from typing import List, Dict, Any, Tuple, Optional
from backend.app.schemas.land_assessment import LandAssessmentInput
from backend.app.schemas.crop import (
    CropRecommendationItem, CropExclusionItem, CropRecommendationResponse,
    CropComparisonItem, CropComparisonResponse
)
from backend.app.knowledge_base.loader import kb

class CropRecommendationEngine:
    def evaluate(self, inputs: LandAssessmentInput, assessment_id: Optional[str] = None) -> CropRecommendationResponse:
        all_crops = kb.get_all_crops()
        recommended: List[CropRecommendationItem] = []
        excluded: List[CropExclusionItem] = []
        adaptive_questions: List[str] = []

        for crop in all_crops:
            exclusion_reason, conflicting_conditions, explanation = self._check_hard_exclusions(crop, inputs)
            if exclusion_reason:
                excluded.append(CropExclusionItem(
                    crop_id=crop["id"],
                    common_name=crop["common_name"],
                    scientific_name=crop["scientific_name"],
                    primary_exclusion_reason=exclusion_reason,
                    conflicting_conditions=conflicting_conditions,
                    explanation=explanation
                ))
            else:
                score, reasons, matching, problems, reqs, confidence = self._score_crop_compatibility(crop, inputs)
                
                if score >= 75:
                    suitability_cat = "highly_suitable"
                elif score >= 55:
                    suitability_cat = "moderately_suitable"
                else:
                    suitability_cat = "conditionally_suitable"

                care_summary = [
                    f"Earthing/Mounding: {crop['care_instructions'].get('mounding_hilling', 'Standard cultivation')}",
                    f"Water Strategy: {crop['care_instructions'].get('irrigation_strategy', 'Consistent irrigation')}",
                    f"Organic Fertility: {crop['care_instructions'].get('organic_nutrition', 'Well-rotted compost')}"
                ]

                cult_specs = crop.get("cultivation_specs", {})
                spacing_text = f"Plant depth: {cult_specs.get('planting_depth_cm', '-')} cm | Spacing: {cult_specs.get('plant_spacing_cm', '-')} cm x {cult_specs.get('row_spacing_cm', '-')} cm"

                recommended.append(CropRecommendationItem(
                    crop_id=crop["id"],
                    common_name=crop["common_name"],
                    scientific_name=crop["scientific_name"],
                    suitability_category=suitability_cat,
                    suitability_score=score,
                    reasons_for_recommendation=reasons,
                    matching_land_conditions=matching,
                    potential_problems=problems,
                    required_growing_conditions=reqs,
                    planting_window=crop["planting_window"],
                    estimated_harvest_period=crop["growing_season"].get("csv_description", crop["growing_season"]["category"]),
                    care_requirements=care_summary,
                    confidence_level=confidence,
                    supporting_sources=crop.get("agricultural_sources", []),
                    cultivation_method=cult_specs.get("method", "direct_sowing").replace("_", " ").title(),
                    spacing_summary=spacing_text
                ))

        # Sort recommendations by suitability score descending
        recommended.sort(key=lambda x: x.suitability_score, reverse=True)

        # Generate summary
        top_crop_names = [c.common_name for c in recommended[:3]]
        if recommended:
            land_summary = f"Identified {len(recommended)} viable cold-terrace candidate crops with {', '.join(top_crop_names)} demonstrating strongest environmental compatibility. {len(excluded)} crops were ruled out based on physiological limits."
        else:
            land_summary = "Extreme land constraints excluded all standard cool-climate crops. Consider structural terrace rehabilitation before cultivation."

        # Adaptive questions if uncertainty exists
        if inputs.frost == "unknown":
            adaptive_questions.append("Is nighttime frost frequent or rare during your anticipated planting month? This determines whether sensitive crops like buckwheat or hill potato can be safely cultivated.")
        if inputs.drainage == "unknown":
            adaptive_questions.append("Does water puddle after rainfall or drain quickly? Root crops like carrots and potatoes rot rapidly in saturated soils.")
        if inputs.water_source == "unknown":
            adaptive_questions.append("What is your primary irrigation availability? Leafy brassicas (cabbage, cauliflower) require consistent weekly water.")

        overall_conf = "high" if len(adaptive_questions) == 0 else ("medium" if len(adaptive_questions) <= 2 else "low")

        return CropRecommendationResponse(
            assessment_id=assessment_id,
            recommended_crops=recommended,
            excluded_crops=excluded,
            land_summary=land_summary,
            overall_confidence=overall_conf,
            adaptive_questions=adaptive_questions
        )

    def _check_hard_exclusions(self, crop: Dict[str, Any], inputs: LandAssessmentInput) -> Tuple[Optional[str], List[str], str]:
        crop_id = crop["id"]

        # Exclusion 0: Aggregate / Statistical Categories from CSV
        if crop.get("is_aggregate_group") or "Aggregate" in crop.get("crop_record_type", "") or crop.get("rule_status") == "Exclude from crop recommendation":
            return (
                "Aggregate Statistical Grouping (Non-Plantable)",
                ["Source Rule: Exclude from crop recommendation", "Record Type: Aggregate/statistical group"],
                crop.get("notes") or "Retained from source to preserve labels; do not recommend as a plantable crop."
            )

        frost_rating = crop.get("frost_sensitivity", {}).get("rating", "moderately_hardy")
        drainage_reqs = crop.get("drainage_requirements", {})
        soil_pref = crop.get("soil_preferences", {})
        water_demand = crop.get("water_needs", {}).get("demand_level", "moderate")

        # Exclusion 1: Frost Sensitivity vs Frequent/Expected Frost
        if inputs.frost in ["frequent", "expected_during_growing_period"] and frost_rating == "sensitive":
            dmg_temp = crop.get("frost_sensitivity", {}).get("foliage_damage_temp_c", 0.0)
            return (
                "Hard Frost Lethality",
                [f"Observed Frost: {inputs.frost}", f"Crop Tolerance: {frost_rating}"],
                f"{crop['common_name']} foliage and floral structures suffer instant cellular freezing necrosis below {dmg_temp}°C. With expected or frequent mountain frost, catastrophic crop loss occurs without continuous greenhouse heating."
            )

        # Exclusion 2: Poor Drainage / Standing Water vs Zero Waterlogging Tolerance
        if inputs.drainage in ["water_remains_long", "pools_on_surface"]:
            is_intolerant = (
                crop_id in ["potato", "barley", "gram", "lentil", "wheat", "rapeseed_mustard", "bajra", "tur", "urad", "moong", "castorseed"] or
                "well-drained" in soil_pref.get("notes", "").lower() or
                "waterlogging" in crop.get("drainage_requirements", {}).get("tolerance", "").lower()
            )
            if is_intolerant:
                return (
                    "Root Hypoxia & Immediate Rot",
                    [f"Observed Drainage: {inputs.drainage}", "Crop Tolerance: Zero standing water tolerance (requires well-drained soil)"],
                    f"{crop['common_name']} requires well-aerated soil. Standing water or prolonged water retention triggers anaerobic bacterial breakdown, asphyxiating roots and rotting root/nodule systems within 48-72 hours."
                )

        # Exclusion 3: Shallow/Rocky Soil vs Deep Taproot / Long Season Formation
        if inputs.soil_texture == "rocky_or_shallow":
            requires_depth = (
                crop_id in ["cotton", "sugarcane", "tur", "castorseed", "carrot"] or
                crop.get("growing_season", {}).get("category") == "long" or
                "deep" in soil_pref.get("notes", "").lower()
            )
            if requires_depth:
                return (
                    "Physical Root Impedance & Depth Deficit",
                    ["Observed Soil: Rocky or shallow shelf", "Crop Requirement: Deep stone-free profile (>45cm)"],
                    f"{crop['common_name']} requires deep soil profile for extensive root/taproot anchorage and moisture reserves. Rocky, shallow terrace shelves cause mechanical impedance and root stunting."
                )

        # Exclusion 4: Severe Water Scarcity vs High Water Requirement
        if inputs.water_source in ["no_reliable_source", "limited_water"] and water_demand == "high" and crop.get("water_needs", {}).get("drought_tolerance") == "low":
            return (
                "Water Deficit Collapse",
                [f"Observed Water Source: {inputs.water_source}", f"Crop Demand Level: {water_demand} (Low drought tolerance)"],
                f"{crop['common_name']} has high transpiration demands. Under mountain terrace water scarcity, severe moisture stress causes complete crop failure."
            )

        # Exclusion 5: Short Season vs Long Cycle Crops
        if inputs.growing_season == "short" and crop.get("growing_season", {}).get("category") == "long":
            min_days = crop.get("growing_season", {}).get("min_days", 130)
            max_days = crop.get("growing_season", {}).get("max_days", 180)
            return (
                "Insufficient Thermal Growing Window",
                ["Observed Season: Short (60-80 days)", f"Crop Requirement: {min_days}-{max_days} days (Long Cycle)"],
                f"{crop['common_name']} requires a minimum of {min_days} frost-free days to mature. A short mountain window will be truncated by early autumn freezes before harvest."
            )

        # Exclusion 6: Deep Shade vs Strict Full Sun cereal
        if inputs.sunlight == "mostly_shaded" and crop.get("sunlight_requirements", {}).get("minimum_hours", 6) >= 6 and crop.get("sunlight_requirements", {}).get("shade_tolerance") == "Low":
            return (
                "Insufficient Photosynthetic Irradiance",
                ["Observed Sunlight: Mostly shaded (<3 hrs direct sun)", "Crop Requirement: Minimum 6+ hours direct solar radiation"],
                f"{crop['common_name']} requires intense direct solar radiation to produce grain heads. Under heavy mountain cliff shade, stems lodge (fall over) and grains remain empty hulls."
            )

        return None, [], ""

    def _score_crop_compatibility(self, crop: Dict[str, Any], inputs: LandAssessmentInput) -> Tuple[int, List[str], List[str], List[str], List[str], str]:
        score = 60 # Base score
        reasons: List[str] = []
        matching: List[str] = []
        problems: List[str] = []
        reqs: List[str] = []

        crop_id = crop["id"]
        soil_pref = crop["soil_preferences"]
        frost_info = crop["frost_sensitivity"]
        water_info = crop["water_needs"]
        sun_info = crop["sunlight_requirements"]
        drainage_info = crop["drainage_requirements"]
        season_info = crop["growing_season"]

        # Soil Texture Match
        if inputs.soil_texture in soil_pref["preferred_textures"]:
            score += 10
            matching.append(f"Soil texture '{inputs.soil_texture.replace('_', ' ')}' perfectly suits {crop['common_name']} root architecture.")
        elif inputs.soil_texture == "unknown":
            score += 0
        else:
            score -= 5
            problems.append(f"Suboptimal soil texture '{inputs.soil_texture.replace('_', ' ')}' will require amendments (FYM or sand).")

        # Frost Match
        if frost_info["rating"] in ["very_hardy", "hardy"]:
            if inputs.frost in ["frequent", "occasional", "expected_during_growing_period"]:
                score += 12
                matching.append(f"High frost tolerance ({frost_info['rating']}) makes it resilient to mountain night chills.")
                reasons.append(f"Withstands sub-zero radiation frosts common on cold terraces (down to {frost_info['foliage_damage_temp_c']}°C).")
        elif frost_info["rating"] == "moderately_hardy":
            if inputs.frost in ["rare", "occasional"]:
                score += 6
                matching.append("Moderate cold tolerance aligns well with low to occasional frost incidence.")
            elif inputs.frost == "frequent":
                score -= 8
                problems.append("Emergent foliage will require protective fleece or straw mulching during nocturnal cold snaps.")

        # Drainage Match
        if inputs.drainage in drainage_info["preferred"]:
            score += 10
            matching.append(f"Drainage '{inputs.drainage.replace('_', ' ')}' meets root aeration criteria.")
        elif inputs.drainage == "unknown":
            score += 0
        else:
            score -= 6
            problems.append(f"Drainage behavior '{inputs.drainage.replace('_', ' ')}' poses disease or stress risks.")

        # Water Match
        if inputs.water_source == "reliable_irrigation":
            score += 8
            matching.append("Reliable irrigation ensures critical growth stages are well supported.")
        elif inputs.water_source in ["limited_water", "seasonal_availability"]:
            if water_info["drought_tolerance"] in ["high", "very_high"]:
                score += 10
                matching.append(f"High natural drought tolerance matches limited terrace water availability.")
                reasons.append("Economical water user, thriving under restricted irrigation regimes.")
            elif water_info["demand_level"] == "high":
                score -= 10
                problems.append("High water demand may cause stunted growth under seasonal water limits.")
        elif inputs.water_source == "no_reliable_source":
            if water_info["drought_tolerance"] in ["high", "very_high"]:
                score += 6
                matching.append("Tolerates rainfed-only regimes.")
            else:
                score -= 12
                problems.append("Yields will be severely depressed without supplemental watering.")

        # Sunlight Match
        if inputs.sunlight == "direct_most_of_day":
            if sun_info["type"] == "direct_full":
                score += 8
                matching.append("Full direct sun exposure optimizes photosynthetic accumulation.")
            else:
                score += 4
        elif inputs.sunlight in ["mostly_shaded", "direct_part_of_day"]:
            if sun_info["shade_tolerance"] in ["High", "Moderate to High", "Moderate"]:
                score += 8
                matching.append(f"Tolerates low light and mountain cliff shade better than most crops.")
                reasons.append("Thrives under partial solar exposure without bolting or dropping vigor.")
            else:
                score -= 8
                problems.append("Limited direct sunlight will slow maturity and reduce curd/tuber density.")

        # Season Match
        if inputs.growing_season == "short":
            if season_info["category"] == "short":
                score += 12
                matching.append(f"Fast maturity ({season_info['min_days']}-{season_info['max_days']} days) fits snugly within short mountain frost-free windows.")
                reasons.append("Rapid turnaround delivers food security before early winter weather closes in.")
            elif season_info["category"] == "moderate":
                score += 2
            else:
                score -= 10
                problems.append("Long growth duration risks early autumn frost damage before complete maturity.")

        # Soil Appearance / Organic Matter synergy
        if inputs.organic_material in ["decayed_leaves_compost_visible", "some_present"] and soil_pref["organic_matter_need"] == "high":
            score += 5
            matching.append("Visible soil organic matter satisfies high humus feeding requirements.")

        # Altitude / Climate synergy
        if inputs.climate in ["cold_days_cold_nights", "very_cold_conditions"]:
            if frost_info.get("rating") in ["hardy", "moderately_hardy"] or "rabi" in crop.get("season_in_source", "").lower():
                score += 10
                reasons.append("Specially adapted to rigorous cool-season thermal regimes.")
            elif frost_info.get("rating") == "sensitive":
                score -= 10
                problems.append("Warm-season physiology struggles under cold mountain daytime/nighttime temperatures.")

        # Terrace Slope suitability
        if inputs.terrace_slope in ["steep_slope", "uneven_or_rocky"]:
            if "erosion control" in str(crop.get("csv_raw", {}).get("Terrace_Slope_Stability_Preference", "")).lower() or crop_id in ["barley", "ragi", "small_millets", "bajra", "nigerseed"]:
                score += 6
                matching.append("Strong root anchoring system stabilizes sloping terrace beds against wash-off.")
            elif crop_id in ["cotton", "sugarcane"]:
                score -= 6
                problems.append("Steep terraces complicate heavy plant balance and uniform furrow watering.")

        # Assemble Primary Recommendation Reasons if sparse
        if not reasons:
            reasons.append(f"Strong overall physiological fit with cold terrace temperatures and local conditions.")
            reasons.append(f"Verified high-altitude cultivar performance supported by {crop['agricultural_sources'][0] if crop.get('agricultural_sources') else 'regional research'}.")

        # Required growing conditions summary
        reqs.append(f"Temperature: {crop['suitable_climatic_conditions']['temperature_range_c']}")
        reqs.append(f"Sunlight: Minimum {sun_info.get('minimum_hours', 5)} hours/day")
        reqs.append(f"Soil: {', '.join(soil_pref['preferred_textures']).replace('_', ' ')}")

        score = max(20, min(98, score))
        confidence = "high" if inputs.soil_texture != "unknown" and inputs.frost != "unknown" else "medium"

        return score, reasons, matching, problems, reqs, confidence

    def compare_crops(self, crop_ids: List[str], assessment_id: Optional[str] = None) -> CropComparisonResponse:
        crops_data = [kb.get_crop(cid) for cid in crop_ids if kb.get_crop(cid)]
        if len(crops_data) < 2:
            raise ValueError("At least 2 valid crops required for comparison")

        compared: List[CropComparisonItem] = []
        for c in crops_data:
            cult = c.get("cultivation_specs", {})
            growing_days_str = f"{c['growing_season']['min_days']}-{c['growing_season']['max_days']} days"
            water_dem = c["water_needs"]["demand_level"].title()
            frost_tol = c["frost_sensitivity"]["rating"].replace("_", " ").title()
            soil_flex = "High" if len(c["soil_preferences"]["preferred_textures"]) >= 3 else "Moderate"
            storage_spec = c.get("storage_requirements", {})
            storage_pot = f"{storage_spec.get('shelf_life_months', '1-2 weeks')}"

            # Advantages & Tradeoffs
            advs = []
            tradeoffs = []
            cid = c["id"]
            if cid == "potato":
                advs = ["High caloric yield per terrace square meter", "4-6 month subterranean cellar storage life", "High market trade value"]
                tradeoffs = ["Susceptible to late blight in foggy spells", "Zero tolerance for waterlogging", "Foliage damaged by hard frost"]
                verdict = "Supreme staple crop when terrace drainage is assured and loose soil is available."
            elif cid == "garden_pea":
                advs = ["Biological nitrogen fixation rejuvenates mountain soil", "High market value for sweet green pods", "Hardy against vegetative frost down to -4°C"]
                tradeoffs = ["Flowers sensitive to hard freeze", "Vines require twig staking", "Short fresh shelf life"]
                verdict = "Best soil-building legume crop with excellent early season food and income value."
            elif cid == "cabbage":
                advs = ["Hardy dense heads tolerate down to -5°C", "Excellent 2-3 month mountain storage", "High vitamin C source for winter"]
                tradeoffs = ["Heavy nutrient feeder", "Requires reliable moisture during heading", "Susceptible to caterpillar pests"]
                verdict = "Reliable cold-hardy vegetable for deep, moisture-retentive soils with regular water."
            elif cid == "cauliflower":
                advs = ["Premium cash crop in hill markets", "Snowball curds thrive in cool mountain temperatures", "High culinary value"]
                tradeoffs = ["Strict moisture and temperature requirements", "Curd purples if frost hits directly", "Needs fertile soil and boron"]
                verdict = "High-reward crop suitable for experienced growers with protected nurseries and reliable water."
            elif cid == "radish":
                advs = ["Ultra fast 35-50 day harvest", "Breaks compacted subsoil with taproot", "Frost improves sweetness and crunch"]
                tradeoffs = ["Must be harvested promptly before pithiness", "Fails in rocky unloosened soil", "Prone to flea beetle shot-holes"]
                verdict = "Ideal fast-cycle crop for quick subsistence and breaking terrace soil."
            elif cid == "turnip":
                advs = ["Exceptional frost hardiness down to -6°C", "Dual harvest (greens + root spheres)", "Thrives on shallow rocky terraces"]
                tradeoffs = ["Moderate culinary versatility", "Pungency increases under drought"]
                verdict = "Most dependable cold-hardy root fallback for challenging, rocky, or high-frost terraces."
            elif cid == "spinach":
                advs = ["Survives extreme freezing down to -7°C", "Multiple cut-and-come-again harvests", "Thrives in low sunlight and cliff shade"]
                tradeoffs = ["Highly perishable unless blanched/frozen", "Bolts quickly if unseasonably hot"]
                verdict = "Unbeatable green crop for cold, shaded, or north-facing mountain terraces."
            elif cid == "leafy_mustard":
                advs = ["Very low water requirement", "Quick 35-50 day maturity", "Natural glucosinolates deter pests and frost"]
                tradeoffs = ["Strong pungent flavor not preferred by all", "Must be eaten fresh or sun-dried"]
                verdict = "Toughest, most forgiving leafy green for water-scarce or marginal terraces."
            elif cid == "carrot":
                advs = ["Sweet, dense nutrient profile enhanced by cold", "Outstanding 4-6 month sand storage", "High consumer demand"]
                tradeoffs = ["Strictly requires deep stone-free soil", "Slow early germination", "Roots fork in rocky ground"]
                verdict = "Exceptional winter storage root if terrace soil is deep, crumbly, and cleared of rocks."
            elif cid == "broad_bean":
                advs = ["Extreme frost hardiness down to -7°C", "Strong terrace windbreak and deep soil anchoring", "High protein staple pulse"]
                tradeoffs = ["Long 110-135 day growing season", "Aphids target succulent tips", "Requires seed soaking"]
                verdict = "Premier high-altitude legume for wind-buffering, soil binding, and multi-year food security."
            elif cid == "barley":
                advs = ["Legendary drought and cold endurance", "Thrives on poor, rocky, alkaline terraces", "Multi-year grain storage (Tsampa)"]
                tradeoffs = ["Zero tolerance for waterlogged soils", "Low fresh vegetable value (cereal grain)"]
                verdict = "The ultimate high-altitude survival cereal for dry, rocky, cold terraces."
            elif cid == "buckwheat":
                advs = ["Fast 60-75 day short season", "Thrives on acidic, nutrient-poor soil", "Smothers weeds naturally"]
                tradeoffs = ["ZERO frost tolerance (killed at -0.5°C)", "Grain shatters if harvest is delayed"]
                verdict = "Superb fast summer crop strictly during frost-free window on marginal terrace ground."
            else:
                advs = ["Cold terrace adapted", "Documented hill practices"]
                tradeoffs = ["Requires standard care"]
                verdict = "Solid option for cool-climate mountain terrace systems."

            compared.append(CropComparisonItem(
                crop_id=c["id"],
                common_name=c["common_name"],
                scientific_name=c["scientific_name"],
                suitability_category="Candidate Crop",
                suitability_score=75,
                growing_days=growing_days_str,
                water_demand=water_dem,
                frost_tolerance=frost_tol,
                soil_flexibility=soil_flex,
                maintenance_level="Moderate",
                storage_potential=storage_pot,
                key_advantages=advs,
                primary_tradeoffs=tradeoffs,
                verdict=verdict
            ))

        head_summary = f"Compared {', '.join(c.common_name for c in compared)}. Balance your selection based on frost hazard, available growing days, and whether fresh vegetables or winter storage is your priority."

        return CropComparisonResponse(
            compared_crops=compared,
            head_to_head_summary=head_summary
        )

recommendation_engine = CropRecommendationEngine()
