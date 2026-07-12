from app.analysis.rubrics import AXIS_MAX_SCORE
from app.analysis.schemas import AxisResult, RepoAnalysisResult


def _build_executive_summary(axis_results: list[AxisResult], overall_score: float) -> str:
    strongest = max(axis_results, key=lambda a: a.weighted_score / AXIS_MAX_SCORE[a.axis])
    weakest = min(axis_results, key=lambda a: a.weighted_score / AXIS_MAX_SCORE[a.axis])
    return (
        f"Overall score {overall_score}/100. Strongest axis: {strongest.axis} "
        f"({strongest.weighted_score}/{AXIS_MAX_SCORE[strongest.axis]}). "
        f"Weakest axis: {weakest.axis} ({weakest.weighted_score}/{AXIS_MAX_SCORE[weakest.axis]})."
    )


def build_repo_analysis_result(repo_url: str, axis_results: list[AxisResult]) -> RepoAnalysisResult:
    overall_score = round(sum(a.weighted_score for a in axis_results), 2)
    return RepoAnalysisResult(
        repo_url=repo_url,
        axes=axis_results,
        overall_score=overall_score,
        executive_summary=_build_executive_summary(axis_results, overall_score),
    )
