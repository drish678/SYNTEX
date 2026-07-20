from fastapi import APIRouter, HTTPException

from app import store
from app.schemas import Task, TaskIn, TaskPatch

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


@router.get("", response_model=list[Task])
def list_tasks():
    return store.list_tasks()


@router.post("", response_model=Task)
def create_task(body: TaskIn):
    return store.create_task(body)


@router.patch("/{task_id}", response_model=Task)
def update_task(task_id: str, body: TaskPatch):
    task = store.update_task(task_id, body)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}")
def delete_task(task_id: str):
    if not store.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}
