"""
Integration Tests — Correlation Engine
Tests: RuleLoader, RiskScorer, AlertGenerator, StateManager, end-to-end pipeline
"""
import sys, os, time, json, uuid
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rule_loader import RuleLoader
from risk_scorer import RiskScorer
from rule_engine import RuleEvaluator

RESULTS = []

def run(name, fn):
    try:
        fn()
        RESULTS.append(("PASS", name))
        print(f"  ✅ PASS  {name}")
    except AssertionError as e:
        RESULTS.append(("FAIL", name, str(e)))
        print(f"  ❌ FAIL  {name}: {e}")
    except Exception as e:
        RESULTS.append(("ERROR", name, str(e)))
        print(f"  💥 ERROR {name}: {e}")


# ── RuleLoader Tests ──────────────────────────────────────────────────────────

def test_loader_loads_rules():
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rules")
    loader = RuleLoader(rules_dir)
    rules = loader.get_rules()
    assert len(rules) > 0, f"Expected >0 rules, got {len(rules)}"

def test_loader_all_have_required_keys():
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rules")
    loader = RuleLoader(rules_dir)
    required = {"rule_id", "name", "severity", "mitre_tactic", "logic"}
    for rule in loader.get_rules():
        missing = required - set(rule.keys())
        assert not missing, f"Rule {rule.get('rule_id')} missing keys: {missing}"

def test_loader_severity_values_valid():
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rules")
    loader = RuleLoader(rules_dir)
    valid = {"critical", "high", "medium", "low", "info"}
    for rule in loader.get_rules():
        sev = str(rule.get("severity", "")).lower()
        assert sev in valid, f"Rule {rule.get('rule_id')} has invalid severity: {sev}"

def test_loader_rule_ids_unique():
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rules")
    loader = RuleLoader(rules_dir)
    ids = [r["rule_id"] for r in loader.get_rules()]
    assert len(ids) == len(set(ids)), f"Duplicate rule IDs found: {set(x for x in ids if ids.count(x)>1)}"

def test_loader_missing_dir():
    loader = RuleLoader("/nonexistent/path")
    assert loader.get_rules() == []

def test_loader_brute_force_rule_exists():
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rules")
    loader = RuleLoader(rules_dir)
    ids = {r["rule_id"] for r in loader.get_rules()}
    assert "SIEM-001" in ids, "Brute force rule SIEM-001 not found"

def test_loader_logic_field_present():
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rules")
    loader = RuleLoader(rules_dir)
    for rule in loader.get_rules():
        assert isinstance(rule["logic"], dict), f"Rule {rule.get('rule_id')}: logic must be a dict"


# ── RiskScorer Tests ──────────────────────────────────────────────────────────

class MockHTTP:
    """Intercepts httpx.post calls to avoid real network requests."""
    def __init__(self):
        self.calls = []
    def __call__(self, url, json=None, timeout=None):
        self.calls.append({"url": url, "body": json})
        class R:
            status_code = 200
        return R()

def test_risk_scorer_critical_weight():
    import risk_scorer as rs_module
    orig = getattr(rs_module.httpx, "post", None)
    interceptor = MockHTTP()
    rs_module.httpx.post = interceptor
    try:
        scorer = RiskScorer()
        scorer.fastapi_url = "http://mock"
        scorer.update_asset_score({
            "entity": "10.0.0.5",
            "severity": "critical",
            "alert_id": "ALT-TEST01",
            "mitre_technique": "T1110"
        })
        assert len(interceptor.calls) == 1
        assert interceptor.calls[0]["body"]["added_risk"] == 40
    finally:
        if orig:
            rs_module.httpx.post = orig

def test_risk_scorer_high_weight():
    import risk_scorer as rs_module
    interceptor = MockHTTP()
    rs_module.httpx.post = interceptor
    scorer = RiskScorer()
    scorer.fastapi_url = "http://mock"
    scorer.update_asset_score({"entity": "host1", "severity": "high", "alert_id": "X", "mitre_technique": "T1"})
    assert interceptor.calls[0]["body"]["added_risk"] == 25

def test_risk_scorer_skips_unknown_entity():
    import risk_scorer as rs_module
    interceptor = MockHTTP()
    rs_module.httpx.post = interceptor
    scorer = RiskScorer()
    scorer.update_asset_score({"entity": "unknown", "severity": "critical"})
    assert len(interceptor.calls) == 0

def test_risk_scorer_skips_empty_entity():
    import risk_scorer as rs_module
    interceptor = MockHTTP()
    rs_module.httpx.post = interceptor
    scorer = RiskScorer()
    scorer.update_asset_score({"severity": "high"})
    assert len(interceptor.calls) == 0


# ── End-to-End Pipeline Tests ─────────────────────────────────────────────────

class MockStateManager:
    def __init__(self):
        self._store = {}
        self._seq = {}
    def track_event(self, threshold_key, event_id, window_seconds):
        self._store.setdefault(threshold_key, [])
        now = time.time()
        self._store[threshold_key].append((now, event_id))
        self._store[threshold_key] = [(t, e) for t, e in self._store[threshold_key] if t >= now - window_seconds]
        return len(self._store[threshold_key])
    def get_sequence_step(self, key): return self._seq.get(key, 0)
    def set_sequence_step(self, key, step, window): self._seq[key] = step
    def clear_sequence(self, key): self._seq.pop(key, None)
    def is_suppressed(self, *a): return False
    def suppress_alert(self, *a): pass

