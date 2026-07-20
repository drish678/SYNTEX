from fastapi import APIRouter

from app import store
from app.schemas import LocationModel, SettingsModel, SettingsPatch

router = APIRouter(prefix="/api/v1", tags=["settings"])


@router.get("/settings", response_model=SettingsModel)
def get_settings():
    return store.get_settings()


@router.patch("/settings", response_model=SettingsModel)
def update_settings(body: SettingsPatch):
    return store.update_settings(body.model_dump())


@router.get("/location", response_model=LocationModel)
def get_location():
    return store.get_location()


@router.put("/location", response_model=LocationModel)
def put_location(body: LocationModel):
    return store.set_location(body.current)
