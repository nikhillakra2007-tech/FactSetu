"""FACTSETU — Shared domain enums (stored as strings, validated at DB + app layer)."""

import enum


class InputType(str, enum.Enum):
    text = "text"
    image = "image"
    voice = "voice"


class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class ContentType(str, enum.Enum):
    ocr = "ocr"
    transcript = "transcript"
    normalized_text = "normalized_text"


class ClaimStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    verified = "verified"
    contradicted = "contradicted"
    uncertain = "uncertain"


class ClaimType(str, enum.Enum):
    factual = "factual"
    prediction = "prediction"
    opinion = "opinion"
    other = "other"


class SourceType(str, enum.Enum):
    government = "government"
    regulator = "regulator"
    international_organization = "international_organization"
    research = "research"
    news = "news"
    other = "other"


class EvidenceType(str, enum.Enum):
    supporting = "supporting"
    contradicting = "contradicting"
    contextual = "contextual"


class VerificationResult(str, enum.Enum):
    verified = "verified"
    contradicted = "contradicted"
    uncertain = "uncertain"


class VerificationRunStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class FeedbackType(str, enum.Enum):
    helpful = "helpful"
    not_helpful = "not_helpful"
    incorrect = "incorrect"
    missing_context = "missing_context"
    other = "other"


# Extended for intelligence layer
class DocumentType(str, enum.Enum):
    html = "html"
    pdf = "pdf"
    text = "text"


class VerificationRequestStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class VerificationVerdict(str, enum.Enum):
    verified = "verified"
    contradicted = "contradicted"
    uncertain = "uncertain"


class ConfidenceLevel(str, enum.Enum):
    high = "HIGH"
    medium = "MEDIUM"
    low = "LOW"


class ClaimCategory(str, enum.Enum):
    government = "government"
    politics = "politics"
    finance = "finance"
    health = "health"
    education = "education"
    employment = "employment"
    technology = "technology"
    public_safety = "public_safety"
    scheme_or_benefit = "scheme_or_benefit"
    legal = "legal"
    general_news = "general_news"
    other = "other"


# Auth
class UserRole(str, enum.Enum):
    USER = "USER"
    MODERATOR = "MODERATOR"
    ADMIN = "ADMIN"


class AuthProvider(str, enum.Enum):
    email = "email"
    google = "google"
    x = "x"
