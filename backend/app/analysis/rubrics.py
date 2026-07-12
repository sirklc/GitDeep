from dataclasses import dataclass


@dataclass(frozen=True)
class Criterion:
    id: str
    title: str
    description: str
    weight: float


@dataclass(frozen=True)
class Rubric:
    axis: str
    criteria: tuple[Criterion, ...]

    def __post_init__(self) -> None:
        total = round(sum(c.weight for c in self.criteria), 4)
        if total != 1.0:
            raise ValueError(f"{self.axis} rubric weights sum to {total}, expected 1.0")

    def weighted_score(self, criterion_scores: dict[str, int]) -> float:
        weights_by_id = {c.id: c.weight for c in self.criteria}
        if weights_by_id.keys() != criterion_scores.keys():
            missing = weights_by_id.keys() ^ criterion_scores.keys()
            raise ValueError(f"{self.axis} scores don't match rubric criteria: {missing}")
        fraction = sum(criterion_scores[cid] / 10 * weight for cid, weight in weights_by_id.items())
        return round(fraction * AXIS_MAX_SCORE[self.axis], 2)


ARCHITECTURE = Rubric(
    axis="architecture",
    criteria=(
        Criterion(
            id="separation_of_concerns",
            title="Separation of concerns",
            description=(
                "Business logic, data access, and API/presentation layers live in "
                "distinct modules rather than being mixed in the same file or function."
            ),
            weight=0.25,
        ),
        Criterion(
            id="dependency_direction",
            title="Dependency direction",
            description=(
                "Dependencies point toward abstractions/inward layers; no circular "
                "imports between modules."
            ),
            weight=0.20,
        ),
        Criterion(
            id="test_coverage_signal",
            title="Test coverage signal",
            description=(
                "Tests exist for core logic and are proportionate to the codebase size; "
                "CI actually runs them."
            ),
            weight=0.20,
        ),
        Criterion(
            id="error_handling_consistency",
            title="Error handling consistency",
            description=(
                "A single, consistent error/exception handling strategy is used across "
                "the codebase rather than ad-hoc try/except patterns per file."
            ),
            weight=0.15,
        ),
        Criterion(
            id="configuration_management",
            title="Configuration management",
            description=(
                "Secrets and environment-specific config are read from environment "
                "variables via a single settings source, never hardcoded."
            ),
            weight=0.20,
        ),
    ),
)

SECURITY = Rubric(
    axis="security",
    criteria=(
        Criterion(
            id="secret_handling",
            title="Secret handling",
            description="No hardcoded credentials, API keys, or tokens in source or git history.",
            weight=0.25,
        ),
        Criterion(
            id="dependency_vulnerabilities",
            title="Dependency vulnerabilities",
            description="No known-vulnerable dependency versions per a dependency scan.",
            weight=0.20,
        ),
        Criterion(
            id="input_validation",
            title="Input validation",
            description="User input is validated/sanitized at every trust boundary.",
            weight=0.20,
        ),
        Criterion(
            id="auth_authorization",
            title="Authentication & authorization",
            description=(
                "Auth is implemented with standard, vetted mechanisms (not homegrown "
                "crypto), with correct access-control checks on protected routes."
            ),
            weight=0.20,
        ),
        Criterion(
            id="transport_and_storage_security",
            title="Transport & storage security",
            description="HTTPS is enforced and sensitive data is encrypted at rest where relevant.",
            weight=0.15,
        ),
    ),
)

ENGAGEMENT = Rubric(
    axis="engagement",
    criteria=(
        Criterion(
            id="issue_response_time",
            title="Issue response time",
            description="Median time to first maintainer response on issues is reasonable.",
            weight=0.25,
        ),
        Criterion(
            id="contribution_guidelines",
            title="Contribution guidelines",
            description="CONTRIBUTING.md, a code of conduct, and a PR template are present.",
            weight=0.20,
        ),
        Criterion(
            id="release_cadence",
            title="Release cadence",
            description="Regular tagged releases with a maintained changelog.",
            weight=0.20,
        ),
        Criterion(
            id="maintainer_activity",
            title="Maintainer activity & bus factor",
            description="Recent commit activity from more than a single active contributor.",
            weight=0.20,
        ),
        Criterion(
            id="external_contributor_ratio",
            title="External contributor ratio",
            description="A meaningful share of merged PRs come from non-owner contributors.",
            weight=0.15,
        ),
    ),
)

DOCUMENTATION = Rubric(
    axis="documentation",
    criteria=(
        Criterion(
            id="readme_completeness",
            title="README completeness",
            description="Install, quickstart, usage, and license sections are present and accurate.",
            weight=0.30,
        ),
        Criterion(
            id="api_reference",
            title="API reference",
            description="Public API/endpoints are documented.",
            weight=0.20,
        ),
        Criterion(
            id="architecture_docs",
            title="Architecture documentation",
            description="A high-level design/architecture explanation exists beyond the README.",
            weight=0.20,
        ),
        Criterion(
            id="inline_documentation",
            title="Inline documentation",
            description=(
                "Non-obvious code carries explanatory comments where needed, without "
                "being over-commented."
            ),
            weight=0.15,
        ),
        Criterion(
            id="changelog_and_versioning",
            title="Changelog & versioning",
            description="A CHANGELOG is maintained and semantic versioning is followed.",
            weight=0.15,
        ),
    ),
)

ALL_RUBRICS: tuple[Rubric, ...] = (ARCHITECTURE, SECURITY, ENGAGEMENT, DOCUMENTATION)
RUBRICS_BY_AXIS: dict[str, Rubric] = {r.axis: r for r in ALL_RUBRICS}

# Matches the per-axis max score already used in the frontend dashboard mock
# (frontend/src/lib/dashboard-mock.ts): architecture/security out of 30, engagement/documentation out of 20.
AXIS_MAX_SCORE = {
    "architecture": 30,
    "security": 30,
    "engagement": 20,
    "documentation": 20,
}
