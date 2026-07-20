from fastapi import APIRouter, Query

from app import store
from app.schemas import CheckIn, CheckInIn

router = APIRouter(prefix="/api/v1/checkins", tags=["checkins"])


@router.get("", response_model=list[CheckIn])
def list_checkins(days: int | None = Query(default=None, ge=1, le=90)):
    return store.list_checkins(days=days)


@router.post("", response_model=CheckIn)
def create_checkin(body: CheckInIn):
    return store.create_checkin(body)
