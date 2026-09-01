"""FACTSETU — Parser (HTML/PDF/text)."""

import re
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


def parse_html(content: str, url: str = "") -> dict:
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(content, "lxml")
    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    # Title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    # Try og:title
    if not title:
        og = soup.find("meta", property="og:title")
        if og and og.get("content"):
            title = og["content"].strip()
    # Main content: article or body
    main = soup.find("article") or soup.find("main") or soup.body
    if main:
        text = main.get_text(separator="\n", strip=True)
    else:
        text = soup.get_text(separator="\n", strip=True)
    # Clean up whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = text.strip()
    if len(text) > 20000:
        text = text[:20000]

    # Published date heuristic
    published = None
    for sel in ["meta[property='article:published_time']", "meta[name='publish_date']", "time"]:
        el = soup.select_one(sel)
        if el:
            val = el.get("content") or el.get("datetime") or el.get_text()
            if val:
                try:
                    published = val.strip()[:50]
                except Exception:
                    pass
                break

    return {
        "title": title[:500] if title else None,
        "content": text,
        "published_at": published,
        "document_type": "html",
    }


def parse_pdf(content_bytes: bytes, url: str = "") -> dict:
    try:
        from pypdf import PdfReader
        import io

        reader = PdfReader(io.BytesIO(content_bytes))
        texts = []
        for i, page in enumerate(reader.pages):
            try:
                t = page.extract_text() or ""
                texts.append(t)
            except Exception:
                continue
        full = "\n\n".join(texts).strip()
        title = reader.metadata.title if reader.metadata and reader.metadata.title else None
        return {"title": title, "content": full[:20000], "document_type": "pdf", "published_at": None}
    except Exception as e:
        logger.warning("pdf parse failed %s: %s", url, e)
        return {"title": None, "content": "", "document_type": "pdf", "published_at": None}


def parse_content(raw: str | bytes, content_type: str = "", url: str = "") -> dict:
    ct = content_type.lower()
    if "pdf" in ct or url.lower().endswith(".pdf"):
        if isinstance(raw, str):
            raw = raw.encode("utf-8", errors="ignore")
        return parse_pdf(raw, url)
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8", errors="ignore")
    if "<html" in raw.lower() or "<body" in raw.lower():
        return parse_html(raw, url)
    # plain text
    txt = raw.strip()[:20000] if isinstance(raw, str) else ""
    return {"title": None, "content": txt, "document_type": "text", "published_at": None}
