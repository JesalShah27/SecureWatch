from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging

from routers import auth, users, rules, alerts, assets, response, threat_intel, agents, fim, vulnerabilities, sca, compliance, hunting, audit, health, reporting

# Configure Logging
logging.basicConfig(level=logging.INFO)

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI
app = FastAPI(
    title="SecureWatch SOC API",
    description="Enterprise-grade API backing the SOC Dashboard",
    version="1.0.0"
)

# Apply limits
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Policy - Crucial for React frontend separation
# CORS Policy - credentials=True requires explicit origins ("*" + credentials is browser-invalid)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Depends
from auth.rbac import get_current_user

# Includes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"], dependencies=[Depends(get_current_user)])
app.include_router(rules.router, prefix="/api/rules", tags=["Rules"], dependencies=[Depends(get_current_user)])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"], dependencies=[Depends(get_current_user)])
app.include_router(response.router, prefix="/api/response", tags=["Active Response"], dependencies=[Depends(get_current_user)])
app.include_router(threat_intel.router, prefix="/api/threat-intel", tags=["Threat Intel"], dependencies=[Depends(get_current_user)])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"], dependencies=[Depends(get_current_user)])
app.include_router(fim.router, prefix="/api/fim", tags=["File Integrity"], dependencies=[Depends(get_current_user)])
app.include_router(vulnerabilities.router, prefix="/api/vulnerabilities", tags=["Vulnerabilities"], dependencies=[Depends(get_current_user)])
app.include_router(sca.router, prefix="/api/sca", tags=["Configuration Assessment"], dependencies=[Depends(get_current_user)])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"], dependencies=[Depends(get_current_user)])
app.include_router(hunting.router, prefix="/api/hunting", tags=["Threat Hunting"], dependencies=[Depends(get_current_user)])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit Logs"], dependencies=[Depends(get_current_user)])
app.include_router(health.router, prefix="/api/diagnostics", tags=["Health Diagnostics"], dependencies=[Depends(get_current_user)])
app.include_router(reporting.router, prefix="/api/reporting", tags=["Reporting Engine"], dependencies=[Depends(get_current_user)])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SecureWatch Backend"}
