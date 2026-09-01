"""FACTSETU — Seed trusted sources registry.

Usage:
  python seed.py
  python seed.py --reset
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core.database import SessionLocal
from app.models.source import Source
from app.models.enums import SourceType

TRUSTED_SOURCES = [
    {
        "name": "Press Information Bureau",
        "domain": "pib.gov.in",
        "base_url": "https://pib.gov.in",
        "source_type": SourceType.government,
        "trust_level": 5,
        "authority_level": 5,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "Reserve Bank of India",
        "domain": "rbi.org.in",
        "base_url": "https://www.rbi.org.in",
        "source_type": SourceType.regulator,
        "trust_level": 5,
        "authority_level": 5,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "India.gov.in - National Portal of India",
        "domain": "india.gov.in",
        "base_url": "https://www.india.gov.in",
        "source_type": SourceType.government,
        "trust_level": 5,
        "authority_level": 5,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "Election Commission of India",
        "domain": "eci.gov.in",
        "base_url": "https://www.eci.gov.in",
        "source_type": SourceType.government,
        "trust_level": 5,
        "authority_level": 5,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "World Health Organization",
        "domain": "who.int",
        "base_url": "https://www.who.int",
        "source_type": SourceType.international_organization,
        "trust_level": 5,
        "authority_level": 5,
        "country": "INT",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "United Nations",
        "domain": "un.org",
        "base_url": "https://www.un.org",
        "source_type": SourceType.international_organization,
        "trust_level": 5,
        "authority_level": 5,
        "country": "INT",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "Ministry of Health and Family Welfare",
        "domain": "mohfw.gov.in",
        "base_url": "https://www.mohfw.gov.in",
        "source_type": SourceType.government,
        "trust_level": 5,
        "authority_level": 5,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "Supreme Court of India",
        "domain": "sci.gov.in",
        "base_url": "https://www.sci.gov.in",
        "source_type": SourceType.government,
        "trust_level": 5,
        "authority_level": 5,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "ISRO",
        "domain": "isro.gov.in",
        "base_url": "https://www.isro.gov.in",
        "source_type": SourceType.government,
        "trust_level": 4,
        "authority_level": 4,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "NITI Aayog",
        "domain": "niti.gov.in",
        "base_url": "https://www.niti.gov.in",
        "source_type": SourceType.government,
        "trust_level": 4,
        "authority_level": 4,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    # Finance — Ministry of Finance
    {
        "name": "Ministry of Finance",
        "domain": "finmin.nic.in",
        "base_url": "https://finmin.nic.in",
        "source_type": SourceType.government,
        "trust_level": 5,
        "authority_level": 5,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
    {
        "name": "SEBI",
        "domain": "sebi.gov.in",
        "base_url": "https://www.sebi.gov.in",
        "source_type": SourceType.regulator,
        "trust_level": 5,
        "authority_level": 5,
        "country": "IN",
        "language": "en",
        "is_trusted": True,
    },
]


def seed(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        if reset:
            deleted = db.query(Source).delete()
            db.commit()
            print(f"Cleared {deleted} existing sources.")

        inserted = 0
        skipped = 0
        for src in TRUSTED_SOURCES:
            exists = db.query(Source).filter(Source.domain == src["domain"]).first()
            if exists:
                skipped += 1
                continue
            s = Source(
                name=src["name"],
                domain=src["domain"],
                base_url=src["base_url"],
                source_type=src["source_type"],
                trust_level=src["trust_level"],
                authority_level=src.get("authority_level", src["trust_level"]),
                country=src.get("country", "IN"),
                language=src.get("language", "en"),
                is_trusted=src.get("is_trusted", True),
                is_active=True,
            )
            db.add(s)
            inserted += 1
        db.commit()
        total = db.query(Source).count()
        print(f"Seed complete: inserted={inserted} skipped={skipped} total={total}")
        for s in db.query(Source).order_by(Source.authority_level.desc(), Source.name).all():
            print(f"  - {s.name} ({s.domain}) trust={s.trust_level} auth={s.authority_level} type={s.source_type.value} trusted={s.is_trusted}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed FACTSETU trusted sources")
    parser.add_argument("--reset", action="store_true", help="Delete existing sources before seeding")
    args = parser.parse_args()
    seed(reset=args.reset)
