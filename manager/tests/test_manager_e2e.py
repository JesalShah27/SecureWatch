import asyncio
import json
import pytest
import os

# We will run this inside the docker container so the manager is at 'manager' or 'localhost' if exposed
MANAGER_HOST = os.getenv("MANAGER_HOST", "localhost")
MANAGER_PORT = int(os.getenv("MANAGER_PORT", "1514"))

async def send_msg(msg: dict) -> dict:
    reader, writer = await asyncio.open_connection(MANAGER_HOST, MANAGER_PORT)
    payload = json.dumps(msg) + "\n"
    writer.write(payload.encode("utf-8"))
    await writer.drain()

    line = await asyncio.wait_for(reader.readline(), timeout=5.0)
    writer.close()
    await writer.wait_closed()

    return json.loads(line.decode("utf-8").strip())

@pytest.mark.asyncio
async def test_agent_registration():
    msg = {
        "type": "register",
        "data": {
            "hostname": "test-agent-01",
            "ip_address": "10.0.0.100",
            "os_type": "linux",
            "agent_version": "1.0.0"
        }
    }
    response = await send_msg(msg)
    assert response.get("status") == "ok"
    assert "agent_id" in response
    assert "token" in response

@pytest.mark.asyncio
async def test_agent_heartbeat_and_events():
    # 1. Register
    reg_msg = {
        "type": "register",
        "data": {"hostname": "test-agent-02", "ip_address": "10.0.0.101", "os_type": "windows"}
    }
    reg_resp = await send_msg(reg_msg)
    agent_id = reg_resp["agent_id"]
    token = reg_resp["token"]

    # 2. Heartbeat with events
    hb_msg = {
        "type": "heartbeat",
        "agent_id": agent_id,
        "token": token,
        "events": [
            {"event_id": 1, "message": "Test event 1"},
            {"event_id": 2, "message": "Test event 2"}
        ]
    }
    hb_resp = await send_msg(hb_msg)
    assert hb_resp.get("status") == "ok"
    assert hb_resp.get("events_processed") == 2

@pytest.mark.asyncio
async def test_invalid_json():
    reader, writer = await asyncio.open_connection(MANAGER_HOST, MANAGER_PORT)
    writer.write(b"not json\n")
    await writer.drain()

    line = await asyncio.wait_for(reader.readline(), timeout=5.0)
    writer.close()
    await writer.wait_closed()

    response = json.loads(line.decode("utf-8").strip())
    assert response.get("status") == "error"
    assert "Invalid JSON" in response.get("message", "")

@pytest.mark.asyncio
async def test_invalid_token_heartbeat():
    hb_msg = {
        "type": "heartbeat",
        "agent_id": "fake-id",
        "token": "fake-token",
        "events": []
    }
    hb_resp = await send_msg(hb_msg)
    assert hb_resp.get("status") == "error"
    assert "Invalid agent_id or token" in hb_resp.get("message", "")
