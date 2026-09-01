"""FACTSETU — AIProvider abstraction."""

from abc import ABC, abstractmethod
from typing import Any


class AIProvider(ABC):
    """Unified interface for all AI operations. Production = GeminiProvider."""

    @abstractmethod
    def extract_claims(self, text: str, language: str | None = None) -> list[dict[str, Any]]:
        """Return list of {claim_text, normalized_claim, claim_type, language}."""

    @abstractmethod
    def normalize_claim(self, claim_text: str) -> str:
        pass

    @abstractmethod
    def classify_claim(self, claim_text: str) -> str:
        """Return one of ClaimCategory values."""

    @abstractmethod
    def generate_search_queries(self, claim_text: str) -> list[str]:
        pass

    @abstractmethod
    def compare_claim_evidence(
        self, claim_text: str, evidence_chunks: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Return {verdict: supports|contradicts|insufficient, explanation, support_type}."""

    @abstractmethod
    def explain_verdict(
        self, claim_text: str, verdict: str, confidence: str, evidence: list[dict[str, Any]]
    ) -> str:
        pass

    @abstractmethod
    def embed_text(self, text: str) -> list[float]:
        """Return embedding vector."""

    def is_available(self) -> bool:
        return True
