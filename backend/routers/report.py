import base64
import logging
import re
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

from backend.models import ReportRequest, ReportResponse
from backend.services.report_generator import generate_markdown, generate_pdf
from backend.storage import session_store
from backend.main import limiter

logger = logging.getLogger("tricountreport.report")
router = APIRouter()


def _safe_filename(name: str) -> str:
    """Remove path separators and shell-unsafe characters from a user-supplied filename."""
    name = name.replace("/", "_").replace("\\", "_").replace("\0", "")
    name = re.sub(r'[<>:"|?*]', "_", name)
    return name.strip()[:100] or "Trip_Report"


@router.post("/report", response_model=ReportResponse)
@limiter.limit("10/minute")
async def generate_report(request: Request, body: ReportRequest):
    data = session_store.get_session(body.session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found")

    # Sanitize trip_name before passing to generators
    safe_trip_name = _safe_filename(body.trip_name)

    kwargs = dict(
        report_mode=body.report_mode,
        personal_member=body.personal_member,
        exclude_personal_expenses=body.exclude_personal_expenses,
    )

    result = ReportResponse()

    if "markdown" in body.formats:
        try:
            result.markdown = generate_markdown(data, safe_trip_name, **kwargs)
        except Exception:
            logger.exception("Markdown generation failed")
            raise HTTPException(status_code=500, detail="Report generation failed. Please try again.")

    if "pdf" in body.formats:
        try:
            pdf_bytes = generate_pdf(data, safe_trip_name, **kwargs)
            result.pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
        except Exception:
            logger.exception("PDF generation failed")
            raise HTTPException(status_code=500, detail="PDF generation failed. Please try again.")

    return result


@router.get("/report/download/{session_id}/{format}")
async def download_report(
    session_id: str, format: str, trip_name: str = "Trip Report",
    report_mode: str = "global", personal_member: str | None = None,
    exclude_personal_expenses: bool = False,
):
    data = session_store.get_session(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found")

    kwargs = dict(
        report_mode=report_mode,
        personal_member=personal_member,
        exclude_personal_expenses=exclude_personal_expenses,
    )

    safe_name = _safe_filename(trip_name)
    if format == "md":
        content = generate_markdown(data, safe_name, **kwargs)
        return Response(
            content=content.encode("utf-8"),
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{safe_name}.md"'},
        )
    elif format == "pdf":
        pdf_bytes = generate_pdf(data, safe_name, **kwargs)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{safe_name}.pdf"'},
        )
    else:
        raise HTTPException(status_code=400, detail="Format must be 'md' or 'pdf'")
