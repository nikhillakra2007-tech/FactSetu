"""Pydantic schemas — minimal for foundation; full CRUD added in next iteration."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    database: str
    app: str = "FACTSETU"
