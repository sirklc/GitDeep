"""GitHub API üzerinden metadata + repo boyutu (kredi tarifesi için)."""

import re

from github import Auth, Github, GithubException

from app.core.config import settings

REPO_URL_RE = re.compile(
    r"^https?://github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?/?$"
)


class RepoNotFound(Exception):
    pass


class RepoNotPublic(Exception):
    pass


def parse_repo_url(url: str) -> tuple[str, str]:
    match = REPO_URL_RE.match(url.strip())
    if not match:
        raise ValueError("Invalid GitHub repository URL")
    return match.group(1), match.group(2)


def _client() -> Github:
    if settings.github_pat:
        return Github(auth=Auth.Token(settings.github_pat))
    return Github()


def get_repo_overview(owner: str, repo_name: str) -> dict:
    """Boyut (MB) + metadata. Private/bulunamayan repo için hata fırlatır."""
    gh = _client()
    try:
        repo = gh.get_repo(f"{owner}/{repo_name}")
    except GithubException as exc:
        if exc.status == 404:
            raise RepoNotFound(f"{owner}/{repo_name}") from exc
        raise
    if repo.private:
        raise RepoNotPublic(f"{owner}/{repo_name}")

    return {
        "full_name": repo.full_name,
        "description": repo.description or "",
        "size_mb": round(repo.size / 1024, 2),  # API size KB döner
        "stars": repo.stargazers_count,
        "forks": repo.forks_count,
        "open_issues": repo.open_issues_count,
        "watchers": repo.subscribers_count,
        "language": repo.language or "",
        "license": repo.license.spdx_id if repo.license else None,
        "default_branch": repo.default_branch,
        "created_at": repo.created_at.isoformat() if repo.created_at else None,
        "pushed_at": repo.pushed_at.isoformat() if repo.pushed_at else None,
        "clone_url": repo.clone_url,
    }


def get_commit_messages(owner: str, repo_name: str, limit: int = 100) -> list[str]:
    gh = _client()
    repo = gh.get_repo(f"{owner}/{repo_name}")
    messages: list[str] = []
    for commit in repo.get_commits()[:limit]:
        first_line = (commit.commit.message or "").splitlines()
        messages.append(first_line[0][:200] if first_line else "")
    return messages


def get_contributor_count(owner: str, repo_name: str) -> int:
    gh = _client()
    repo = gh.get_repo(f"{owner}/{repo_name}")
    contributors = repo.get_contributors()
    # İlk sayfayla yetin — büyük repolarda tam sayım pahalı.
    count = 0
    for _ in contributors[:100]:
        count += 1
    return count
