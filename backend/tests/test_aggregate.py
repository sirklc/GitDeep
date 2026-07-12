from app.analysis.aggregate import build_repo_analysis_result
from app.analysis.rubrics import ALL_RUBRICS
from app.analysis.schemas import AxisResult, CriterionEvidence, CriterionResult, FileReport


def _axis_result(axis: str, weighted_score: float) -> AxisResult:
    return AxisResult(
        axis=axis,
        criteria=[
            CriterionResult(
                criterion_id="c1",
                score=7,
                evidence=[CriterionEvidence(file_path="a.py", observation="obs")],
                reasoning="because",
            )
        ],
        file_reports=[FileReport(file_path="a.py", verdict="clean", summary="ok")],
        weighted_score=weighted_score,
        summary="summary",
    )


def test_build_repo_analysis_result_sums_axis_scores():
    axis_results = [
        _axis_result("architecture", 20.0),
        _axis_result("security", 25.0),
        _axis_result("engagement", 15.0),
        _axis_result("documentation", 10.0),
    ]

    aggregate = build_repo_analysis_result("https://github.com/example/repo", axis_results)

    assert aggregate.overall_score == 70.0
    assert aggregate.repo_url == "https://github.com/example/repo"
    assert len(aggregate.axes) == 4


def test_executive_summary_names_strongest_and_weakest_axis():
    axis_results = [
        _axis_result("architecture", 30.0),  # 30/30 = 1.0 fraction, strongest
        _axis_result("security", 3.0),  # 3/30 = 0.1 fraction, weakest
        _axis_result("engagement", 15.0),  # 15/20 = 0.75
        _axis_result("documentation", 10.0),  # 10/20 = 0.5
    ]

    aggregate = build_repo_analysis_result("https://github.com/example/repo", axis_results)

    assert "architecture" in aggregate.executive_summary
    assert "security" in aggregate.executive_summary


def test_all_rubric_axes_are_covered_by_a_fixture():
    axes = {r.axis for r in ALL_RUBRICS}
    assert axes == {"architecture", "security", "engagement", "documentation"}
