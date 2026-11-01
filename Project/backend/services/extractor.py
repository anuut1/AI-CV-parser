from io import BytesIO
import re
from fastapi import UploadFile
from pypdf import PdfReader

try:
    from docx import Document
except ImportError:
    Document = None


async def extract_text_from_upload(file: UploadFile) -> str:
    content = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(content)

    if filename.endswith(".docx") or filename.endswith(".doc"):
        return extract_text_from_docx(content)

    return content.decode("utf-8", errors="ignore")


def extract_text_from_pdf(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    pages = []

    for page in reader.pages:
        pages.append(page.extract_text() or "")

    return "\n".join(pages).strip()


def extract_text_from_docx(content: bytes) -> str:
    if Document is not None:
        try:
            doc = Document(BytesIO(content))
            lines = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(c.text.strip() for c in row.cells if c.text.strip())
                    if row_text:
                        lines.append(row_text)
            text = "\n".join(lines).strip()
            if text:
                return text
        except Exception:
            pass

    # Fallback text extraction for legacy binary .doc or corrupted packaging
    raw = content.decode("utf-8", errors="ignore")
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]", " ", raw)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned
