# FACTSETU — Database Architecture

## Overview

FACTSETU is an evidence-first fact verification platform. The database is the
persistent memory and audit trail — it stores *what was submitted, what was
extracted, what was claimed, what evidence was retrieved, and what result was
produced* — but it is NOT the source of truth for facts. External trusted
sources (RBI, PIB, WHO, etc.) and the LLM verification pipeline provide the
ground truth.

## High-Level Flow

```
USER INPUT (text / image / voice)
  → InputFile (optional file) / original_text
  → ExtractedContent (OCR / transcript / normalized_text)
  → Claim extraction (1 submission → N claims)
  → ClaimEntity extraction (NER for each claim)
  → Evidence retrieval per claim (each evidence → 1 source)
  → Verification per claim (verified / contradicted / uncertain)
  → VerificationRun (pipeline execution attempts, for debugging & async)
  → Feedback (user rating of verification)
```

## Tables (11) — Purpose

| # | Table | Purpose |
|---|-------|---------|
| 1 | `users` | Application users. Minimal: `id`, `email` (nullable, unique), `display_name`, `preferred_language`. Auth not implemented yet; table is ready to integrate with future auth without migration. |
| 2 | `submissions` | One user submission — the unit of ingestion. Holds `input_type` (text/image/voice), `original_text`, `original_language`, `status` (pending/processing/completed/failed). |
| 3 | `input_files` | Uploaded files per submission. Stores `storage_key` (S3 key / URL / local path), `mime_type`, `file_size`. Schema ready for cloud storage without requiring it now. |
| 4 | `extracted_content` | Machine-extracted text per submission. Distinguishes `ocr` vs `transcript` vs `normalized_text`, with `extraction_method` + `confidence`. Preserves the chain original → extracted → claims. |
| 5 | `claims` | **Core table.** One submission → many claims. Stores `claim_text`, `normalized_claim`, `claim_type`, `language`, `status` (pending/processing/verified/contradicted/uncertain). |
| 6 | `claim_entities` | Entities per claim (RBI → ORGANIZATION, UPI → SYSTEM, etc.). Flexible: `entity_type`, `entity_text`, `normalized_value`, `metadata` JSON. No entity-resolution engine yet. |
| 7 | `sources` | Registry of trusted/allowed sources. `domain` (unique), `base_url`, `source_type` (government/regulator/intl_org/research/news/other), `trust_level` (1-5), `is_active`. Seed includes 10 real sources (pib.gov.in, rbi.org.in, india.gov.in, eci.gov.in, who.int, un.org, …). |
| 8 | `evidence` | **Distinct from sources.** A source is "RBI website"; evidence is "a specific page/snippet from RBI relevant to a claim". Stores `url`, `snippet`, `content`, `published_at`, `retrieved_at`, `relevance_score`, `evidence_type` (supporting/contradicting/contextual). |
| 9 | `verifications` | Outcome per claim. `result` (verified/contradicted/uncertain), `confidence`, `reason`, `model_name`. Supports uncertainty — not forced to true/false. |
| 10 | `verification_runs` | Individual pipeline execution attempts for a verification. `status` (pending/running/completed/failed), `started_at`, `completed_at`, `error_message`, `pipeline_metadata` JSON. Enables async debugging. |
| 11 | `feedback` | User feedback per verification. `rating` (1-5), `feedback_type` (helpful/not_helpful/incorrect/missing_context/other), `comment`. |

## Relationships

```
User ──1:N── Submissions
              ├──1:N── InputFile
              ├──1:N── ExtractedContent
              └──1:N── Claim
                        ├──1:N── ClaimEntity
                        ├──1:N── Evidence ──N:1── Source
                        └──1:N── Verification
                                  ├──1:N── VerificationRun
                                  └──1:N── Feedback (also N:1 User)
User ──1:N── Feedback
```

Explicit FKs with intentional cascade behavior:

* `RESTRICT` for `Submission.user_id` and `Evidence.source_id` and `Feedback.user_id` — prevents accidental deletion of users/sources that have historical records.
* `CASCADE` for `Submission → InputFile / ExtractedContent / Claim`, `Claim → Entity / Evidence / Verification`, `Verification → Run / Feedback` — cleaning up a submission correctly removes its derived data; deleting a claim removes its evidence/verifications. Historical verification records are preserved unless explicitly cascaded from their parent claim.

## ER Diagram (text)

