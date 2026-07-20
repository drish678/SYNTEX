const BASE = "/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Profile / Avatar ---

export interface Profile {
  name: string;
  age: string;
  gender: string;
  diagnosis: string[];
  environment: string;
  triggers: string[];
  fatigueFrequency: number;
  dismissed: boolean;
  completedAt: string;
}

export interface AvatarConfig {
  skinTone: string;
  hairStyle: "buzz" | "short" | "medium" | "long" | "curly" | "bun" | "afro";
  hairColor: string;
  glasses: "none" | "round" | "rectangle" | "cat-eye";
  gender: "feminine" | "masculine";
}

// --- Tasks ---

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  complexity: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  estimatedMinutes: number;
  completed: boolean;
  createdAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  complexity: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  estimatedMinutes: number;
}

// --- Circles ---

export interface CircleMember {
  id: string;
  name: string;
  relationship: "Caregiver" | "Family" | "Friend" | "Therapist" | "Other";
  avatar: string;
  isDesignatedCaregiver: boolean;
  isOnline: boolean;
  sensoryLoad: number;
  cognitiveLoad: number;
  heartRate?: number;
  biometricPermission: boolean;
  currentLocation?: string;
  lastSeen: string;
  phone?: string;
  canReceiveAlerts: boolean;
}

export interface CircleGroup {
  id: string;
  name: string;
  emoji: string;
  members: CircleMember[];
}

// --- Alerts ---

export interface Alert {
  id: string;
  memberId: string;
  memberName: string;
  reason?: string;
  createdAt: string;
}

// --- Settings ---

export interface Settings {
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  autoFilterEnabled: boolean;
  crisisDetectionEnabled: boolean;
  sensitivityLevel: number;
  appleWatchConnected: boolean;
  reduceNotificationSounds: boolean;
  extraDimEnabled: boolean;
  dndSync: boolean;
  pauseMonitoring: boolean;
}

// --- Check-ins ---

export interface CheckIn {
  id: string;
  timestamp: string;
  sensoryLoad: number;
  mentalLoad: number;
  cognitiveReservoir: number;
  timeToOverload: number | null;
}

export const api = {
  // Profile
  getProfile: () => request<Profile | null>("/profile"),
  saveProfile: (profile: Partial<Profile>) =>
    request<Profile>("/profile", { method: "PUT", body: JSON.stringify(profile) }),
  deleteProfile: () => request<{ ok: true }>("/profile", { method: "DELETE" }),

  // Avatar
  getAvatar: () => request<AvatarConfig | null>("/avatar"),
  saveAvatar: (config: AvatarConfig) =>
    request<AvatarConfig>("/avatar", { method: "PUT", body: JSON.stringify(config) }),

  // Tasks
  listTasks: () => request<Task[]>("/tasks"),
  createTask: (task: TaskInput) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(task) }),
  updateTask: (id: string, patch: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteTask: (id: string) => request<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" }),

  // Circles
  listCircles: () => request<CircleGroup[]>("/circles"),
  createCircle: (name: string, emoji: string) =>
    request<CircleGroup>("/circles", { method: "POST", body: JSON.stringify({ name, emoji }) }),
  deleteCircle: (id: string) => request<{ ok: true }>(`/circles/${id}`, { method: "DELETE" }),
  addMember: (
    circleId: string,
    member: { name: string; relationship: CircleMember["relationship"]; phone?: string; biometricPermission: boolean }
  ) =>
    request<CircleMember>(`/circles/${circleId}/members`, { method: "POST", body: JSON.stringify(member) }),
  updateMember: (circleId: string, memberId: string, patch: Partial<CircleMember>) =>
    request<CircleMember>(`/circles/${circleId}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  removeMember: (circleId: string, memberId: string) =>
    request<{ ok: true }>(`/circles/${circleId}/members/${memberId}`, { method: "DELETE" }),

  // Alerts
  listAlerts: () => request<Alert[]>("/alerts"),
  sendAlert: (memberId: string, memberName: string, reason?: string) =>
    request<Alert>("/alerts", { method: "POST", body: JSON.stringify({ memberId, memberName, reason }) }),

  // Settings
  getSettings: () => request<Settings>("/settings"),
  updateSettings: (patch: Partial<Settings>) =>
    request<Settings>("/settings", { method: "PATCH", body: JSON.stringify(patch) }),

  // Location
  getLocation: () => request<{ current: string }>("/location"),
  setLocation: (current: string) =>
    request<{ current: string }>("/location", { method: "PUT", body: JSON.stringify({ current }) }),

  // Check-ins
  listCheckins: (days?: number) => request<CheckIn[]>(`/checkins${days ? `?days=${days}` : ""}`),
  createCheckin: (snapshot: Omit<CheckIn, "id" | "timestamp">) =>
    request<CheckIn>("/checkins", { method: "POST", body: JSON.stringify(snapshot) }),

  // Data
  exportData: () => request<Record<string, unknown>>("/data/export"),
  wipeData: () => request<{ ok: true }>("/data", { method: "DELETE" }),
};
