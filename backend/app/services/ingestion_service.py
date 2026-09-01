"""FACTSETU — IngestionService: Fetcher → Parser → Deduplicator → Document → Chunker → Embed."""

import logging
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.evidence_chunk import EvidenceChunk
from app.models.source import Source
from app.services.chunker import ChunkingService
from app.services.embedding_service import EmbeddingService
from app.services.fetcher import FetchService
from app.services.parser import parse_content

logger = logging.getLogger(__name__)


class IngestionService:
    def __init__(self, ai_provider=None):
        self.fetcher = FetchService()
        self.chunker = ChunkingService()
        self.embedding = EmbeddingService(ai_provider=ai_provider)
        self.ai_provider = ai_provider

    def ingest_url(self, url: str, source_id=None, db: Session = None) -> dict:
        """Ingest single URL. Returns {status, document_id, chunks, error}."""
        if db is None:
            from app.core.database import SessionLocal

            db = SessionLocal()
        # Resolve source_id if not provided: infer from domain
        if source_id is None:
            from urllib.parse import urlparse

            domain = urlparse(url).netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
            src = db.query(Source).filter(Source.domain == domain).first()
            if src:
                source_id = src.id
            else:
                # try ends with
                srcs = db.query(Source).filter(Source.is_trusted == True).all()
                for s in srcs:
                    if domain == s.domain or domain.endswith("." + s.domain):
                        source_id = s.id
                        break
                if not source_id:
                    return {"status": "failed", "error": "no trusted source for domain", "url": url}

        # Fetch
        res = self.fetcher.fetch(url, db)
        if res.get("error"):
            return {"status": "failed", "error": res["error"], "url": url}

        raw = res["content"]
        ct = res.get("content_type", "")

        # Parse
        parsed = parse_content(raw, ct, url)
        title = parsed.get("title")
        content = parsed.get("content", "")
        doc_type = parsed.get("document_type", "html")
        if not content or len(content.strip()) < 50:
            return {"status": "failed", "error": "empty content after parse", "url": url}

        # Deduplicate via content_hash
        content_hash = Document.compute_hash(content)
        existing = db.query(Document).filter(Document.content_hash == content_hash).first()
        if existing:
            return {"status": "skipped", "reason": "duplicate", "document_id": str(existing.id), "url": url}

        existing_url = db.query(Document).filter(Document.url == url).first()
        if existing_url:
            return {"status": "skipped", "reason": "url exists", "document_id": str(existing_url.id), "url": url}

        # Create document
        doc = Document(
            source_id=source_id,
            title=title,
            url=url,
            content=content,
            document_type=doc_type,
            language="en",
            content_hash=content_hash,
        )
        db.add(doc)
        db.flush()  # get id

        # Chunk
        chunks_data = self.chunker.chunk(content)
        chunks = []
        for c in chunks_data:
            ch = EvidenceChunk(
                document_id=doc.id,
                chunk_text=c["chunk_text"],
                chunk_index=c["chunk_index"],
                section=c.get("section"),
            )
            db.add(ch)
            chunks.append(ch)
        db.commit()

        # Embed
        for ch in chunks:
            try:
                self.embedding.embed_chunk(ch, db)
            except Exception as e:
                logger.warning("embed chunk %s failed: %s", ch.id, e)

        return {"status": "created", "document_id": str(doc.id), "chunks": len(chunks), "url": url, "title": title}

    def ingest_source(self, source_id, limit: int = 3, db: Session = None) -> list[dict]:
        """Ingest base_url + common pages for a source (simple). For demo, fetch base_url only."""
        if db is None:
            from app.core.database import SessionLocal

            db = SessionLocal()
        src = db.query(Source).filter(Source.id == source_id).first()
        if not src or not src.base_url:
            return [{"status": "failed", "error": "source not found or no base_url"}]
        # For now, ingest base_url; future could crawl sitemap
        return [self.ingest_url(src.base_url, source_id=src.id, db=db)]
