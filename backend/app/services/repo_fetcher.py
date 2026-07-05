"""Repo klonlama ve SADECE statik okuma.

Güvenlik ilkeleri:
- `git clone --bare --depth=1`: working tree yok, tek commit — klonlanan koddan
  hiçbir şey execute edilmez, sadece git objeleri okunur.
- İnteraktif prompt'lar kapalı (GIT_TERMINAL_PROMPT=0), timeout zorunlu.
- İş bitince klon dizini silinir (çağıran sorumlu, cleanup() ile).
"""

import shutil
import subprocess
import tempfile
from pathlib import Path

from app.core.config import settings

_GIT_ENV = {
    "GIT_TERMINAL_PROMPT": "0",
    "GIT_ASKPASS": "echo",
    "HOME": "/tmp",
}


class CloneError(Exception):
    pass


def clone_bare(clone_url: str) -> str:
    """Bare+shallow klon açar, klon dizin yolunu döner."""
    dest = tempfile.mkdtemp(prefix="gitdeep_clone_")
    try:
        subprocess.run(
            [
                "git", "clone", "--bare", "--depth=1",
                "--config", "transfer.fsckObjects=true",
                clone_url, dest,
            ],
            env=_GIT_ENV,
            capture_output=True,
            timeout=settings.clone_timeout_seconds,
            check=True,
        )
    except subprocess.TimeoutExpired as exc:
        shutil.rmtree(dest, ignore_errors=True)
        raise CloneError("Clone timed out") from exc
    except subprocess.CalledProcessError as exc:
        shutil.rmtree(dest, ignore_errors=True)
        raise CloneError(exc.stderr.decode(errors="replace")[:500]) from exc
    return dest


def cleanup(repo_dir: str) -> None:
    shutil.rmtree(repo_dir, ignore_errors=True)


def list_tree(repo_dir: str) -> list[tuple[str, int]]:
    """(path, byte) listesi. HEAD ağacındaki tüm dosyalar."""
    result = subprocess.run(
        ["git", "ls-tree", "-r", "-l", "HEAD"],
        cwd=repo_dir,
        env=_GIT_ENV,
        capture_output=True,
        timeout=30,
        check=True,
    )
    entries: list[tuple[str, int]] = []
    for line in result.stdout.decode(errors="replace").splitlines():
        # format: <mode> <type> <hash> <size>\t<path>
        try:
            meta, path = line.split("\t", 1)
            parts = meta.split()
            if parts[1] != "blob":
                continue
            size = int(parts[3]) if parts[3] != "-" else 0
            entries.append((path, size))
        except (ValueError, IndexError):
            continue
    return entries


def read_blob(repo_dir: str, path: str, max_kb: int | None = None) -> str | None:
    """Dosya içeriğini string döner; binary ise None."""
    limit_kb = max_kb if max_kb is not None else settings.max_file_read_kb
    try:
        result = subprocess.run(
            ["git", "cat-file", "blob", f"HEAD:{path}"],
            cwd=repo_dir,
            env=_GIT_ENV,
            capture_output=True,
            timeout=30,
            check=True,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    data = result.stdout[: limit_kb * 1024]
    if b"\x00" in data:
        return None  # binary
    return data.decode("utf-8", errors="replace")
