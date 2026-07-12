from app.analysis.rubrics import ALL_RUBRICS
from app.analysis.schemas import AxisResult, CriterionEvidence, CriterionResult, FileReport
from app.db.models import AnalysisJob
from app.reports.pdf import render_analysis_report_pdf


def _axis_result_for(rubric) -> AxisResult:
    scores = {c.id: 7 for c in rubric.criteria}
    return AxisResult(
        axis=rubric.axis,
        criteria=[
            CriterionResult(
                criterion_id=c.id,
                score=scores[c.id],
                evidence=[CriterionEvidence(file_path="app/main.py", observation="looked fine")],
                reasoning=f"{c.title} is adequately handled.",
            )
            for c in rubric.criteria
        ],
        file_reports=[
            FileReport(file_path="app/main.py", verdict="clean", summary="Well-structured entry point."),
            FileReport(file_path="app/utils.py", verdict="issues", summary="Missing error handling."),
        ],
        weighted_score=rubric.weighted_score(scores),
        summary=f"{rubric.axis} axis looks solid overall.",
    )


def _make_job() -> AnalysisJob:
    axis_results = [_axis_result_for(rubric) for rubric in ALL_RUBRICS]
    overall_score = round(sum(a.weighted_score for a in axis_results), 2)
    return AnalysisJob(
        repo_url="https://github.com/example/repo",
        status="completed",
        axes=[a.model_dump(mode="json") for a in axis_results],
        overall_score=overall_score,
        executive_summary="Overall a well-maintained repository with a few gaps in error handling.",
    )


def test_render_analysis_report_pdf_produces_valid_pdf():
    job = _make_job()

    pdf_bytes = render_analysis_report_pdf(job)

    assert pdf_bytes.startswith(b"%PDF-")
    assert len(pdf_bytes) > 1000


def test_render_analysis_report_pdf_handles_empty_axes():
    job = AnalysisJob(
        repo_url="https://github.com/example/repo",
        status="completed",
        axes=[],
        overall_score=0.0,
        executive_summary="No axes available.",
    )

    pdf_bytes = render_analysis_report_pdf(job)

    assert pdf_bytes.startswith(b"%PDF-")
