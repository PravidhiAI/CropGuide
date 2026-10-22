from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class MetadataSchema(BaseModel):
    engine_version: str = "1.0"
    knowledge_base_version: str = "1.0"
    generated_at: str
    sources: List[str] = Field(default_factory=list)

class ResponseEnvelope(BaseModel):
    success: bool = True
    data: Any
    metadata: MetadataSchema
    warnings: List[str] = Field(default_factory=list)
