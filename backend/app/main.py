"""FACTSETU — FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.verify import router as verify_router
from app.api.sources import router as sources_router
from app.api.ingest import router as ingest_router
from app.api.reports import router as reports_router
from app.api.auth import router as auth_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="FACTSETU API",
    description="Evidence-first fact verification platform — authentication + intelligence + evidence layer",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(verify_router)
app.include_router(sources_router)
app.include_router(ingest_router)
app.include_router(reports_router)
app.include_router(auth_router)


@app.get("/", tags=["root"])
def root():
    return {
        "app": "FACTSETU",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }
