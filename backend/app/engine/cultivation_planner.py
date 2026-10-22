import uuid
import datetime
from typing import Dict, Any, List, Optional
from backend.app.schemas.cultivation import (
    CultivationPlanResponse, CultivationStageSchema, CultivationTaskSchema
)
from backend.app.knowledge_base.loader import kb

class CultivationPlannerEngine:
    def generate_plan(self, crop_id: str, planting_date_str: str, assessment_id: Optional[str] = None) -> CultivationPlanResponse:
        crop = kb.get_crop(crop_id)
        if not crop:
            raise ValueError(f"Crop with ID '{crop_id}' not found in knowledge base")

        plan_id = f"plan-{uuid.uuid4().hex[:8]}"
        stages: List[CultivationStageSchema] = []
        total_tasks = 0

        cult_specs = crop.get("cultivation_specs", {})
        method = cult_specs.get("method", "direct_sowing")
        depth = cult_specs.get("planting_depth_cm", 2.0)
        p_space = cult_specs.get("plant_spacing_cm", 15)
        r_space = cult_specs.get("row_spacing_cm", 30)
        germ_days = cult_specs.get("germination_days", "7-12 days")
        min_days = crop["growing_season"]["min_days"]
        max_days = crop["growing_season"]["max_days"]
        sources = crop.get("agricultural_sources", [])

        # Parse planting date
        try:
            planting_date = datetime.date.fromisoformat(planting_date_str)
        except Exception:
            planting_date = datetime.date.today()

        harvest_start = planting_date + datetime.timedelta(days=min_days)
        harvest_end = planting_date + datetime.timedelta(days=max_days)
        harvest_window_str = f"{harvest_start.strftime('%b %d, %Y')} to {harvest_end.strftime('%b %d, %Y')}"

        # ---------------- STAGE 1: LAND PREPARATION ----------------
        s1_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t1-1",
                step_number=1,
                stage_number=1,
                stage_name="Stage 1: Land Preparation",
                title="Terrace Bed Clearing & Stone Bund Inspection",
                purpose="Clear winter weed debris, inspect terrace retainers, and prevent slope erosion.",
                tools_materials=["Khurpa (hand hoe)", "Rake", "Gloves", "Wheelbarrow or basket"],
                instructions=[
                    "Walk along the terrace edges and remove dead weed stumps, thorny shrubs, and winter debris.",
                    "Inspect the dry-stone terrace wall (riser) for loose or dislodged stones.",
                    "Ensure terrace edge retains a slight inward lip (bund) so surface water does not rush over and scour the downhill face."
                ],
                expected_result="A clean, secure terrace platform with intact stone retention walls.",
                safety_notes="Be cautious near steep terrace drops; wear sturdy boots on uneven stone ledges."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t1-2",
                step_number=2,
                stage_number=1,
                stage_name="Stage 1: Land Preparation",
                title="Soil Aeration & Raised Bed Construction",
                purpose="Loosen compacted cold mountain soil to improve drainage, aeration, and root penetration.",
                tools_materials=["Spade or Kudal", "Rake", "String line & wooden pegs"],
                instructions=[
                    "Dig the terrace soil to a depth of 20-25 cm using a spade or kudal, breaking up heavy clods.",
                    "Shape 1-meter wide raised planting beds (15-20 cm elevated above pathways) running along the contour.",
                    "Smooth the top of the bed with a rake, leaving a fine, crumbly seedbed free of large stones."
                ],
                expected_result="A 15-20 cm elevated planting bed that warms up 3-5°C faster under morning sun.",
                safety_notes="Pace digging to avoid back strain at high altitudes."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t1-3",
                step_number=3,
                stage_number=1,
                stage_name="Stage 1: Land Preparation",
                title="Organic Fertility & Basal Compost Incorporation",
                purpose="Replenish essential soil organic matter and slow-release nutrients adapted for cold soils.",
                tools_materials=["Well-rotted Farmyard Manure (FYM) or Vermicompost (2-3 kg/m²)", "Wood ash (15-20 g/m²)", "Fork"],
                instructions=[
                    "Spread 2-3 kg of dark, fully decomposed compost or FYM evenly across every square meter of planting bed.",
                    "Lightly dust wood ash to provide natural potassium and balance acidic mountain soil.",
                    "Incorporate amendments thoroughly into the top 10-15 cm of soil using a garden fork."
                ],
                expected_result="Dark, friable, nutrient-enriched soil ready for sowing or transplanting.",
                safety_notes="Never use fresh, hot unfermented manure, which burns tender roots and introduces weeds."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=1,
            stage_name="Land Preparation",
            stage_description="Terrace stabilization, contour bed shaping, drainage furrowing, and organic soil enrichment.",
            estimated_day_range="Days -14 to 0 (Before Planting)",
            tasks=s1_tasks
        ))

        # ---------------- STAGE 2: PLANTING ----------------
        if method == "seed_tuber":
            method_desc = "Seed Tuber Placement (Hill Potato)"
            p_instructions = [
                f"Lay out furrows across the raised bed spaced {r_space} cm apart.",
                f"Place pre-sprouted seed tubers with sturdy green sprouts pointing upward, spaced {p_space} cm apart.",
                f"Cover tubers with loose, crumbly soil to a depth of {depth} cm.",
                "Water lightly with tempered water; do not flood the furrow."
            ]
            p_tools = ["Pre-sprouted seed tubers (35-50g)", "Planting trowel or hoe", "Measuring stick"]
        elif method == "transplanting":
            method_desc = f"Transplanting Hardened Seedlings ({crop['common_name']})"
            p_instructions = [
                f"Mark planting holes spaced {p_space} cm apart in rows {r_space} cm apart.",
                "Carefully ease healthy seedlings from nursery flats without tearing root balls.",
                f"Set seedlings {depth} cm deep, pressing soil gently around root collar to eliminate air pockets.",
                "Water immediately with tempered water around each plant base."
            ]
            p_tools = ["Healthy 4-5 leaf transplants", "Hand trowel", "Tempered water can with rose head"]
        else:
            method_desc = f"Precision Direct Sowing ({crop['common_name']})"
            p_instructions = [
                f"Create straight shallow furrows {depth} cm deep, spaced {r_space} cm apart.",
                f"Sow seeds carefully at {p_space} cm intervals along the furrow.",
                f"Gently cover with fine sifted soil and tamp down lightly with the back of a rake for good seed-to-soil contact.",
                "Moisten the bed with a fine spray of sun-warmed water."
            ]
            p_tools = ["Quality certified seed", "Line cord", "Fine hand rake", "Watering can"]

        s2_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t2-1",
                step_number=1,
                stage_number=2,
                stage_name="Stage 2: Planting",
                title=f"Seed/Tuber Preparation & Planting ({method_desc})",
                purpose=f"Establish {crop['common_name']} at verified scientific depth and spacing for optimal cold terrace growth.",
                tools_materials=p_tools,
                instructions=p_instructions,
                expected_result=f"Properly planted bed with seeds/seedlings secure at {depth} cm depth.",
                safety_notes="Avoid planting during high midday winds or intense drying midday sun; plant in late afternoon."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t2-2",
                step_number=2,
                stage_number=2,
                stage_name="Stage 2: Planting",
                title="Surface Straw Mulching & Frost Blanket Setup",
                purpose="Conserve seedbed moisture, protect against freezing mountain nights, and suppress weed germination.",
                tools_materials=["Clean dry mountain straw or pine needles (3-5 cm layer)", "Agrifleece or bamboo cloche hoops"],
                instructions=[
                    "Scatter a light 3 cm layer of clean straw over the bed surface.",
                    "If nighttime temperatures dip near or below 0°C, set up flexible bamboo arches and drape lightweight agrifleece.",
                    "Secure cloche edges with terrace stones to prevent mountain gusts from whipping the cover away."
                ],
                expected_result="Protected microclimate maintaining 2-4°C higher soil temperature than ambient air.",
                safety_notes="Ensure stones are safely placed and will not roll downhill."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=2,
            stage_name="Planting & Sowing",
            stage_description=f"Precision sowing/transplanting at {depth} cm depth and {p_space}x{r_space} cm spacing with protective mulching.",
            estimated_day_range="Day 0 to Day 5",
            tasks=s2_tasks
        ))

        # ---------------- STAGE 3: SEEDLING ESTABLISHMENT ----------------
        s3_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t3-1",
                step_number=1,
                stage_number=3,
                stage_name="Stage 3: Seedling Establishment",
                title="Germination & Emergence Assessment",
                purpose=f"Verify uniform germination ({germ_days}) and inspect early seedling vigor.",
                tools_materials=["Magnifying glass or hand lens", "Notebook / Field Journal"],
                instructions=[
                    f"Check rows daily during the expected emergence window ({germ_days}).",
                    "Inspect emergent cotyledons or shoots for healthy green coloration and absence of collar constriction.",
                    "If cold weather delays sprouting, check that topsoil remains damp and not encrusted with hard sun-baked crust."
                ],
                expected_result="Uniform green rows emerging steadily across the terrace bed.",
                safety_notes="Do not disturb delicate sprout roots by digging into the seed furrow."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t3-2",
                step_number=2,
                stage_number=3,
                stage_name="Stage 3: Seedling Establishment",
                title="Selective Thinning & First Light Weeding",
                purpose=f"Ensure optimal {p_space} cm individual plant spacing to prevent stunted, crowded growth.",
                tools_materials=["Small khurpa (weeding knife)", "Hand trowel"],
                instructions=[
                    f"When seedlings reach 3-5 cm height, thin congested clusters by carefully snipping or pulling weaker seedlings.",
                    f"Maintain a final distance of {p_space} cm between healthy, sturdy individual plants.",
                    "Gently scrape away small weed sprouts between rows without disrupting crop root hairs."
                ],
                expected_result=f"Evenly spaced, uncrowded seedlings with adequate space for leaf and root development.",
                safety_notes="Thinned greens of radish, turnip, spinach, or mustard can be washed and consumed as fresh microgreens."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=3,
            stage_name="Seedling Establishment",
            stage_description="Monitoring emergence, early moisture stabilization, selective thinning, and wind buffering.",
            estimated_day_range=f"Days 5 to {min(30, min_days // 3)}",
            tasks=s3_tasks
        ))

        # ---------------- STAGE 4: ONGOING CARE ----------------
        care_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t4-1",
                step_number=1,
                stage_number=4,
                stage_name="Stage 4: Ongoing Care",
                title="Calibrated Irrigation & Soil Moisture Monitoring",
                purpose="Deliver water efficiently according to crop demand without waterlogging or root chilling.",
                tools_materials=["Moisture probe or clean trowel", "Irrigation furrow or watering can with tempered water"],
                instructions=[
                    "Check soil moisture by probing 5 cm into the bed: if soil is cool and holds a crumbly ball when squeezed, moisture is adequate.",
                    "If upper 3 cm is dry, irrigate into furrows in the late morning (10 AM to 12 PM) so solar warmth takes the chill off the water.",
                    "NEVER irrigate late in the evening during cold seasons, as wet soil freezes faster and induces nocturnal freeze injury."
                ],
                expected_result="Consistently moist root zone without perched standing water.",
                safety_notes="Avoid cold-shocking roots with direct glacial stream runoff."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t4-2",
                step_number=2,
                stage_number=4,
                stage_name="Stage 4: Ongoing Care",
                title="Crop-Specific Canopy & Soil Management",
                purpose="Provide necessary physical support (earthing up, trellising, or blanching) specific to this crop.",
                tools_materials=["Khurpa", "Compost", "Mulch replenishment"],
                instructions=[
                    f"Earthing/Mounding: {crop['care_instructions'].get('mounding_hilling', 'Earth up soil around root base to stabilize stems')}",
                    f"Nutrient Boost: {crop['care_instructions'].get('organic_nutrition', 'Apply diluted compost tea or vermiwash')}",
                    "Inspect row mulch and top up any thin spots with dry straw."
                ],
                expected_result="Robust root collar anchorage, shielded tubers/roots, and sustained vegetative development.",
                safety_notes="Take care not to scrape root collars with metal hoe edges."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=4,
            stage_name="Ongoing Care",
            stage_description="Irrigation calibration, organic nutrition top-dressing, earthing-up, and weed suppression.",
            estimated_day_range=f"Days {min_days // 3} to {min_days - 20}",
            tasks=care_tasks
        ))

        # ---------------- STAGE 5: PEST AND DISEASE MANAGEMENT ----------------
        s5_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t5-1",
                step_number=1,
                stage_number=5,
                stage_name="Stage 5: Pest & Disease Management",
                title="Weekly Integrated Pest Management (IPM) Inspection",
                purpose="Detect early pest incursions or fungal foliar spots before population outbreaks occur.",
                tools_materials=["Magnifying hand lens", "Yellow sticky card", "Clean collection jar"],
                instructions=[
                    "Inspect the undersides of 10 random leaves and check root collars early in the morning.",
                    "Check for common pests identified for this crop: " + ", ".join(crop.get("pests_diseases", ["aphids", "cutworm"])).replace("_", " "),
                    "Record any discolored spots, powder, or chewed margins in your Field Journal."
                ],
                expected_result="Early detection of any leaf lesions or feeding larvae at sub-economic threshold.",
                safety_notes="Isolate and inspect suspicious diseased leaves away from clean beds."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t5-2",
                step_number=2,
                stage_number=5,
                stage_name="Stage 5: Pest & Disease Management",
                title="Biological & Cultural Prevention Application",
                purpose="Apply safe, verified bio-controls and physical barriers without using harmful chemical insecticides.",
                tools_materials=["Neem oil (5ml/L) or wood ash", "Fine sprayer or duster", "Protective gloves"],
                instructions=[
                    "For chewing caterpillars/flea beetles: dust fine clean wood ash onto dew-damp foliage at sunrise.",
                    "For aphids or sap suckers: spray cold-pressed neem oil (5 ml/L) mixed with a mild soap surfactant in the late afternoon.",
                    "For soil cutworms: place paper seedling collars 3 cm into soil around stems."
                ],
                expected_result="Pest populations controlled below damage threshold while protecting native pollinators.",
                safety_notes="Never spray during active bee foraging hours; always wear face covering when dusting wood ash."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=5,
            stage_name="Pest and Disease Management",
            stage_description="Rigorous IPM scouting, biological controls, physical barriers, and safe botanical deterrents.",
            estimated_day_range="Continuous Throughout Growing Cycle",
            tasks=s5_tasks
        ))

        # ---------------- STAGE 6: HARVEST READINESS ----------------
        indicators = crop.get("harvest_indicators", ["Foliage shows signs of maturity", "Proper root/head dimensions reached"])
        s6_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t6-1",
                step_number=1,
                stage_number=6,
                stage_name="Stage 6: Harvest Readiness",
                title="Observable Maturity Signs Verification",
                purpose=f"Evaluate verified physiological maturity indicators before initiating {crop['common_name']} harvest.",
                tools_materials=["Harvest readiness checklist", "Ruler or caliper"],
                instructions=[
                    f"Check indicator 1: {indicators[0]}",
                    f"Check indicator 2: {indicators[1] if len(indicators) > 1 else 'Color and firmness check'}",
                    "Perform a test sample harvest on 1-2 representative plants from the middle of the terrace bed.",
                    "Verify maturity before proceeding with full harvest."
                ],
                expected_result="Confirmed physiological ripeness and peak culinary/storage quality.",
                safety_notes="Do not harvest unripe or water-bloated produce."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t6-2",
                step_number=2,
                stage_number=6,
                stage_name="Stage 6: Harvest Readiness",
                title="Weather Check & Pre-Harvest Water Cutoff",
                purpose="Ensure dry field conditions and skin hardening for superior shelf life.",
                tools_materials=["Weather forecast or local mountain observations"],
                instructions=[
                    "Cease irrigation 7-10 days before harvest (especially for root/tuber crops) to allow outer skins to set and sugar concentration to peak.",
                    "Check weather forecast: plan the harvest during a 2-3 day window of clear, dry, sunny mountain weather.",
                    "If prolonged heavy rains or severe frost are imminent, prepare tarpaulins or execute emergency harvest."
                ],
                expected_result="Drier terrace soil preventing caked mud on produce and promoting natural curing.",
                safety_notes="Harvesting wet produce dramatically increases rot during winter storage."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=6,
            stage_name="Harvest Readiness",
            stage_description="Inspecting maturity indicators, pre-harvest water restriction, and weather timing.",
            estimated_day_range=f"Days {min_days - 10} to {min_days}",
            tasks=s6_tasks
        ))

        # ---------------- STAGE 7: HARVESTING ----------------
        harvest_instructions = crop.get("harvesting_instructions", [
            "Harvest during crisp dry morning hours using clean tools.",
            "Avoid bruising, cutting, or dropping produce onto stones."
        ])
        s7_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t7-1",
                step_number=1,
                stage_number=7,
                stage_name="Stage 7: Harvesting",
                title=f"Step-by-Step Harvesting of {crop['common_name']}",
                purpose="Carefully reap produce without causing punctures, bruising, or skin abrasions.",
                tools_materials=["Clean sharp harvest knife or khurpa / digging fork", "Lined harvest baskets / crates", "Gloves"],
                instructions=harvest_instructions + [
                    "Handle produce gently; never toss or drop harvested roots/heads into containers.",
                    "Keep harvested crates shaded immediately beneath canvas or terrace trees."
                ],
                expected_result="Cleanly harvested crop free of mechanical cuts and bruises.",
                safety_notes="Keep fingers clear of sharp knife blades; use proper lifting posture when carrying heavy crates."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t7-2",
                step_number=2,
                stage_number=7,
                stage_name="Stage 7: Harvesting",
                title="Field Sorting & Damaged Produce Separation",
                purpose="Isolate damaged or diseased produce to prevent contaminating sound storage stock.",
                tools_materials=["Two distinct bins: 'Prime Storage' and 'Immediate Use/Cull'"],
                instructions=[
                    "Inspect each harvested unit: sort unblemished, fully intact items into Prime Storage bins.",
                    "Items with minor fork nicks, insect bites, or bruising must be set aside for immediate cooking or feeding.",
                    "Discard severely rotted or fungal-infected material safely away from terrace composting areas."
                ],
                expected_result="Strictly graded produce ensuring only pristine specimens enter long-term storage.",
                safety_notes="Wash hands after handling any visibly rotted specimens."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=7,
            stage_name="Harvesting",
            stage_description="Careful manual reaping, bruise prevention, field grading, and sorting.",
            estimated_day_range=f"Days {min_days} to {max_days}",
            tasks=s7_tasks
        ))

        # ---------------- STAGE 8: POST-HARVEST ----------------
        storage_spec = crop.get("storage_requirements", {})
        s8_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t8-1",
                step_number=1,
                stage_number=8,
                stage_name="Stage 8: Post-Harvest",
                title="Curing & Surface Conditioning",
                purpose="Thicken skins, heal minor surface abrasions, and reduce excess moisture.",
                tools_materials=["Ventilated curing racks / burlap sheets", "Dark, well-ventilated room (15-18°C)"],
                instructions=[
                    f"Curing Protocol: {storage_spec.get('curing', 'Spread in thin layers in a shaded, well-ventilated area for 7-10 days')}",
                    "Do NOT wash root crops with water prior to curing/storage; simply brush off dry loose terrace dirt.",
                    "Ensure adequate cross-ventilation to remove transpired water vapor."
                ],
                expected_result="Firm, healed produce skins resistant to pathogen entry.",
                safety_notes="Ensure rodents cannot access curing rooms."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t8-2",
                step_number=2,
                stage_number=8,
                stage_name="Stage 8: Post-Harvest",
                title="Long-Term Cold Storage Setup",
                purpose=f"Maintain optimal temperature ({storage_spec.get('long_term_temp_c', '0-4°C')}) and humidity ({storage_spec.get('humidity_percent', '85-95%')}) for maximum shelf life.",
                tools_materials=["Insulated mountain root cellar, sand boxes, or slatted wooden crates", "Thermometer/Hygrometer"],
                instructions=[
                    f"Store at recommended temperature: {storage_spec.get('long_term_temp_c', '0-4°C')}.",
                    f"Maintain target relative humidity: {storage_spec.get('humidity_percent', '90%')}.",
                    f"Light condition: {storage_spec.get('light_condition', 'Complete darkness to prevent greening or sprouting')}.",
                    f"Expected shelf life: {storage_spec.get('shelf_life_months', '2-4 months')} under proper cellar conditions.",
                    "Inspect storage bins every two weeks and immediately remove any softening or spoiling unit."
                ],
                expected_result="Extended winter food security lasting throughout high-altitude cold months.",
                safety_notes="Ensure storage cellars have safe access and adequate oxygen ventilation."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=8,
            stage_name="Post-Harvest & Storage",
            stage_description="Curing, temperature & humidity management, root cellar storage, and spoilage prevention.",
            estimated_day_range=f"Days {max_days} to {max_days + 15}",
            tasks=s8_tasks
        ))

        # ---------------- STAGE 9: SEASON REVIEW ----------------
        s9_tasks = [
            CultivationTaskSchema(
                task_id=f"{plan_id}-t9-1",
                step_number=1,
                stage_number=9,
                stage_name="Stage 9: Season Review",
                title="Yield Logging & Field Journal Completion",
                purpose="Document actual harvest yield, date, and weather outcomes for personal and community learning.",
                tools_materials=["Weighing balance / spring scale", "Field Journal (online or paper)"],
                instructions=[
                    "Weigh and record total clean harvest yield in kilograms from the terrace bed.",
                    "Note down exact harvest dates, number of pickings, and grade proportions.",
                    "Log major weather events (late frosts, cloudbursts, dry spells) and how the crop reacted."
                ],
                expected_result="Comprehensive harvest yield and seasonal performance record.",
                safety_notes="Store records safely to compare against future seasonal cycles."
            ),
            CultivationTaskSchema(
                task_id=f"{plan_id}-t9-2",
                step_number=2,
                stage_number=9,
                stage_name="Stage 9: Season Review",
                title="Terrace Bed Restoration & Crop Rotation Planning",
                purpose="Recondition the terrace soil and plan crop rotation to break pest cycles and replenish nitrogen.",
                tools_materials=["Compost", "Green manure seeds or mulch cover", "Hoe"],
                instructions=[
                    "Remove spent crop haulms (compost if disease-free; bury or burn if late blight or clubroot was present).",
                    "Do NOT plant the same crop botanical family in this bed next season (e.g. follow solanaceous potatoes with nitrogen-fixing peas or broad beans).",
                    "Sow an overwintering cold cover crop (e.g. winter rye or broad bean) or spread 10 cm straw mulch over the terrace bed before heavy winter snows arrive."
                ],
                expected_result="Protected terrace soil ready to retain fertility through winter for next spring's cycle.",
                safety_notes="Leave legume root nodules intact in the soil to release biological nitrogen."
            )
        ]
        stages.append(CultivationStageSchema(
            stage_number=9,
            stage_name="Season Review & Soil Restoration",
            stage_description="Yield auditing, journal synthesis, crop rotation scheduling, and winter bed protection.",
            estimated_day_range=f"Days {max_days + 16} to {max_days + 30}",
            tasks=s9_tasks
        ))

        for st in stages:
            total_tasks += len(st.tasks)

        return CultivationPlanResponse(
            plan_id=plan_id,
            assessment_id=assessment_id,
            crop_id=crop["id"],
            crop_name=crop["common_name"],
            scientific_name=crop["scientific_name"],
            planting_date=planting_date_str,
            estimated_harvest_window=harvest_window_str,
            total_days_estimate=max_days,
            total_stages=len(stages),
            total_tasks_count=total_tasks,
            completed_tasks_count=0,
            progress_percentage=0.0,
            stages=stages,
            supporting_sources=sources
        )

cultivation_planner = CultivationPlannerEngine()
