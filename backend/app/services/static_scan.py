"""Hafif statik güvenlik taraması: secret regex seti + dependency manifest parse.

Secret değerleri MASKELİ raporlanır — tam değer asla LLM'e, DB'ye veya
rapora yazılmaz.
"""

import json
import re
from dataclasses import dataclass, field

# (kural adı, derlenmiş regex) — gitleaks'in en yaygın kuralları
SECRET_RULES: list[tuple[str, re.Pattern]] = [
    ("AWS Access Key", re.compile(r"\b(AKIA[0-9A-Z]{16})\b")),
    ("GitHub Token", re.compile(r"\b(gh[pousr]_[A-Za-z0-9]{36,255})\b")),
    ("Stripe Live Key", re.compile(r"\b(sk_live_[A-Za-z0-9]{20,})\b")),
    ("Slack Token", re.compile(r"\b(xox[baprs]-[A-Za-z0-9-]{10,})\b")),
    ("Anthropic Key", re.compile(r"\b(sk-ant-[A-Za-z0-9_-]{20,})\b")),
    ("OpenAI Key", re.compile(r"\b(sk-[A-Za-z0-9]{40,})\b")),
    ("Private Key Block", re.compile(r"(-----BEGIN [A-Z ]*PRIVATE KEY-----)")),
    (
        "Generic Secret",
        re.compile(
            r"""(?i)\b(?:api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['"]([^'"]{12,})['"]"""
        ),
    ),
]

# Tarama dışı yollar: örnek env'ler, test fixture'ları, lock/vendor dosyaları
SKIP_PATH_RE = re.compile(
    r"(\.env\.example|\.env\.sample|test|spec|fixture|mock|vendor/|node_modules/|"
    r"\.lock$|-lock\.|\.min\.(js|css)$|\.map$)",
    re.IGNORECASE,
)

TEXT_EXTENSIONS = {
    ".py", ".js", ".ts", ".tsx", ".jsx", ".go", ".rs", ".rb", ".php", ".java",
    ".kt", ".swift", ".c", ".h", ".cpp", ".cs", ".sh", ".bash", ".zsh",
    ".yml", ".yaml", ".json", ".toml", ".ini", ".cfg", ".conf", ".env",
    ".md", ".txt", ".xml", ".properties", ".tf", ".sql",
}

MANIFEST_FILES = {
    "package.json", "requirements.txt", "pyproject.toml", "go.mod",
    "Cargo.toml", "composer.json", "Gemfile", "build.gradle", "pom.xml",
}


@dataclass
class SecretFinding:
    rule: str
    file: str
    line: int
    masked: str


@dataclass
class ScanResult:
    secrets: list[SecretFinding] = field(default_factory=list)
    dependencies: dict[str, list[str]] = field(default_factory=dict)
    scanned_files: int = 0


def mask_secret(value: str) -> str:
    if len(value) <= 8:
        return "****"
    return f"{value[:4]}****...{value[-2:]}"


def is_scannable(path: str) -> bool:
    if SKIP_PATH_RE.search(path):
        return False
    name = path.rsplit("/", 1)[-1]
    if name in MANIFEST_FILES or name.startswith(".env"):
        return True
    dot = name.rfind(".")
    return dot != -1 and name[dot:].lower() in TEXT_EXTENSIONS


def scan_content(path: str, content: str) -> list[SecretFinding]:
    findings: list[SecretFinding] = []
    for line_no, line in enumerate(content.splitlines(), start=1):
        if len(line) > 2000:
            continue  # minified/generated satır
        for rule_name, pattern in SECRET_RULES:
            for match in pattern.finditer(line):
                findings.append(
                    SecretFinding(
                        rule=rule_name,
                        file=path,
                        line=line_no,
                        masked=mask_secret(match.group(1)),
                    )
                )
    return findings


def parse_manifest(path: str, content: str) -> list[str] | None:
    """Manifest'ten 'isim@versiyon' listesi çıkarır; manifest değilse None."""
    name = path.rsplit("/", 1)[-1]
    try:
        if name == "package.json":
            data = json.loads(content)
            deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
            return [f"{k}@{v}" for k, v in sorted(deps.items())]
        if name == "requirements.txt":
            return [
                line.strip()
                for line in content.splitlines()
                if line.strip() and not line.strip().startswith(("#", "-"))
            ]
        if name == "pyproject.toml":
            deps = re.findall(r'"([A-Za-z0-9_.\[\]-]+[><=~!]{1,2}[^"]*)"', content)
            return deps or None
        if name == "go.mod":
            return re.findall(r"^\t([^\s]+ v[^\s]+)", content, re.MULTILINE)
        if name == "Cargo.toml":
            return re.findall(r'^([A-Za-z0-9_-]+)\s*=\s*"([^"]+)"', content, re.MULTILINE) and [
                f"{m[0]}@{m[1]}"
                for m in re.findall(r'^([A-Za-z0-9_-]+)\s*=\s*"([^"]+)"', content, re.MULTILINE)
            ]
        if name in ("composer.json",):
            data = json.loads(content)
            deps = {**data.get("require", {}), **data.get("require-dev", {})}
            return [f"{k}@{v}" for k, v in sorted(deps.items())]
        if name == "Gemfile":
            return re.findall(r"gem ['\"]([^'\"]+)['\"]", content)
    except (json.JSONDecodeError, ValueError):
        return None
    return None
