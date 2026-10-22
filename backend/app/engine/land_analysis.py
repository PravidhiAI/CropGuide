import uuid
from typing import Dict, Any, List, Tuple
from backend.app.schemas.land_assessment import LandAssessmentInput, LandAnalysisOutput, PracticalImprovement
from backend.app.knowledge_base.loader import kb

class LandAnalysisEngine:
    def analyze(self, inputs: LandAssessmentInput, assessment_id: str = None) -> LandAnalysisOutput:
        if not assessment_id:
            assessment_id = f"asm-{uuid.uuid4().hex[:8]}"

        observed_facts: List[str] = []
        inferred_conditions: List[str] = []
        favorable_conditions: List[str] = []
        potential_limitations: List[str] = []
        agricultural_risks: List[str] = []
        missing_information: List[str] = []
        conflicts_detected: List[str] = []
        follow_up_questions: List[str] = []
        practical_improvements: List[PracticalImprovement] = []

        # 1. Fact collection
        if inputs.soil_texture != "unknown":
            observed_facts.append(f"Soil texture observed as: {inputs.soil_texture.replace('_', ' ')}")
        else:
            missing_information.append("Soil texture is unknown; physical soil workability cannot be verified.")

        if inputs.drainage != "unknown":
            observed_facts.append(f"Drainage behavior: {inputs.drainage.replace('_', ' ')}")
        else:
            missing_information.append("Drainage characteristics are unknown.")

        if inputs.frost != "unknown":
            observed_facts.append(f"Frost occurrence: {inputs.frost.replace('_', ' ')}")
        else:
            missing_information.append("Frost frequency is unknown.")

        if inputs.sunlight != "unknown":
            observed_facts.append(f"Solar exposure: {inputs.sunlight.replace('_', ' ')}")

        if inputs.water_source != "unknown":
            observed_facts.append(f"Water source: {inputs.water_source.replace('_', ' ')}")

        # 2. Inconsistency / Conflict Detection
        # Conflict 1: Rapid drainage vs water pooling on surface
        if inputs.drainage == "water_disappears_quickly" and inputs.soil_moisture == "very_wet":
            conflicts_detected.append("You noted water disappears quickly, but soil moisture is very wet.")
            follow_up_questions.append("Does water drain rapidly across the entire terrace, or is there a localized low spot where cold water pools?")
        
        # Conflict 2: Rapid drainage vs pools on surface
        if inputs.drainage in ["water_disappears_quickly", "water_drains_gradually"] and inputs.drainage == "pools_on_surface":
            conflicts_detected.append("Conflicting drainage responses entered.")
            follow_up_questions.append("Does surface water pool during rain, or does it seep away immediately?")

        # Conflict 3: Dry dusty soil vs pools on surface
        if inputs.soil_moisture == "dry_and_dusty" and inputs.drainage == "pools_on_surface":
            conflicts_detected.append("Dry dusty soil reported alongside standing surface pools.")
            follow_up_questions.append("Was the terrace recently inundated after a rain event, or is it chronically parched?")

        # Conflict 4: No reliable water vs reliable irrigation
        if inputs.water_source == "no_reliable_source" and inputs.soil_moisture == "very_wet":
            inferred_conditions.append("High soil moisture in the absence of an irrigation source suggests natural seepage or perched mountain water table.")

        # 3. Terrain & Terrace Slope Evaluation
        if inputs.terrace_slope in ["steep_slope", "uneven_or_rocky"]:
            agricultural_risks.append("Terrace edge erosion and topsoil slump risk during heavy cloudbursts or fast snowmelt.")
            inferred_conditions.append("Sloping terraces accelerate runoff velocity, causing sheet erosion and exposing shallow subsoil.")
            practical_improvements.append(PracticalImprovement(
                title="Dry-Stone Bund & Riser Reinforcement",
                purpose="Stabilize terrace wall integrity and retain precious organic matter on slope.",
                steps=[
                    "Inspect dry-stone terrace wall risers for outward bulging or fallen stones.",
                    "Re-lay stones with a 1:5 inward batter (leaning slightly back toward the terrace slope).",
                    "Pack gravel drainage backing directly behind walls to relieve hydrostatic pressure."
                ],
                priority="high"
            ))
        elif inputs.terrace_slope == "gentle_slope":
            favorable_conditions.append("Gentle terrace slope facilitates natural gravitational drainage without high erosion shear.")
        elif inputs.terrace_slope == "nearly_flat":
            favorable_conditions.append("Flat terrace bed provides uniform moisture absorption and ease of manual cultivation.")
            if inputs.drainage in ["water_remains_long", "pools_on_surface"]:
                agricultural_risks.append("Water stagnation risk: Flat terraces with poor drainage lack natural gravity escape for standing water.")

        # 4. Soil Texture & Structure Evaluation
        if inputs.soil_texture == "crumbly_and_balanced":
            favorable_conditions.append("Crumbly, balanced soil (loam) offers optimal root aeration, moisture retention, and easy root expansion.")
            inferred_conditions.append("Balanced texture supports the widest spectrum of both root tubers and leafy crops.")
        elif inputs.soil_texture == "sandy_and_gritty":
            favorable_conditions.append("Gritty texture warms rapidly under spring sunlight and provides rapid drainage.")
            potential_limitations.append("Rapid percolation may leach soluble nutrients and require more frequent irrigation.")
            practical_improvements.append(PracticalImprovement(
                title="Organic Matter Incorporation",
                purpose="Increase moisture-holding capacity and prevent nutrient leaching in coarse terrace soil.",
                steps=[
                    "Incorporate 20-25 kg mature farmyard manure (FYM) or compost per 10 m² terrace bed.",
                    "Mulch bed surfaces with 5 cm dry mountain grass or straw to retard evaporation."
                ],
                priority="high"
            ))
        elif inputs.soil_texture == "sticky_and_clay_like":
            potential_limitations.append("Heavy clay soil compacts easily when wet, resists root expansion, and warms up very slowly in cold mountain springs.")
            agricultural_risks.append("Soil compaction and root suffocation (hypoxia) during prolonged wet weather.")
            practical_improvements.append(PracticalImprovement(
                title="Raised Cold-Terrace Planting Beds (15-20 cm)",
                purpose="Warm soil 3-5°C faster in spring, relieve water stagnation, and ease root growth.",
                steps=[
                    "Mark 1-meter wide beds aligned strictly along the terrace contour.",
                    "Excavate shallow 30 cm pathways and pile topsoil onto beds to raise them 15-20 cm.",
                    "Blend compost and coarse sand into the top 10 cm to improve friability."
                ],
                priority="high"
            ))
        elif inputs.soil_texture == "rocky_or_shallow":
            potential_limitations.append("Shallow rocky soil restricts deep taproot vegetables (e.g. standard carrots, large daikon).")
            agricultural_risks.append("Rapid root restriction, limited water storage reservoir, and fork-shaped root deformities.")
            practical_improvements.append(PracticalImprovement(
                title="Rock Sifting and Shallow Root Bed Construction",
                purpose="Create a cleared 20 cm loose root zone or select shallow-rooted frost hardy crops.",
                steps=[
                    "Use a hand fork to loosen upper 20 cm and move large rocks to the terrace riser bund.",
                    "Focus planting on shallow-rooting greens (spinach, mustard) or surface tubers (turnip, hill potato)."
                ],
                priority="medium"
            ))

        # 5. Drainage Evaluation
        if inputs.drainage in ["water_remains_long", "pools_on_surface"]:
            potential_limitations.append("Poor internal drainage or surface water ponding.")
            agricultural_risks.append("High vulnerability to fungal root rot (Pythium/Fusarium) and tuber rot in cold soil.")
            practical_improvements.append(PracticalImprovement(
                title="Perimeter Contour Spillways",
                purpose="Channel excess rainfall safely away from plant roots to stone discharge flumes.",
                steps=[
                    "Excavate a shallow drainage furrow (15 cm deep) along the inner foot of the terrace riser.",
                    "Grade the furrow at a gentle 0.5% slope toward the terrace side spillway."
                ],
                priority="high"
            ))
        elif inputs.drainage == "water_drains_gradually":
            favorable_conditions.append("Gradual drainage retains vital capillary moisture without waterlogging root zones.")
        elif inputs.drainage == "water_disappears_quickly":
            favorable_conditions.append("Rapid drainage prevents standing water disease, ideal during mountain cloudbursts.")

        # 6. Frost & Cold Climate Evaluation
        if inputs.frost in ["frequent", "expected_during_growing_period"]:
            potential_limitations.append("Sub-zero radiation frost presents high risk to tender emerging leaves, blossoms, and shoots.")
            agricultural_risks.append("Nocturnal thermal freeze damage; sudden tissue collapse upon morning thaw.")
            practical_improvements.append(PracticalImprovement(
                title="Thermal Micro-Cloche & Straw Insulation",
                purpose="Prevent frost kill down to -5°C using low-cost microclimate buffering.",
                steps=[
                    "Erect flexible willow or bamboo hoops arched 40-50 cm over terrace beds.",
                    "Drape agrifleece (30 GSM) or clear polyethylene over hoops before sunset on clear cold nights.",
                    "Roll back covers by 9:30 AM to let daytime solar heat warm foliage and soil."
                ],
                priority="high"
            ))
        elif inputs.frost == "occasional":
            favorable_conditions.append("Occasional light frost sweetens brassica and root vegetables without terminating growth.")
        elif inputs.frost == "rare":
            favorable_conditions.append("Low frost hazard extends the active vegetative growing window.")

        # 7. Sunlight & Aspect Evaluation
        if inputs.sunlight == "direct_most_of_day":
            favorable_conditions.append("Full day solar radiation maximizes daytime soil thermal storage and photosynthetic bulking.")
        elif inputs.sunlight in ["mostly_shaded", "seasonal_variation"]:
            potential_limitations.append("Shaded or north-facing mountain terrace receives limited direct photosynthetic hours.")
            inferred_conditions.append("Cold soil temperatures will persist longer into the season, delaying germination.")
            practical_improvements.append(PracticalImprovement(
                title="Solar Heat Trapping with Thermal Stones",
                purpose="Absorb solar energy during brief direct sun hours and radiate warmth at night.",
                steps=[
                    "Place dark mountain slate or river cobbles along northern bed borders.",
                    "Stone thermal mass warms adjacent soil microclimate by 1.5 - 2.5°C."
                ],
                priority="medium"
            ))

        # 8. Water Availability Evaluation
        if inputs.water_source == "reliable_irrigation":
            favorable_conditions.append("Reliable irrigation ensures uninterrupted crop development during critical flowering and tuberization.")
        elif inputs.water_source in ["limited_water", "seasonal_availability", "no_reliable_source"]:
            potential_limitations.append("Unpredictable or scarce water supply requires drought-hardy crops and moisture conservation.")
            agricultural_risks.append("Moisture stress during sensitive root bulking or flowering stages.")
            practical_improvements.append(PracticalImprovement(
                title="Pre-Warming Water Basin & Organic Mulch",
                purpose="Conserve every drop of water and avoid cold-shocking roots with freezing glacial stream runoff.",
                steps=[
                    "Store stream/spring water in a dark 200L drum exposed to sunlight so it warms to 14-18°C before irrigation.",
                    "Apply a 6 cm organic mulch blanket around crop rows to cut surface evaporation by 60%."
                ],
                priority="high"
            ))

        # 9. Confidence Assessment
        known_count = sum(1 for field in [
            inputs.soil_texture, inputs.drainage, inputs.soil_moisture,
            inputs.sunlight, inputs.climate, inputs.frost, inputs.water_source
        ] if field != "unknown")

        if known_count >= 6 and len(conflicts_detected) == 0:
            confidence_level = "high"
            confidence_explanation = "Comprehensive natural observations provided across soil, climate, water, and exposure with no conflicting data points."
        elif known_count >= 4:
            confidence_level = "medium"
            confidence_explanation = "Adequate key observations provided to build an actionable terrace profile; minor field parameters estimated based on mountain agro-climatic norms."
        else:
            confidence_level = "low"
            confidence_explanation = "Multiple key observations marked unknown. Recommendations will rely primarily on cold-terrace resilience defaults and require iterative field confirmation."

        # Plain language summary
        summary_parts = []
        if inputs.terrace_slope:
            summary_parts.append(f"A {inputs.terrace_slope.replace('_', ' ')} high-altitude terrace")
        if inputs.soil_texture != "unknown":
            summary_parts.append(f"featuring {inputs.soil_texture.replace('_', ' ')} soil")
        if inputs.drainage != "unknown":
            summary_parts.append(f"with {inputs.drainage.replace('_', ' ')}")
        if inputs.frost != "unknown":
            summary_parts.append(f"and {inputs.frost.replace('_', ' ')} frost conditions")
        
        plain_summary = " ".join(summary_parts) + "." if summary_parts else "High-altitude cold mountain terrace with mixed natural field observations."

        return LandAnalysisOutput(
            assessment_id=assessment_id,
            plain_language_summary=plain_summary,
            favorable_conditions=favorable_conditions or ["High-altitude solar radiation during clear periods", "Natural nocturnal chilling beneficial for cool-season crops"],
            potential_limitations=potential_limitations or ["Cold night temperatures requiring resilient cultivars"],
            agricultural_risks=agricultural_risks or ["Unseasonal cold snaps or heavy rain runoff"],
            missing_information=missing_information,
            practical_improvements=practical_improvements,
            confidence_level=confidence_level,
            confidence_explanation=confidence_explanation,
            conflicts_detected=conflicts_detected,
            follow_up_questions=follow_up_questions,
            observed_facts=observed_facts,
            inferred_conditions=inferred_conditions
        )

land_engine = LandAnalysisEngine()
