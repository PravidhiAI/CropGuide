from typing import Dict, Any, List, Optional
from backend.app.schemas.pest import (
    PestDiagnosisRequest, PestDiagnosisResponse, PossibleCauseItem
)
from backend.app.knowledge_base.loader import kb

class PestDiagnosticEngine:
    def diagnose(self, req: PestDiagnosisRequest) -> PestDiagnosisResponse:
        all_pests = kb.get_all_pests()
        possible_causes: List[PossibleCauseItem] = []
        follow_up_questions: List[str] = []

        observed_symptoms = set(req.symptoms)
        affected_parts = set(req.affected_plant_parts)

        for p in all_pests:
            # Check crop specificity if crop_id is provided
            if req.crop_id and req.crop_id not in p.get("affected_crops", []):
                continue

            pest_symptoms = set(p.get("primary_symptoms", []))
            matching_symptoms = list(observed_symptoms.intersection(pest_symptoms))

            if not matching_symptoms:
                continue

            match_pct = int((len(matching_symptoms) / max(len(pest_symptoms), len(observed_symptoms))) * 100)
            
            # Bonus matching if plant part matches
            pest_parts = set(p.get("affected_plant_parts", []))
            if affected_parts.intersection(pest_parts):
                match_pct = min(100, match_pct + 15)

            # Bonus matching if weather matches
            if req.moisture_condition == "soggy_flooded" and p["id"] in ["waterlogging_asphyxia", "damping_off_root_rot"]:
                match_pct = min(100, match_pct + 20)
            if req.moisture_condition == "damp_dew" and p["id"] in ["late_blight", "powdery_mildew"]:
                match_pct = min(100, match_pct + 15)

            # Confidence determination
            if match_pct >= 65 and len(matching_symptoms) >= 2:
                conf = "high"
            elif match_pct >= 40:
                conf = "medium"
            else:
                conf = "low"

            possible_causes.append(PossibleCauseItem(
                disorder_id=p["id"],
                common_name=p["common_name"],
                scientific_name=p["scientific_name"],
                category=p.get("category", "disease_fungal"),
                confidence_level=conf,
                match_percentage=match_pct,
                matching_symptoms=[s.replace("_", " ").title() for s in matching_symptoms],
                distinguishing_features=p.get("distinguishing_features", "Look for characteristic lesion patterns or insect morphology."),
                conducive_weather=p.get("conducive_weather", "Cold mountain conditions with fluctuating moisture."),
                cultural_controls=p.get("cultural_controls", []),
                physical_controls=p.get("physical_controls", []),
                biological_controls=p.get("biological_controls", []),
                safe_treatments=p.get("safe_treatments", []),
                escalation_criteria=p.get("escalation_criteria", "Contact local KVK plant clinic if symptoms advance across >20% of terrace foliage."),
                sources=p.get("sources", [])
            ))

        # Sort by match percentage descending
        possible_causes.sort(key=lambda x: x.match_percentage, reverse=True)

        # Generate clarifying follow-up questions
        if "holes_in_leaves" in req.symptoms and not req.visible_insects:
            follow_up_questions.append("Are there tiny black jumping beetles (1-2mm) creating round shot-holes, or are larger green caterpillars chewing irregular leaf edges?")
        if "wilting" in req.symptoms:
            follow_up_questions.append("Does the wilting occur in bone-dry soil, or do the plants remain wilted even when the terrace soil is soggy and cold (indicating root rot or asphyxia)?")
        if "yellowing" in req.symptoms:
            follow_up_questions.append("Is the yellowing uniform across old lower leaves (nutrient leaching/cold), or are there mottled mosaic patches or sticky honeydew residues underneath (aphid vector)?")
        if "rotting_plant_parts" in req.symptoms:
            follow_up_questions.append("Is there a foul rotting odor accompanied by water-soaked brown stem/tuber lesions (suggestive of late blight or soft rot)?")

        if possible_causes:
            summary = f"Identified {len(possible_causes)} potential causes matching observed field symptoms. Top match: {possible_causes[0].common_name} ({possible_causes[0].match_percentage}% confidence match)."
        else:
            summary = "No direct pest or disease in the knowledge base fully matched the entered symptom combination. Symptoms may stem from complex microclimate abiotic stress, nutrient deficiency, or early season cold shock."

        ipm_protocol = [
            "1. Physical Scouting: Inspect both upper and lower leaf surfaces early in the morning.",
            "2. Cultural Sanitation: Promptly remove and safely bury or burn badly infected lower leaves (do not compost diseased foliage).",
            "3. Mechanical Barriers: Use fine floating agrifleece (40 mesh) or cardboard seedling collars to block cutworms and flea beetles.",
            "4. Biological Stewardship: Conserve local ladybird beetles and apply botanical neem extracts or wood ash before escalating.",
            "5. Escalation: Consult your local Krishi Vigyan Kendra (KVK) or State Agricultural University extension if more than 15% of terrace plants exhibit rapid blight or vascular collapse."
        ]

        disclaimer = "Field symptom analysis provides supportive diagnostic hypotheses based on documented regional crop disorders. It does not replace physical microscopic or laboratory plant clinic assays."

        return PestDiagnosisResponse(
            possible_causes=possible_causes,
            investigative_summary=summary,
            follow_up_questions=follow_up_questions,
            ipm_general_protocol=ipm_protocol,
            disclaimer=disclaimer
        )

pest_engine = PestDiagnosticEngine()
