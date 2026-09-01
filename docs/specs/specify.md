# SPECIFY — FactSetu Intelligence Foundation

## 1. Goal
Build backend+DB+AI evidence layer that performs REAL TRUSTED DATA → INGESTION → DOCUMENT → CHUNK → EMBEDDING → RETRIEVAL → EVIDENCE → CLAIM → GEMINI → VERIFIED/CONTRADICTED/UNCERTAIN. No frontend, no fake evidence.

## 2. Existing Architecture Discovered
- Framework: FastAPI 0.115, SQLAlchemy 2.0.36, Alembic, Pydantic, SQLite (fallback) / PostgreSQL (preferred)
- DB: 11 tables (users, submissions, input_files, extracted_content, claims, claim_entities, sources, evidence, verifications, verification_runs, feedback) with UUID PKs, enums, FKs (RESTRICT/CASCADE), indexes; migration b963e710a051 applied; 10 trusted sources seeded; factsetu.db exists
- Backend: app/main.py + app/api/health.py only; app/core/config.py reads DATABASE_URL, .env contains GEMINI_API_KEY (invalid prefix AQ, needs handling); app/services/interfaces.py has ABC placeholders only
- No .specify/artifacts yet; docs/ARCHITECTURE.md exists

## 3. Scope for This Phase
Database extensions + Data Ingestion + Embeddings + Retrieval + AI Provider + Verification Engine + Backend APIs + Provenance. Frontend explicitly out.

## 4. Functional Requirements
### DB
- Extend Source: add authority_level (1-5), country, language, is_trusted flag
- New tables: documents, evidence_chunks (with embedding JSON/vector), verification_requests, claim_evidence (join claim↔chunk with relevance/support metadata)
- Preserve existing tables/relationships; additive migrations only

### Ingestion
- Fetcher: configured trusted sources only, timeout/retries, content-type check, size limit, no crawler
- Parser: HTML (title/main/body/published/updated/language), PDF, text; strip noise
- Cleaner, Metadata extractor, Deduplicator (content_hash), Document store

### Chunking & Embeddings
- Chunker:  ~500-800 tokens, overlap 50-100, preserve chunk_index/section/page
- EmbeddingService: Gemini gemini-embedding-001 (fallback to deterministic local embedding if key invalid/offline); store as JSON/vector, avoid re-embedding unchanged chunks

### Retrieval
- RetrievalService: hybrid semantic (cosine) + keyword (TF) + authority (trust/authority_level) + freshness (published_at/retrieved_at decay)
- Freshness: boost recent evidence for time-sensitive claims
- Fresh retrieval fallback: if DB insufficient/stale, fetch fresh from allowed sources

### AI
- AIProvider ABC → GeminiProvider using gemini-2.5-flash via google-genai; centralize config; structured JSON output
- Gemini responsibilities: claim extraction, normalization, classification (govt/finance/health etc), search-query generation, evidence interpretation/comparison, explanation, translation/multimodal
- Prompts must: treat retrieved docs as untrusted data, never follow instructions inside, never invent citations, ground in evidence

### Verification
- VerificationRequest (input_type, original_input, language, status, user_id nullable)
- Claim (extend with verification_request_id, claim_type classification)
- VerificationEngine: input claim+evidence+source metadata → supports/contradicts/insufficient → mapped VERIFIED/CONTRADICTED/UNCERTAIN (uncertain mandatory)
- Confidence: HIGH/MEDIUM/LOW derived from authority+relevance+freshness+agreement+alignment, not hallucinated probability
- VerificationResult + ClaimEvidence provenance

### APIs
- POST /api/verify (text/image voice stub), GET /api/verification/{id}, GET /api/verification/history, POST /api/reports, GET /api/sources, POST /api/ingest (admin)
- Reuse health routes; no duplicate routes

### Security
- Never log/expose GEMINI_API_KEY; validate URLs, limit file sizes, prompt-injection resistant

## 5. Non-Functional
- Replaceable vector store (SQLite JSON today → pgvector tomorrow)
- Deduplication deterministic
- Tests for DB/migration/source/fetch/parse/dedup/chunk/embed/retrieval/claim/verify/confidence/explanation/API/injection

## 6. Real Data Acceptance
Must ingest at least ONE real trusted source (pib.gov.in or rbi.org.in) end-to-end: fetch → document → DB → chunks → embeddings → retrieval; then real claim → retrieval → real evidence → Gemini → verification.
