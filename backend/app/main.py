from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import alerts, checkins, circles, data, profile, settings, tasks
from app.schemas import HealthResponse

settings_conf = get_settings()

app = FastAPI(title=settings_conf.app_name, version="0.1.0")

_origins = [o.strip() for o in settings_conf.cors_origins.split(",") if o.strip()]
if _origins == ["*"]:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(profile.router)
app.include_router(checkins.router)
app.include_router(alerts.router)
app.include_router(tasks.router)
app.include_router(circles.router)
app.include_router(settings.router)
app.include_router(data.router)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


# --- Serve the built frontend from ../static when present ---
_ROOT = Path(__file__).resolve().parents[2]
_STATIC = _ROOT / "static"


@app.get("/")
def spa_index():
    index = _STATIC / "index.html"
    if index.is_file():
        return FileResponse(index)
    return {"service": "syntex", "docs": "/docs", "health": "/health"}


_assets = _STATIC / "assets"
if _assets.is_dir():
    app.mount("/assets", StaticFiles(directory=_assets), name="assets")
