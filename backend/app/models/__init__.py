"""FACTSETU — Models package — import all models so Alembic sees them."""

from app.core.database import Base  # noqa: F401
from app.models.claim import Claim  # noqa: F401
from app.models.claim_entity import ClaimEntity  # noqa: F401
from app.models.enums import (  # noqa: F401
    AuthProvider,
    ClaimStatus,
    ClaimType,
    ContentType,
    EvidenceType,
    FeedbackType,
    InputType,
    SourceType,
    SubmissionStatus,
    UserRole,
    VerificationResult,
    VerificationRunStatus,
)
from app.models.claim_evidence import ClaimEvidence  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.evidence import Evidence  # noqa: F401
from app.models.evidence_chunk import EvidenceChunk  # noqa: F401
from app.models.extracted_content import ExtractedContent  # noqa: F401
from app.models.feedback import Feedback  # noqa: F401
from app.models.input_file import InputFile  # noqa: F401
from app.models.source import Source  # noqa: F401
from app.models.submission import Submission  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.verification import Verification  # noqa: F401
from app.models.verification_request import VerificationRequest  # noqa: F401
from app.models.verification_run import VerificationRun  # noqa: F401

__all__ = [
    "Base",
    "User",
    "Submission",
    "InputFile",
    "ExtractedContent",
    "Claim",
    "ClaimEntity",
    "Source",
    "Evidence",
    "EvidenceChunk",
    "Document",
    "Verification",
    "VerificationRequest",
    "VerificationRun",
    "Feedback",
    "ClaimEvidence",
]
