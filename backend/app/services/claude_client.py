"""İki aşamalı Claude analizi.

Aşama 1 (ucuz model): tree + README + manifest'lerden kritik dosyaları seç.
Aşama 2 (güçlü model): RepoReviewer — 0-100 puanlı yapılandırılmış rapor.

ANTHROPIC_API_KEY yoksa deterministik stub döner (dev/test için).
Çıktılar Pydantic ile doğrulanır; bozuk JSON'da bir kez retry edilir.
"""

import json
import re

import structlog
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings

log = structlog.get_logger()


class FileSelection(BaseModel):
    critical_files: list[str] = Field(max_length=5)
    detected_language: str = Field(pattern="^(tr|en)$")
    project_type: str
    selection_reason: str


class Section(BaseModel):
    score: int = Field(ge=0)
    max_score: int
    summary: str
    findings: list[str]


class RepoReview(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    language: str = Field(pattern="^(tr|en)$")
    architecture: Section
    security: Section
    engagement: Section
    documentation: Section
    top_recommendations: list[str] = Field(min_length=3, max_length=3)
    one_line_verdict: str


SELECTOR_SYSTEM = """You are a code triage assistant for an automated repo review service.
Given a repository file tree, README and dependency manifests, pick the 3-5 files
most critical for judging the project's ARCHITECTURE and SECURITY (core logic,
entry points, auth/payment handling — not tests, not config boilerplate).

Also detect the project's primary human language from the README: "tr" for Turkish, "en" otherwise.

Respond ONLY with a JSON object matching this schema, no prose:
{"critical_files": ["path1", ...], "detected_language": "tr|en", "project_type": "short label", "selection_reason": "one sentence"}"""

REVIEWER_SYSTEM = """# SYSTEM PROMPT: RepoReviewer AI

Sen dünyanın en iyi yazılım mimarlarından ve güvenlik uzmanlarından birisin.
Görevin bir GitHub reposunu analiz edip sahibine hem teknik hem profesyonel
kariyer açısından code review yapmaktır. Mentorluk eden, teşvik edici fakat
standartları yüksek bir yazılım mühendisi gibi konuş.

## ANALİZ KRİTERLERİ (toplam 0-100)
1. **Mimari Kalite (0-30):** Separation of concerns, clean code, ölçeklenebilirlik, tasarım desenleri.
2. **Güvenlik (0-30):** <static_findings> içindeki hardcoded secret bulgularını ve bağımlılık listesindeki riskleri (bilinen güvensiz paketler, wildcard/aşırı eski versiyonlar) MUTLAKA değerlendir; koddaki injection/validasyon risklerini incele.
3. **Engagement/Community (0-20):** GitHub istatistikleri, README kalitesi, production-ready sinyalleri.
4. **Dokümantasyon (0-20):** Commit mesajlarının açıklayıcılığı, README profesyonelliği.

## KURALLAR
- Raporu "language" alanında belirtilen dilde yaz (tr veya en).
- Her bölümde somut, koddan kanıtlı gözlemler yap; genel geçer laf etme.
- top_recommendations TAM 3 madde: somut, uygulanabilir, öncelik sırasıyla.
- overall_score dört bölümün toplamıdır.

Respond ONLY with a JSON object matching this schema, no prose:
{"overall_score": int, "language": "tr|en",
 "architecture": {"score": int, "max_score": 30, "summary": str, "findings": [str]},
 "security": {"score": int, "max_score": 30, "summary": str, "findings": [str]},
 "engagement": {"score": int, "max_score": 20, "summary": str, "findings": [str]},
 "documentation": {"score": int, "max_score": 20, "summary": str, "findings": [str]},
 "top_recommendations": [str, str, str], "one_line_verdict": str}"""


def _extract_json(text: str) -> dict:
    """Model çıktısından JSON gövdesini ayıklar (kod bloğu sarmalına toleranslı)."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object in model output")
    return json.loads(text[start : end + 1])


def _call_model(model: str, system: str, user_content: str, max_tokens: int) -> dict:
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    last_error: Exception | None = None
    for attempt in range(2):
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_content}],
        )
        text = "".join(block.text for block in response.content if block.type == "text")
        try:
            return _extract_json(text)
        except (ValueError, json.JSONDecodeError) as exc:
            last_error = exc
            log.warning("llm_json_parse_failed", attempt=attempt, model=model)
    raise RuntimeError(f"Model returned unparseable JSON: {last_error}")


def select_critical_files(
    tree_lines: list[str],
    readme: str,
    manifests: dict[str, str],
) -> FileSelection:
    if not settings.anthropic_api_key:
        return _stub_selection(tree_lines, readme)

    # Tree budama: 3000 satırı aşarsa derinliği kırp
    if len(tree_lines) > 3000:
        tree_lines = [l for l in tree_lines if l.count("/") <= 2][:3000]

    manifest_block = "\n".join(
        f"<manifest path=\"{path}\">\n{content[:4000]}\n</manifest>"
        for path, content in manifests.items()
    )
    user = (
        f"<tree>\n{chr(10).join(tree_lines)}\n</tree>\n\n"
        f"<readme>\n{readme[:8000]}\n</readme>\n\n{manifest_block}"
    )
    data = _call_model(settings.claude_model_select, SELECTOR_SYSTEM, user, max_tokens=1500)
    return FileSelection.model_validate(data)


def review_repo(
    github_stats: dict,
    commit_messages: list[str],
    static_findings: list[dict],
    dependencies: dict[str, list[str]],
    readme: str,
    selected_files: dict[str, str],
    detected_language: str,
) -> RepoReview:
    if not settings.anthropic_api_key:
        return _stub_review(detected_language)

    files_block = "\n".join(
        f"<file path=\"{path}\">\n{content}\n</file>"
        for path, content in selected_files.items()
    )
    deps_block = json.dumps(dependencies, ensure_ascii=False)[:6000]
    user = (
        f"<github_stats>\n{json.dumps(github_stats, ensure_ascii=False)}\n</github_stats>\n\n"
        f"<commit_messages>\n{chr(10).join(commit_messages[:100])}\n</commit_messages>\n\n"
        f"<static_findings>\n{json.dumps(static_findings, ensure_ascii=False)}\n</static_findings>\n\n"
        f"<dependencies>\n{deps_block}\n</dependencies>\n\n"
        f"<readme>\n{readme[:8000]}\n</readme>\n\n"
        f"{files_block}\n\n"
        f"Rapor dili: {detected_language}"
    )
    data = _call_model(settings.claude_model_review, REVIEWER_SYSTEM, user, max_tokens=4000)
    review = RepoReview.model_validate(data)
    # Toplamı bölümlerden yeniden hesapla — model aritmetiğine güvenme
    review.overall_score = min(
        100,
        review.architecture.score
        + review.security.score
        + review.engagement.score
        + review.documentation.score,
    )
    return review


# --- API key'siz deterministik stub'lar (dev + test) ---

def _stub_selection(tree_lines: list[str], readme: str) -> FileSelection:
    candidates = [
        l for l in tree_lines
        if l.endswith((".py", ".ts", ".js", ".go", ".rs"))
        and "test" not in l.lower()
    ][:3]
    lang = "tr" if re.search(r"\b(ve|için|bir|bu)\b", readme[:2000], re.IGNORECASE) else "en"
    return FileSelection(
        critical_files=candidates,
        detected_language=lang,
        project_type="stub",
        selection_reason="ANTHROPIC_API_KEY yok — deterministik stub seçimi",
    )


def _stub_review(language: str) -> RepoReview:
    def section(score: int, max_score: int) -> Section:
        return Section(
            score=score,
            max_score=max_score,
            summary="Stub değerlendirme (API key yapılandırılmadı).",
            findings=["Gerçek analiz için ANTHROPIC_API_KEY ayarlayın."],
        )

    return RepoReview(
        overall_score=70,
        language=language,
        architecture=section(20, 30),
        security=section(22, 30),
        engagement=section(14, 20),
        documentation=section(14, 20),
        top_recommendations=[
            "ANTHROPIC_API_KEY yapılandırın",
            "Bu bir stub rapordur",
            "Gerçek LLM analizi bekleniyor",
        ],
        one_line_verdict="Stub rapor — LLM yapılandırılmadı.",
    )
