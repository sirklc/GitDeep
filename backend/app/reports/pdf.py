from datetime import datetime, timezone
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

from app.analysis.rubrics import AXIS_MAX_SCORE, RUBRICS_BY_AXIS
from app.analysis.schemas import AxisResult
from app.db.models import AnalysisJob

_TEMPLATE_DIR = Path(__file__).parent / "templates"
_env = Environment(
    loader=FileSystemLoader(_TEMPLATE_DIR),
    autoescape=select_autoescape(["html", "jinja"]),
)

_AXIS_ORDER = list(RUBRICS_BY_AXIS)


def render_analysis_report_pdf(job: AnalysisJob) -> bytes:
    axes = sorted(
        (AxisResult(**a) for a in (job.axes or [])),
        key=lambda a: _AXIS_ORDER.index(a.axis),
    )
    template = _env.get_template("analysis_report.html.jinja")
    html = template.render(
        repo_url=job.repo_url,
        overall_score=job.overall_score,
        executive_summary=job.executive_summary,
        axes=[_build_axis_section(a) for a in axes],
        generated_at=datetime.now(timezone.utc),
    )
    return HTML(string=html).write_pdf()


def _build_axis_section(axis: AxisResult) -> dict:
    rubric = RUBRICS_BY_AXIS[axis.axis]
    criteria_by_id = {c.id: c for c in rubric.criteria}
    return {
        "axis": axis.axis,
        "weighted_score": axis.weighted_score,
        "max_score": AXIS_MAX_SCORE[axis.axis],
        "summary": axis.summary,
        "criteria": [
            {
                "title": criteria_by_id[c.criterion_id].title if c.criterion_id in criteria_by_id else c.criterion_id,
                "score": c.score,
                "reasoning": c.reasoning,
                "evidence": c.evidence,
            }
            for c in axis.criteria
        ],
        "file_reports": axis.file_reports,
    }
