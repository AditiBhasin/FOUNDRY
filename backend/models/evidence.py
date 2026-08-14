from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class EvidenceType(str, Enum):
    DATA = "DATA"                      # Verified external empirical data
    AI_INFERENCE = "AI_INFERENCE"      # Synthesized by LLM reasoning
    ASSUMPTION = "ASSUMPTION"          # Hypothesis requiring market validation
    RECOMMENDATION = "RECOMMENDATION"  # Strategic advice / guidance


class EvidenceItem(BaseModel):
    id: str
    agent: str
    category: EvidenceType
    claim: str
    source: Optional[str] = None
    verification_status: str = "unverified"
    notes: Optional[str] = None


class LiveResearchStatus(BaseModel):
    available: bool = False
    provider: Optional[str] = None
    message: str = "Live web research unavailable. External search provider not configured."
    total_sources: int = 0
