"""
Unit Tests — Correlation Engine Rule Evaluator
Tests: equals, contains, regex, exists, not_equals, greater_than, less_than,
       threshold, sequence, composite, suppression, nested field access
"""
import time
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rule_engine import RuleEvaluator


class MockStateManager:
    def __init__(self):
        self._store = {}
        self._seq = {}

    def track_event(self, threshold_key, event_id, window_seconds):
        self._store.setdefault(threshold_key, [])
        self._store[threshold_key].append((time.time(), event_id))
        cutoff = time.time() - window_seconds
        self._store[threshold_key] = [(t, e) for t, e in self._store[threshold_key] if t >= cutoff]
        return len(self._store[threshold_key])

    def get_sequence_step(self, key):
        return self._seq.get(key, 0)

    def set_sequence_step(self, key, step, window):
        self._seq[key] = step

    def clear_sequence(self, key):
        self._seq.pop(key, None)


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


# ── Unit Tests ────────────────────────────────────────────────────────────────

def make(state=None):
    return RuleEvaluator(state or MockStateManager())

def test_equals_match():
    e = make()
    rule = {"rule_id": "T1", "logic": {"type": "equals", "field": "event_type", "value": "login_failure"}, "suppression": 0}
    assert e.evaluate({"event_type": "login_failure"}, rule) is True

def test_equals_no_match():
    e = make()
    rule = {"rule_id": "T2", "logic": {"type": "equals", "field": "event_type", "value": "login_failure"}, "suppression": 0}
    assert e.evaluate({"event_type": "login_success"}, rule) is False

def test_contains_match():
    e = make()
    rule = {"rule_id": "T3", "logic": {"type": "contains", "field": "message", "value": "xmrig"}, "suppression": 0}
    assert e.evaluate({"message": "Process xmrig.exe started at high CPU"}, rule) is True

def test_contains_no_match():
    e = make()
    rule = {"rule_id": "T4", "logic": {"type": "contains", "field": "message", "value": "xmrig"}, "suppression": 0}
    assert e.evaluate({"message": "normal system process"}, rule) is False

def test_regex_match():
    e = make()
    rule = {"rule_id": "T5", "logic": {"type": "regex", "field": "cmd", "pattern": r"powershell.*-enc"}, "suppression": 0}
    assert e.evaluate({"cmd": "PowerShell.exe -EncodedCommand abc"}, rule) is True

def test_regex_invalid_pattern():
    e = make()
    rule = {"rule_id": "T6", "logic": {"type": "regex", "field": "cmd", "pattern": r"[invalid"}, "suppression": 0}
    assert e.evaluate({"cmd": "test"}, rule) is False

def test_exists_match():
    e = make()
    rule = {"rule_id": "T7", "logic": {"type": "exists", "field": "malware_hash"}, "suppression": 0}
    assert e.evaluate({"malware_hash": "abc123"}, rule) is True

def test_exists_missing():
    e = make()
    rule = {"rule_id": "T8", "logic": {"type": "exists", "field": "malware_hash"}, "suppression": 0}
    assert e.evaluate({"other_field": "value"}, rule) is False

def test_not_equals():
    e = make()
    rule = {"rule_id": "T9", "logic": {"type": "not_equals", "field": "status", "value": "allowed"}, "suppression": 0}
    assert e.evaluate({"status": "blocked"}, rule) is True
    assert e.evaluate({"status": "allowed"}, rule) is False

def test_greater_than():
    e = make()
    rule = {"rule_id": "T10", "logic": {"type": "greater_than", "field": "cpu", "value": 90}, "suppression": 0}
    assert e.evaluate({"cpu": 98.4}, rule) is True
    assert e.evaluate({"cpu": 50}, rule) is False

def test_less_than():
    e = make()
    rule = {"rule_id": "T11", "logic": {"type": "less_than", "field": "score", "value": 10}, "suppression": 0}
    assert e.evaluate({"score": 3}, rule) is True
    assert e.evaluate({"score": 50}, rule) is False

