import csv
import json
import re

CSV_PATH = "data/crops.csv"
JSON_OUT_PATH = "data/crop_database.json"

# Scientific names and botanical metadata for the crops in the CSV
BOTANICAL_LOOKUP = {
    "Bajra": {
        "slug": "bajra",
        "scientific_name": "Pennisetum glaucum",
        "common_name": "Bajra (Pearl Millet)",
        "min_days": 70, "max_days": 90, "category": "short",
        "foliage_damage_temp_c": 1.0,
        "frost_rating": "sensitive",
        "demand_level": "low",
        "drought_tolerance": "very_high",
        "alt_min": 200, "alt_max": 1800,
        "planting_depth_cm": 2.5, "plant_spacing_cm": 12, "row_spacing_cm": 45,
        "germination_days": "4-7 days",
        "pests": ["shoot_fly", "downy_mildew", "rust"],
        "harvest_indicators": ["Grains become hard and moisture falls below 20%", "Ears turn golden-straw colored with dark basal nodes"],
        "curing": "Sun dry harvested cobs for 4-6 days until grain moisture reaches 10-12% before threshing."
    },
    "Barley": {
        "slug": "barley",
        "scientific_name": "Hordeum vulgare",
        "common_name": "Barley (Jau)",
        "min_days": 80, "max_days": 110, "category": "short",
        "foliage_damage_temp_c": -3.5,
        "frost_rating": "hardy",
        "demand_level": "low",
        "drought_tolerance": "high",
        "alt_min": 1000, "alt_max": 3500,
        "planting_depth_cm": 4.0, "plant_spacing_cm": 10, "row_spacing_cm": 22,
        "germination_days": "5-8 days",
        "pests": ["powdery_mildew", "aphids", "loose_smut"],
        "harvest_indicators": ["Ears droop downward and turn pale straw yellow", "Grains cannot be dented with thumbnail"],
        "curing": "Field dry harvested bundles in upright stooks for 3-5 days in dry sun before threshing."
    },
    "Castorseed": {
        "slug": "castorseed",
        "scientific_name": "Ricinus communis",
        "common_name": "Castorseed (Arandi)",
        "min_days": 130, "max_days": 170, "category": "long",
        "foliage_damage_temp_c": 0.0,
        "frost_rating": "sensitive",
        "demand_level": "moderate",
        "drought_tolerance": "high",
        "alt_min": 100, "alt_max": 1400,
        "planting_depth_cm": 5.0, "plant_spacing_cm": 45, "row_spacing_cm": 90,
        "germination_days": "10-14 days",
        "pests": ["semilooper", "capsule_borer"],
        "harvest_indicators": ["Capsules turn brownish-yellow and dry", "One or two spikes per cluster begin to crack open"],
        "curing": "Sun-dry spikes on clean threshing floor for 5-7 days; beat with sticks to extract seed."
    },
    "Cotton": {
        "slug": "cotton",
        "scientific_name": "Gossypium hirsutum",
        "common_name": "Cotton (Kapas)",
        "min_days": 150, "max_days": 190, "category": "long",
        "foliage_damage_temp_c": 2.0,
        "frost_rating": "sensitive",
        "demand_level": "high",
        "drought_tolerance": "moderate",
        "alt_min": 50, "alt_max": 1000,
        "planting_depth_cm": 4.0, "plant_spacing_cm": 30, "row_spacing_cm": 75,
        "germination_days": "7-10 days",
        "pests": ["bollworm", "whitefly", "aphids"],
        "harvest_indicators": ["Bolls burst open fully exposing white lint", "Foliage senesces under autumn warmth"],
        "curing": "Pick clean bolls on dry sunny mornings; air dry in thin layers away from dew."
    },
    "Gram": {
        "slug": "gram",
        "scientific_name": "Cicer arietinum",
        "common_name": "Gram (Chickpea / Chana)",
        "min_days": 90, "max_days": 115, "category": "moderate",
        "foliage_damage_temp_c": -1.5,
        "frost_rating": "moderately_hardy",
        "demand_level": "low",
        "drought_tolerance": "high",
        "alt_min": 800, "alt_max": 2400,
        "planting_depth_cm": 5.0, "plant_spacing_cm": 10, "row_spacing_cm": 30,
        "germination_days": "5-8 days",
        "pests": ["pod_borer_helicoverpa", "fusarium_wilt", "dry_root_rot"],
        "harvest_indicators": ["Leaves turn reddish-yellow and drop", "Pods turn straw-colored and seeds rattle inside when shaken"],
        "curing": "Pull or cut mature vines; dry in field heaps for 3-4 days before threshing."
    },
    "Groundnut": {
        "slug": "groundnut",
        "scientific_name": "Arachis hypogaea",
        "common_name": "Groundnut (Peanut / Moongphali)",
        "min_days": 105, "max_days": 130, "category": "moderate",
        "foliage_damage_temp_c": 0.5,
        "frost_rating": "sensitive",
        "demand_level": "moderate",
        "drought_tolerance": "moderate",
        "alt_min": 100, "alt_max": 1300,
        "planting_depth_cm": 4.0, "plant_spacing_cm": 15, "row_spacing_cm": 30,
        "germination_days": "7-10 days",
        "pests": ["tikka_leaf_spot", "collar_rot", "white_grub"],
        "harvest_indicators": ["Foliage yellows and lower leaves shed", "Inner pod shell turns dark brownish-black when cracked"],
        "curing": "Invert plants in field rows with pods facing up to sun-dry for 6-8 days until pods rattle."
    },
    "Jowar": {
        "slug": "jowar",
        "scientific_name": "Sorghum bicolor",
        "common_name": "Jowar (Sorghum)",
        "min_days": 95, "max_days": 120, "category": "moderate",
        "foliage_damage_temp_c": 1.0,
        "frost_rating": "sensitive",
        "demand_level": "low",
        "drought_tolerance": "very_high",
        "alt_min": 200, "alt_max": 1600,
        "planting_depth_cm": 3.0, "plant_spacing_cm": 15, "row_spacing_cm": 45,
        "germination_days": "4-7 days",
        "pests": ["shoot_fly", "stem_borer", "grain_mold"],
        "harvest_indicators": ["Grains become hard with a visible black layer at the seed attachment point", "Leaves turn dry and straw colored"],
        "curing": "Cut earheads and dry on terrace mats for 5-7 days prior to threshing."
    },
    "Jute": {
        "slug": "jute",
        "scientific_name": "Corchorus olitorius",
        "common_name": "Jute (Pat)",
        "min_days": 120, "max_days": 150, "category": "long",
        "foliage_damage_temp_c": 5.0,
        "frost_rating": "sensitive",
        "demand_level": "high",
        "drought_tolerance": "low",
        "alt_min": 20, "alt_max": 800,
        "planting_depth_cm": 2.0, "plant_spacing_cm": 7, "row_spacing_cm": 25,
        "germination_days": "3-5 days",
        "pests": ["stem_rot", "jute_semilooper", "yellow_mite"],
        "harvest_indicators": ["Small pods begin to form at 50% flowering stage", "Lower stem leaves turn yellow"],
        "curing": "Submerge tied bundles in slow-moving water for retting (14-21 days) to extract bast fiber."
    },
    "Lentil": {
        "slug": "lentil",
        "scientific_name": "Lens culinaris",
        "common_name": "Lentil (Masoor)",
        "min_days": 85, "max_days": 110, "category": "short",
        "foliage_damage_temp_c": -3.0,
        "frost_rating": "hardy",
        "demand_level": "low",
        "drought_tolerance": "high",
        "alt_min": 1000, "alt_max": 3200,
        "planting_depth_cm": 3.0, "plant_spacing_cm": 5, "row_spacing_cm": 20,
        "germination_days": "5-8 days",
        "pests": ["fusarium_wilt", "rust", "aphids"],
        "harvest_indicators": ["Pods turn golden brown and rattle", "Vines turn brittle and yellowish brown"],
        "curing": "Cut in early morning dew to prevent pod shatter; sun dry in heaps for 4-5 days."
    },
    "Linseed": {
        "slug": "linseed",
        "scientific_name": "Linum usitatissimum",
        "common_name": "Linseed / Flax (Alsi)",
        "min_days": 95, "max_days": 120, "category": "moderate",
        "foliage_damage_temp_c": -2.0,
        "frost_rating": "moderately_hardy",
        "demand_level": "moderate",
        "drought_tolerance": "moderate",
        "alt_min": 800, "alt_max": 2500,
        "planting_depth_cm": 2.5, "plant_spacing_cm": 8, "row_spacing_cm": 25,
        "germination_days": "6-9 days",
        "pests": ["powdery_mildew", "rust", "linseed_gall_midge"],
        "harvest_indicators": ["Capsules turn dry golden brown", "Seeds rattle inside boll when shaken and stems turn golden"],
        "curing": "Harvest by pulling or sickle cutting; tie in sheaves and dry in sunny terrace corners for 4 days."
    },
    "Maize": {
        "slug": "maize",
        "scientific_name": "Zea mays",
        "common_name": "Maize / Corn (Makka)",
        "min_days": 85, "max_days": 115, "category": "moderate",
        "foliage_damage_temp_c": 0.0,
        "frost_rating": "sensitive",
        "demand_level": "high",
        "drought_tolerance": "moderate",
        "alt_min": 400, "alt_max": 2600,
        "planting_depth_cm": 5.0, "plant_spacing_cm": 20, "row_spacing_cm": 60,
        "germination_days": "5-8 days",
        "pests": ["fall_armyworm", "stem_borer", "leaf_blight"],
        "harvest_indicators": ["Husks turn dry papery white and silks turn dark brown", "Black layer forms at base of kernel"],
        "curing": "Hang cobs under mountain house eaves or sun-dry on slate roofs until moisture is under 13%."
    },
    "Mesta": {
        "slug": "mesta",
        "scientific_name": "Hibiscus sabdariffa",
        "common_name": "Mesta (Roselle)",
        "min_days": 120, "max_days": 160, "category": "long",
        "foliage_damage_temp_c": 3.0,
        "frost_rating": "sensitive",
        "demand_level": "moderate",
        "drought_tolerance": "high",
        "alt_min": 100, "alt_max": 1200,
        "planting_depth_cm": 3.0, "plant_spacing_cm": 10, "row_spacing_cm": 30,
        "germination_days": "5-7 days",
        "pests": ["foot_and_stem_rot", "mealybug"],
        "harvest_indicators": ["Plants reach 50% flowering and lower calyces turn bright red or fleshy", "Lower leaves shed"],
        "curing": "Cut stems at base and bundle for water retting or harvest succulent calyces for drying."
    },
    "Moong": {
        "slug": "moong",
        "scientific_name": "Vigna radiata",
        "common_name": "Moong (Green Gram)",
        "min_days": 60, "max_days": 75, "category": "short",
        "foliage_damage_temp_c": 2.0,
        "frost_rating": "sensitive",
        "demand_level": "moderate",
        "drought_tolerance": "moderate",
        "alt_min": 200, "alt_max": 1800,
        "planting_depth_cm": 3.5, "plant_spacing_cm": 10, "row_spacing_cm": 30,
        "germination_days": "4-6 days",
        "pests": ["yellow_mosaic_virus", "whitefly", "powdery_mildew"],
        "harvest_indicators": ["80% of pods turn dark brown or black", "Leaves yellow and drop naturally"],
        "curing": "Pick mature pods or pull entire vines on a sunny day; sun-dry for 3-5 days before beating out seeds."
    },
    "Nigerseed": {
        "slug": "nigerseed",
        "scientific_name": "Guizotia abyssinica",
        "common_name": "Nigerseed (Ramtil)",
        "min_days": 75, "max_days": 100, "category": "short",
        "foliage_damage_temp_c": 0.0,
        "frost_rating": "moderately_hardy",
        "demand_level": "low",
        "drought_tolerance": "high",
        "alt_min": 600, "alt_max": 2200,
        "planting_depth_cm": 2.0, "plant_spacing_cm": 10, "row_spacing_cm": 30,
        "germination_days": "5-8 days",
        "pests": ["caterpillar", "leaf_spot"],
        "harvest_indicators": ["Flower petals wither and disc heads turn dark brown", "Seeds turn shiny jet black"],
        "curing": "Cut whole plants in the morning, bundle, and sun-dry upside down over clean canvas for 5 days."
    },
    "Ragi": {
        "slug": "ragi",
        "scientific_name": "Eleusine coracana",
        "common_name": "Ragi (Finger Millet / Mandua)",
        "min_days": 90, "max_days": 115, "category": "moderate",
        "foliage_damage_temp_c": -1.0,
        "frost_rating": "moderately_hardy",
        "demand_level": "low",
        "drought_tolerance": "very_high",
        "alt_min": 600, "alt_max": 2500,
        "planting_depth_cm": 2.0, "plant_spacing_cm": 10, "row_spacing_cm": 25,
        "germination_days": "5-7 days",
        "pests": ["blast_disease", "shoot_fly"],
        "harvest_indicators": ["Finger ears turn dark golden brown", "Grain becomes hard and resists crushing between fingers"],
        "curing": "Cut earheads with sickles, dry on sunny slate terraces for 6-8 days, then thresh by foot or wooden flail."
    },
    "Rapeseed & Mustard": {
        "slug": "rapeseed_mustard",
        "scientific_name": "Brassica juncea / napus",
        "common_name": "Rapeseed & Mustard (Sarson / Rai)",
        "min_days": 75, "max_days": 105, "category": "short",
        "foliage_damage_temp_c": -3.0,
        "frost_rating": "hardy",
        "demand_level": "moderate",
        "drought_tolerance": "moderate",
        "alt_min": 500, "alt_max": 3000,
        "planting_depth_cm": 2.5, "plant_spacing_cm": 10, "row_spacing_cm": 30,
        "germination_days": "4-7 days",
        "pests": ["mustard_aphid", "white_rust", "alternaria_blight"],
        "harvest_indicators": ["Siliqua (pods) turn pale golden-yellow", "Seeds inside turn dark brown and firm"],
        "curing": "Harvest in early morning to prevent pod shatter; stack in bundles for 4 days before flailing."
    },
    "Rice": {
        "slug": "rice",
        "scientific_name": "Oryza sativa",
        "common_name": "Mountain Paddy Rice (Dhan)",
        "min_days": 110, "max_days": 145, "category": "moderate",
        "foliage_damage_temp_c": 3.0,
        "frost_rating": "sensitive",
        "demand_level": "high",
        "drought_tolerance": "low",
        "alt_min": 200, "alt_max": 2000,
        "planting_depth_cm": 3.0, "plant_spacing_cm": 15, "row_spacing_cm": 20,
        "germination_days": "6-9 days",
        "pests": ["blast", "brown_planthopper", "stem_borer"],
        "harvest_indicators": ["Upper 80% of panicle turns golden yellow", "Flag leaves turn yellowish straw color"],
        "curing": "Field dry harvested bundles for 2-3 days, then thresh against wooden boards or stones."
    },
    "Safflower": {
        "slug": "safflower",
        "scientific_name": "Carthamus tinctorius",
        "common_name": "Safflower (Kusum)",
        "min_days": 100, "max_days": 125, "category": "moderate",
        "foliage_damage_temp_c": -2.0,
        "frost_rating": "moderately_hardy",
        "demand_level": "low",
        "drought_tolerance": "very_high",
        "alt_min": 400, "alt_max": 2200,
        "planting_depth_cm": 4.0, "plant_spacing_cm": 15, "row_spacing_cm": 45,
        "germination_days": "6-10 days",
        "pests": ["aphids", "wilt", "leaf_spot"],
        "harvest_indicators": ["Bracts and leaves turn dry and brittle-spiny", "Seeds turn white and hard"],
        "curing": "Cut heads early in the morning when spines are slightly damp and pliable; sun-dry before threshing."
    },
    "Sesamum": {
        "slug": "sesamum",
        "scientific_name": "Sesamum indicum",
        "common_name": "Sesamum (Til)",
        "min_days": 75, "max_days": 95, "category": "short",
        "foliage_damage_temp_c": 2.0,
        "frost_rating": "sensitive",
        "demand_level": "low",
        "drought_tolerance": "high",
        "alt_min": 200, "alt_max": 1600,
        "planting_depth_cm": 2.0, "plant_spacing_cm": 12, "row_spacing_cm": 30,
        "germination_days": "4-7 days",
        "pests": ["phyllody", "antigastra_leaf_and_pod_caterpillar"],
        "harvest_indicators": ["Lower capsules turn yellow and begin cracking open at tips", "Leaves turn yellow and drop"],
        "curing": "Cut plants, tie in small bundles, and stand upright like tepees for 5-7 days; invert over sheets to shake out seeds."
    },
    "Small Millets": {
        "slug": "small_millets",
        "scientific_name": "Panicum sumatrense / Setaria italica",
        "common_name": "Small Millets (Kangni / Kutki / Cheena)",
        "min_days": 60, "max_days": 85, "category": "short",
        "foliage_damage_temp_c": -1.0,
        "frost_rating": "moderately_hardy",
        "demand_level": "low",
        "drought_tolerance": "very_high",
        "alt_min": 600, "alt_max": 2800,
        "planting_depth_cm": 2.0, "plant_spacing_cm": 8, "row_spacing_cm": 25,
        "germination_days": "4-6 days",
        "pests": ["smut", "grasshopper"],
        "harvest_indicators": ["Panicles turn golden yellow and dry", "Grains feel solid and resist pinching"],
        "curing": "Cut panicles with sickles, spread on drying cloth in midday sun for 4-5 days, then flail."
    },
    "Soybean": {
        "slug": "soybean",
        "scientific_name": "Glycine max",
        "common_name": "Soybean (Bhat)",
        "min_days": 90, "max_days": 115, "category": "moderate",
        "foliage_damage_temp_c": 0.5,
        "frost_rating": "sensitive",
        "demand_level": "moderate",
        "drought_tolerance": "moderate",
        "alt_min": 400, "alt_max": 2000,
        "planting_depth_cm": 3.5, "plant_spacing_cm": 10, "row_spacing_cm": 45,
        "germination_days": "5-8 days",
        "pests": ["girdle_beetle", "rust", "yellow_mosaic_virus"],
        "harvest_indicators": ["Leaves turn yellow and completely shed", "Pods turn greyish-brown and rattle when shaken"],
        "curing": "Cut vines close to ground; dry in small loose piles for 3-4 days until moisture drops below 13%."
    },
    "Sugarcane": {
        "slug": "sugarcane",
        "scientific_name": "Saccharum officinarum",
        "common_name": "Sugarcane (Ganna)",
        "min_days": 270, "max_days": 360, "category": "long",
        "foliage_damage_temp_c": 1.0,
        "frost_rating": "sensitive",
        "demand_level": "high",
        "drought_tolerance": "low",
        "alt_min": 50, "alt_max": 900,
        "planting_depth_cm": 8.0, "plant_spacing_cm": 30, "row_spacing_cm": 90,
        "germination_days": "14-25 days",
        "pests": ["red_rot", "shoot_borer", "woolly_aphid"],
        "harvest_indicators": ["Leaves turn yellow and dry; metallic sound when stalk is tapped", "High brix sugar content"],
        "curing": "Harvest by cutting at ground level with sharp cane knife; process immediately into jaggery or juice."
    },
    "Sunflower": {
        "slug": "sunflower",
        "scientific_name": "Helianthus annuus",
        "common_name": "Sunflower (Surajmukhi)",
        "min_days": 85, "max_days": 110, "category": "moderate",
        "foliage_damage_temp_c": -1.0,
        "frost_rating": "moderately_hardy",
        "demand_level": "moderate",
        "drought_tolerance": "high",
        "alt_min": 300, "alt_max": 2200,
        "planting_depth_cm": 4.0, "plant_spacing_cm": 20, "row_spacing_cm": 60,
        "germination_days": "6-9 days",
        "pests": ["head_borer_helicoverpa", "alternaria_blight", "downy_mildew"],
        "harvest_indicators": ["Back of the flower head turns lemon yellow to brown", "Bracts turn brown and dry"],
        "curing": "Cut heads with 10 cm stem; sun-dry heads face-up on terrace mats for 4-6 days before rubbing seeds out."
    },
    "Tur": {
        "slug": "tur",
        "scientific_name": "Cajanus cajan",
        "common_name": "Tur / Arhar (Pigeon Pea)",
        "min_days": 140, "max_days": 180, "category": "long",
        "foliage_damage_temp_c": 1.0,
        "frost_rating": "sensitive",
        "demand_level": "low",
        "drought_tolerance": "very_high",
        "alt_min": 200, "alt_max": 1600,
        "planting_depth_cm": 4.5, "plant_spacing_cm": 25, "row_spacing_cm": 75,
        "germination_days": "6-9 days",
        "pests": ["pod_borer", "fusarium_wilt", "sterility_mosaic"],
        "harvest_indicators": ["75-80% of pods turn dark brown and dry", "Leaves shed leaving exposed seed pods"],
        "curing": "Cut whole shrubs or pod clusters; dry on sunny terrace floor for 5-7 days before flailing."
    },
    "Urad": {
        "slug": "urad",
        "scientific_name": "Vigna mungo",
        "common_name": "Urad (Black Gram / Mash)",
        "min_days": 65, "max_days": 80, "category": "short",
        "foliage_damage_temp_c": 2.0,
        "frost_rating": "sensitive",
        "demand_level": "moderate",
        "drought_tolerance": "moderate",
        "alt_min": 300, "alt_max": 1800,
        "planting_depth_cm": 3.0, "plant_spacing_cm": 10, "row_spacing_cm": 30,
        "germination_days": "4-6 days",
        "pests": ["yellow_mosaic_virus", "whitefly", "powdery_mildew"],
        "harvest_indicators": ["Pods turn dull black and leaves dry down", "Seeds are firm and dark black"],
        "curing": "Pull or sickle-cut mature plants on a clear morning; sun dry in bundles for 4 days before threshing."
    },
    "Wheat": {
        "slug": "wheat",
        "scientific_name": "Triticum aestivum",
        "common_name": "Wheat (Gehun)",
        "min_days": 100, "max_days": 130, "category": "moderate",
        "foliage_damage_temp_c": -4.0,
        "frost_rating": "hardy",
        "demand_level": "moderate",
        "drought_tolerance": "moderate",
        "alt_min": 800, "alt_max": 3300,
        "planting_depth_cm": 4.5, "plant_spacing_cm": 8, "row_spacing_cm": 20,
        "germination_days": "5-8 days",
        "pests": ["yellow_rust", "powdery_mildew", "loose_smut", "termites"],
        "harvest_indicators": ["Spikes and stems turn golden yellow", "Grains snap cleanly in half without softness when bitten"],
        "curing": "Tie sheaves in stooks in the terrace for 3-5 days in dry sun before threshing; store grain below 12% moisture."
    }
}

