import csv
import json
import re
from typing import Dict, Any, List, Optional
from backend.app.schemas.land_assessment import (
    LandAssessmentInput, LandPhotoAnalysisRequest, LandPhotoAnalysisResponse,
    ChatbotMessageRequest, ChatbotMessageResponse
)
from backend.app.knowledge_base.loader import kb

class LandPhotoAssistantEngine:
    def analyze_photo(self, req: LandPhotoAnalysisRequest) -> LandPhotoAnalysisResponse:
        image_attached = bool(req.image_base64)
        notes = (req.user_notes or "").strip()
        filename = (req.image_name or "land photo").strip()
        visual_features = [
            f"Photo received: {filename}." if image_attached else "No photo was attached.",
            "The current service does not include a visual-recognition model; soil texture, slope, wall condition, vegetation, and sunlight have not been verified from the image."
        ]
        uncertainties_marked = [
            "Soil texture and effective depth: confirm by touching and probing the soil.",
            "Frost dates and daily sunlight: confirm with local observations.",
            "Drainage, terrace stability, and water access: inspect on site before acting."
        ]
        input_echo = (
            "Photo intake recorded. No physical land features have been inferred from image pixels."
            + (f" Your notes: {notes}" if notes else " No additional photo notes were provided.")
        )
        inferred = req.current_inputs or LandAssessmentInput()

        return LandPhotoAnalysisResponse(
            soil_archetype="Soil type not confirmed from photo",
            visual_features=visual_features,
            input_echo=input_echo,
            inferred_inputs=inferred,
            confidence_level="low",
            uncertainties_marked=uncertainties_marked
        )

    def answer_chatbot(self, req: ChatbotMessageRequest) -> ChatbotMessageResponse:
        q = req.message.lower().strip()
        updates = {}
        tip = None

        # 1. Season length & frost
        if any(w in q for w in ["season", "frost", "cold", "freeze", "snow", "autumn"]):
            reply = (
                "In high-altitude cold terraces, season length and frost risk dictate everything. "
                "Do not infer a frost date or a fixed number of extra growing days from a photo. "
                "Check the frost history with local growers and compare it with the season and frost-tolerance descriptions in the crop dataset. "
                "Those CSV profiles are qualitative starting points and need local, variety-specific confirmation."
            )
            followups = [
                "How do I calculate the cold-slowed growth buffer?",
                "What can I do if hard frost is predicted tonight?",
                "Which crops survive sub-zero nights without dying?"
            ]
            tip = "Rule of thumb: Always add 20 days buffer to any crop maturity claim in high mountain terraces."

        # 2. Soil & stones
        elif any(w in q for w in ["soil", "stone", "rock", "gravel", "depth", "test"]):
            reply = (
                "Your mountain terrace has thin, stony soil. Do NOT try to sift out every pebble—only pick out stones "
                "larger than a clenched fist! Use those fist-sized stones to rebuild the collapsed terrace retention wall and line bed edges. "
                "To test soil quality with zero instruments: do the 'Bucketful Stone-Share Test' (fill a bucket, pick out large stones into another bucket—if stones take >40% volume, dig and add compost). "
                "Then add 3 to 4 buckets of well-rotted animal manure or leaf mold per 10m² bed to create rich, loose loam."
            )
            followups = [
                "How do I check if my soil is loose enough to plant?",
                "Can dark stones be used as warm mulch?",
                "What do I do about heavy clay or waterlogged spots?"
            ]
            tip = "Leave dark palm-sized flat stones along plant rows—they soak up solar heat at midday and radiate warmth into root zones at night."

        # 3. Sunlight & shadow
        elif any(w in q for w in ["sun", "shade", "shadow", "afternoon", "light", "hours"]):
            reply = (
                "Mountain ridges cast deep shadows early! If your plot falls into cliff shadow by 1:30 or 2:00 PM, "
                "you are getting only 4-5 hours of direct sun. Full-sun cereals like tall maize will struggle to fill grain. "
                "Zero-equipment check: mark the shade boundary across your terrace with small white stones at 11:00 AM, 1:00 PM, and 3:00 PM. "
                "If sunlight is limited, select shade-tolerant cool crops like Leafy Mustard, Barley, or Lentil."
            )
            updates["sunlight"] = "direct_part_of_day"
            followups = [
                "How do I measure shadow lines with stones?",
                "Which crops can tolerate partial shade on mountain terraces?",
                "Will crops mature if direct sunlight is under 5 hours?"
            ]
            tip = "White lime wash or pale flat stones stacked along the uphill wall can reflect extra sunlight downward onto your garden beds."

        # 4. Water & Stream
        elif any(w in q for w in ["water", "stream", "irrigation", "cold water", "creek"]):
            reply = (
                "Critical mountain alert: Snowmelt and high-altitude stream water is painfully cold (often 3°C to 7°C). "
                "Dumping ice-cold stream water directly onto seedlings induces thermal root shock, shutting down nutrient uptake for days! "
                "The Fix: divert stream water into black drums, old barrels, or shallow stone-lined sun pools. "
                "Let it bask in the midday sun for 4 to 6 hours so it warms to ambient air temperature before gently irrigating root furrows."
            )
            followups = [
                "How often should I water on sloping terraces?",
                "How do I build a simple stone sun-warming pool?",
                "What if water pools on the surface after heavy rain?"
            ]
            tip = "Water only at base of roots during mid-morning so excess foliage moisture evaporates before freezing night falls."

        # 5. Wall & terrace fix
        elif any(w in q for w in ["wall", "slope", "terrace", "rebuild", "erosion", "bund"]):
            reply = (
                "A fallen terrace wall threatens the entire bed through slope scour and soil loss during cloudbursts! "
                "Rebuild it using dry-stone masonry with a 1:5 inward batter (leaning slightly back into the hillside). "
                "Place the largest flat foundation stones at the base, pack smaller gravel shards behind the wall to relieve hydraulic pressure, "
                "and ensure the terrace front has a raised soil-and-stone lip (bund) so rainwater seeps down rather than pouring over the edge."
            )
            followups = [
                "What is the hand push readiness test for terrace walls?",
                "How high should the terrace riser wall be built?",
                "How do I prevent erosion during monsoon downpours?"
            ]
            tip = "The hand readiness gate: push hard against the middle of the reconstructed wall with both hands; if it moves or rattles, restack with interlocking stones."

        # 6. Specific crops from the source CSV
        elif any(
            name.lower() in q
            for crop in kb.get_all_crops()
            if not crop.get("is_aggregate_group")
            for name in [crop.get("common_name", ""), crop.get("csv_raw", {}).get("Crop", "")]
            if name
        ):
            matching_crops = [
                crop for crop in kb.get_all_crops()
                if not crop.get("is_aggregate_group")
                and any(
                    name.lower() in q
                    for name in [crop.get("common_name", ""), crop.get("csv_raw", {}).get("Crop", "")]
                    if name
                )
            ]
            crop_profiles = []
            for crop in matching_crops[:3]:
                row = crop.get("csv_raw", {})
                crop_profiles.append(
                    f"{row.get('Crop', crop['common_name'])}: season {row.get('Season(s)_in_Source', 'not listed')}; "
                    f"soil {row.get('Soil_Texture_Preference', 'not listed')}; "
                    f"frost {row.get('Frost_Tolerance_Context', 'not listed')}; "
                    f"growing season {row.get('Growing_Season_Length', 'not listed')}."
                )
            reply = (
                "Here is the matching source-CSV profile: "
                + " ".join(crop_profiles)
                + " These are qualitative preferences, not a guarantee of suitability; compare them with your local conditions and seek local agronomic validation."
            )
            followups = [
                "How do I compare this crop with my soil and frost observations?",
                "How can I check the available growing season locally?",
                "Which details in this profile are still uncertain?"
            ]
            tip = "Aggregate/statistical rows in the CSV are excluded from plantable crop recommendations."

        # 7. General fallback
        else:
            reply = (
                "Welcome to the TERRAFORM Himalayan Assistant! I can help you reason through: "
                "1. Interpreting your land and soil photo without lab instruments. "
                "2. The 10-step survival protocol (Input echo, missing variables, fix protocol, readiness gate, crop choices, timeframes, planting, care, harvest, and soil regeneration). "
                "3. Recommending the best plantable crops from our CSV database for cold terraces. "
                "What specific question about your plot, soil, or climate can I answer?"
            )
            followups = [
                "How do I assess my soil without laboratory tools?",
                "What are the top 3 crops for high-altitude cold terraces?",
                "How does the 10-step protocol work?"
            ]

        return ChatbotMessageResponse(
            reply=reply,
            suggested_followups=followups,
            detected_input_updates=updates if updates else None,
            actionable_tip=tip
        )

land_assistant = LandPhotoAssistantEngine()
