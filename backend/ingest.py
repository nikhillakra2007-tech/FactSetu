"""FACTSETU — CLI ingestion.

Usage:
  python ingest.py --url https://pib.gov.in/PressReleasePage.aspx?PRID=123
  python ingest.py --source pib.gov.in
  python ingest.py --all
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core.database import SessionLocal
from app.models.source import Source
from app.services.gemini_provider import GeminiProvider
from app.services.ingestion_service import IngestionService


def main():
    parser = argparse.ArgumentParser(description="FactSetu ingestion CLI")
    parser.add_argument("--url", help="URL to ingest (must be allowlisted)")
    parser.add_argument("--source", help="Source domain to ingest base_url")
    parser.add_argument("--all", action="store_true", help="Ingest base_url for all trusted sources")
    args = parser.parse_args()

    ai = GeminiProvider()
    svc = IngestionService(ai_provider=ai)
    db = SessionLocal()

    try:
        if args.url:
            res = svc.ingest_url(args.url, db=db)
            print(res)
        elif args.source:
            src = db.query(Source).filter(Source.domain == args.source).first()
            if not src:
                print(f"Source not found: {args.source}")
                sys.exit(1)
            res = svc.ingest_source(src.id, db=db)
            print(res)
        elif args.all:
            sources = db.query(Source).filter(Source.is_trusted == True, Source.is_active == True).all()
            for s in sources:
                print(f"Ingesting {s.name} ({s.base_url})...")
                res = svc.ingest_source(s.id, db=db)
                print(res)
        else:
            parser.print_help()
    finally:
        db.close()


if __name__ == "__main__":
    main()
