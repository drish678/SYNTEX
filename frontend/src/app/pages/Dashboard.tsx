import { useState, useEffect } from "react";
import { Volume2, Brain, AlertTriangle, Sparkles, Eye, Target, Smartphone, Clock, MoveRight, Heart, Activity, Info, User, AlertCircle, Shield, X } from "lucide-react";
import { AvatarSVG, AvatarConfig, DEFAULT_AVATAR } from "../components/AvatarCreator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useOutletContext } from "react-router";
import { FuelGauge } from "../components/FuelGauge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Separator } from "../components/ui/separator";
import { JustInTimeAlert } from "../components/JustInTimeAlert";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useMonitoring } from "../contexts/MonitoringContext";
import { api } from "../api";

interface OutletContext {
  appEnabled: boolean;
  triggerCrisis: () => void;
  dimLevel: number;
  setDimLevel: (level: number) => void;
  extraDimEnabled: boolean;
  setExtraDimEnabled: (enabled: boolean) => void;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { appEnabled, triggerCrisis, dimLevel, setDimLevel, extraDimEnabled, setExtraDimEnabled } = useOutletContext<OutletContext>();
  
  // Use monitoring context for real-time calculations
  const monitoring = useMonitoring();
  const sensoryLoad = monitoring.sensoryLoad;
  const mentalLoad = monitoring.mentalLoad;
  const cognitiveReservoir = monitoring.cognitiveReservoir;
  const timeToOverload = monitoring.timeToOverload;
  const noiseLevel = monitoring.noiseLevel;
  const sessionMinutes = Math.floor(monitoring.sessionSeconds / 60);


  const [showAlert, setShowAlert] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(new Date().getHours());
  const [profileData, setProfileData] = useState<any>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 18 ? "Good afternoon" : "Good evening";
  const [isPaused, setIsPaused] = useState(false);

  // Task tracking (just used for the Mental Load gauge subtitle count)
  const [tasks, setTasks] = useState<string[]>([]);
  const [completedTasksToday, setCompletedTasksToday] = useState(0);

