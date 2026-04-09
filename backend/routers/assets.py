from fastapi import APIRouter
from typing import Dict
from models.schemas import AssetUpdate
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock DB for phase 4
ASSETS_DB: Dict[str, dict] = {}

@router.post("/risk-update")
async def update_risk(asset: AssetUpdate):
    """The Correlation Engine posts to this when an alert fires to tweak the asset risk profile."""
    entity = asset.entity_id
    
    if entity not in ASSETS_DB:
        ASSETS_DB[entity] = {
            "entity_id": entity,
            "risk_score": 0,
            "tactics_hit": set(),
            "latest_alert": None
        }

    # Cap risk at 100
    current_risk = ASSETS_DB[entity]["risk_score"]
    new_risk = min(100, current_risk + asset.added_risk)
    
    ASSETS_DB[entity]["risk_score"] = new_risk
    ASSETS_DB[entity]["latest_alert"] = asset.last_seen_alert
    if asset.mitre_technique_triggered:
        ASSETS_DB[entity]["tactics_hit"].add(asset.mitre_technique_triggered)

    return {"status": "updated", "new_risk_score": new_risk}

@router.get("")
async def get_assets():
    """Frontend calls this to populate the asset inventory UI."""
    return [
        {
            **data,
            "tactics_hit": list(data["tactics_hit"])
        }
        for data in ASSETS_DB.values()
    ]