def test_e2e_brute_force_threshold():
    """5 failed login events from same IP should trigger SIEM-001"""
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rules")
    loader = RuleLoader(rules_dir)
    rules = {r["rule_id"]: r for r in loader.get_rules()}
    assert "SIEM-001" in rules, "SIEM-001 not loaded"

    sm = MockStateManager()
    evaluator = RuleEvaluator(sm)
    rule = rules["SIEM-001"]

    event = {"source_ip": "185.15.20.47", "mitre": {"technique_id": "T1110"}}
    fires = []
    for i in range(6):
        matched = evaluator.evaluate(event, rule)
        fires.append(matched)

    assert any(fires), "Brute force rule never fired after 6 events"
    assert fires[4] is True or fires[5] is True, "Should fire at or after 5th event"

def test_e2e_all_rules_evaluate_without_crash():
    """Every loaded rule should process an empty event without throwing."""
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rules")
    loader = RuleLoader(rules_dir)
    sm = MockStateManager()
    evaluator = RuleEvaluator(sm)
    empty_event = {}
    for rule in loader.get_rules():
        try:
            evaluator.evaluate(empty_event, rule)
        except Exception as ex:
            assert False, f"Rule {rule.get('rule_id')} crashed on empty event: {ex}"

def test_e2e_composite_rule_fires():
    sm = MockStateManager()
    evaluator = RuleEvaluator(sm)
    rule = {
        "rule_id": "E2E-COMP",
        "logic": {
            "type": "composite",
            "operator": "AND",
            "conditions": [
                {"field": "event_type", "condition": "equals", "value": "login_failure"},
                {"field": "country", "condition": "equals", "value": "RU"},
            ]
        },
        "suppression": 0
    }
    assert evaluator.evaluate({"event_type": "login_failure", "country": "RU"}, rule) is True
    assert evaluator.evaluate({"event_type": "login_failure", "country": "US"}, rule) is False

def test_e2e_sequence_three_steps():
    sm = MockStateManager()
    evaluator = RuleEvaluator(sm)
    rule = {
        "rule_id": "E2E-SEQ",
        "logic": {
            "type": "sequence",
            "_rule_id": "E2E-SEQ",
            "group_by": "host",
            "window": 300,
            "steps": [
                {"field": "phase", "condition": "equals", "value": "recon"},
                {"field": "phase", "condition": "equals", "value": "exploit"},
                {"field": "phase", "condition": "equals", "value": "exfil"},
            ]
        },
        "suppression": 0
    }
    host = {"host": "victim-pc"}
    assert evaluator.evaluate({**host, "phase": "recon"}, rule)   is False
    assert evaluator.evaluate({**host, "phase": "exploit"}, rule) is False
    assert evaluator.evaluate({**host, "phase": "exfil"}, rule)   is True


# ── Run ────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    tests = [
        # RuleLoader
        ("RuleLoader loads rules from disk", test_loader_loads_rules),
        ("RuleLoader all rules have required keys", test_loader_all_have_required_keys),
        ("RuleLoader severity values valid", test_loader_severity_values_valid),
        ("RuleLoader rule_ids are unique", test_loader_rule_ids_unique),
        ("RuleLoader missing dir returns empty", test_loader_missing_dir),
        ("RuleLoader SIEM-001 brute force exists", test_loader_brute_force_rule_exists),
        ("RuleLoader logic field is a dict", test_loader_logic_field_present),
        # RiskScorer
        ("RiskScorer critical = weight 40", test_risk_scorer_critical_weight),
        ("RiskScorer high = weight 25", test_risk_scorer_high_weight),
        ("RiskScorer skips unknown entity", test_risk_scorer_skips_unknown_entity),
        ("RiskScorer skips empty entity", test_risk_scorer_skips_empty_entity),
        # E2E
        ("E2E brute force threshold fires", test_e2e_brute_force_threshold),
        ("E2E all rules process empty event safely", test_e2e_all_rules_evaluate_without_crash),
        ("E2E composite AND rule fires correctly", test_e2e_composite_rule_fires),
        ("E2E three-step sequence fires correctly", test_e2e_sequence_three_steps),
    ]

    print("\n" + "="*60)
    print("  CORRELATION ENGINE — Integration Test Suite")
    print("="*60)

    for name, fn in tests:
        run(name, fn)

    total = len(RESULTS)
    passed = sum(1 for r in RESULTS if r[0] == "PASS")
    failed = total - passed

    print("\n" + "="*60)
    print(f"  RESULTS: {passed}/{total} passed  |  {failed} failed")
    print("="*60)

    if failed:
        print("\nFailed tests:")
        for r in RESULTS:
            if r[0] != "PASS":
                print(f"  [{r[0]}] {r[1]} — {r[2]}")

    sys.exit(0 if failed == 0 else 1)
