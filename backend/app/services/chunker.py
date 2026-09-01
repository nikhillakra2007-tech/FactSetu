"""FACTSETU — Chunker (sentence-aware, overlap)."""

import re
from typing import List
from app.core.config import get_settings


class ChunkingService:
    def __init__(self):
        self.settings = get_settings()

    def chunk(self, text: str) -> list[dict]:
        """Return list of {chunk_text, chunk_index, section}."""
        if not text or not text.strip():
            return []
        chunk_size = self.settings.chunk_size_chars
        overlap = self.settings.chunk_overlap_chars

        # Sentence split
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        chunks: list[dict] = []
        current = ""
        idx = 0
        for sent in sentences:
            if len(current) + len(sent) + 1 <= chunk_size:
                current = (current + " " + sent).strip() if current else sent.strip()
            else:
                if current:
                    chunks.append({"chunk_text": current, "chunk_index": idx, "section": None})
                    idx += 1
                    # overlap: keep last overlap chars
                    current = current[-overlap:] + " " + sent if overlap and len(current) > overlap else sent
                    current = current.strip()
                    # if still too long, truncate
                    if len(current) > chunk_size:
                        current = current[:chunk_size]
                else:
                    # single long sentence: split by chars
                    while len(sent) > chunk_size:
                        chunks.append({"chunk_text": sent[:chunk_size], "chunk_index": idx, "section": None})
                        idx += 1
                        sent = sent[chunk_size - overlap :]
                    current = sent
        if current.strip():
            chunks.append({"chunk_text": current.strip(), "chunk_index": idx, "section": None})
        return chunks
