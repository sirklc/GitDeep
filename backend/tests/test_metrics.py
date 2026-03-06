import pytest
from app.services.metrics_engine import MetricsEngine

def test_bus_factor_calculation():
    engine = MetricsEngine()
    commits = [
        {"author": "alice", "message": "fix"},
        {"author": "alice", "message": "feat"},
        {"author": "alice", "message": "docs"},
        {"author": "bob", "message": "typo"},
    ]
    
    result = engine.calculate_bus_factor(commits)
    assert result["bus_factor"] == 1
    assert result["total_contributors"] == 2
    assert result["top_contributors"][0]["author"] == "alice"
    assert result["top_contributors"][0]["ownership_pct"] == 75.0

def test_activity_decay_stagnant():
    engine = MetricsEngine()
    # Mocking old dates to show decay
    commits = [
        {"date": "2023-01-01"}, {"date": "2023-01-15"}, {"date": "2023-02-01"},
        {"date": "2023-07-01"}
    ]
    
    result = engine.calculate_activity_decay(commits)
    # The first half (Jan, Feb) has more commits than the second half (July)
    assert result["is_stagnant"] is True

def test_code_quality_heuristic():
    engine = MetricsEngine()
    hotspots = [
        {"filename": "app.py", "changes": 500, "commit_count": 50},
        {"filename": "utils.py", "changes": 20, "commit_count": 2}
    ]
    
    result = engine.calculate_code_quality(hotspots)
    
    # 520 total changes
    # 520 * 0.02 = 10 bugs
    assert result["bugs"] == 10
    
    # 520 * 0.15 = 78 code smells -> Grade B (50 < 78 < 200)
    assert result["sqale_rating"] == "B"
    
def test_empty_commits():
    engine = MetricsEngine()
    
    bf = engine.calculate_bus_factor([])
    assert bf["bus_factor"] == 0
    
    ad = engine.calculate_activity_decay([])
    assert ad["is_stagnant"] is True
    
    cq = engine.calculate_code_quality([])
    assert cq["sqale_rating"] == "A"
