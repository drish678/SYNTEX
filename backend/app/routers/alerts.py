from fastapi import APIRouter

from app import store
from app.schemas import Alert, AlertIn

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.get("", response_model=list[Alert])
def list_alerts():
    return store.list_alerts()


@router.post("", response_model=Alert)
def create_alert(body: AlertIn):
    return store.create_alert(body)
