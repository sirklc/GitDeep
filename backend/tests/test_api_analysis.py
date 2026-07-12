import json
from contextlib import contextmanager
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.analysis.rubrics import ARCHITECTURE
from app.api.deps import get_current_user
from app.db.database import Base, get_db
from app.db.models import AnalysisJob, User
from app.main import app
from app.tasks import analysis_tasks


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


@pytest.fixture
def client(session_factory, monkeypatch):
    def _override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    fake_user = User(id=1, email="dev@example.com", hashed_password="x", locale="en")

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_current_user] = lambda: fake_user
    monkeypatch.setattr(analysis_tasks.orchestrate_analysis, "delay", lambda job_id: None)

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_submit_job_creates_queued_row(client, session_factory):
    response = client.post("/api/analysis/jobs", json={"repo_url": "https://github.com/example/repo"})

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "queued"

    session = session_factory()
    job = session.get(AnalysisJob, body["job_id"])
    assert job is not None
    assert job.repo_url == "https://github.com/example/repo"
    assert job.user_id == 1


def test_get_job_returns_404_for_unknown_job(client):
    response = client.get("/api/analysis/jobs/999")
    assert response.status_code == 404


def test_get_job_returns_404_for_other_users_job(client, session_factory):
    session = session_factory()
    job = AnalysisJob(repo_url="https://github.com/example/repo", user_id=2, status="completed")
    session.add(job)
    session.commit()
    session.refresh(job)
    job_id = job.id
    session.close()

    response = client.get(f"/api/analysis/jobs/{job_id}")
    assert response.status_code == 404


def test_get_job_returns_owned_job(client, session_factory):
    session = session_factory()
    job = AnalysisJob(
        repo_url="https://github.com/example/repo",
        user_id=1,
        status="completed",
        overall_score=75.5,
    )
    session.add(job)
    session.commit()
    session.refresh(job)
    job_id = job.id
    session.close()

    response = client.get(f"/api/analysis/jobs/{job_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["overall_score"] == 75.5


def test_get_job_report_returns_pdf_for_completed_job(monkeypatch, client, session_factory):
    monkeypatch.setattr("app.api.analysis.render_analysis_report_pdf", lambda job: b"%PDF-fake")

    session = session_factory()
    job = AnalysisJob(repo_url="https://github.com/example/repo", user_id=1, status="completed")
    session.add(job)
    session.commit()
    session.refresh(job)
    job_id = job.id
    session.close()

    response = client.get(f"/api/analysis/jobs/{job_id}/report")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content == b"%PDF-fake"
    assert f"gitdeep-report-{job_id}.pdf" in response.headers["content-disposition"]


def test_get_job_report_returns_409_for_incomplete_job(client, session_factory):
    session = session_factory()
    job = AnalysisJob(repo_url="https://github.com/example/repo", user_id=1, status="processing")
    session.add(job)
    session.commit()
    session.refresh(job)
    job_id = job.id
    session.close()

    response = client.get(f"/api/analysis/jobs/{job_id}/report")

    assert response.status_code == 409


def test_get_job_report_returns_404_for_other_users_job(client, session_factory):
    session = session_factory()
    job = AnalysisJob(repo_url="https://github.com/example/repo", user_id=2, status="completed")
    session.add(job)
    session.commit()
    session.refresh(job)
    job_id = job.id
    session.close()

    response = client.get(f"/api/analysis/jobs/{job_id}/report")

    assert response.status_code == 404


def test_test_run_endpoint_still_works_with_mocked_claude(monkeypatch, client):
    @contextmanager
    def _fake_clone_repo(repo_url):
        yield Path("/fake/repo")

    def _fake_stream(**kwargs):
        payload = json.dumps(
            {
                "axis": "architecture",
                "criteria": [
                    {"criterion_id": c.id, "score": 6, "evidence": [], "reasoning": "ok"}
                    for c in ARCHITECTURE.criteria
                ],
                "file_reports": [{"file_path": "a.py", "verdict": "clean", "summary": "ok"}],
                "summary": "fine",
            }
        )
        message = SimpleNamespace(stop_reason="end_turn", content=[SimpleNamespace(type="text", text=payload)])

        @contextmanager
        def _cm():
            yield SimpleNamespace(get_final_message=lambda: message)

        return _cm()

    monkeypatch.setattr("app.api.analysis.clone_repo", _fake_clone_repo)
    monkeypatch.setattr("app.api.analysis.build_repo_context", lambda repo_path: "context")
    monkeypatch.setattr("app.analysis.claude_client._client.messages.stream", _fake_stream)

    response = client.post("/api/analysis/test-run", json={"repo_url": "https://github.com/example/repo"})

    assert response.status_code == 200
    body = response.json()
    assert body["file_reports"][0]["file_path"] == "a.py"
