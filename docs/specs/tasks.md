# TASKS — Breakdown

- [ ] T1 Extend config (.env, requirements) + install google-genai, bs4, pypdf, lxml, httpx, numpy, pytest
- [ ] T2 Extend Source model with authority_level/country/language/is_trusted + create Document/EvidenceChunk/VerificationRequest/ClaimEvidence models
- [ ] T3 Create Alembic migration (auto) and apply
- [ ] T4 AIProvider ABC + GeminiProvider (gemini-2.5-flash, structured JSON, guard prompts, fallback)
- [ ] T5 EmbeddingService (Gemini + local deterministic fallback, dedup)
- [ ] T6 Fetcher + Parser + Chunker services
- [ ] T7 RetrievalService (hybrid scoring + freshness)
- [ ] T8 VerificationEngine + Confidence + ExplanationService + Claim extraction/normalization/classification
- [ ] T9 Wire IngestionService + VerificationPipeline
- [ ] T10 APIs: verify, verification history/detail, sources, ingest/documents, reports; update main.py + schemas
- [ ] T11 CLI: backend/ingest.py + seed expansion
- [ ] T12 Tests: models/migrations/ingest/chunk/embed/retrieval/verify/API/injection
- [ ] T13 Real data run: ingest at least 1 trusted source → verify real claim
- [ ] T14 Final VERIFY checklist per spec 54