```
┌─────────┐
│  users  │─────────┐
│ PK id   │         │ 1:N
└─────────┘         │
     ▲              ▼
     │         ┌──────────────┐
     │         │ submissions  │
     └─────────┤ PK id        │
   Feedback    │ FK user_id   │──┬──1:N──┌──────────────┐
   ┌──────────┐│ input_type   │  │       │ input_files  │
   │ feedback ││ status       │  │       └──────────────┘
   │ PK id    │└──────────────┘  │
   │ FK user  │                  ├──1:N──┌───────────────────┐
   │ FK verif │                  │       │ extracted_content │
   └──────────┘                  │       └───────────────────┘
        ▲                        │
        │ 1:N                    └──1:N──┌─────────┐
┌──────────────┐                        │ claims  │──1:N──┌────────────────┐
│verifications │                        │ PK id   │       │ claim_entities │
│ PK id        │────────────────────────┤ FK sub  │       └────────────────┘
│ FK claim_id  │                        │ status  │
│ result       │                        └─────────┘
│ confidence   │                             │
└──────────────┘                             ├──1:N──┌──────────┐
     ▲                                       │       │ evidence │──N:1──┌─────────┐
     │ 1:N                                   │       │ FK claim │      │ sources │
┌──────────────────┐                         │       │ FK src   │      │ PK id   │
│verification_runs │                         │       │ url      │      │ domain  │
│ PK id            │                         │       │ type     │      │ trust   │
│ FK verif_id      │                         │       └──────────┘      └─────────┘
│ status           │                         │
└──────────────────┘                         └──1:N──┌──────────────┐
                                                    │verifications │
                                                    └──────────────┘
```

## Why Evidence and Source are Separate

*Source* is the trusted publisher (e.g., `pib.gov.in`). *Evidence* is a specific retrieved artifact: a URL, snippet, publication date, relevance score, and type. One claim can have many evidence rows from the same source (different pages), and evidence rows are immutable retrieval records while sources are a slowly-changing registry with trust levels. This separation allows trusted-source prioritization later (query `trust_level >= 4` first) without conflating source metadata with per-retrieval data.

## Why Submissions and Claims are Separate

A submission is what the user submitted ("RBI banned UPI after 10 PM and all users will be affected."). It contains N factual claims. Claims are the unit of verification — each claim gets its own evidence set, verification result, and entities. Storing them separately preserves the original context, allows per-claim status tracking, and supports claims that span submissions or get re-verified independently.

## How Future OCR / STT / LLM Systems Will Connect

* `InputFile` already stores `storage_key`/`mime_type` — the OCR service will read the file and write to `ExtractedContent` with `content_type=ocr`.
* `SpeechToTextService` will do the same with `content_type=transcript`.
* `TranslationService` writes `content_type=normalized_text`.
* `ClaimExtractionService` reads `submissions.original_text` + `extracted_content.content` and writes `claims` + `claim_entities`.
* `EvidenceRetrievalService` reads `claims.claim_text` + `sources` registry and writes `evidence`.
* `VerificationService` reads `claim` + its `evidence` and writes `verifications` + `verification_runs`.

Interfaces are defined in `backend/app/services/interfaces.py` as ABCs — no fake AI is implemented.

## How Verification History is Preserved

* `verifications` is append-friendly: a claim can have multiple verification rows (re-verification). The latest row is current; older rows are audit history.
* `verification_runs` logs each pipeline attempt (including failures with `error_message` and `pipeline_metadata`), so re-runs and async jobs are traceable.
* `evidence` rows are never mutated as "truth" — they store what was retrieved and when (`retrieved_at`, `published_at`), so the chain user → submission → extracted → claim → evidence (→ source) → verification → run → feedback is fully auditable.

## Indexing

Critical indexes (from `engine/config.py` + models):
`submissions(user_id, created_at)`, `submissions(status)`, `claims(submission_id, status)`,
`evidence(claim_id, source_id)`, `verifications(claim_id, result)`,
`verification_runs(verification_id, status)`, `feedback(user_id, verification_id)`.
Plus unique constraints on `users.email`, `sources.domain`, `sources.name`.

## Tech Stack

* **DB:** PostgreSQL preferred (`DATABASE_URL` with `psycopg2-binary`); SQLite fallback for local dev without Postgres.
* **ORM:** SQLAlchemy 2.x (typed `Mapped` models, `Uuid` PKs, `Enum` with `native_enum=False` for SQLite compat).
* **Migrations:** Alembic (`alembic upgrade head` reproduces full schema).
* **API:** FastAPI — currently `/health` + `/health/db` + `/`; full verification APIs deferred.
* **Seed:** `seed.py` inserts 10 authoritative sources with real domains.

## What is NOT Implemented (by design)

LLM/RAG/web search, OCR, STT, translation pipeline, verification algorithm, vector DB/embeddings, frontend, dashboard, auth, admin, notifications.
