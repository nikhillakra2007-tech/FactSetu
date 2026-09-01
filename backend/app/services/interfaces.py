"""FACTSETU — Service interfaces (placeholders for future AI pipeline).

These are intentionally not implemented — they define the contract that
future services will plug into without forcing fake AI logic now.
"""

from abc import ABC, abstractmethod
from typing import Any


class ClaimExtractionService(ABC):
    """Extract individual claims from a submission's text."""

    @abstractmethod
    def extract_claims(self, text: str, language: str | None = None) -> list[dict[str, Any]]:
        """Return list of {claim_text, claim_type, entities}."""


class EvidenceRetrievalService(ABC):
    """Retrieve evidence for a claim from trusted sources."""

    @abstractmethod
    def retrieve(self, claim_text: str, sources: list[str] | None = None) -> list[dict[str, Any]]:
        """Return list of {source_id, url, snippet, relevance_score}."""


class VerificationService(ABC):
    """Compare claim against evidence and produce a verification result."""

    @abstractmethod
    def verify(self, claim_text: str, evidence: list[dict[str, Any]]) -> dict[str, Any]:
        """Return {result, confidence, reason}."""


class OCRService(ABC):
    """Image → text extraction."""

    @abstractmethod
    def extract_text(self, file_path: str) -> dict[str, Any]:
        """Return {content, confidence, language}."""


class SpeechToTextService(ABC):
    """Audio → transcript extraction."""

    @abstractmethod
    def transcribe(self, file_path: str) -> dict[str, Any]:
        """Return {content, confidence, language}."""


class TranslationService(ABC):
    """Language normalization / translation."""

    @abstractmethod
    def translate(self, text: str, target_language: str = "en") -> dict[str, Any]:
        """Return {translated_text, source_language, confidence}."""
