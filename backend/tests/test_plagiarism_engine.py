from app.services.plagiarism_engine import PlagiarismEngine


def test_jaccard_similarity():
    engine = PlagiarismEngine(tmp_dir="/tmp")
    assert engine._jaccard_similarity({"a", "b"}, {"a", "b"}) == 1.0
    assert engine._jaccard_similarity({"a", "b"}, {"c", "d"}) == 0.0
    assert engine._jaccard_similarity({"a", "b"}, {"b", "c"}) == 1 / 3
    assert engine._jaccard_similarity(set(), set()) == 0.0


def _write_code(path, lines):
    path.write_text("\n".join(lines), encoding="utf-8")


def test_internal_duplication_detects_copied_files(tmp_path):
    # Two nearly identical files > 40% similar should be flagged
    shared = [f"def function_number_{i}(): return {i} * 42" for i in range(15)]
    _write_code(tmp_path / "original.py", shared)
    _write_code(tmp_path / "copy.py", shared + ["def extra(): return 'unique line here'"])
    _write_code(tmp_path / "different.py",
                [f"class TotallyDifferentThing{i}: pass  # nr {i}" for i in range(15)])

    engine = PlagiarismEngine(tmp_dir=str(tmp_path))
    avg, pairs = engine.calculate_internal_duplication(str(tmp_path))

    assert pairs, "expected the copied pair to be flagged"
    flagged = {(p["file1"], p["file2"]) for p in pairs}
    assert ("copy.py", "original.py") in flagged or ("original.py", "copy.py") in flagged
    assert pairs[0]["similarity"] > 40


def test_internal_duplication_missing_path():
    engine = PlagiarismEngine(tmp_dir="/tmp")
    avg, pairs = engine.calculate_internal_duplication("/nonexistent/path/xyz")
    assert avg == 0.0
    assert pairs == []


def test_internal_duplication_skips_dependency_dirs(tmp_path):
    # Files inside node_modules must be ignored
    dep_dir = tmp_path / "node_modules"
    dep_dir.mkdir()
    shared = [f"def duplicated_line_number_{i}(): return {i}" for i in range(15)]
    _write_code(dep_dir / "a.py", shared)
    _write_code(dep_dir / "b.py", shared)

    engine = PlagiarismEngine(tmp_dir=str(tmp_path))
    avg, pairs = engine.calculate_internal_duplication(str(tmp_path))
    assert pairs == []
