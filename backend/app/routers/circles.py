from fastapi import APIRouter, HTTPException

from app import store
from app.schemas import CircleGroup, CircleGroupIn, CircleMember, CircleMemberIn, CircleMemberPatch

router = APIRouter(prefix="/api/v1/circles", tags=["circles"])


@router.get("", response_model=list[CircleGroup])
def list_circles():
    return store.list_circles()


@router.post("", response_model=CircleGroup)
def create_circle(body: CircleGroupIn):
    return store.create_circle(body)


@router.delete("/{circle_id}")
def delete_circle(circle_id: str):
    if not store.delete_circle(circle_id):
        raise HTTPException(status_code=404, detail="Circle not found")
    return {"ok": True}


@router.post("/{circle_id}/members", response_model=CircleMember)
def add_member(circle_id: str, body: CircleMemberIn):
    member = store.add_member(circle_id, body)
    if member is None:
        raise HTTPException(status_code=404, detail="Circle not found")
    return member


@router.patch("/{circle_id}/members/{member_id}", response_model=CircleMember)
def update_member(circle_id: str, member_id: str, body: CircleMemberPatch):
    member = store.update_member(circle_id, member_id, body)
    if member is None:
        raise HTTPException(status_code=404, detail="Circle or member not found")
    return member


@router.delete("/{circle_id}/members/{member_id}")
def remove_member(circle_id: str, member_id: str):
    if not store.remove_member(circle_id, member_id):
        raise HTTPException(status_code=404, detail="Circle or member not found")
    return {"ok": True}
