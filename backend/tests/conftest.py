"""FACTSETU — Test configuration and database fixture setup."""

import sys
from pathlib import Path
import pytest

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal, Base, engine
import app.models
from app.models.source import Source
from app.models.enums import SourceType


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensure database has basic seed sources for tests."""
    db = SessionLocal()
    try:
        if not db.query(Source).filter(Source.domain == "pib.gov.in").first():
            test_source = Source(
                name="Press Information Bureau",
                domain="pib.gov.in",
                base_url="https://pib.gov.in",
                source_type=SourceType.government,
                trust_level=5,
                authority_level=5,
                country="IN",
                language="en",
                is_trusted=True,
                is_active=True,
            )
            db.add(test_source)
        if not db.query(Source).filter(Source.domain == "rbi.org.in").first():
            test_source_rbi = Source(
                name="Reserve Bank of India",
                domain="rbi.org.in",
                base_url="https://www.rbi.org.in",
                source_type=SourceType.regulator,
                trust_level=5,
                authority_level=5,
                country="IN",
                language="en",
                is_trusted=True,
                is_active=True,
            )
            db.add(test_source_rbi)
        db.commit()
    finally:
        db.close()
    yield