def test_greater_than_non_numeric():
    e = make()
    rule = {"rule_id": "T12", "logic": {"type": "greater_than", "field": "cpu", "value": 90}, "suppression": 0}
    assert e.evaluate({"cpu": "not-a-number"}, rule) is False

def test_nested_field():
    e = make()
    rule = {"rule_id": "T13", "logic": {"type": "equals", "field": "winlog.event_id", "value": 4625}, "suppression": 0}
    assert e.evaluate({"winlog": {"event_id": 4625}}, rule) is True

def test_nested_field_missing():
    e = make()
    rule = {"rule_id": "T14", "logic": {"type": "exists", "field": "a.b.c"}, "suppression": 0}
    assert e.evaluate({"a": {"b": {}}}, rule) is False

def test_threshold_fires_at_limit():
    sm = MockStateManager()
    e = make(sm)
    rule = {
        "rule_id": "T15",
        "logic": {"type": "threshold", "_rule_id": "T15", "group_by": "source_ip", "threshold": 3, "window": 120},
        "suppression": 0
    }
    event = {"source_ip": "10.0.0.1"}
    assert e.evaluate(event, rule) is False  # 1st
    assert e.evaluate(event, rule) is False  # 2nd
    assert e.evaluate(event, rule) is True   # 3rd — fires

def test_threshold_different_ips():
    sm = MockStateManager()
    e = make(sm)
    rule = {
        "rule_id": "T16",
        "logic": {"type": "threshold", "_rule_id": "T16", "group_by": "source_ip", "threshold": 3, "window": 120},
        "suppression": 0
    }
    for _ in range(2):
        e.evaluate({"source_ip": "10.0.0.1"}, rule)
    # Different IP should not trigger
    assert e.evaluate({"source_ip": "10.0.0.2"}, rule) is False

def test_composite_and_all_true():
    e = make()
    rule = {
        "rule_id": "T17",
        "logic": {
            "type": "composite",
            "operator": "AND",
            "conditions": [
                {"field": "event_type", "condition": "equals", "value": "login_failure"},
                {"field": "source_ip", "condition": "exists"},
            ]
        },
        "suppression": 0
    }
    assert e.evaluate({"event_type": "login_failure", "source_ip": "1.2.3.4"}, rule) is True

