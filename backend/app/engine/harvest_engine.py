from typing import Dict, Any, List, Optional
from backend.app.schemas.pest import (
    HarvestAssessmentRequest, HarvestAssessmentResponse
)
from backend.app.knowledge_base.loader import kb

class HarvestReadinessEngine:
    def assess(self, req: HarvestAssessmentRequest) -> HarvestAssessmentResponse:
        crop = kb.get_crop(req.crop_id)
        if not crop:
            raise ValueError(f"Crop '{req.crop_id}' not found in knowledge base")

        min_days = crop["growing_season"]["min_days"]
        max_days = crop["growing_season"]["max_days"]
        maturity_range_str = f"{min_days}-{max_days} days"

        # Evaluate time maturity
        days = req.days_since_planting
        if days < min_days - 10:
            time_status = "premature"
            time_score = max(10, int((days / min_days) * 70))
        elif days <= max_days:
            time_status = "in_window"
            time_score = 90
        else:
            time_status = "overdue"
            time_score = 80

        # Evaluate observable signs
        crop_indicators = crop.get("harvest_indicators", [])
        evaluated_signs: List[Dict[str, Any]] = []
        positive_checks = 0

        for idx, ind in enumerate(crop_indicators):
            key = f"indicator_{idx + 1}"
            checked = req.checklist_answers.get(key, False)
            if checked:
                positive_checks += 1
            evaluated_signs.append({
                "sign_id": key,
                "description": ind,
                "verified": checked
            })

        # Calculate maturity percentage
        indicator_ratio = (positive_checks / len(crop_indicators)) if crop_indicators else 0.5
        overall_maturity_pct = int((time_score * 0.4) + (indicator_ratio * 60))
        overall_maturity_pct = max(0, min(100, overall_maturity_pct))

        reasons_to_delay: List[str] = []
        if req.weather_forecast == "impending_rain":
            reasons_to_delay.append("Persistent rain forecasted: digging root crops in wet mud causes severe storage fungal rot.")
        if days < min_days - 7 and not all(s["verified"] for s in evaluated_signs):
            reasons_to_delay.append(f"Crop is only {days} days old (minimum maturity is {min_days} days). Tubers/heads are still actively expanding.")

        # Determine readiness status
        if overall_maturity_pct >= 80 and not reasons_to_delay:
            readiness_status = "ready_for_harvest"
            summary = f"{crop['common_name']} exhibits confirmed physiological maturity and is ready for immediate harvest under current weather conditions."
        elif overall_maturity_pct >= 60:
            readiness_status = "approaching_maturity"
            summary = f"{crop['common_name']} is nearing peak maturity ({overall_maturity_pct}% ready). Monitor closely over the next 5-7 days."
        elif days > max_days + 15:
            readiness_status = "overdue_risk"
            summary = f"{crop['common_name']} is past its optimal harvest window. Harvest immediately to prevent splitting, woody fibers, or seed shattering."
        else:
            readiness_status = "too_early"
            summary = f"{crop['common_name']} is in active vegetative/bulking phase. Harvesting now will result in underdeveloped yields and watery produce."

        # Harvest tools
        tools_map = {
            "potato": ["Blunt hand digging fork (khurpa/kudal)", "Clean cloth-lined crates", "Haulm pruning shears"],
            "carrot": ["Narrow garden fork to loosen soil", "Cloth collection basket", "Sharp trimming knife"],
            "radish": ["Hand gloves", "Trimming knife", "Water washing basin"],
            "turnip": ["Hand gloves", "Twisting shears", "Storage basket"],
            "cabbage": ["Sharp heavy harvest knife", "Padded crates"],
            "cauliflower": ["Curd harvest knife", "Clean harvest crates with wrapper leaf padding"],
            "garden_pea": ["Two-handed harvest technique", "Breathable wicker baskets"],
            "spinach": ["Clean harvest shears or knife", "Cool shaded crates"],
            "leafy_mustard": ["Clean pruning shears", "Shaded collection basket"],
            "broad_bean": ["Harvest shears or downward snap", "Mesh bags"],
            "barley": ["Curved hill sickle (daranti)", "Twine for sheaves", "Clean threshing sheet"],
            "buckwheat": ["Sickle", "Clean canvas sheet for immediate gentle threshing"]
        }
        tools = tools_map.get(req.crop_id, ["Clean harvesting knife", "Collection crates", "Gloves"])

        # Weather guidance
        if req.weather_forecast == "dry_sunny":
            weather_guidance = "Optimal clear weather window! Reaping under dry morning sun ensures clean curing and minimized pathogen transfer."
        elif req.weather_forecast == "impending_frost":
            weather_guidance = "Frost Warning: Harvest sensitive crops immediately before nocturnal freezing causes irreversible tissue collapse."
        else:
            weather_guidance = "Harvest during crisp, dry morning hours after dew has evaporated but before intense midday heat."

        return HarvestAssessmentResponse(
            crop_id=req.crop_id,
            crop_name=crop["common_name"],
            days_since_planting=days,
            estimated_maturity_range=maturity_range_str,
            maturity_percentage=overall_maturity_pct,
            readiness_status=readiness_status,
            readiness_summary=summary,
            observable_signs_evaluated=evaluated_signs,
            weather_guidance=weather_guidance,
            reasons_to_delay=reasons_to_delay,
            harvest_tools_needed=tools,
            harvest_steps=crop.get("harvesting_instructions", ["Harvest with care using clean tools."]),
            post_harvest_storage_specs=crop.get("storage_requirements", {})
        )

harvest_engine = HarvestReadinessEngine()
