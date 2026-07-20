from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, Field


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "syntex"


# --- Profile (Calibration) ---

class ProfileIn(BaseModel):
    name: str = ""
    age: str = ""
    gender: str = ""
    diagnosis: list[str] = Field(default_factory=list)
    environment: str = ""
    triggers: list[str] = Field(default_factory=list)
    fatigueFrequency: int = 5
    dismissed: bool = False


class Profile(ProfileIn):
    completedAt: str = Field(default_factory=now_iso)


# --- Avatar ---

class AvatarConfig(BaseModel):
    skinTone: str = "#D4956A"
    hairStyle: Literal["buzz", "short", "medium", "long", "curly", "bun", "afro"] = "medium"
    hairColor: str = "#3D1F0D"
    glasses: Literal["none", "round", "rectangle", "cat-eye"] = "none"
    gender: Literal["feminine", "masculine"] = "feminine"


# --- Tasks ---

Complexity = Literal["low", "medium", "high"]


class TaskIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    complexity: Complexity = "medium"
    urgency: Complexity = "medium"
    estimatedMinutes: int = 30


class Task(TaskIn):
    id: str
    completed: bool = False
    createdAt: str = Field(default_factory=now_iso)


class TaskPatch(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    complexity: Optional[Complexity] = None
    urgency: Optional[Complexity] = None
    estimatedMinutes: Optional[int] = None
    completed: Optional[bool] = None


# --- Circles ---

Relationship = Literal["Caregiver", "Family", "Friend", "Therapist", "Other"]


class CircleMemberIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    relationship: Relationship = "Friend"
    phone: Optional[str] = None
    biometricPermission: bool = False


class CircleMember(BaseModel):
    id: str
    name: str
    relationship: Relationship
    avatar: str
    isDesignatedCaregiver: bool
    isOnline: bool = False
    sensoryLoad: float
    cognitiveLoad: float
    heartRate: Optional[float] = None
    biometricPermission: bool
    currentLocation: Optional[str] = None
    lastSeen: str
    phone: Optional[str] = None
    canReceiveAlerts: bool


class CircleMemberPatch(BaseModel):
    name: Optional[str] = None
    relationship: Optional[Relationship] = None
    phone: Optional[str] = None
    biometricPermission: Optional[bool] = None
    canReceiveAlerts: Optional[bool] = None
    currentLocation: Optional[str] = None


class CircleGroupIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)
    emoji: str = "👥"


class CircleGroup(BaseModel):
    id: str
    name: str
    emoji: str
    members: list[CircleMember] = Field(default_factory=list)


# --- Alerts ---

class AlertIn(BaseModel):
    memberId: str
    memberName: str
    reason: Optional[str] = None


class Alert(AlertIn):
    id: str
    createdAt: str = Field(default_factory=now_iso)


# --- Settings ---

class SettingsModel(BaseModel):
    biometricEnabled: bool = True
    notificationsEnabled: bool = True
    autoFilterEnabled: bool = False
    crisisDetectionEnabled: bool = True
    sensitivityLevel: int = 60
    appleWatchConnected: bool = False
    reduceNotificationSounds: bool = False
    extraDimEnabled: bool = False
    dndSync: bool = False
    pauseMonitoring: bool = False


class SettingsPatch(BaseModel):
    biometricEnabled: Optional[bool] = None
    notificationsEnabled: Optional[bool] = None
    autoFilterEnabled: Optional[bool] = None
    crisisDetectionEnabled: Optional[bool] = None
    sensitivityLevel: Optional[int] = None
    appleWatchConnected: Optional[bool] = None
    reduceNotificationSounds: Optional[bool] = None
    extraDimEnabled: Optional[bool] = None
    dndSync: Optional[bool] = None
    pauseMonitoring: Optional[bool] = None


# --- Location ---

class LocationModel(BaseModel):
    current: str = "Not set"


# --- Check-ins (monitoring snapshots, logged periodically from the client) ---

class CheckInIn(BaseModel):
    sensoryLoad: float = Field(..., ge=0, le=100)
    mentalLoad: float = Field(..., ge=0, le=100)
    cognitiveReservoir: float = Field(..., ge=0, le=100)
    timeToOverload: Optional[float] = None


class CheckIn(CheckInIn):
    id: str
    timestamp: str = Field(default_factory=now_iso)


# --- Data export ---

class DataExport(BaseModel):
    profile: Optional[Profile] = None
    avatar: Optional[AvatarConfig] = None
    tasks: list[Task] = Field(default_factory=list)
    circles: list[CircleGroup] = Field(default_factory=list)
    alerts: list[Alert] = Field(default_factory=list)
    settings: SettingsModel = Field(default_factory=SettingsModel)
    location: LocationModel = Field(default_factory=LocationModel)
    checkins: list[CheckIn] = Field(default_factory=list)
    exportedAt: str = Field(default_factory=now_iso)