  const [showNoiseAlert, setShowNoiseAlert] = useState(false);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showSemicolonInfo, setShowSemicolonInfo] = useState(false);
  const [showOverloadInfo, setShowOverloadInfo] = useState(false);

  // Case 1: Avoider Buffer state
  const [avoiderBufferActive, setAvoiderBufferActive] = useState(false);
  const [audioVisualSpikeDetected, setAudioVisualSpikeDetected] = useState(false);
  
  // Case 2: Sensory Reset state
  const [sensoryResetSuggested, setSensoryResetSuggested] = useState(false);
  const [sensoryResetActive, setSensoryResetActive] = useState(false);
  const [sensoryResetTimer, setSensoryResetTimer] = useState(0);
  
  // Case 3: Social Load state
  const [socialBattery, setSocialBattery] = useState(100);
  const [socialLoadHigh, setSocialLoadHigh] = useState(false);
  const [focusIsolationActive, setFocusIsolationActive] = useState(false);

  // Cognitive Reservoir - "Getting Full" system - now from monitoring context
  const [cautionAlertShown, setCautionAlertShown] = useState(false);
  const [overloadAlertShown, setOverloadAlertShown] = useState(false);
  const [protectiveModeActive, setProtectiveModeActive] = useState(false);
  const [quickResetActive, setQuickResetActive] = useState(false);
  const [quickResetTimer, setQuickResetTimer] = useState(0);
  const [recoveryActive, setRecoveryActive] = useState(false);


  // Check if user has completed profile
  useEffect(() => {
    api.getProfile().then((profile) => {
      if (profile) setProfileData(profile);
    });

    api.getAvatar().then((avatar) => {
      if (avatar) setAvatarConfig(avatar);
    });

    // Load tasks (just used for the active-task count here; full CRUD lives in Tasks.tsx)
    api.listTasks().then((loadedTasks) => {
      setTasks(loadedTasks.filter((t) => !t.completed).map((t) => t.title));
    });
  }, []);

  // Monitor sensory load for alerts - calculations now in MonitoringContext
  useEffect(() => {
    if (!appEnabled || isPaused) return;

    // Trigger alert if sensory load gets too high
    if (sensoryLoad > 85 && !showAlert) {
      setShowAlert(true);
    }
  }, [appEnabled, isPaused, sensoryLoad, showAlert]);

  // Environmental monitoring — noise now comes from the real microphone
  // reading in MonitoringContext; this just reacts to it for alerts/cases.
  useEffect(() => {
    if (!appEnabled || isPaused || noiseLevel == null) return;

    // Case 1: Detect Audio-Visual Spike (85dB+)
    if (noiseLevel >= 85 && sensoryLoad > 75) {
      setAudioVisualSpikeDetected(true);
    } else if (noiseLevel < 80) {
      setAudioVisualSpikeDetected(false);
    }

    // Trigger alert if noise is too high
    if (noiseLevel > 70 && !showNoiseAlert) {
      setShowNoiseAlert(true);
    } else if (noiseLevel < 60) {
      setShowNoiseAlert(false);
    }
  }, [appEnabled, isPaused, noiseLevel, sensoryLoad, showNoiseAlert]);

  // Case 2/3 demo scenarios + real break suggestion, based on real elapsed
  // session time and current mental load (no more fake random ticks).
  useEffect(() => {
    if (!appEnabled || isPaused) return;

    const currentHour = new Date().getHours();
    if (currentHour >= 17 && mentalLoad > 70 && sessionMinutes > 180) {
      setSensoryResetSuggested(true);
    }

    if (sessionMinutes > 25 && mentalLoad > 60) {
      setShowBreakSuggestion(true);
    }
  }, [appEnabled, isPaused, mentalLoad, sessionMinutes]);

  // Automatic screen dimming based on sensory load
  useEffect(() => {
    if (!appEnabled || extraDimEnabled) return;
    
    // Auto-dim screen when sensory load is high or critical
    if (sensoryLoad >= 85) {
      // Critical level - maximum auto-dim (50%)
      setDimLevel(50);
    } else if (sensoryLoad >= 70) {
      // High level - moderate auto-dim (30%)
      setDimLevel(30);
    } else {
      // Normal level - no dim
      setDimLevel(0);
    }
  }, [sensoryLoad, appEnabled, extraDimEnabled, setDimLevel]);

  // Cognitive Reservoir monitoring - now handled by MonitoringContext
  // This effect watches for threshold crossings and triggers alerts
  useEffect(() => {
    if (!appEnabled || isPaused || protectiveModeActive) return;

    // Phase 1: Caution Zone (80%)
    if (cognitiveReservoir >= 80 && cognitiveReservoir < 100 && !cautionAlertShown && !protectiveModeActive) {
      setCautionAlertShown(true);
      toast.warning("Cognitive Budget at 80%", {
        description: timeToOverload 
          ? `You may reach capacity in ${Math.round(timeToOverload)} minutes.`
          : "Consider a 5-minute sensory reset to maintain productivity.",
        duration: 8000,
      });
    } else if (cognitiveReservoir < 75) {
      setCautionAlertShown(false);
    }
    
    // Phase 2: Overload Zone (100%)
    if (cognitiveReservoir >= 95 && !overloadAlertShown) {
      setOverloadAlertShown(true);
      setProtectiveModeActive(true);
      toast.error("Cognitive Threshold Reached", {
        description: "SYNTEX is engaging Protective Mode to prevent burnout.",
        duration: 10000,
      });
    }
  }, [cognitiveReservoir, appEnabled, isPaused, cautionAlertShown, overloadAlertShown, protectiveModeActive, timeToOverload]);


  const getStatus = (value: number) => {
    if (value < 30) return { label: "Critical", color: "text-red-400" };
    if (value < 60) return { label: "Moderate", color: "text-amber-400" };
    return { label: "Optimal", color: "text-emerald-400" };
  };

  const getLoadStatus = (value: number) => {
    if (value > 70) return { label: "High", color: "text-red-400" };
    if (value > 40) return { label: "Moderate", color: "text-amber-400" };
    return { label: "Low", color: "text-emerald-400" };
  };

  return (
    <div 
      className="min-h-full px-6 py-6"
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 10, 30, 1) 0%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Avatar Greeting */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500/40 flex-shrink-0"
            style={{ boxShadow: "0 0 20px rgba(99,102,241,0.25)" }}
          >
            <AvatarSVG config={avatarConfig} size={56} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Welcome back
              <span
                className="text-indigo-400 text-lg"
                style={{ textShadow: "0 0 12px rgba(99,102,241,0.9), 0 0 24px rgba(99,102,241,0.5)" }}
              >
                ✦
              </span>
            </h2>
            {profileData?.name && (
              <p className="text-sm text-gray-500 mt-0.5">{profileData.name}</p>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-2xl mb-1 text-white tracking-wide flex items-center gap-3" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, letterSpacing: '0.02em' }}>
            Your Current State
          </h2>
          <p className="text-sm text-gray-400">Real-time monitoring • {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
        </div>

        {/* Skip Profile Button - Show if no profile */}
        {!profileData && (
          <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/30 p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base text-white font-medium">Create Your Profile</h3>
                  <p className="text-sm text-gray-400">Help SYNTEX better understand your needs</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate("/calibration")}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white"
                  size="sm"
                >
                  Create Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Triad Dashboard */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <FuelGauge
            title="Sensory Load"
            subtitle={monitoring.location !== "Not set" ? monitoring.location : "Set your location"}
            value={sensoryLoad}
            icon={Eye}
            color="cyan"
            status={getStatus(sensoryLoad)}
            inverted={true}
          />

          <FuelGauge
            title="Mental Load Level"
            subtitle={`${tasks.length} active task${tasks.length !== 1 ? 's' : ''}`}
            value={mentalLoad}
            icon={Brain}
            color="purple"
            status={getLoadStatus(mentalLoad)}
            inverted={true}
          />
        </div>


        {/* Environmental Monitoring Section */}
        {appEnabled && (
          <div className="mb-8">
            <div className="mb-6">
              <h3 className="text-lg text-white tracking-wide flex items-center gap-2 mb-4" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, letterSpacing: '0.02em' }}>
                Environmental Monitoring
                <span className="text-cyan-200" style={{ textShadow: '0 0 12px rgba(165, 243, 252, 0.6), 0 0 6px rgba(165, 243, 252, 0.4)' }}>✦</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Noise Level Monitoring — real microphone reading */}
              <Card className={`border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                noiseLevel != null && noiseLevel > 70 ? 'bg-amber-500/5 border-amber-500/40 hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]' :
                noiseLevel != null && noiseLevel > 55 ? 'bg-cyan-500/5 border-cyan-500/30 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]' :
                'bg-emerald-500/5 border-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'
              }`}>
                <div className="p-6">
                  <div className="flex items-start gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${
                      noiseLevel != null && noiseLevel > 70 ? 'bg-amber-500/20' :
                      noiseLevel != null && noiseLevel > 55 ? 'bg-cyan-500/20' :
                      'bg-emerald-500/20'
                    } flex items-center justify-center flex-shrink-0`}>
                      <Volume2 className={`w-4 h-4 ${
                        noiseLevel != null && noiseLevel > 70 ? 'text-amber-400' :
                        noiseLevel != null && noiseLevel > 55 ? 'text-cyan-400' :
                        'text-emerald-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-white">Background Noise</h4>
                    </div>
                  </div>

                  {noiseLevel == null ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400">Grant microphone access to measure the noise around you. Nothing is recorded.</p>
                      <Button
                        size="sm"
                        className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 w-full"
                        onClick={() => monitoring.requestMicPermission()}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        {monitoring.micPermission === 'denied' ? 'Access denied — try again' : 'Grant Microphone Access'}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className={`text-4xl font-bold mb-2 ${
                          noiseLevel > 70 ? 'text-amber-400' : noiseLevel > 55 ? 'text-cyan-400' : 'text-emerald-400'
                        }`}>
                          {noiseLevel.toFixed(0)} <span className="text-2xl">dB</span>
                        </div>
                        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              noiseLevel > 70 ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                              noiseLevel > 55 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
                              'bg-gradient-to-r from-emerald-500 to-green-500'
                            }`}
                            style={{ width: `${Math.min((noiseLevel / 90) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {noiseLevel > 70 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-amber-400">High Noise</span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {noiseLevel.toFixed(0)} dB — may trigger sensory overload
                          </p>
                        </div>
                      )}
                      {noiseLevel > 55 && noiseLevel <= 70 && (
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                          <p className="text-sm text-gray-300">Moderate — {noiseLevel.toFixed(0)} dB</p>
                        </div>
                      )}
                      {noiseLevel <= 55 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                          <p className="text-sm text-gray-300">Optimal — {noiseLevel.toFixed(0)} dB</p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Whisper</span>
                          <span>Normal</span>
                          <span>Loud</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Screen Time — real elapsed session time */}
              <Card className={`border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                showBreakSuggestion ? 'bg-purple-500/5 border-purple-500/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]' :
                'bg-indigo-500/5 border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]'
              }`}>
                <div className="p-6">
                  <div className="flex items-start gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${
                      showBreakSuggestion ? 'bg-purple-500/20' : 'bg-indigo-500/20'
                    } flex items-center justify-center flex-shrink-0`}>
                      <Smartphone className={`w-4 h-4 ${
                        showBreakSuggestion ? 'text-purple-400' : 'text-indigo-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-white">Screen Time</h4>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className={`text-4xl font-bold mb-2 ${
                      showBreakSuggestion ? 'text-purple-400' : 'text-indigo-400'
                    }`}>
                      {sessionMinutes} <span className="text-2xl">min</span>
                    </div>
                    <p className="text-sm text-gray-400">Current session time</p>
                  </div>

                  {showBreakSuggestion && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">Break Recommended</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        You've been on screen for {sessionMinutes} minutes with a high mental load. Taking a break might help you reset.
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-300"
                        onClick={() => setShowBreakSuggestion(false)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}

                  {!showBreakSuggestion && sessionMinutes > 15 && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                      <p className="text-sm text-gray-300">Good progress — {sessionMinutes} min this session</p>
                    </div>
                  )}

                  {!showBreakSuggestion && sessionMinutes <= 15 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-sm text-gray-300">Fresh start — You're doing great!</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Ambient Brightness — best-effort, most browsers don't expose this */}
              <Card className="border-2 bg-gray-500/5 border-gray-700 transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-6">
                  <div className="flex items-start gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/30 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-white">Ambient Light</h4>
                    </div>
                  </div>

                  {monitoring.brightnessSupported && monitoring.brightnessLux != null ? (
                    <div className="text-4xl font-bold mb-2 text-gray-200">
                      {monitoring.brightnessLux.toFixed(0)} <span className="text-2xl">lux</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Not supported on this browser/device — most browsers don't expose ambient light or screen brightness to web pages.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Capacity Card */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Reaching Overload Card */}
          <Card className="bg-[#0f0f0f] border-amber-500/30 p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] cursor-pointer">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg text-white font-medium">Reaching Overload</h3>
              </div>
              <button
                onClick={() => setShowOverloadInfo(true)}
                className="w-7 h-7 rounded-lg bg-gray-800/50 hover:bg-gray-800 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Info className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Value aligned with scale */}
            <div className="mb-4">
              <div className="text-4xl font-bold text-amber-400 h-12 flex items-center">{mentalLoad.toFixed(0)}%</div>
            </div>

            {/* Visual Scale */}
            <div className="relative mb-6">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-300"
                  style={{ width: `${mentalLoad}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-3 -ml-3">
                <span className="text-emerald-400 text-center flex flex-col items-center" style={{ minWidth: '40px' }}>
                  <span className="text-xs">60</span>
                  <span className="text-[10px] tracking-wider">(Safe)</span>
                </span>
                <span className="text-amber-400 text-center flex flex-col items-center" style={{ minWidth: '55px' }}>
                  <span className="text-xs">80</span>
                  <span className="text-[10px] tracking-wider">(Caution)</span>
                </span>
                <span className="text-red-400 text-center flex flex-col items-center" style={{ minWidth: '60px' }}>
                  <span className="text-xs">100</span>
                  <span className="text-[10px] tracking-wider">(Overload)</span>
                </span>
              </div>
            </div>

            {/* Warning Message */}
            {mentalLoad >= 60 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  {mentalLoad >= 80 
                    ? "You're approaching overload. Take a break now to prevent burnout." 
                    : "You're getting close to your limit. Consider taking a short break soon or switching to easier tasks."}
                </p>
              </div>
            )}
            {mentalLoad < 60 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  You have good capacity right now. Great time for focused work.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Proactive Recommendations */}
        {appEnabled && (
          <>
            {/* Sensory Reset Suggestion */}
            {mentalLoad > 70 && timeOfDay >= 15 && (
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base mb-2 text-white">Sensory Reset Recommended</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Pattern detected: Your mental load tends to peak in the afternoon. A 20-minute sensory reset could help you avoid cognitive burnout.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Start 20-min Reset
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-300"
                      >
                        Maybe later
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* High Capacity Window */}
            {mentalLoad < 40 && timeOfDay >= 8 && timeOfDay <= 11 && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base mb-2 text-white">Peak Performance Window</h3>
                    <p className="text-sm text-gray-300">
                      You're in your high-capacity zone! This is an optimal time for complex tasks that require deep thinking. Consider tackling your most challenging work now.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Avoider Buffer (High Sensory Environment) */}
            {sensoryLoad > 75 && (
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base mb-2 text-white">High Sensory Environment Detected</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Audio-visual spike detected. Your environment is experiencing high stimulation that may impact your working memory.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30"
                        onClick={() => {
                          setAvoiderBufferActive(true);
                          toast.success("Avoider Buffer Activated", {
                            description: "Screen dimmed and noise masking enabled to protect your working memory.",
                          });
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Activate Avoider Buffer
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-300"
                      >
                        I'm okay
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Case 1: Audio-Visual Spike Alert with Avoider Buffer */}
            {audioVisualSpikeDetected && !avoiderBufferActive && (
              <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 p-6 mb-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base mb-2 text-white flex items-center gap-2">
                      ⚠️ Audio-Visual Spike Detected
                      <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded">Case 1</span>
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                      <strong>Crowded Environment:</strong> {noiseLevel.toFixed(0)}dB noise + high visual stimulation detected.
                    </p>
                    <p className="text-sm text-gray-300 mb-4">
                      Your wearable shows elevated heart rate variability. This sensory-cognitive friction may impact working memory.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                        onClick={() => {
                          setAvoiderBufferActive(true);
                          setAudioVisualSpikeDetected(false);
                          toast.success("✨ Avoider Buffer Activated", {
                            description: "Noise-masking enabled in earbuds. High-contrast low-glare filter applied to screen.",
                            duration: 5000,
                          });
                        }}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Activate Avoider Buffer
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                        onClick={() => setAudioVisualSpikeDetected(false)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Case 2: Cognitive Wall - Sensory Reset */}
            {sensoryResetSuggested && !sensoryResetActive && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base mb-2 text-white flex items-center gap-2">
                      🧠 Cognitive Wall Detected
                      <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">Case 2</span>
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                      <strong>5:00 PM Pattern:</strong> High visual stimulation in morning lectures has led to a 20% drop in executive function.
                    </p>
                    <p className="text-sm text-gray-300 mb-4">
                      Your sensory consumption data suggests a proactive break before total burnout occurs.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                        onClick={() => {
                          setSensoryResetActive(true);
                          setSensoryResetSuggested(false);
                          setSensoryResetTimer(1200); // 20 minutes
                          monitoring.triggerSensoryReset(); // Recharge reservoir
                          toast.success("🌿 Sensory Reset Started", {
                            description: "Academic apps locked for 20 minutes. Follow the guided proprioceptive exercise.",
                            duration: 5000,
                          });
                          // Start timer
                          const timer = setInterval(() => {
                            setSensoryResetTimer((prev) => {
                              if (prev <= 1) {
                                clearInterval(timer);
                                setSensoryResetActive(false);
                                toast.success("Reset Complete", {
                                  description: "Heavy logic tasks shifted to tomorrow morning's high-capacity window.",
                                });
                                return 0;
                              }
                              return prev - 1;
                            });
                          }, 1000);
                        }}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Start 20-min Sensory Reset
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                        onClick={() => setSensoryResetSuggested(false)}
                      >
                        Later
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Case 3: Social Load High - Focus Isolation */}
            {socialLoadHigh && !focusIsolationActive && (
              <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base mb-2 text-white flex items-center gap-2">
                      👥 Social Load High
                      <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">Case 3</span>
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                      <strong>Social Battery: {socialBattery.toFixed(0)}%</strong> — Group meeting detected. Ambient social demand is causing hidden attention drain.
                    </p>
                    <p className="text-sm text-gray-300 mb-4">
                      Multiple voices + body language tracking + social cues are increasing your entropic load.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white"
                        onClick={() => {
                          setFocusIsolationActive(true);
                          setSocialLoadHigh(false);
                          toast.success("🎯 Focus Isolation Enabled", {
                            description: "Headset tuned out side-conversations. Direct voice enhanced to reduce cognitive effort.",
                            duration: 5000,
                          });
                        }}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Enable Focus Isolation
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                        onClick={() => setSocialLoadHigh(false)}
                      >
                        I'm fine
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Active Avoider Buffer Overlay */}
            {avoiderBufferActive && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 pointer-events-none transition-all duration-1000">
                <div className="absolute top-4 right-4 pointer-events-auto">
                  <Card className="bg-cyan-900/90 border-cyan-500/50 p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-cyan-300" />
                      <div>
                        <p className="text-sm text-cyan-300 font-medium">Avoider Buffer Active</p>
                        <p className="text-xs text-cyan-400">Screen dimmed • Noise masking on</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-4 text-cyan-300 hover:text-cyan-200"
                        onClick={() => {
                          setAvoiderBufferActive(false);
                          toast.info("Avoider Buffer Deactivated");
                        }}
                      >
                        Deactivate
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Active Sensory Reset Timer */}
            {sensoryResetActive && (
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40 p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-base text-white font-medium">Sensory Reset In Progress</h3>
                      <p className="text-sm text-purple-300">
                        {Math.floor(sensoryResetTimer / 60)}:{(sensoryResetTimer % 60).toString().padStart(2, '0')} remaining
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    onClick={() => {
                      setSensoryResetActive(false);
                      setSensoryResetTimer(0);
                      toast.info("Sensory Reset Cancelled");
                    }}
                  >
                    End Early
                  </Button>
                </div>
                <div className="mt-4 h-2 bg-purple-900/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                    style={{ width: `${((1200 - sensoryResetTimer) / 1200) * 100}%` }}
                  />
                </div>
              </Card>
            )}

            {/* Active Focus Isolation */}
            {focusIsolationActive && (
              <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/40 p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/30 flex items-center justify-center">
                      <Target className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-base text-white font-medium">Focus Isolation Active</h3>
                      <p className="text-sm text-amber-300">
                        Social Battery: {socialBattery.toFixed(0)}% • Filtering side conversations
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    onClick={() => {
                      setFocusIsolationActive(false);
                      toast.info("Focus Isolation Disabled");
                    }}
                  >
                    Disable
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Overload Info Modal */}
        <AnimatePresence>
          {showOverloadInfo && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={() => setShowOverloadInfo(false)}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[340px]"
              >
                <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-5 border-b border-amber-500/30 flex items-center justify-between relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-gray-900/40 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-base text-white font-semibold tracking-tight">Reaching Overload</h3>
                        <p className="text-xs text-amber-200/80 font-medium">How It Works</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOverloadInfo(false)}
                      className="w-9 h-9 rounded-xl bg-gray-900/40 backdrop-blur-sm hover:bg-gray-800/60 flex items-center justify-center transition-all flex-shrink-0 relative z-10 shadow-lg hover:scale-105"
                    >
                      <X className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4"
                    >
                      <h4 className="text-sm font-bold text-amber-400 mb-2 tracking-tight">📊 What This Measures</h4>
                      <p className="text-sm text-gray-300/90 leading-relaxed">
                        Your current mental load level - how close you are to cognitive overload based on combined sensory input, task complexity, and cognitive reservoir.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="space-y-3"
                    >
                      <h4 className="text-sm font-bold text-amber-400 tracking-tight">📈 The Scale</h4>
                      
                      <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">0-60%</span>
                        </div>
                        <p className="text-sm text-gray-300/90 leading-relaxed pl-4">
                          Safe zone - you have good capacity for focused work
                        </p>
                      </div>

                      <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-sm font-bold text-amber-400">60-80%</span>
                        </div>
                        <p className="text-sm text-gray-300/90 leading-relaxed pl-4">
                          Caution zone - getting close to your limit, consider taking a break
                        </p>
                      </div>

                      <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="text-sm font-bold text-red-400">80-100%</span>
                        </div>
                        <p className="text-sm text-gray-300/90 leading-relaxed pl-4">
                          Overload zone - immediate rest needed to prevent burnout
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
                    >
                      <h4 className="text-sm font-bold text-amber-400 mb-2 tracking-tight">🧮 How It's Calculated</h4>
                      <p className="text-sm text-gray-300/90 leading-relaxed">
                        Monitors your sensory load (environmental noise, visual input), active tasks, and depleting cognitive reservoir. As these factors increase, your mental load percentage rises.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4"
                    >
                      <h4 className="text-sm font-bold text-blue-400 mb-2 tracking-tight">💡 What To Do</h4>
                      <p className="text-sm text-gray-300/90 leading-relaxed">
                        When you reach 60%+, the app suggests taking breaks, simplifying tasks, or activating protective modes like Avoider Buffer to help you recover before reaching full overload.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Just-in-Time Alert */}
        {showAlert && appEnabled && (
          <JustInTimeAlert
            onClose={() => setShowAlert(false)}
            onAction={() => {
              monitoring.triggerSensoryReset();
              setShowAlert(false);
            }}
            onCrisis={triggerCrisis}
          />
        )}
      </div>
    </div>
  );
}

function Insight({
  condition,
  text,
}: {
  condition: boolean;
  text: string;
}) {
  if (!condition) return null;

  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
      <p className="text-gray-300">{text}</p>
    </div>
  );
}