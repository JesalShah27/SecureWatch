import pytest
import os
import redis
import json
import time

# We run inside the 'active-response' container, or similar, 
# so we can use localhost or redis directly if exposed.
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

def test_redis_connection():
    client = redis.from_url(REDIS_URL, decode_responses=True)
    assert client.ping() is True

def test_push_to_playbook_queue():
    client = redis.from_url(REDIS_URL, decode_responses=True)
    task = {
        "playbook_id": "PLAYBOOK-001",
        "target": "10.0.0.99"
    }
    
    # We use a test queue name so the background daemon doesn't consume it instantly
    client.delete("test_playbook_tasks")
    client.rpush("test_playbook_tasks", json.dumps(task))
    assert client.llen("test_playbook_tasks") >= 1
    
    item = client.lpop("test_playbook_tasks")
    popped_task = json.loads(item)
    assert popped_task["playbook_id"] == "PLAYBOOK-001"
    assert popped_task["target"] == "10.0.0.99"

def test_playbook_runner_dry_run():
    import sys
    # Add response root to path so we can import playbook_runner
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from playbook_runner import PlaybookRunner
    
    runner = PlaybookRunner()
    result = runner.execute("PLAYBOOK-001", "192.168.1.50", dry_run=True)
    assert result is True  # Assuming playbooks return True on success
    
def test_playbook_runner_invalid_playbook():
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from playbook_runner import PlaybookRunner
    
    runner = PlaybookRunner()
    result = runner.execute("INVALID-PLAYBOOK", "10.0.0.100", dry_run=True)
    assert result is False
