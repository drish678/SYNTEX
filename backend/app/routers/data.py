from fastapi import APIRouter

from app import store
from app.schemas import DataExport

router = APIRouter(prefix="/api/v1/data", tags=["data"])


@router.get("/export", response_model=DataExport)
def export_data():
    return store.export_all()


@router.delete("")
def wipe_data():
    store.wipe_all()
    return {"ok": True}
