import json
import threading
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from app.schemas import (
    Alert,
    AlertIn,
    AvatarConfig,
    CircleGroupIn,
    CircleMember,
    CircleMemberIn,
    CircleMemberPatch,
    CheckInIn,
    LocationModel,
    Profile,
    ProfileIn,
    SettingsModel,
    Task,
    TaskIn,
    TaskPatch,
    now_iso,
)

_DATA_FILE = Path(__file__).resolve().parents[1] / "data.json"
_lock = threading.Lock()


def _default_data() -> dict:
    return {
        "profile": None,
        "avatar": None,
        "tasks": [],
        "circles": [],
        "alerts": [],
        "settings": SettingsModel().model_dump(),
        "location": LocationModel().model_dump(),
        "checkins": [],
    }


def _load() -> dict:
    if not _DATA_FILE.is_file():
        return _default_data()
    try:
        with _DATA_FILE.open("r") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return _default_data()
    base = _default_data()
    base.update(data)
    return base


def _save(data: dict) -> None:
    tmp = _DATA_FILE.with_suffix(".tmp")
    with tmp.open("w") as f:
        json.dump(data, f, indent=2)
    tmp.replace(_DATA_FILE)


# --- Profile ---

def get_profile() -> Optional[dict]:
    with _lock:
        return _load()["profile"]


def set_profile(profile_in: ProfileIn) -> dict:
    with _lock:
        data = _load()
        profile = Profile(**profile_in.model_dump())
        data["profile"] = profile.model_dump()
        _save(data)
        return data["profile"]


def delete_profile() -> None:
    with _lock:
        data = _load()
        data["profile"] = None
        _save(data)


# --- Avatar ---

def get_avatar() -> Optional[dict]:
    with _lock:
        return _load()["avatar"]


def set_avatar(avatar: AvatarConfig) -> dict:
    with _lock:
        data = _load()
        data["avatar"] = avatar.model_dump()
        _save(data)
        return data["avatar"]


# --- Tasks ---

def list_tasks() -> list[dict]:
    with _lock:
        return _load()["tasks"]


def create_task(task_in: TaskIn) -> dict:
    with _lock:
        data = _load()
        task = Task(id=str(uuid.uuid4()), **task_in.model_dump())
        data["tasks"].append(task.model_dump())
        _save(data)
        return task.model_dump()


def update_task(task_id: str, patch: TaskPatch) -> Optional[dict]:
    with _lock:
        data = _load()
        for task in data["tasks"]:
            if task["id"] == task_id:
                updates = {k: v for k, v in patch.model_dump().items() if v is not None}
                task.update(updates)
                _save(data)
                return task
        return None


def delete_task(task_id: str) -> bool:
    with _lock:
        data = _load()
        before = len(data["tasks"])
        data["tasks"] = [t for t in data["tasks"] if t["id"] != task_id]
        _save(data)
        return len(data["tasks"]) < before


# --- Circles ---

def list_circles() -> list[dict]:
    with _lock:
        return _load()["circles"]


def create_circle(circle_in: CircleGroupIn) -> dict:
    with _lock:
        data = _load()
        circle = {"id": str(uuid.uuid4()), "name": circle_in.name, "emoji": circle_in.emoji, "members": []}
        data["circles"].append(circle)
        _save(data)
        return circle


def delete_circle(circle_id: str) -> bool:
    with _lock:
        data = _load()
        before = len(data["circles"])
        data["circles"] = [c for c in data["circles"] if c["id"] != circle_id]
        _save(data)
        return len(data["circles"]) < before


def add_member(circle_id: str, member_in: CircleMemberIn) -> Optional[dict]:
    with _lock:
        data = _load()
        circle = next((c for c in data["circles"] if c["id"] == circle_id), None)
        if circle is None:
            return None
        member = CircleMember(
            id=str(uuid.uuid4()),
            name=member_in.name,
            relationship=member_in.relationship,
            avatar=member_in.name[:2].upper(),
            isDesignatedCaregiver=member_in.relationship in ("Caregiver", "Therapist"),
            isOnline=False,
            sensoryLoad=35,
            cognitiveLoad=35,
            heartRate=70 if member_in.biometricPermission else None,
            biometricPermission=member_in.biometricPermission,
            currentLocation=None,
            lastSeen="just added",
            phone=member_in.phone,
            canReceiveAlerts=bool(member_in.phone),
        )
        circle["members"].append(member.model_dump())
        _save(data)
        return member.model_dump()


def update_member(circle_id: str, member_id: str, patch: CircleMemberPatch) -> Optional[dict]:
    with _lock:
        data = _load()
        circle = next((c for c in data["circles"] if c["id"] == circle_id), None)
        if circle is None:
            return None
        member = next((m for m in circle["members"] if m["id"] == member_id), None)
        if member is None:
            return None
        updates = {k: v for k, v in patch.model_dump().items() if v is not None}
        member.update(updates)
        _save(data)
        return member


def remove_member(circle_id: str, member_id: str) -> bool:
    with _lock:
        data = _load()
        circle = next((c for c in data["circles"] if c["id"] == circle_id), None)
        if circle is None:
            return False
        before = len(circle["members"])
        circle["members"] = [m for m in circle["members"] if m["id"] != member_id]
        _save(data)
        return len(circle["members"]) < before


# --- Alerts ---

def list_alerts() -> list[dict]:
    with _lock:
        return list(reversed(_load()["alerts"]))


def create_alert(alert_in: AlertIn) -> dict:
    with _lock:
        data = _load()
        alert = Alert(id=str(uuid.uuid4()), **alert_in.model_dump())
        data["alerts"].append(alert.model_dump())
        _save(data)
        return alert.model_dump()


# --- Settings ---

def get_settings() -> dict:
    with _lock:
        return _load()["settings"]


def update_settings(patch: dict) -> dict:
    with _lock:
        data = _load()
        data["settings"].update({k: v for k, v in patch.items() if v is not None})
        _save(data)
        return data["settings"]


# --- Location ---

def get_location() -> dict:
    with _lock:
        return _load()["location"]


def set_location(current: str) -> dict:
    with _lock:
        data = _load()
        data["location"] = {"current": current}
        _save(data)
        return data["location"]


# --- Check-ins ---

def create_checkin(checkin_in: CheckInIn) -> dict:
    with _lock:
        data = _load()
        from app.schemas import CheckIn

        checkin = CheckIn(id=str(uuid.uuid4()), **checkin_in.model_dump())
        data["checkins"].append(checkin.model_dump())
        # Cap history so the file doesn't grow unbounded (client logs ~once/min)
        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        data["checkins"] = [
            c for c in data["checkins"] if datetime.fromisoformat(c["timestamp"]) > cutoff
        ]
        _save(data)
        return checkin.model_dump()


def list_checkins(days: Optional[int] = None) -> list[dict]:
    with _lock:
        data = _load()
        checkins = data["checkins"]
        if days is None:
            return checkins
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        return [c for c in checkins if datetime.fromisoformat(c["timestamp"]) > cutoff]


# --- Full data export / wipe ---

def export_all() -> dict:
    with _lock:
        return _load()


def wipe_all() -> None:
    with _lock:
        _save(_default_data())
