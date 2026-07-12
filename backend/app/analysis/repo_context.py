import subprocess
import tempfile
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    "dist",
    "build",
    ".next",
    "target",
    "vendor",
}

PRIORITY_FILENAMES = (
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "go.mod",
    "Cargo.toml",
    "Dockerfile",
    "docker-compose.yml",
    "README.md",
    "README.rst",
    "README",
)


def qualifying_filenames_for_axis(axis: str) -> set[str]:
    """Filenames (outside SOURCE_SUFFIXES) that qualify for per-file reporting
    on the given axis. Manifests/Dockerfiles carry architecture-relevant
    signal on every axis; README* only qualifies when the axis is
    documentation.
    """
    readme_names = {name for name in PRIORITY_FILENAMES if name.startswith("README")}
    manifest_names = set(PRIORITY_FILENAMES) - readme_names
    return manifest_names | (readme_names if axis == "documentation" else set())


BINARY_SUFFIXES = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg",
    ".pdf", ".zip", ".tar", ".gz", ".woff", ".woff2", ".ttf", ".eot",
    ".mp4", ".mp3", ".wav", ".so", ".dylib", ".dll", ".pyc", ".bin",
    ".lock",
}

# Auto-generated, high-volume, low-signal for architecture review — would
# otherwise crowd out actual source files within the context budget.
EXCLUDED_FILENAMES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "Cargo.lock",
    "poetry.lock",
    "Pipfile.lock",
    "composer.lock",
    "Gemfile.lock",
}

SOURCE_SUFFIXES = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rb", ".java",
    ".rs", ".c", ".cpp", ".h", ".hpp", ".cs", ".php", ".kt", ".swift",
}

# Caps any single file's share of the context budget so one large file
# (e.g. a generated migration or a big config) can't starve the rest.
MAX_CHARS_PER_FILE = 20_000


class RepoCloneError(Exception):
    pass


@contextmanager
def clone_repo(repo_url: str) -> Iterator[Path]:
    if not repo_url.startswith("https://"):
        raise RepoCloneError("repo_url must use https://")

    with tempfile.TemporaryDirectory(prefix="gitdeep-clone-") as tmp_dir:
        try:
            subprocess.run(
                ["git", "clone", "--depth", "1", repo_url, tmp_dir],
                capture_output=True,
                text=True,
                timeout=60,
                check=True,
            )
        except subprocess.CalledProcessError as exc:
            raise RepoCloneError(f"git clone failed: {exc.stderr.strip()}") from exc
        except subprocess.TimeoutExpired as exc:
            raise RepoCloneError("git clone timed out after 60s") from exc

        yield Path(tmp_dir)


def _iter_files(repo_path: Path) -> Iterator[Path]:
    for path in sorted(repo_path.rglob("*")):
        if not path.is_file():
            continue
        if any(part in EXCLUDED_DIRS for part in path.relative_to(repo_path).parts):
            continue
        if path.suffix.lower() in BINARY_SUFFIXES:
            continue
        if path.name in EXCLUDED_FILENAMES:
            continue
        yield path


def _build_tree(repo_path: Path, files: list[Path]) -> str:
    lines = [str(f.relative_to(repo_path)) for f in files]
    return "\n".join(lines)


def build_repo_context(repo_path: Path, max_chars: int = 240_000) -> str:
    files = list(_iter_files(repo_path))

    tree = _build_tree(repo_path, files)
    sections = [f"## File tree\n{tree}"]
    budget = max_chars - len(tree)

    def priority_key(f: Path) -> tuple[int, int, int]:
        try:
            manifest_rank = PRIORITY_FILENAMES.index(f.name)
            return (0, manifest_rank, 0)
        except ValueError:
            pass
        tier = 1 if f.suffix.lower() in SOURCE_SUFFIXES else 2
        return (tier, 0, len(f.relative_to(repo_path).parts))

    for file in sorted(files, key=priority_key):
        if budget <= 0:
            break
        try:
            content = file.read_text(encoding="utf-8", errors="strict")
        except (UnicodeDecodeError, OSError):
            continue

        rel_path = file.relative_to(repo_path)
        truncated = content[: min(budget, MAX_CHARS_PER_FILE)]
        block = f"\n\n## {rel_path}\n```\n{truncated}\n```"
        sections.append(block)
        budget -= len(block)

    return "\n".join(sections)
