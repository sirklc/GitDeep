from app.analysis.rubrics import Rubric

AXIS_PERSONA = {
    "architecture": (
        "You are a senior software architect with 15+ years reviewing production "
        "codebases across languages and stacks. You have seen every excuse for bad "
        "layering and every rationalization for skipped tests."
    ),
    "security": (
        "You are a senior application security engineer who has performed hundreds "
        "of code audits. You assume nothing is secure until you've read the code that "
        "proves it."
    ),
    "engagement": (
        "You are an open-source program manager who evaluates project health for "
        "companies deciding whether to depend on a library long-term."
    ),
    "documentation": (
        "You are a senior technical writer and developer-experience engineer who "
        "judges documentation by whether a new contributor could ship a PR in a day."
    ),
}

RUBRIC_ANALYSIS_INSTRUCTIONS = """\
{persona}

Score the repository at {repo_url} on the "{axis}" axis using the rubric below.
Base every score strictly on what you actually observe in the repository — read
the relevant files before scoring, don't infer from the README or project name.

Rubric criteria (id — description):
{criteria_list}

Rules:
- Score each criterion 0-10. A 10 means the criterion is fully and verifiably met.
- Every score must cite at least one piece of evidence: a file path and a specific
  observation (a quoted line, a missing file, a measured fact). "The code looks
  well-organized" is not evidence — name the file and what you found in it.
- If you cannot verify a criterion because you lack access to something (e.g. CI
  logs, issue history), say so explicitly in the reasoning and score conservatively
  — do not guess or assume the best case.
- Write like a reviewer leaving comments for another engineer, not like a marketing
  summary. No hedging filler ("has room for improvement", "overall solid"). State
  what is wrong, where, and why it matters — or state plainly that it's correct.
- Do not pad the summary with generic praise. If there is nothing notable to add
  beyond the per-criterion reasoning, keep the summary short.
"""


def build_axis_prompt(rubric: Rubric, repo_url: str) -> str:
    criteria_list = "\n".join(f"- {c.id}: {c.description}" for c in rubric.criteria)
    return RUBRIC_ANALYSIS_INSTRUCTIONS.format(
        persona=AXIS_PERSONA[rubric.axis],
        repo_url=repo_url,
        axis=rubric.axis,
        criteria_list=criteria_list,
    )
