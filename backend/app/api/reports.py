"""FACTSETU — Reports API (stub for future)."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api", tags=["reports"])


class ReportRequest(BaseModel):
    verification_request_id: str
    reason: Optional[str] = None
    category: Optional[str] = None


@router.post("/reports")
def create_report(req: ReportRequest):
    # Stub: persist later; for now echo
    return {"status": "received", "verification_request_id": req.verification_request_id, "category": req.category}