AGGREGATES_LOOKUP = {
    "Cereals": "cereals",
    "Jute & Mesta": "jute_and_mesta",
    "Nutri/Coarse Cereals": "nutri_coarse_cereals",
    "Other Pulses": "other_pulses",
    "Shree Anna /Nutri Cereals": "shree_anna_nutri_cereals",
    "Total Food Grains": "total_food_grains",
    "Total Oil Seeds": "total_oil_seeds",
    "Total Pulses": "total_pulses"
}

def parse_csv_and_generate_json():
    crops_list = []
    
    with open(CSV_PATH, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            crop_name = row["Crop"].strip()
            record_type = row["Crop_Record_Type"].strip()
            season_source = row["Season(s)_in_Source"].strip()
            soil_texture = row["Soil_Texture_Preference"].strip()
            drainage_pref = row["Rainfall_Drainage_Preference"].strip()
            moisture_pref = row["Soil_Moisture_Preference"].strip()
            soil_appearance = row["Soil_Appearance_Organic_Matter_Preference"].strip()
            frost_context = row["Frost_Tolerance_Context"].strip()
            solar_pref = row["Solar_Exposure_Preference"].strip()
            climate_pref = row["Daily_Climate_Preference"].strip()
            slope_pref = row["Terrace_Slope_Stability_Preference"].strip()
            irrigation_pref = row["Irrigation_Water_Requirement"].strip()
            season_length = row["Growing_Season_Length"].strip()
            rule_status = row["Rule_Status"].strip()
            notes = row["Notes"].strip()

            is_aggregate = "Aggregate" in record_type or "Exclude" in rule_status

            if is_aggregate:
                slug = AGGREGATES_LOOKUP.get(crop_name, re.sub(r'[^a-z0-9]+', '_', crop_name.lower()).strip('_'))
                crop_entry = {
                    "id": slug,
                    "common_name": crop_name,
                    "scientific_name": "Not applicable (Statistical Grouping)",
                    "crop_record_type": record_type,
                    "is_aggregate_group": True,
                    "rule_status": rule_status,
                    "notes": notes,
                    "season_in_source": season_source,
                    "csv_raw": row,
                    "altitude_range_m": {"min": 0, "max": 0},
                    "suitable_climatic_conditions": {
                        "temperature_range_c": "Not applicable",
                        "climate_types": []
                    },
                    "frost_sensitivity": {
                        "rating": "excluded_aggregate",
                        "foliage_damage_temp_c": 0,
                        "risk_explanation": "Aggregate category excluded from plantable recommendation."
                    },
                    "sunlight_requirements": {
                        "type": "none",
                        "minimum_hours": 0,
                        "shade_tolerance": "None"
                    },
                    "soil_preferences": {
                        "preferred_textures": [],
                        "unsuitable_textures": ["rocky_or_shallow", "sticky_and_clay_like"],
                        "organic_matter_need": "none",
                        "notes": "Aggregate statistical label."
                    },
                    "drainage_requirements": {
                        "preferred": [],
                        "prohibited": [],
                        "tolerance": "None"
                    },
                    "water_needs": {
                        "demand_level": "none",
                        "critical_stages": [],
                        "drought_tolerance": "none"
                    },
                    "growing_season": {
                        "min_days": 0,
                        "max_days": 0,
                        "category": "not_applicable"
                    },
                    "planting_window": "Not applicable",
                    "cultivation_specs": {"method": "not_applicable"},
                    "growth_stages": [],
                    "care_instructions": {},
                    "harvest_indicators": [],
                    "storage_requirements": {},
                    "agricultural_sources": ["CSV Master Dataset"]
                }
                crops_list.append(crop_entry)
            else:
                meta = BOTANICAL_LOOKUP.get(crop_name)
                if not meta:
                    slug = re.sub(r'[^a-z0-9]+', '_', crop_name.lower()).strip('_')
                    meta = {
                        "slug": slug,
                        "scientific_name": f"{crop_name} spp.",
                        "common_name": crop_name,
                        "min_days": 80, "max_days": 110, "category": "moderate",
                        "foliage_damage_temp_c": 0.0,
                        "frost_rating": "moderately_hardy",
                        "demand_level": "moderate",
                        "drought_tolerance": "moderate",
                        "alt_min": 500, "alt_max": 2500,
                        "planting_depth_cm": 3.0, "plant_spacing_cm": 15, "row_spacing_cm": 30,
                        "germination_days": "5-10 days",
                        "pests": ["aphids", "stem_borer"],
                        "harvest_indicators": ["Pods or heads dry down"],
                        "curing": "Sun-dry in field for 4-5 days."
                    }

                slug = meta["slug"]

                # Parse preferred textures
                preferred_textures = []
                st_lower = soil_texture.lower()
                if "sandy" in st_lower or "sand" in st_lower:
                    preferred_textures.append("sandy_and_gritty")
                if "loam" in st_lower or "crumbly" in st_lower:
                    preferred_textures.append("crumbly_and_balanced")
                if "powdery" in st_lower or "silt" in st_lower or "alluvial" in st_lower:
                    preferred_textures.append("soft_and_powdery")
                if not preferred_textures:
                    preferred_textures = ["crumbly_and_balanced"]

                # Unsuitable textures
                unsuitable = []
                if "well-drained" in st_lower or "avoid waterlogging" in drainage_pref.lower():
                    unsuitable.append("sticky_and_clay_like")
                if "deep" in st_lower or "taproot" in notes.lower() or meta["category"] == "long":
                    unsuitable.append("rocky_or_shallow")

                # Drainage
                pref_drainage = []
                dp_lower = drainage_pref.lower()
                if "quick" in dp_lower:
                    pref_drainage.append("water_disappears_quickly")
                if "gradual" in dp_lower:
                    pref_drainage.append("water_drains_gradually")
                if not pref_drainage:
                    pref_drainage = ["water_disappears_quickly", "water_drains_gradually"]

                prohibited_drainage = ["pools_on_surface", "water_remains_long"]

                # Climate types
                clim_types = []
                cp_lower = climate_pref.lower()
                if "cool" in cp_lower:
                    clim_types.extend(["cold_days_cold_nights", "mild_days_cold_nights"])
                if "warm" in cp_lower or "mild" in cp_lower:
                    clim_types.extend(["mild_days_warm_nights", "warm_days_mild_nights"])
                if not clim_types:
                    clim_types = ["mild_days_cold_nights"]

                crop_entry = {
                    "id": slug,
                    "common_name": meta["common_name"],
                    "scientific_name": meta["scientific_name"],
                    "crop_record_type": record_type,
                    "is_aggregate_group": False,
                    "rule_status": rule_status,
                    "notes": notes,
                    "season_in_source": season_source,
                    "csv_raw": row,
                    "altitude_range_m": {"min": meta["alt_min"], "max": meta["alt_max"]},
                    "suitable_climatic_conditions": {
                        "temperature_range_c": climate_pref,
                        "climate_types": clim_types
                    },
                    "frost_sensitivity": {
                        "rating": meta["frost_rating"],
                        "foliage_damage_temp_c": meta["foliage_damage_temp_c"],
                        "tuber_protection": "Root zone insulation via dry mulch/stones" if meta["frost_rating"] in ["hardy", "moderately_hardy"] else "No root frost resistance",
                        "risk_explanation": f"{frost_context}. Damage occurs near {meta['foliage_damage_temp_c']}°C."
                    },
                    "sunlight_requirements": {
                        "type": "direct_full",
                        "minimum_hours": 6,
                        "shade_tolerance": "Moderate" if meta["frost_rating"] == "hardy" else "Low"
                    },
                    "soil_preferences": {
                        "preferred_textures": preferred_textures,
                        "unsuitable_textures": unsuitable,
                        "organic_matter_need": "high" if "organic" in soil_appearance.lower() else "moderate",
                        "notes": f"{soil_texture}. Organic preference: {soil_appearance}"
                    },
                    "drainage_requirements": {
                        "preferred": pref_drainage,
                        "prohibited": prohibited_drainage,
                        "tolerance": drainage_pref
                    },
                    "water_needs": {
                        "demand_level": meta["demand_level"],
                        "critical_stages": ["germination", "flowering", "pod_seed_fill"],
                        "drought_tolerance": meta["drought_tolerance"],
                        "irrigation_notes": irrigation_pref
                    },
                    "growing_season": {
                        "min_days": meta["min_days"],
                        "max_days": meta["max_days"],
                        "category": meta["category"],
                        "csv_description": season_length
                    },
                    "regional_suitability": [
                        "Himachal Pradesh terraces", "Uttarakhand mountain slopes", 
                        "Kashmir temperate valleys", "Ladakh irrigated belts",
                        "Central & Peninsular plateau terraces"
                    ],
                    "planting_window": f"{season_source} season planting ({'Spring/Summer' if 'Kharif' in season_source else 'Autumn/Winter/Early Spring'}).",
                    "cultivation_specs": {
                        "method": "direct_sowing",
                        "seed_prep": "Select graded, plump, viable seeds; treat with bio-fungicide (Trichoderma viride 4g/kg) and dry in shade.",
                        "planting_depth_cm": meta["planting_depth_cm"],
                        "plant_spacing_cm": meta["plant_spacing_cm"],
                        "row_spacing_cm": meta["row_spacing_cm"],
                        "germination_days": meta["germination_days"]
                    },
                    "growth_stages": [
                        {"stage": 1, "name": "Germination & Emergence", "days": f"1-{round(meta['min_days']*0.2)}", "description": "Seed radicle pushes into soil; cotyledons emerge and establish first true leaves."},
                        {"stage": 2, "name": "Vegetative Branching & Tillering", "days": f"{round(meta['min_days']*0.2)+1}-{round(meta['min_days']*0.45)}", "description": "Active root network expansion and vigorous foliage canopy establishment."},
                        {"stage": 3, "name": "Flowering & Spiking", "days": f"{round(meta['min_days']*0.45)+1}-{round(meta['min_days']*0.7)}", "description": "Floral buds open; pollination and initial pod/grain set under midday sun."},
                        {"stage": 4, "name": "Grain / Seed Filling", "days": f"{round(meta['min_days']*0.7)+1}-{round(meta['min_days']*0.9)}", "description": "Starch and nutrient translocation into grains/seeds; critical moisture period."},
                        {"stage": 5, "name": "Physiological Maturity", "days": f"{round(meta['min_days']*0.9)+1}-{meta['max_days']}", "description": "Canopy naturally senesces to golden-straw; seeds harden to harvesting readiness."}
                    ],
                    "care_instructions": {
                        "mounding_hilling": f"Weed and loosen soil between rows twice during vegetative growth; create a shallow ridge to secure root base on {slope_pref.lower()}.",
                        "irrigation_strategy": f"{irrigation_pref}. Let cold mountain stream water warm in sun drums before irrigating.",
                        "organic_nutrition": "Incorporate 15-20 tonnes/ha well-rotted compost or FYM plus 150 kg/ha wood ash to provide phosphorus, potassium, and soil microbial vitality."
                    },
                    "pests_diseases": meta["pests"],
                    "harvest_indicators": meta["harvest_indicators"],
                    "harvesting_instructions": [
                        "Harvest on a clear, dry sunny morning after morning mountain dew has completely evaporated.",
                        "Cut stems with a sharp hand sickle or pull carefully without shaking off ripe seeds.",
                        "Transport in clean shallow baskets to avoid bruising or shattering grain heads."
                    ],
                    "storage_requirements": {
                        "curing": meta["curing"],
                        "long_term_temp_c": "10-15°C in clean, dry, rodent-proof mountain storehouse",
                        "humidity_percent": "50-60%",
                        "light_condition": "Dark, well-ventilated storeroom",
                        "shelf_life_months": "9-12 months in sealed earthen jars (kothar) with dried neem leaves"
                    },
                    "agricultural_sources": [
                        "ICAR Agricultural Crop Guidelines & Package of Practices",
                        "State Agricultural Universities (SAU) Mountain Farming Bulletins",
                        "Master Agro-Ecological CSV Dataset"
                    ],
                    "data_confidence": "low",
                    "limitations": f"Requires validation under extreme sub-zero cold spells. {notes}"
                }
                crops_list.append(crop_entry)

    output_data = {
        "database_version": "2.0_csv_master",
        "description": "Master Crop Database generated directly from CSV dataset covering Kharif, Rabi, and Summer agronomic profiles.",
        "total_crops": len(crops_list),
        "crops": crops_list
    }

    with open(JSON_OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated {len(crops_list)} crops in {JSON_OUT_PATH}!")

if __name__ == "__main__":
    parse_csv_and_generate_json()
