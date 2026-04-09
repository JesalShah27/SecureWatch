from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Dict, Optional
import uuid
import time
from datetime import datetime
from models.agent_schemas import AgentRegisterSchema, AgentResponseSchema, AgentCommandSchema, AgentHeartbeatSchema
import logging

router = APIRouter()
logger = logging.getLogger("api.agents")

# Dummy DB for agents (in-memory for now until postgres migration)
AGENTS_DB: Dict[str, dict] = {}
AGENT_TOKENS: Dict[str, str] = {}
AGENT_COMMANDS_QUEUE: Dict[str, list] = {}

def get_agent_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    return authorization.split("Bearer ")[1]

@router.post("/register", response_model=dict)
async def register_agent(agent_data: AgentRegisterSchema):
    agent_id = str(uuid.uuid4())
    token = str(uuid.uuid4().hex)
    
    AGENTS_DB[agent_id] = {
        "agent_id": agent_id,
        "hostname": agent_data.hostname,
        "ip_address": agent_data.ip_address,
        "os_type": agent_data.os_type,
        "os_version": agent_data.os_version,
        "agent_version": agent_data.agent_version,
        "registration_date": datetime.utcnow().isoformat(),  # Store as string for JSON serialization
        "last_seen": datetime.utcnow(),  # Keep as datetime for timedelta computation
        "status": "active",
        "group_name": agent_data.group,
        "labels": {}
    }
    AGENT_TOKENS[agent_id] = token
    AGENT_COMMANDS_QUEUE[agent_id] = []
    
    logger.info(f"Registered new agent: {agent_id} ({agent_data.hostname})")
    
    return {"agent_id": agent_id, "token": token}

@router.get("", response_model=List[AgentResponseSchema])
async def list_agents():
    # Update statuses based on last_seen
    now = datetime.utcnow()
    for aid, data in AGENTS_DB.items():
        time_diff = (now - data['last_seen']).total_seconds()
        if time_diff > 60:
            data['status'] = "inactive"
            
    return list(AGENTS_DB.values())

@router.get("/{agent_id}", response_model=AgentResponseSchema)
async def get_agent(agent_id: str):
    if agent_id not in AGENTS_DB:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AGENTS_DB[agent_id]

@router.delete("/{agent_id}")
async def remove_agent(agent_id: str):
    if agent_id in AGENTS_DB:
        del AGENTS_DB[agent_id]
        if agent_id in AGENT_TOKENS:
            del AGENT_TOKENS[agent_id]
        if agent_id in AGENT_COMMANDS_QUEUE:
            del AGENT_COMMANDS_QUEUE[agent_id]
        return {"status": "removed"}
    raise HTTPException(status_code=404, detail="Agent not found")

@router.post("/{agent_id}/heartbeat")
async def agent_heartbeat(agent_id: str, payload: AgentHeartbeatSchema, token: str = Depends(get_agent_token)):
    if agent_id not in AGENTS_DB:
        raise HTTPException(status_code=404, detail="Agent not registered")
    
    if AGENT_TOKENS.get(agent_id) != token:
        raise HTTPException(status_code=403, detail="Invalid token for agent")
        
    # Update last seen
    AGENTS_DB[agent_id]['last_seen'] = datetime.utcnow()
    AGENTS_DB[agent_id]['status'] = "active"
    
    # Process incoming events
    # In a real setup, these would be pushed to Elasticsearch or Logstash.
    # For now, we will log them. 
    events = payload.events
    if events:
        logger.info(f"Received {len(events)} events from agent {agent_id}")
    
    # Fetch pending commands
    pending_commands = AGENT_COMMANDS_QUEUE.get(agent_id, [])
    AGENT_COMMANDS_QUEUE[agent_id] = [] # Clear queue
    
    return {"status": "ok", "commands": pending_commands}

@router.post("/{agent_id}/command")
async def send_command(agent_id: str, cmd_data: AgentCommandSchema):
    if agent_id not in AGENTS_DB:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    cmd_id = str(uuid.uuid4())
    command_obj = {
        "id": cmd_id,
        "command": cmd_data.command,
        "args": cmd_data.args or {},
        "timestamp": datetime.utcnow().isoformat()
    }
    
    AGENT_COMMANDS_QUEUE[agent_id].append(command_obj)
    
    return {"status": "queued", "command_id": cmd_id}
