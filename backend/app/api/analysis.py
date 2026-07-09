from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.analysis.claude_client import AnalysisError, run_axis_analysis
from app.analysis.repo_context import RepoCloneError, build_repo_context, clone_repo
from app.analysis.rubrics import ARCHITECTURE
from app.analysis.schemas import AxisResult

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class AnalysisTestRunRequest(BaseModel):
    repo_url: str


@router.post("/test-run", response_model=AxisResult)
def test_run(body: AnalysisTestRunRequest) -> AxisResult:
    try:
        with clone_repo(body.repo_url) as repo_path:
            context = build_repo_context(repo_path)
    except RepoCloneError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        return run_axis_analysis(ARCHITECTURE, body.repo_url, context)
    except AnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
