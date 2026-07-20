from fastapi import APIRouter

from app import store
from app.schemas import AvatarConfig, Profile, ProfileIn

router = APIRouter(prefix="/api/v1", tags=["profile"])


@router.get("/profile", response_model=Profile | None)
def get_profile():
    return store.get_profile()


@router.put("/profile", response_model=Profile)
def put_profile(body: ProfileIn):
    return store.set_profile(body)


@router.delete("/profile")
def delete_profile():
    store.delete_profile()
    return {"ok": True}


@router.get("/avatar", response_model=AvatarConfig | None)
def get_avatar():
    return store.get_avatar()


@router.put("/avatar", response_model=AvatarConfig)
def put_avatar(body: AvatarConfig):
    return store.set_avatar(body)
