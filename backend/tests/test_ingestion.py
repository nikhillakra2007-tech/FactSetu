import sys
sys.path.insert(0, "C:/Users/nikhi/OneDrive/Desktop/coding/hacks/backend")
from app.services.chunker import ChunkingService
from app.services.embedding_service import local_embedding, EmbeddingService
from app.services.parser import parse_html, parse_content

def test_html_parser():
    html="<html><title>Test</title><body><article><p>Hello world from PIB</p></article></body></html>"
    res=parse_html(html)
    assert "Hello world" in res["content"]
    assert res["document_type"]=="html"

def test_chunker():
    svc=ChunkingService()
    text="Sentence one. Sentence two. Sentence three. " + "Long sentence "*50
    chunks=svc.chunk(text)
    assert len(chunks)>=1
    assert all("chunk_text" in c for c in chunks)
    # overlap check: next chunk should share some content
    if len(chunks)>1:
        assert len(chunks[0]["chunk_text"])<=600

def test_local_embedding():
    vec=local_embedding("hello world")
    assert len(vec)==384
    # norm should be ~1
    import math
    norm=math.sqrt(sum(x*x for x in vec))
    assert abs(norm-1.0)<0.01

def test_retrieval_hybrid():
    from app.core.database import SessionLocal
    from app.services.retrieval_service import RetrievalService
    from app.services.gemini_provider import GeminiProvider
    db=SessionLocal()
    svc=RetrievalService(ai_provider=GeminiProvider())
    # Ensure at least one document exists (from earlier ingestion)
    results=svc.retrieve("RBI", db, top_k=2)
    # May be empty if no chunks, but should not error
    assert isinstance(results, list)
    if results:
        assert "hybrid" in results[0]
        assert "authority" in results[0]
        assert "freshness" in results[0]
    db.close()
