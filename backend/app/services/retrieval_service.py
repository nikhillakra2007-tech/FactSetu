"""FACTSETU — RetrievalService (hybrid: semantic + keyword + authority + freshness)."""

import math
import re
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.document import Document
from app.models.evidence_chunk import EvidenceChunk
from app.models.source import Source
from app.services.embedding_service import EmbeddingService, local_embedding


def keyword_score(query: str, text: str) -> float:
    if not query or not text:
        return 0.0
    q_terms = set(re.findall(r"\w+", query.lower()))
    t_terms = set(re.findall(r"\w+", text.lower()))
    if not q_terms:
        return 0.0
    overlap = len(q_terms & t_terms) / len(q_terms)
    return overlap


def freshness_score(published_at, retrieved_at) -> float:
    # exponential decay: 30-day half-life
    now = datetime.now(timezone.utc)
    ref = published_at or retrieved_at
    if not ref:
        return 0.5
    # ensure timezone
    if ref.tzinfo is None:
        ref = ref.replace(tzinfo=timezone.utc)
    days = (now - ref).days
    if days < 0:
        days = 0
    return math.exp(-days / 30.0)


class RetrievalService:
    def __init__(self, ai_provider=None):
        self.settings = get_settings()
        self.embedding = EmbeddingService(ai_provider=ai_provider)
        self.ai_provider = ai_provider

    def retrieve(
        self, claim_text: str, db: Session, top_k: int | None = None, min_score: float = 0.0
    ) -> list[dict[str, Any]]:
        top_k = top_k or self.settings.retrieval_top_k
        # Embed claim
        try:
            if self.ai_provider and self.ai_provider.is_available():
                q_vec, _ = self.embedding.embed(claim_text)
            else:
                q_vec = local_embedding(claim_text)
        except Exception:
            q_vec = local_embedding(claim_text)

        # Load chunks with embeddings
        chunks = db.query(EvidenceChunk).all()
        if not chunks:
            return []

        # Preload document->source for authority
        # Batch load sources via documents
        doc_ids = {c.document_id for c in chunks}
        docs = db.query(Document).filter(Document.id.in_(doc_ids)).all() if doc_ids else []
        doc_map = {d.id: d for d in docs}
        source_ids = {d.source_id for d in docs}
        sources = db.query(Source).filter(Source.id.in_(source_ids)).all() if source_ids else []
        src_map = {s.id: s for s in sources}

        scored = []
        for ch in chunks:
            if not ch.embedding:
                continue
            sem = EmbeddingService.cosine(q_vec, ch.embedding)
            kw = keyword_score(claim_text, ch.chunk_text)
            doc = doc_map.get(ch.document_id)
            auth = 0.5
            if doc:
                src = src_map.get(doc.source_id)
                if src:
                    # trust_level 1-5 → 0.2-1.0; authority_level similarly
                    auth = (src.trust_level + src.authority_level) / 10.0
                    if src.is_trusted:
                        auth = min(1.0, auth + 0.1)
            fresh = freshness_score(doc.published_at if doc else None, doc.retrieved_at if doc else None)

            # Hybrid: 0.5 sem + 0.2 kw + 0.2 auth + 0.1 fresh
            hybrid = 0.5 * sem + 0.2 * kw + 0.2 * auth + 0.1 * fresh
            if hybrid < min_score:
                continue
            scored.append(
                {
                    "chunk": ch,
                    "document": doc,
                    "source": src_map.get(doc.source_id) if doc else None,
                    "semantic": sem,
                    "keyword": kw,
                    "authority": auth,
                    "freshness": fresh,
                    "hybrid": hybrid,
                    "chunk_text": ch.chunk_text,
                    "url": doc.url if doc else "",
                    "source_name": src_map.get(doc.source_id).name if doc and doc.source_id in src_map else "Unknown",
                }
            )
        scored.sort(key=lambda x: x["hybrid"], reverse=True)
        return scored[:top_k]

    def retrieve_for_claim(self, claim_text: str, db: Session, **kwargs):
        results = self.retrieve(claim_text, db, **kwargs)
        # If insufficient, could trigger fresh fetch (delegated to pipeline)
        return results
