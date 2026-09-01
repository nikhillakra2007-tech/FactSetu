# PLAN — Architecture & Implementation Plan

## 1. Database Changes (Additive Migration b963... → new)
- Extend sources: authority_level INT (1-5), country VARCHAR(10) default 'IN', language VARCHAR(10) default 'en', is_trusted BOOL default True
- New table documents: id Uuid, source_id FK RESTRICT, title TEXT, url TEXT UNIQUE, content TEXT, document_type VARCHAR(20) (html/pdf/text), language VARCHAR(10), published_at DATETIME nullable, updated_at nullable, content_hash VARCHAR(64) UNIQUE, retrieved_at DATETIME, created_at
- New table evidence_chunks: id Uuid, document_id FK CASCADE, chunk_text TEXT, chunk_index INT, section VARCHAR(255) nullable, page_number INT nullable, embedding JSON nullable (list[float]), embedding_model VARCHAR(50) nullable, created_at
- Indexes: documents(source_id), documents(content_hash), documents(url), evidence_chunks(document_id), evidence_chunks(chunk_index)
- New table verification_requests: id Uuid, user_id FK RESTRICT nullable, input_type Enum, original_input TEXT, language VARCHAR(10), status Enum (pending/processing/completed/failed), created_at, completed_at nullable
- New table claim_evidence: id Uuid, claim_id FK CASCADE, chunk_id FK CASCADE, relevance_score FLOAT, support_type VARCHAR(20) nullable, retrieval_rank INT nullable, created_at; unique (claim_id, chunk_id)

## 2. Services Architecture
```
app/core/config.py += gemini_api_key, gemini_model (gemini-2.5-flash), gemini_embedding_model (gemini-embedding-001)
app/services/ai_provider.py : AIProvider ABC
app/services/gemini_provider.py : GeminiProvider implements AIProvider via google-genai; methods: extract_claims, normalize_claim, classify_claim, generate_search_queries, compare_claim_evidence, explain_verdict; structured JSON schema enforcement; prompt injection guard
app/services/embedding_service.py : EmbeddingService (generate/store/retrieve; dedup via hash; local fallback embedding = 384-dim deterministic)
app/services/fetcher.py : FetchService (httpx, timeout 10s, max 5MB, allowlist check, content-type)
app/services/parser.py : ParserService (BeautifulSoup for HTML, pypdf for PDF)
app/services/chunker.py : ChunkingService (sentence-aware, 600 chars, overlap 100)
app/services/retrieval_service.py : RetrievalService (hybrid score = 0.5*semantic +0.2*keyword +0.2*authority +0.1*freshness)
app/services/verification_engine.py : VerificationEngine (supports/contradicts/insufficient → VERIFIED/CONTRADICTED/UNCERTAIN, confidence HIGH/MEDIUM/LOW)
app/services/ingestion_service.py : IngestionService orchestrates Fetcher→Parser→Dedup→Document→Chunker→Embedding
app/services/pipeline.py : VerificationPipeline orchestrates extraction→normalize→classify→retrieval→verify→explain→persist
```

## 3. API Layer
- app/api/verify.py: POST /api/verify, GET /api/verification/{id}, GET /api/verification/history
- app/api/sources.py: GET /api/sources, POST /api/sources
- app/api/ingest.py: POST /api/ingest (admin), GET /api/documents, GET /api/chunks
- app/api/reports.py: POST /api/reports (stub friendly to future)
- Register routers in app/main.py; keep health

## 4. Schemas
- app/schemas/verify.py, document.py, source.py, etc with Pydantic

## 5. Seed & Config
- Extend seed.py with authority_level/country/language/is_trusted; add finance/health sources already present

## 6. Vector Storage Strategy
- SQLite: embedding as JSON list[float]; RetrievalService does Python cosine (numpy if available, else pure python); no pgvector dependency
- Config flag VECTOR_STORE = sqlite_json; future pgvector path via same interface

## 7. Testing & Real Data
- tests/test_models.py, test_ingestion.py, test_retrieval.py, test_verify.py
- Real ingestion test: fetch https://www.rbi.org.in/Scripts/NotificationUser.aspx or https://pib.gov.in/PressReleasePage.aspx?PRID=... ; persist; then claim "RBI banned UPI after 10 PM" → verify → expect CONTRADICTED or UNCERTAIN grounded in real chunk

## 8. Security
- Never log GEMINI_API_KEY; validate URL domain allowlist; limit file size; prompt template includes untrusted data guard

## 9. Task Order (see tasks.md)
DB → Services → Pipeline → APIs → Ingestion → Tests → Real Data Verify
