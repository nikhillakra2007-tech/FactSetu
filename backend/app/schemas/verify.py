from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum


class VerifyRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Input text to verify")
    input_type: str = Field(default="text", description="text|image|voice")
    language: Optional[str] = None
    user_id: Optional[str] = None


class EvidenceOut(BaseModel):
    chunk_id: str
    chunk_text: str
    url: str
    source_name: str
    relevance_score: float
    authority: Optional[float] = None
    freshness: Optional[float] = None


class ClaimVerifyOut(BaseModel):
    claim_id: str
    claim_text: str
    normalized_claim: Optional[str] = None
    claim_type: Optional[str] = None
    status: str
    verification: dict
    evidence: List[dict]


class VerifyResponse(BaseModel):
    verification_request_id: str
    status: str
    claims: List[ClaimVerifyOut]
    original_input: str


class IngestRequest(BaseModel):
    url: str
    source_id: Optional[str] = None


class IngestResponse(BaseModel):
    status: str
    document_id: Optional[str] = None
    chunks: Optional[int] = None
    url: str
    title: Optional[str] = None
    error: Optional[str] = None
    reason: Optional[str] = None
