from io import BytesIO

from fastapi import UploadFile
from pypdf import PdfReader


async def extract_text_from_upload(file: UploadFile) -> str:
    content = await file.read()

    if file.filename and file.filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(content)

    return content.decode("utf-8", errors="ignore")


def extract_text_from_pdf(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    pages = []

    for page in reader.pages:
        pages.append(page.extract_text() or "")

    return "\n".join(pages).strip()

