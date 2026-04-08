import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from backend.routers import upload, fetch, expenses, categorize, settings_router, report

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("tricountreport")

# ── CORS ──────────────────────────────────────────────────────────────────
_env_origins = os.getenv("ALLOWED_ORIGINS", "")
_is_production = os.getenv("ENVIRONMENT", "").lower() == "production"

if _is_production and not _env_origins:
    raise RuntimeError(
        "ALLOWED_ORIGINS env var must be set in production. "
        "Example: ALLOWED_ORIGINS=https://yourdomain.com"
    )

ALLOWED_ORIGINS = (
    [o.strip() for o in _env_origins.split(",") if o.strip()]
    or ["http://localhost:5173", "http://localhost:4173"]
)

# ── Rate limiting ─────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title="tric-yreports API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(fetch.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(categorize.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(report.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
