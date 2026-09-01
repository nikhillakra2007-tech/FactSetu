# CLARIFY — Decisions & Assumptions

## Clarifications Made
1. **DB choice**: Keep SQLite for dev (factsetu.db) + Postgres via DATABASE_URL for prod. Not replacing existing 11 tables; additive migration. Embedding stored as JSON (SQLite) but PG can later use pgvector without code change (EmbeddingService abstraction).
2. **Source authority**: Map existing trust_level (1-5) to new authority_level; add country/language/is_trusted. Authority influences ranking multiplicatively.
3. **Embedding model**: Spec says gemini-embedding-2 but official SDK uses gemini-embedding-001 / text-embedding-004. Implement as GEMINI_EMBEDDING_MODEL env (default gemini-embedding-001) with fallback deterministic local embedding (hash-based 384-dim) when key invalid/offline, so dev works without network.
4. **Gemini model**: gemini-2.5-flash primary (per spec) via new google-genai SDK (`from google import genai`); central config in app/core/config.py; all prompts go through GeminiProvider, not scattered calls.
5. **GEMINI_API_KEY in repo**: .env has AQ... prefix which is invalid for Gemini (needs AIza...). Treat as possibly corrupt; code must fail gracefully → fallback to rule-based claim extraction + local embeddings, and surface “Gemini not configured” without crashing.
6. **Document vs Evidence**: Preserve old evidence table (claim→source snippet) and add new pipeline Document → EvidenceChunk → embedding → RetrievalService → claim_evidence join. VerificationEngine will consume top-ranked chunks (new) and fallback to old evidence if present.
7. **VerificationRequest vs Submission**: Submission already is “one piece of content submitted”. Introduce verification_requests as thin wrapper around submission for new pipeline, but also allow submissions to be used directly; claims now have optional verification_request_id FK for new flow.
8. **Chunking**: Use ~600 chars (~150 tokens) with 100 overlap for SQLite practicality; sentence-aware split via regex; store chunk_index/section/page.
9. **Retrieval freshness staleness**: Stale if retrieved_at > 30 days or published_at > 90 days; boost factor = exp(-days/30).
10. **Ingestion scope**: Not a crawler; Fetcher allowlist = sources.is_active && is_trusted && domain in TRUSTED_SOURCES; fetch single URL per ingestion call, with Bloom-style seen URL cache.
11. **API design**: Add app/api/verify.py etc, register in main.py, keep /health. Use Pydantic schemas in app/schemas/.
12. **Testing**: Need httpx; add to requirements.txt; create tests/ folder with pytest.

## Open Risks
- Network to pib.gov.in/rbi.org.in may be blocked in CI — fallback to cached fixture + still test pipeline end-to-end.
- Gemini quota/auth failure must not break verification; must return UNCERTAIN with explanation “insufficient evidence / AI unavailable” rather than fake verdict.

## Spec Kit Usage
- No existing spec-kit init; creating lightweight artifacts in docs/specs/ (specify.md, clarify.md, plan.md, tasks.md) and proceeding with IMPLEMENT → VERIFY.
