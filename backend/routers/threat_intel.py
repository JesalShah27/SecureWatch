from fastapi import APIRouter
import httpx
import os

router = APIRouter()

VT_KEY = os.getenv("VIRUSTOTAL_API_KEY")
ABUSE_KEY = os.getenv("ABUSEIPDB_API_KEY")

@router.get("/ip/{ip_address}")
async def lookup_ip(ip_address: str):
    if not ABUSE_KEY:
        return {"error": "AbuseIPDB API key not configured"}
        
    try:
        url = "https://api.abuseipdb.com/api/v2/check"
        headers = {"Key": ABUSE_KEY, "Accept": "application/json"}
        params = {"ipAddress": ip_address, "maxAgeInDays": "30"}
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, params=params, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                return data["data"]
            return {"error": f"API returned {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/hash/{file_hash}")
async def lookup_hash(file_hash: str):
    if not VT_KEY:
        return {"error": "VirusTotal API key not configured"}
        
    try:
        url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
        headers = {"x-apikey": VT_KEY}
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                return data["data"]["attributes"]["last_analysis_stats"]
            return {"error": f"API returned {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}
