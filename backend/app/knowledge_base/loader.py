import os
import json
from typing import Dict, List, Any, Optional

class KnowledgeBase:
    _instance = None

    def __init__(self):
        self.crops: List[Dict[str, Any]] = []
        self.crops_by_id: Dict[str, Dict[str, Any]] = {}
        self.pests: List[Dict[str, Any]] = []
        self.pests_by_id: Dict[str, Dict[str, Any]] = {}
        self.cultivation_methods: List[Dict[str, Any]] = []
        self.sources: Dict[str, Any] = {}
        self.load_all()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = KnowledgeBase()
        return cls._instance

    def _resolve_data_dir(self) -> str:
        # Check environment variable first
        if "TERRAFORM_DATA_DIR" in os.environ:
            return os.environ["TERRAFORM_DATA_DIR"]
        
        # Traverse up from current file
        current = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            os.path.abspath(os.path.join(current, "..", "..", "..", "data")),
            os.path.abspath(os.path.join(current, "..", "..", "data")),
            os.path.abspath(os.path.join(os.getcwd(), "data")),
            os.path.abspath(os.path.join(os.getcwd(), "..", "data")),
        ]
        for candidate in candidates:
            if os.path.isdir(candidate) and os.path.exists(os.path.join(candidate, "crop_database.json")):
                return candidate
        
        # Default fallback
        return os.path.abspath(os.path.join(current, "..", "..", "..", "data"))

    def load_all(self):
        data_dir = self._resolve_data_dir()
        
        # Crop database
        crop_path = os.path.join(data_dir, "crop_database.json")
        if os.path.exists(crop_path):
            with open(crop_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.crops = data.get("crops", [])
                self.crops_by_id = {c["id"]: c for c in self.crops}

        # Pest database
        pest_path = os.path.join(data_dir, "pest_database.json")
        if os.path.exists(pest_path):
            with open(pest_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.pests = data.get("disorders_and_pests", [])
                self.pests_by_id = {p["id"]: p for p in self.pests}

        # Cultivation methods
        methods_path = os.path.join(data_dir, "cultivation_methods.json")
        if os.path.exists(methods_path):
            with open(methods_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.cultivation_methods = data.get("terrace_management_practices", [])

        # Sources
        source_path = os.path.join(data_dir, "source_registry.json")
        if os.path.exists(source_path):
            with open(source_path, "r", encoding="utf-8") as f:
                self.sources = json.load(f)

    def get_crop(self, crop_id: str) -> Optional[Dict[str, Any]]:
        return self.crops_by_id.get(crop_id)

    def get_all_crops(self) -> List[Dict[str, Any]]:
        return self.crops

    def get_pest(self, pest_id: str) -> Optional[Dict[str, Any]]:
        return self.pests_by_id.get(pest_id)

    def get_all_pests(self) -> List[Dict[str, Any]]:
        return self.pests

    def get_sources(self) -> Dict[str, Any]:
        return self.sources

    def get_methods(self) -> List[Dict[str, Any]]:
        return self.cultivation_methods

kb = KnowledgeBase.get_instance()
