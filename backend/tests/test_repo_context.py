from app.analysis.repo_context import build_repo_context, qualifying_filenames_for_axis


def test_qualifying_filenames_for_documentation_includes_readme():
    names = qualifying_filenames_for_axis("documentation")
    assert "README.md" in names
    assert "package.json" in names


def test_qualifying_filenames_for_architecture_excludes_readme():
    names = qualifying_filenames_for_axis("architecture")
    assert "README.md" not in names
    assert "README" not in names
    assert "package.json" in names


def test_build_repo_context_excludes_lockfiles_and_includes_source(tmp_path):
    (tmp_path / "package-lock.json").write_text("x" * 500)
    (tmp_path / "main.py").write_text("print('hello')")
    (tmp_path / "README.md").write_text("# Title")

    context = build_repo_context(tmp_path, max_chars=1000)

    assert "package-lock.json" not in context
    assert "main.py" in context
