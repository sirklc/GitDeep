from app.analysis.prompts import build_axis_prompt
from app.analysis.rubrics import ALL_RUBRICS


def test_every_axis_prompt_includes_file_report_scope():
    for rubric in ALL_RUBRICS:
        prompt = build_axis_prompt(rubric, "https://github.com/example/repo")
        assert "File-by-file reporting" in prompt
        assert "file_reports" in prompt


def test_only_documentation_axis_scope_mentions_readme_filenames():
    for rubric in ALL_RUBRICS:
        prompt = build_axis_prompt(rubric, "https://github.com/example/repo")
        if rubric.axis == "documentation":
            assert "README.md" in prompt
        else:
            assert "README.md" not in prompt
