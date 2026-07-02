from app.services.nlp_engine import NLPEngine


def _commits(*messages):
    return [{"message": m} for m in messages]


def test_intent_classification():
    engine = NLPEngine()
    result = engine.analyze_commits(_commits(
        "feat: add new dashboard",
        "fix: resolve login bug",
        "chore: update ci config",
        "docs: update readme",
        "refactor everything",
    ))
    assert result["feature"] == 1
    assert result["fix"] == 1
    assert result["chore"] == 1
    assert result["docs"] == 1
    assert result["other"] == 1


def test_priority_order_feature_wins_over_fix():
    engine = NLPEngine()
    # Message matches both feature ("add") and fix ("bug") keywords;
    # feature branch is checked first.
    result = engine.analyze_commits(_commits("add fix for bug"))
    assert result["feature"] == 1
    assert result["fix"] == 0


def test_tech_debt_ratio():
    engine = NLPEngine()
    result = engine.analyze_commits(_commits(
        "feat: one feature",
        "fix: bug one",
        "fix: bug two",
        "chore: build tweak",
    ))
    # maintenance (2 fix + 1 chore) / 1 feature = 3.0
    assert result["tech_debt_ratio"] == 3.0
    assert result["maintenance_focus"] is True


def test_tech_debt_ratio_no_features():
    engine = NLPEngine()
    result = engine.analyze_commits(_commits("fix: a", "fix: b"))
    # With zero features the raw maintenance count is used
    assert result["tech_debt_ratio"] == 2


def test_empty_commits():
    engine = NLPEngine()
    result = engine.analyze_commits([])
    assert result == {"feature": 0, "fix": 0, "chore": 0, "docs": 0, "other": 0}
