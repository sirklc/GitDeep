from contextlib import contextmanager
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.analysis.repo_context import RepoCloneError
from app.analysis.schemas import AxisResult, CriterionResult, FileReport
from app.db.database import Base
from app.db.models import AnalysisJob
from app.tasks import analysis_tasks


@pytest.fixture(autouse=True)
def eager_celery():
    analysis_tasks.celery_app.conf.task_always_eager = True
    analysis_tasks.celery_app.conf.task_eager_propagates = True
    yield
    analysis_tasks.celery_app.conf.task_always_eager = False
    analysis_tasks.celery_app.conf.task_eager_propagates = False


@pytest.fixture
def session_factory():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    yield factory
    engine.dispose()


@pytest.fixture(autouse=True)
def patched_session_local(monkeypatch, session_factory):
    monkeypatch.setattr(analysis_tasks, "SessionLocal", session_factory)
    return session_factory


def _create_job(session_factory, repo_url="https://github.com/example/repo") -> int:
    session = session_factory()
    job = AnalysisJob(repo_url=repo_url, status="queued")
    session.add(job)
    session.commit()
    session.refresh(job)
    job_id = job.id
    session.close()
    return job_id


def _fake_run_axis_analysis(rubric, repo_url, repo_context):
    scores = {c.id: 7 for c in rubric.criteria}
    return AxisResult(
        axis=rubric.axis,
        criteria=[
            CriterionResult(criterion_id=cid, score=score, evidence=[], reasoning="ok")
            for cid, score in scores.items()
        ],
        file_reports=[FileReport(file_path="a.py", verdict="clean", summary="ok")],
        weighted_score=rubric.weighted_score(scores),
        summary="fine",
    )


def test_run_axis_task_returns_result_payload_on_success(monkeypatch):
    monkeypatch.setattr(analysis_tasks, "run_axis_analysis", _fake_run_axis_analysis)

    payload = analysis_tasks.run_axis_task("architecture", "https://github.com/example/repo", "context")

    assert payload["axis"] == "architecture"
    assert "error" not in payload
    assert payload["result"]["file_reports"][0]["file_path"] == "a.py"


def test_aggregate_results_task_marks_completed_on_success(session_factory):
    job_id = _create_job(session_factory)
    payloads = [
        {"axis": axis, "result": _fake_run_axis_analysis(rubric, "repo", "ctx").model_dump(mode="json")}
        for axis, rubric in analysis_tasks.RUBRICS_BY_AXIS.items()
    ]

    analysis_tasks.aggregate_results_task(payloads, job_id)

    session = session_factory()
    job = session.get(AnalysisJob, job_id)
    assert job.status == "completed"
    assert job.completed_at is not None
    assert len(job.axes) == 4
    assert all(axis["file_reports"] for axis in job.axes)
    assert job.overall_score is not None


def test_aggregate_results_task_marks_failed_on_error_payload(session_factory):
    job_id = _create_job(session_factory)
    payloads = [{"axis": "architecture", "error": "Claude API: rate limited (boom)"}]

    analysis_tasks.aggregate_results_task(payloads, job_id)

    session = session_factory()
    job = session.get(AnalysisJob, job_id)
    assert job.status == "failed"
    assert "rate limited" in job.error
    assert job.completed_at is not None


def test_orchestrate_analysis_end_to_end_marks_completed(monkeypatch, session_factory):
    job_id = _create_job(session_factory)

    @contextmanager
    def _fake_clone_repo(repo_url):
        yield Path("/fake/repo")

    monkeypatch.setattr(analysis_tasks, "clone_repo", _fake_clone_repo)
    monkeypatch.setattr(analysis_tasks, "build_repo_context", lambda repo_path: "fake context")
    monkeypatch.setattr(analysis_tasks, "run_axis_analysis", _fake_run_axis_analysis)

    analysis_tasks.orchestrate_analysis(job_id)

    session = session_factory()
    job = session.get(AnalysisJob, job_id)
    assert job.status == "completed"
    assert len(job.axes) == 4


def test_orchestrate_analysis_marks_failed_on_clone_error(monkeypatch, session_factory):
    job_id = _create_job(session_factory)

    @contextmanager
    def _failing_clone_repo(repo_url):
        raise RepoCloneError("git clone failed: repository not found")
        yield  # pragma: no cover

    monkeypatch.setattr(analysis_tasks, "clone_repo", _failing_clone_repo)

    analysis_tasks.orchestrate_analysis(job_id)

    session = session_factory()
    job = session.get(AnalysisJob, job_id)
    assert job.status == "failed"
    assert "not found" in job.error
