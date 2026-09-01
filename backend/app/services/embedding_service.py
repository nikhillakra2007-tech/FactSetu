"""FACTSETU — EmbeddingService with Gemini + deterministic fallback."""

import hashlib
import logging
import math
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.evidence_chunk import EvidenceChunk

logger = logging.getLogger(__name__)


def local_embedding(text: str, dim: int = 384) -> list[float]:
    """Deterministic 384-dim hash embedding for offline fallback."""
    # Use word hash distribution
    vec = [0.0] * dim
    words = text.lower().split()
    if not words:
        return vec
    for w in words:
        h = int(hashlib.sha256(w.encode()).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0
        # second hash for sign
        vec[(h >> 8) % dim] += 0.5
    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]


class EmbeddingService:
    def __init__(self, ai_provider=None):
        self.settings = get_settings()
        self.ai_provider = ai_provider

    def embed(self, text: str) -> tuple[list[float], str]:
        """Return (vector, model_name). Tries Gemini, falls back to local."""
        if self.ai_provider and self.ai_provider.is_available():
            try:
                vec = self.ai_provider.embed_text(text[:8000])
                return vec, self.settings.gemini_embedding_model
            except Exception as e:
                logger.warning("Gemini embed failed, fallback: %s", e)
        return local_embedding(text), "local-384"

    def embed_chunk(self, chunk: EvidenceChunk, db: Session, force: bool = False) -> EvidenceChunk:
        if chunk.embedding is not None and not force:
            return chunk
        vec, model = self.embed(chunk.chunk_text)
        chunk.embedding = vec
        chunk.embedding_model = model
        db.add(chunk)
        db.commit()
        return chunk

    def embed_chunks_for_document(self, document_id, db: Session):
        chunks = db.query(EvidenceChunk).filter(EvidenceChunk.document_id == document_id).all()
        for ch in chunks:
            self.embed_chunk(ch, db)

    @staticmethod
    def cosine(a: list[float], b: list[float]) -> float:
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        na = math.sqrt(sum(x * x for x in a))
        nb = math.sqrt(sum(y * y for y in b))
        if na == 0 or nb == 0:
            return 0.0
        return dot / (na * nb)
