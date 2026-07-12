import pytest
from pydantic import ValidationError

from app.analysis.schemas import AxisResult, CriterionEvidence, CriterionResult, FileReport, axis_json_schema


def test_file_report_verdict_restricted_to_clean_or_issues():
    FileReport(file_path="app/main.py", verdict="clean", summary="Fine.")
    FileReport(file_path="app/main.py", verdict="issues", summary="Bad.")
    with pytest.raises(ValidationError):
        FileReport(file_path="app/main.py", verdict="maybe", summary="?")


def test_axis_result_requires_file_reports():
    criteria = [
        CriterionResult(
            criterion_id="x",
            score=5,
            evidence=[CriterionEvidence(file_path="a.py", observation="obs")],
            reasoning="because",
        )
    ]
    with pytest.raises(ValidationError):
        AxisResult(axis="architecture", criteria=criteria, weighted_score=10.0, summary="s")

    result = AxisResult(
        axis="architecture",
        criteria=criteria,
        file_reports=[FileReport(file_path="a.py", verdict="clean", summary="ok")],
        weighted_score=10.0,
        summary="s",
    )
    assert result.file_reports[0].file_path == "a.py"


def test_axis_json_schema_includes_file_reports():
    schema = axis_json_schema()
    assert "file_reports" in schema["properties"]
    assert "file_reports" in schema["required"]

    file_report_schema = schema["properties"]["file_reports"]["items"]
    assert set(file_report_schema["required"]) == {"file_path", "verdict", "summary"}
    assert file_report_schema["properties"]["verdict"]["enum"] == ["clean", "issues"]