def test_composite_and_partial_false():
    e = make()
    rule = {
        "rule_id": "T18",
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
    assert e.evaluate({"event_type": "login_failure", "country": "US"}, rule) is False

def test_composite_or_one_true():
    e = make()
    rule = {
        "rule_id": "T19",
        "logic": {
            "type": "composite",
            "operator": "OR",
            "conditions": [
                {"field": "event_type", "condition": "equals", "value": "ransomware"},
                {"field": "event_type", "condition": "equals", "value": "login_failure"},
            ]
        },
        "suppression": 0
    }
    assert e.evaluate({"event_type": "login_failure"}, rule) is True

def test_composite_empty_conditions():
    e = make()
    rule = {"rule_id": "T20", "logic": {"type": "composite", "operator": "AND", "conditions": []}, "suppression": 0}
    assert e.evaluate({"any": "event"}, rule) is False

def test_suppression_window():
    e = make()
    rule = {
        "rule_id": "T21",
        "logic": {"type": "equals", "field": "evt", "value": "bad"},
        "suppression": 3600,  # 1 hour
        "logic": {"type": "equals", "field": "evt", "value": "bad", "group_by": "source_ip"}
    }
    event = {"evt": "bad", "source_ip": "5.5.5.5"}
    # Manually inject suppression
    rule2 = {"rule_id": "T21", "logic": {"type": "equals", "field": "evt", "value": "bad"}, "suppression": 3600}
    result1 = e.evaluate(event, rule2)
    result2 = e.evaluate(event, rule2)  # Should be suppressed now
    assert result1 is True
    assert result2 is False

def test_sequence_two_steps():
    sm = MockStateManager()
    e = make(sm)
    rule = {
        "rule_id": "T22",
        "logic": {
            "type": "sequence",
            "_rule_id": "T22",
            "group_by": "source_ip",
            "window": 300,
            "steps": [
                {"field": "event_type", "condition": "equals", "value": "recon"},
                {"field": "event_type", "condition": "equals", "value": "exploit"},
            ]
        },
        "suppression": 0
    }
    e1 = {"source_ip": "1.2.3.4", "event_type": "recon"}
    e2 = {"source_ip": "1.2.3.4", "event_type": "exploit"}
    assert e.evaluate(e1, rule) is False   # Step 1
    assert e.evaluate(e2, rule) is True    # Step 2 — fires!

def test_sequence_wrong_order():
    sm = MockStateManager()
    e = make(sm)
    rule = {
        "rule_id": "T23",
        "logic": {
            "type": "sequence",
            "_rule_id": "T23",
            "group_by": "source_ip",
            "window": 300,
            "steps": [
                {"field": "event_type", "condition": "equals", "value": "recon"},
                {"field": "event_type", "condition": "equals", "value": "exploit"},
            ]
        },
        "suppression": 0
    }
    e2 = {"source_ip": "1.2.3.4", "event_type": "exploit"}
    assert e.evaluate(e2, rule) is False  # Step 2 without Step 1 — no fire

def test_unknown_rule_type_defaults_equals():
    e = make()
    rule = {"rule_id": "T24", "logic": {"type": "UNKNOWN_TYPE", "field": "x", "value": "y"}, "suppression": 0}
    assert e.evaluate({"x": "y"}, rule) is True  # Falls back to equals

def test_empty_event():
    e = make()
    rule = {"rule_id": "T25", "logic": {"type": "equals", "field": "event_type", "value": "login"}, "suppression": 0}
    assert e.evaluate({}, rule) is False

def test_missing_field_key():
    e = make()
    rule = {"rule_id": "T26", "logic": {"type": "equals", "field": "", "value": "x"}, "suppression": 0}
    assert e.evaluate({"event_type": "x"}, rule) is False


# ── Run All ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    tests = [
        ("equals match", test_equals_match),
        ("equals no match", test_equals_no_match),
        ("contains match", test_contains_match),
        ("contains no match", test_contains_no_match),
        ("regex match", test_regex_match),
        ("regex invalid pattern", test_regex_invalid_pattern),
        ("exists match", test_exists_match),
        ("exists missing field", test_exists_missing),
        ("not_equals", test_not_equals),
        ("greater_than", test_greater_than),
        ("less_than", test_less_than),
        ("greater_than non-numeric", test_greater_than_non_numeric),
        ("nested field access", test_nested_field),
        ("nested field missing", test_nested_field_missing),
        ("threshold fires at limit", test_threshold_fires_at_limit),
        ("threshold different IPs isolated", test_threshold_different_ips),
        ("composite AND all true", test_composite_and_all_true),
        ("composite AND partial false", test_composite_and_partial_false),
        ("composite OR one true", test_composite_or_one_true),
        ("composite empty conditions", test_composite_empty_conditions),
        ("suppression window", test_suppression_window),
        ("sequence two steps fires", test_sequence_two_steps),
        ("sequence wrong order no fire", test_sequence_wrong_order),
        ("unknown rule type defaults equals", test_unknown_rule_type_defaults_equals),
        ("empty event", test_empty_event),
        ("missing field key", test_missing_field_key),
    ]

    print("\n" + "="*60)
    print("  CORRELATION ENGINE — Unit Test Suite")
    print("="*60)

    for name, fn in tests:
        run(name, fn)

    total = len(RESULTS)
    passed = sum(1 for r in RESULTS if r[0] == "PASS")
    failed = total - passed

    print("\n" + "="*60)
    print(f"  RESULTS: {passed}/{total} passed  |  {failed} failed")
    print("="*60)

    if failed > 0:
        print("\nFailed tests:")
        for r in RESULTS:
            if r[0] != "PASS":
                print(f"  {r[0]}: {r[1]} — {r[2]}")

    sys.exit(0 if failed == 0 else 1)
