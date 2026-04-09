from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class BlockRequest(BaseModel):
    ip_address: str
    reason: str

# Mock State for blocked IPs
BLOCKED_IPS = set()

@router.post("/block-ip")
async def block_ip(request: BlockRequest):
    """Simulates pushing an iptables drop rule or firewall API call."""
    logger.warning(f"ACTIVE RESPONSE INIT: Blocking IP {request.ip_address}. Reason: {request.reason}")
    BLOCKED_IPS.add(request.ip_address)
    
    # In a real scenario, we would trigger an SSH library (paramiko) 
    # to run `iptables -A INPUT -s {ip} -j DROP` on perimeter devices.
    return {"status": "success", "action": "blocked", "ip": request.ip_address}

@router.post("/unblock-ip")
async def unblock_ip(request: BlockRequest):
    if request.ip_address in BLOCKED_IPS:
        BLOCKED_IPS.remove(request.ip_address)
        logger.info(f"ACTIVE RESPONSE INIT: Unblocking IP {request.ip_address}")
        return {"status": "success", "action": "unblocked"}
    raise HTTPException(status_code=404, detail="IP not currently blocked")

@router.get("/blocklist")
async def get_blocklist():
    return {"blocked_ips": list(BLOCKED_IPS)}
