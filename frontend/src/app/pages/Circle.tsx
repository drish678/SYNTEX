import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  MapPin,
  BellRing,
  X,
  AlertTriangle,
  Shield,
  Phone,
  MessageSquare,
  CheckCircle,
  Wifi,
  WifiOff,
  UserPlus,
  Navigation,
  Zap,
  Volume2,
  Eye,
  Activity,
  ChevronDown,
  FolderPlus,
  Trash2,
  Heart,
  HeartPulse,
  Pin,
} from "lucide-react";
import { toast } from "sonner";
import { useMonitoring } from "../contexts/MonitoringContext";
import { api, CircleGroup, CircleMember } from "../api";
import { locationProfiles } from "../lib/locationProfiles";

// ─── Thresholds ───────────────────────────────────────────────────────────────

const HR_HIGH = 110;    // bpm — elevated
const HR_CRITICAL = 130; // bpm — alert
const LOAD_HIGH = 80;   // % — elevated
const LOAD_CRITICAL = 90; // % — alert

// ─── Defaults ─────────────────────────────────────────────────────────────────

const CIRCLE_EMOJIS = ["🛡️","🏠","👥","🧒","💼","🌿","❤️","⭐","🎓","🏋️"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const loadColor = (v: number) => {
  if (v < 40) return { bar: "bg-emerald-500", text: "text-emerald-400", label: "Calm" };
  if (v < 65) return { bar: "bg-amber-500",   text: "text-amber-400",   label: "Moderate" };
  if (v < 85) return { bar: "bg-orange-500",  text: "text-orange-400",  label: "Elevated" };
  return             { bar: "bg-red-500",     text: "text-red-400",     label: "High" };
};

const hrColor = (bpm: number) => {
  if (bpm < HR_HIGH)      return { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Normal" };
  if (bpm < HR_CRITICAL)  return { text: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30",     label: "Elevated" };
  return                         { text: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",         label: "Critical" };
};

const stimTypeColor = (type: string) => {
  if (type === "Very High-Stim" || type === "High-Stim") return { badge: "bg-red-500/20 text-red-400",         border: "border-red-500/30"     };
  if (type === "Medium-Stim")                             return { badge: "bg-amber-500/20 text-amber-400",     border: "border-amber-500/30"   };
  return                                                         { badge: "bg-emerald-500/20 text-emerald-400", border: "border-emerald-500/30" };
};

const relColor: Record<string, string> = {
  Caregiver: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  Family:    "text-purple-400 bg-purple-500/10 border-purple-500/30",
  Friend:    "text-cyan-400   bg-cyan-500/10   border-cyan-500/30",
  Therapist: "text-teal-400   bg-teal-500/10   border-teal-500/30",
  Other:     "text-gray-400   bg-gray-500/10   border-gray-500/30",
};

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden w-full">
      <motion.div className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}

function HrIcon({ bpm, size = 14 }: { bpm: number; size?: number }) {
  const c = hrColor(bpm);
  return <HeartPulse style={{ width: size, height: size }} className={c.text} />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function Circle() {
  const { cognitiveReservoir } = useMonitoring();

  const [circles, setCircles] = useState<CircleGroup[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>("");

  useEffect(() => {
    api.listCircles().then((loaded) => {
      setCircles(loaded);
      setActiveCircleId((prev) => prev || loaded[0]?.id || "");
    });
  }, []);
  const [circleDropdownOpen, setCircleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Distress
  const [myDistress, setMyDistress] = useState(0);
  const [alertSentTo, setAlertSentTo] = useState<Set<string>>(new Set());
  const [alertConfirm, setAlertConfirm] = useState<{ memberId: string; reason?: string } | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Auto-alert tracking (avoid duplicate toasts per session)
  const autoAlertedRef = useRef<Set<string>>(new Set());

  // Member sheet
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);

  // Add member sheet
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState<CircleMember["relationship"]>("Friend");
  const [newPhone, setNewPhone] = useState("");
  const [newBiometric, setNewBiometric] = useState(false);

  // Create circle sheet
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [newCircleName, setNewCircleName] = useState("");
  const [newCircleEmoji, setNewCircleEmoji] = useState("👥");

  // Location
  const [currentLocation, setCurrentLocation] = useState("Not set");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationWarning, setLocationWarning] = useState(false);
  const [locationWarningMessage, setLocationWarningMessage] = useState("");
  const [customLocationInput, setCustomLocationInput] = useState("");

  const activeCircle = circles.find(c => c.id === activeCircleId) ?? circles[0];

  // Load + persist location
  useEffect(() => { api.getLocation().then((loc) => setCurrentLocation(loc.current)); }, []);
  useEffect(() => { if (currentLocation !== "Not set") api.setLocation(currentLocation); }, [currentLocation]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCircleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fluctuate loads + heart rate
  useEffect(() => {
    const id = setInterval(() => {
      setCircles(prev => {
        const updated = prev.map(c => ({
          ...c,
          members: c.members.map(m => {
            const newSensory   = Math.max(5, Math.min(95, m.sensoryLoad   + (Math.random() - 0.48) * 5));
            const newCognitive = Math.max(5, Math.min(95, m.cognitiveLoad + (Math.random() - 0.48) * 4));
            const newHR = m.biometricPermission && m.heartRate !== undefined
              ? Math.max(48, Math.min(155, m.heartRate + (Math.random() - 0.48) * 4))
              : m.heartRate;
            return { ...m, sensoryLoad: newSensory, cognitiveLoad: newCognitive, heartRate: newHR };
          }),
        }));

        // Auto-alert check on updated values
        updated.forEach(c => {
          c.members.forEach(m => {
            if (!m.biometricPermission) return;
            const key = (reason: string) => `${m.id}-${reason}`;

            // Heart rate critical
            if (m.heartRate && m.heartRate >= HR_CRITICAL && !autoAlertedRef.current.has(key("hr"))) {
              autoAlertedRef.current.add(key("hr"));
              const caregivers = updated.flatMap(cg => cg.members).filter(x => x.isDesignatedCaregiver && x.canReceiveAlerts);
              if (caregivers.length > 0) {
                toast.error(`🫀 ${m.name}'s heart rate is critical (${Math.round(m.heartRate)} bpm) — caregivers notified.`, { duration: 6000 });
              }
              setTimeout(() => autoAlertedRef.current.delete(key("hr")), 60000);
            }
            // Sensory load critical
            if (m.sensoryLoad >= LOAD_CRITICAL && !autoAlertedRef.current.has(key("sensory"))) {
              autoAlertedRef.current.add(key("sensory"));
              toast.error(`⚡ ${m.name}'s sensory load is very high (${Math.round(m.sensoryLoad)}%).`, { duration: 5000 });
              setTimeout(() => autoAlertedRef.current.delete(key("sensory")), 60000);
            }
            // Cognitive load critical
            if (m.cognitiveLoad >= LOAD_CRITICAL && !autoAlertedRef.current.has(key("cognitive"))) {
              autoAlertedRef.current.add(key("cognitive"));
              toast.error(`🧠 ${m.name}'s cognitive load is very high (${Math.round(m.cognitiveLoad)}%).`, { duration: 5000 });
              setTimeout(() => autoAlertedRef.current.delete(key("cognitive")), 60000);
            }
          });
        });

        return updated;
      });
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // Location warning
  useEffect(() => {
    if (currentLocation === "Not set") return;
    const profile = locationProfiles[currentLocation];
    if (!profile) { setLocationWarning(false); return; }
    if ((profile.type === "High-Stim" || profile.type === "Very High-Stim") && cognitiveReservoir > 70) {
      setLocationWarning(true);
      setLocationWarningMessage(`⚠️ ${currentLocation} is ${profile.type}. Your cognitive load (${cognitiveReservoir.toFixed(0)}%) may push you toward overload within 15–30 min.`);
    } else if (profile.type === "Very High-Stim" && cognitiveReservoir > 50) {
      setLocationWarning(true);
      setLocationWarningMessage(`⚠️ ${currentLocation} has very high stimulation. Consider limiting time here.`);
    } else {
      setLocationWarning(false);
      if ((profile.type === "Low-Stim" || profile.type === "Very Low-Stim") && cognitiveReservoir > 60) {
        toast.success(`${currentLocation} is a great recovery spot.`, { duration: 4000 });
      }
    }
  }, [currentLocation, cognitiveReservoir]);

  const sendAlert = async (memberId: string, reason?: string) => {
    const name = circles.flatMap(c => c.members).find(m => m.id === memberId)?.name ?? "Caregiver";
    setAlertSentTo(prev => new Set([...prev, memberId]));
    setAlertConfirm(null);
    setAlertSuccess(name);
    setTimeout(() => setAlertSuccess(null), 4000);
    await api.sendAlert(memberId, name, reason);
  };

  const updateMembers = (circleId: string, fn: (members: CircleMember[]) => CircleMember[]) => {
    setCircles(prev => prev.map(c => c.id === circleId ? { ...c, members: fn(c.members) } : c));
  };

  const addMember = async () => {
    if (!newName.trim() || !activeCircle) return;
    const member = await api.addMember(activeCircle.id, {
      name: newName.trim(),
      relationship: newRelationship,
      phone: newPhone.trim() || undefined,
      biometricPermission: newBiometric,
    });
    updateMembers(activeCircle.id, ms => [...ms, member]);
    setNewName(""); setNewPhone(""); setNewBiometric(false); setShowAddMember(false);
  };

  const removeMember = async (circleId: string, memberId: string) => {
    await api.removeMember(circleId, memberId);
    updateMembers(circleId, ms => ms.filter(m => m.id !== memberId));
    setSelectedMember(null);
  };

  const createCircle = async () => {
    if (!newCircleName.trim()) return;
    const circle = await api.createCircle(newCircleName.trim(), newCircleEmoji);
    setCircles(prev => [...prev, circle]);
    setActiveCircleId(circle.id);
    setNewCircleName(""); setShowCreateCircle(false);
  };

  const deleteCircle = async (circleId: string) => {
    await api.deleteCircle(circleId);
    setCircles(prev => {
      const updated = prev.filter(c => c.id !== circleId);
      if (activeCircleId === circleId) setActiveCircleId(updated[0]?.id ?? "");
      return updated;
    });
    setCircleDropdownOpen(false);
  };

  // Members with biometric alerts in any circle
  const biometricAlertMembers = circles.flatMap(c => c.members).filter(m =>
    m.biometricPermission && (
      (m.heartRate && m.heartRate >= HR_HIGH) ||
      m.sensoryLoad >= LOAD_HIGH ||
      m.cognitiveLoad >= LOAD_HIGH
    )
  );

  const allCaregivers = circles.flatMap(c => c.members).filter(m => m.isDesignatedCaregiver && m.canReceiveAlerts);
  const isInDistress = myDistress >= 70;
  const currentProfile = locationProfiles[currentLocation];

  // Helper: get the circle a member belongs to
  const getMemberCircle = (memberId: string) => circles.find(c => c.members.some(m => m.id === memberId));

  return (
    <div className="min-h-full flex flex-col pb-4 relative"
      style={{ background: "linear-gradient(to bottom,rgba(10,5,20,1) 0%,rgba(0,0,0,1) 100%)" }}>

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-semibold text-white">My Circles</h1>
          </div>
          <button onClick={() => setShowCreateCircle(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors">
            <FolderPlus className="w-3.5 h-3.5" />
            New Circle
          </button>
        </div>
        <p className="text-gray-500 text-sm">Your support network</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">

        {/* ── Biometric Alert Banner ── */}
        <AnimatePresence>
          {biometricAlertMembers.length > 0 && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <HeartPulse className="w-4 h-4 text-red-400" />
                <p className="text-sm font-semibold text-red-300">Biometric Alert</p>
              </div>
              {biometricAlertMembers.map(m => {
                const issues: string[] = [];
                if (m.heartRate && m.heartRate >= HR_CRITICAL) issues.push(`Heart rate ${Math.round(m.heartRate)} bpm`);
                else if (m.heartRate && m.heartRate >= HR_HIGH) issues.push(`Heart rate elevated (${Math.round(m.heartRate)} bpm)`);
                if (m.sensoryLoad >= LOAD_CRITICAL) issues.push(`Sensory overload (${Math.round(m.sensoryLoad)}%)`);
                else if (m.sensoryLoad >= LOAD_HIGH) issues.push(`Sensory high (${Math.round(m.sensoryLoad)}%)`);
                if (m.cognitiveLoad >= LOAD_CRITICAL) issues.push(`Cognitive overload (${Math.round(m.cognitiveLoad)}%)`);
                else if (m.cognitiveLoad >= LOAD_HIGH) issues.push(`Cognitive high (${Math.round(m.cognitiveLoad)}%)`);
                return (
                  <div key={m.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-white font-medium">{m.name}</p>
                      <p className="text-[10px] text-red-300/80">{issues.join(" · ")}</p>
                    </div>
                    {m.canReceiveAlerts && !alertSentTo.has(m.id) && (
                      <button onClick={() => setAlertConfirm({ memberId: m.id, reason: issues[0] })}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-medium hover:bg-red-500/30 transition-colors">
                        <BellRing className="w-2.5 h-2.5" />
                        Alert
                      </button>
                    )}
                    {alertSentTo.has(m.id) && (
                      <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Notified
                      </span>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Alert Success ── */}
        <AnimatePresence>
          {alertSuccess && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-emerald-300 text-sm font-medium">Alert sent to {alertSuccess}</p>
                <p className="text-emerald-400/70 text-xs">They have been notified you need support.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Distress Signal ── */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-200">My Distress Signal</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
              myDistress < 40 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
              : myDistress < 70 ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
              : "text-red-400 bg-red-500/10 border-red-500/30"
            }`}>
              {myDistress < 40 ? "Okay" : myDistress < 70 ? "Struggling" : "Need help"}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Calm</span><span>{myDistress}%</span><span>Distress</span>
            </div>
            <input type="range" min={0} max={100} value={myDistress}
              onChange={e => setMyDistress(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right,${myDistress < 40 ? "#10b981" : myDistress < 70 ? "#f59e0b" : "#ef4444"} ${myDistress}%,#1f2937 ${myDistress}%)` }}
            />
            <p className="text-xs text-gray-500">Slide to indicate how you are feeling right now</p>
          </div>
          {isInDistress && allCaregivers.length > 0 && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} className="pt-2 border-t border-gray-800">
              <p className="text-xs text-red-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                High distress — alert a caregiver?
              </p>
              <div className="flex flex-wrap gap-2">
                {allCaregivers.map(c => (
                  <button key={c.id} onClick={() => !alertSentTo.has(c.id) && setAlertConfirm({ memberId: c.id })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      alertSentTo.has(c.id) ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                      : "text-red-300 bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                    }`}>
                    {alertSentTo.has(c.id) ? <CheckCircle className="w-3 h-3" /> : <BellRing className="w-3 h-3" />}
                    {alertSentTo.has(c.id) ? "Sent" : `Alert ${c.name}`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Alert Confirm ── */}
        <AnimatePresence>
          {alertConfirm && (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="bg-gray-900 border border-red-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-400" />
                <p className="text-sm font-medium text-white">Send distress alert?</p>
              </div>
              <p className="text-xs text-gray-400">
                A message will be sent to{" "}
                <span className="text-white font-medium">
                  {circles.flatMap(c => c.members).find(m => m.id === alertConfirm.memberId)?.name}
                </span>
                {alertConfirm.reason ? ` regarding: ${alertConfirm.reason}` : " letting them know you need support right now"}.
              </p>
              <div className="flex gap-2">
                <button onClick={() => sendAlert(alertConfirm.memberId, alertConfirm.reason)}
                  className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors">
                  Yes, send alert
                </button>
                <button onClick={() => setAlertConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-sm hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Location Predictions ── */}
        <div className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
          locationWarning ? "bg-red-500/10 border-red-500/40" : currentLocation !== "Not set" ? "bg-indigo-500/5 border-indigo-500/30" : "bg-gray-900/50 border-gray-800"
        }`}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className={`w-4 h-4 ${locationWarning ? "text-red-400" : "text-indigo-400"}`} />
                <h2 className="text-sm font-semibold text-gray-200">Location Predictions</h2>
              </div>
              {currentProfile && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${stimTypeColor(currentProfile.type).badge}`}>
                  {currentProfile.type}
                </span>
              )}
            </div>
            {currentLocation !== "Not set" && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-sm text-gray-300">{currentLocation}</span>
              </div>
            )}
            <button onClick={() => setShowLocationPicker(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
              <MapPin className="w-4 h-4" />
              {currentLocation === "Not set" ? "Set My Location" : "Change Location"}
              <ChevronDown className={`w-4 h-4 transition-transform ${showLocationPicker ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showLocationPicker && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                  <div className="pt-1 space-y-3">
                    <input value={customLocationInput} onChange={e => setCustomLocationInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && customLocationInput.trim()) { setCurrentLocation(customLocationInput.trim()); setShowLocationPicker(false); setCustomLocationInput(""); toast.success(`Location set to ${customLocationInput.trim()}`); } }}
                      placeholder="Type a location… (Enter to set)"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60" />
                    <div className="h-px bg-gray-800" />
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {Object.entries(locationProfiles).map(([name, profile]) => {
                        const c = stimTypeColor(profile.type);
                        return (
                          <button key={name} onClick={() => { setCurrentLocation(name); setShowLocationPicker(false); toast.success(`Location set to ${name}`); }}
                            className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl border transition-all text-sm ${
                              currentLocation === name ? "bg-indigo-500/20 border-indigo-500/50 text-white" : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/70"
                            }`}>
                            <span>{name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${c.badge}`}>{profile.type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {locationWarning && !showLocationPicker && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200">{locationWarningMessage}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { const low = Object.entries(locationProfiles).filter(([,p]) => p.type === "Low-Stim" || p.type === "Very Low-Stim").map(([n]) => n).slice(0,3).join(", "); toast.info(`Consider: ${low}`, { duration: 6000 }); }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                    Suggest calmer spots
                  </button>
                  <button onClick={() => setLocationWarning(false)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-xs hover:bg-gray-700 transition-colors">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
            {currentProfile && !locationWarning && !showLocationPicker && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Volume2, label: "Noise",  value: `${currentProfile.noiseLevel} dB`, color: "text-cyan-400"   },
                  { icon: Eye,     label: "Visual", value: `${currentProfile.visualStim}%`,   color: "text-purple-400" },
                  { icon: Activity,label: "Social", value: `${currentProfile.socialLoad}%`,   color: "text-amber-400"  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-black/20 p-2.5 rounded-xl border border-gray-800 text-center">
                    <Icon className={`w-3.5 h-3.5 ${color} mx-auto mb-1`} />
                    <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
                    <p className="text-xs font-semibold text-gray-200">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Circle Selector + Members ── */}
        {circles.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-gray-800 bg-gray-900/40">
            <Users className="w-8 h-8 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-300 text-sm font-medium mb-1">No circles yet</p>
            <p className="text-gray-500 text-xs mb-4 px-6">Create a circle and add the people you'd like to keep in your support network.</p>
            <button onClick={() => setShowCreateCircle(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors">
              <FolderPlus className="w-3.5 h-3.5" />
              Create your first circle
            </button>
          </div>
        ) : (
        <div>
          {/* Selector row */}
          <div className="flex items-center gap-2 mb-3">
            <div ref={dropdownRef} className="relative flex-1">
              <button onClick={() => setCircleDropdownOpen(v => !v)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{activeCircle?.emoji}</span>
                  <span className="text-sm font-semibold text-white">{activeCircle?.name}</span>
                  <span className="text-xs text-gray-500">
                    {activeCircle?.members.length ?? 0} {activeCircle?.members.length === 1 ? "member" : "members"}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${circleDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {circleDropdownOpen && (
                  <motion.div initial={{ opacity:0, y:-6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-6, scale:0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl z-20">
                    {circles.map(circle => {
                      const circleAlerts = circle.members.filter(m => m.biometricPermission && (
                        (m.heartRate && m.heartRate >= HR_HIGH) || m.sensoryLoad >= LOAD_HIGH || m.cognitiveLoad >= LOAD_HIGH
                      )).length;
                      return (
                        <div key={circle.id}
                          className={`flex items-center justify-between px-4 py-3 transition-colors cursor-pointer ${circle.id === activeCircleId ? "bg-indigo-500/10" : "hover:bg-gray-900"}`}
                          onClick={() => { setActiveCircleId(circle.id); setCircleDropdownOpen(false); }}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-base leading-none">{circle.emoji}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${circle.id === activeCircleId ? "text-indigo-300" : "text-gray-200"}`}>{circle.name}</p>
                                {circleAlerts > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-medium">
                                    {circleAlerts} alert{circleAlerts > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500">{circle.members.length} {circle.members.length === 1 ? "member" : "members"} · {circle.members.filter(m => m.isOnline).length} online</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {circle.id === activeCircleId && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                            {circles.length > 1 && (
                              <button onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${circle.name}"?`)) deleteCircle(circle.id); }}
                                className="p-1 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-800 px-4 py-2.5">
                      <button onClick={() => { setCircleDropdownOpen(false); setShowCreateCircle(true); }}
                        className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        <FolderPlus className="w-3.5 h-3.5" />
                        Create new circle
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setShowAddMember(true)}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors shrink-0">
              <UserPlus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {activeCircle && (
            <p className="text-xs text-gray-600 mb-2">
              {activeCircle.members.filter(m => m.isOnline).length} of {activeCircle.members.length} online
              {activeCircle.members.filter(m => m.biometricPermission).length > 0 && (
                <span className="ml-2 text-rose-500/70">· {activeCircle.members.filter(m => m.biometricPermission).length} biometric</span>
              )}
            </p>
          )}

          {/* Members list */}
          {activeCircle?.members.length === 0 ? (
            <div className="text-center py-10 text-gray-600 text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No members yet — add someone to this circle.
            </div>
          ) : (
            <div className="space-y-2">
              {activeCircle?.members.map((member, i) => {
                const sC = loadColor(member.sensoryLoad);
                const cC = loadColor(member.cognitiveLoad);
                const isAlert = member.biometricPermission && (
                  (member.heartRate && member.heartRate >= HR_HIGH) ||
                  member.sensoryLoad >= LOAD_HIGH ||
                  member.cognitiveLoad >= LOAD_HIGH
                );
                return (
                  <motion.div key={member.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedMember(member)}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] ${
                      isAlert
                        ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50"
                        : "bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900/80"
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 rounded-full border flex items-center justify-center ${
                          isAlert
                            ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/40"
                            : "bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border-indigo-500/30"
                        }`}>
                          <span className={`text-sm font-semibold ${isAlert ? "text-red-300" : "text-indigo-300"}`}>{member.avatar}</span>
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${member.isOnline ? "bg-emerald-500" : "bg-gray-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-100">{member.name}</span>
                            {member.isDesignatedCaregiver && <Shield className="w-3 h-3 text-indigo-400" />}
                            {member.biometricPermission && (
                              <HrIcon bpm={member.heartRate ?? 70} size={12} />
                            )}
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${relColor[member.relationship]}`}>{member.relationship}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 mb-2 flex-wrap">
                          {member.isOnline ? <Wifi className="w-2.5 h-2.5 text-emerald-500" /> : <WifiOff className="w-2.5 h-2.5 text-gray-600" />}
                          <span className="text-xs text-gray-500">{member.lastSeen}</span>
                          {member.biometricPermission && member.heartRate !== undefined && (
                            <span className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${hrColor(member.heartRate).bg} ${hrColor(member.heartRate).text}`}>
                              <Heart className="w-2 h-2" />
                              {Math.round(member.heartRate)} bpm
                            </span>
                          )}
                        </div>
                        {/* Location row */}
                        {member.currentLocation && (() => {
                          const loc = locationProfiles[member.currentLocation!];
                          const sc = loc ? stimTypeColor(loc.type) : null;
                          return (
                            <div className="flex items-center gap-1.5 mb-2">
                              <MapPin className="w-2.5 h-2.5 text-gray-600 shrink-0" />
                              <span className="text-[10px] text-gray-500 truncate">{member.currentLocation}</span>
                              {sc && loc && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${sc.badge}`}>{loc.type}</span>
                              )}
                            </div>
                          );
                        })()}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-14 shrink-0">Sensory</span>
                            <MiniBar value={member.sensoryLoad} color={sC.bar} />
                            <span className={`text-[10px] font-medium w-8 text-right shrink-0 ${sC.text}`}>{Math.round(member.sensoryLoad)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-14 shrink-0">Cognitive</span>
                            <MiniBar value={member.cognitiveLoad} color={cC.bar} />
                            <span className={`text-[10px] font-medium w-8 text-right shrink-0 ${cC.text}`}>{Math.round(member.cognitiveLoad)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* Privacy note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-900/40 border border-gray-800">
          <Shield className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">Biometric and load data is shared only by members who have given explicit permission. No data is stored outside this device.</p>
        </div>
      </div>

      {/* ── Member Detail Sheet ── */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 bg-black/70 z-50 flex items-end" onClick={() => setSelectedMember(null)}>
            <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", damping:30, stiffness:300 }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-gray-950 border-t border-gray-800 rounded-t-3xl p-6 space-y-5">
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto -mt-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-300">{selectedMember.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{selectedMember.name}</h3>
                      {selectedMember.isDesignatedCaregiver && <Shield className="w-4 h-4 text-indigo-400" />}
                      {selectedMember.biometricPermission && <HrIcon bpm={selectedMember.heartRate ?? 70} size={14} />}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${relColor[selectedMember.relationship]}`}>{selectedMember.relationship}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-2 rounded-full hover:bg-gray-800 text-gray-500"><X className="w-5 h-5" /></button>
              </div>

              {/* Biometric + loads grid */}
              <div className={`grid gap-3 ${selectedMember.biometricPermission && selectedMember.heartRate !== undefined ? "grid-cols-3" : "grid-cols-2"}`}>
                {selectedMember.biometricPermission && selectedMember.heartRate !== undefined && (
                  <div className="bg-gray-900 rounded-xl p-3 space-y-1 text-center">
                    <HeartPulse className={`w-5 h-5 mx-auto ${hrColor(selectedMember.heartRate).text}`} />
                    <p className={`text-2xl font-bold ${hrColor(selectedMember.heartRate).text}`}>{Math.round(selectedMember.heartRate)}</p>
                    <p className="text-[10px] text-gray-500">bpm</p>
                    <p className={`text-[10px] font-medium ${hrColor(selectedMember.heartRate).text}`}>{hrColor(selectedMember.heartRate).label}</p>
                  </div>
                )}
                {[{ label:"Sensory Load", value:selectedMember.sensoryLoad }, { label:"Cognitive Load", value:selectedMember.cognitiveLoad }].map(({ label, value }) => {
                  const c = loadColor(value);
                  return (
                    <div key={label} className="bg-gray-900 rounded-xl p-3 space-y-2">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className={`text-2xl font-bold ${c.text}`}>{Math.round(value)}%</p>
                      <MiniBar value={value} color={c.bar} />
                      <p className={`text-xs font-medium ${c.text}`}>{c.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Location card */}
              {selectedMember.currentLocation ? (() => {
                const loc = locationProfiles[selectedMember.currentLocation!];
                const sc = loc ? stimTypeColor(loc.type) : null;
                return (
                  <div className={`rounded-xl border p-3 space-y-2 ${sc ? sc.border : "border-gray-800"} bg-gray-900`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-200">{selectedMember.currentLocation}</p>
                      </div>
                      {sc && loc && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${sc.badge}`}>{loc.type}</span>
                      )}
                    </div>
                    {loc && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {[
                          { icon: Volume2, label: "Noise",  value: `${loc.noiseLevel} dB`, color: "text-cyan-400"   },
                          { icon: Eye,     label: "Visual", value: `${loc.visualStim}%`,   color: "text-purple-400" },
                          { icon: Activity,label: "Social", value: `${loc.socialLoad}%`,   color: "text-amber-400"  },
                        ].map(({ icon: Icon, label, value, color }) => (
                          <div key={label} className="text-center">
                            <Icon className={`w-3 h-3 ${color} mx-auto mb-0.5`} />
                            <p className="text-[10px] text-gray-600">{label}</p>
                            <p className={`text-xs font-semibold ${color}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <MapPin className="w-4 h-4 text-gray-600 shrink-0" />
                  <p className="text-xs text-gray-500">Location not shared by {selectedMember.name}.</p>
                </div>
              )}

              {/* Biometric permission note */}
              {!selectedMember.biometricPermission && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <Heart className="w-4 h-4 text-gray-600 shrink-0" />
                  <p className="text-xs text-gray-500">Biometric monitoring not enabled — {selectedMember.name} has not granted permission.</p>
                </div>
              )}

              <div className="space-y-2">
                {selectedMember.phone && (
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors text-left">
                    <Phone className="w-4 h-4 text-indigo-400" />
                    <div><p className="text-sm text-gray-200 font-medium">Call</p><p className="text-xs text-gray-500">{selectedMember.phone}</p></div>
                  </button>
                )}
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors text-left">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <div><p className="text-sm text-gray-200 font-medium">Send check-in</p><p className="text-xs text-gray-500">Let them know you are thinking of them</p></div>
                </button>
                {selectedMember.canReceiveAlerts && !alertSentTo.has(selectedMember.id) && (
                  <button onClick={() => { setAlertConfirm({ memberId: selectedMember.id }); setSelectedMember(null); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors text-left">
                    <BellRing className="w-4 h-4 text-red-400" />
                    <div><p className="text-sm text-red-300 font-medium">Send distress alert</p><p className="text-xs text-red-400/60">They will be notified immediately</p></div>
                  </button>
                )}
                <button onClick={() => { const c = getMemberCircle(selectedMember.id); if (c) removeMember(c.id, selectedMember.id); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900 transition-colors text-left">
                  <X className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Remove from circle</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Member Sheet ── */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 bg-black/70 z-50 flex items-end" onClick={() => setShowAddMember(false)}>
            <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", damping:30, stiffness:300 }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-gray-950 border-t border-gray-800 rounded-t-3xl p-6 space-y-4">
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto -mt-2" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Add to {activeCircle?.name}</h3>
                  <p className="text-xs text-gray-500">{activeCircle?.emoji} {activeCircle?.name}</p>
                </div>
                <button onClick={() => setShowAddMember(false)} className="p-2 rounded-full hover:bg-gray-800 text-gray-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Name</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Their name"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Relationship</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Caregiver","Family","Friend","Therapist","Other"] as const).map(rel => (
                      <button key={rel} onClick={() => setNewRelationship(rel)}
                        className={`py-2 px-2 rounded-xl text-xs border transition-all ${newRelationship === rel ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}>
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Phone (for alerts)</label>
                  <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1 555-0000 (optional)" type="tel"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                {/* Biometric permission toggle */}
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Biometric monitoring</label>
                  <button onClick={() => setNewBiometric(v => !v)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${newBiometric ? "bg-rose-500/10 border-rose-500/40" : "bg-gray-900 border-gray-800 hover:border-gray-700"}`}>
                    <div className="flex items-center gap-2">
                      <HeartPulse className={`w-4 h-4 ${newBiometric ? "text-rose-400" : "text-gray-600"}`} />
                      <div className="text-left">
                        <p className={`text-xs font-medium ${newBiometric ? "text-rose-300" : "text-gray-400"}`}>
                          {newBiometric ? "Permission granted" : "Grant biometric access"}
                        </p>
                        <p className="text-[10px] text-gray-600">Heart rate, sensory & cognitive monitoring</p>
                      </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${newBiometric ? "bg-rose-500" : "bg-gray-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${newBiometric ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </button>
                </div>
              </div>
              <button onClick={addMember} disabled={!newName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Add to {activeCircle?.name}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create Circle Sheet ── */}
      <AnimatePresence>
        {showCreateCircle && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 bg-black/70 z-50 flex items-end" onClick={() => setShowCreateCircle(false)}>
            <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", damping:30, stiffness:300 }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-gray-950 border-t border-gray-800 rounded-t-3xl p-6 space-y-4">
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto -mt-2" />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">New Circle</h3>
                <button onClick={() => setShowCreateCircle(false)} className="p-2 rounded-full hover:bg-gray-800 text-gray-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Circle name</label>
                  <input value={newCircleName} onChange={e => setNewCircleName(e.target.value)} placeholder="e.g. Kids, Work, Neighbours…"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Pick an emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {CIRCLE_EMOJIS.map(e => (
                      <button key={e} onClick={() => setNewCircleEmoji(e)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${newCircleEmoji === e ? "border-indigo-500/60 bg-indigo-500/20 scale-110" : "border-gray-800 bg-gray-900 hover:scale-105"}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={createCircle} disabled={!newCircleName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Create Circle
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
