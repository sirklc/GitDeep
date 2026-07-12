from app.analysis.repo_context import SOURCE_SUFFIXES, qualifying_filenames_for_axis
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

File-by-file reporting:
- Beyond the criteria above, produce one `file_reports` entry for every
  qualifying file you actually opened and read in the repository context —
  not only files where you found a problem. A qualifying file is
  {file_report_scope}.
- Do not report on lockfiles, generated/build output, binary or data-only
  files, or any file you did not actually read.
- Every qualifying file present in the repository context must get exactly
  one entry. If a qualifying file has nothing wrong with it for this axis,
  set verdict to "clean" and write one sentence saying what it does right
  (e.g. the pattern it correctly follows) — do not omit it and do not write
  an empty or generic summary.
- If a qualifying file has one or more problems relevant to this axis, set
  verdict to "issues" and summarize the specific problem(s) in 1-3
  sentences, consistent with (never more lenient than) the criterion
  evidence above.
- Do not invent files that are not present in the repository context.
"""


def _file_report_scope(axis: str) -> str:
    extensions = ", ".join(sorted(SOURCE_SUFFIXES))
    filenames = ", ".join(sorted(qualifying_filenames_for_axis(axis)))
    return (
        f"any file with one of these extensions ({extensions}), plus these "
        f"filenames when present in the repository ({filenames})"
    )


def build_axis_prompt(rubric: Rubric, repo_url: str) -> str:
    criteria_list = "\n".join(f"- {c.id}: {c.description}" for c in rubric.criteria)
    return RUBRIC_ANALYSIS_INSTRUCTIONS.format(
        persona=AXIS_PERSONA[rubric.axis],
        repo_url=repo_url,
        axis=rubric.axis,
        criteria_list=criteria_list,
        file_report_scope=_file_report_scope(rubric.axis),
    )
