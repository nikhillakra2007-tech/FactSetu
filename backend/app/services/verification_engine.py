"""FACTSETU — VerificationEngine + Confidence + Explanation."""

import logging
from typing import Any

from app.models.enums import VerificationResult

logger = logging.getLogger(__name__)


class VerificationEngine:
    def __init__(self, ai_provider=None):
        self.ai_provider = ai_provider

    def verify(self, claim_text: str, evidence: list[dict[str, Any]]) -> dict[str, Any]:
        """Returns {verdict: verified|contradicted|uncertain, confidence: HIGH|MEDIUM|LOW, explanation, raw}."""
        if not evidence:
            return {
                "verdict": VerificationResult.uncertain.value,
                "confidence": "LOW",
                "explanation": "No evidence retrieved for this claim.",
                "raw_verdict": "insufficient",
                "support_type": "insufficient",
            }

        # Use AIProvider to compare
        if self.ai_provider:
            try:
                cmp = self.ai_provider.compare_claim_evidence(claim_text, evidence)
                raw = cmp.get("verdict", "insufficient")
            except Exception as e:
                logger.warning("AI compare failed: %s", e)
                cmp = {"verdict": "insufficient", "explanation": str(e), "support_type": "insufficient"}
                raw = "insufficient"
        else:
            cmp = {"verdict": "insufficient", "explanation": "No AI provider.", "support_type": "insufficient"}
            raw = "insufficient"

        # If retrieval is weak, force insufficient regardless of AI
        max_hybrid = max((e.get("hybrid", 0) for e in evidence), default=0)
        if max_hybrid < 0.32:
            raw = "insufficient"
            cmp = {"verdict": "insufficient", "explanation": "Retrieved evidence has low relevance (max hybrid %.2f). Insufficient to verify." % max_hybrid, "support_type": "insufficient"}

        # Map supports/contradicts/insufficient → verified/contradicted/uncertain
        verdict_map = {
            "supports": VerificationResult.verified.value,
            "contradicts": VerificationResult.contradicted.value,
            "insufficient": VerificationResult.uncertain.value,
            "verified": VerificationResult.verified.value,
            "contradicted": VerificationResult.contradicted.value,
            "uncertain": VerificationResult.uncertain.value,
        }
        verdict = verdict_map.get(raw, VerificationResult.uncertain.value)

        # Confidence from measurable signals
        confidence = self._confidence(evidence, verdict, raw)

        # Explanation grounded in evidence
        explanation = cmp.get("explanation", "")
        if self.ai_provider and verdict != VerificationResult.uncertain.value:
            try:
                explanation = self.ai_provider.explain_verdict(claim_text, verdict, confidence, evidence)
            except Exception:
                pass

        return {
            "verdict": verdict,
            "confidence": confidence,
            "explanation": explanation,
            "raw_verdict": raw,
            "support_type": cmp.get("support_type", raw),
            "reason": explanation,
        }

    def _confidence(self, evidence: list[dict[str, Any]], verdict: str, raw: str) -> str:
        if not evidence:
            return "LOW"
        # signals: authority avg, hybrid relevance avg, freshness avg, agreement (how many chunks support verdict)
        auth_avg = sum(e.get("authority", 0.5) for e in evidence) / len(evidence)
        rel_avg = sum(e.get("hybrid", 0) for e in evidence) / len(evidence)
        fresh_avg = sum(e.get("freshness", 0.5) for e in evidence) / len(evidence)
        # agreement: if verdict is not uncertain, higher relevance suggests agreement; else limited
        # score 0-1
        score = 0.3 * auth_avg + 0.4 * rel_avg + 0.15 * fresh_avg + 0.15 * (1 if verdict != "uncertain" else 0.3)
        # evidence count boost
        if len(evidence) >= 3 and score > 0.5:
            score = min(1.0, score + 0.1)
        if score >= 0.7:
            return "HIGH"
        if score >= 0.45:
            return "MEDIUM"
        return "LOW"
