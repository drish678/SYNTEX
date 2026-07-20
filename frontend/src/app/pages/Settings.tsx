import { useState, useEffect } from "react";
import { AvatarConfig, AvatarSVG, AvatarCreator, DEFAULT_AVATAR } from "../components/AvatarCreator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Separator } from "../components/ui/separator";
import { Shield, Lock, Eye, Volume2, Bell, Trash2, AlertCircle, User, Edit, RefreshCw, Smartphone, Watch, Heart, Activity, Download, Lightbulb, Power, MapPin, Navigation, Palette, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";
import { toast } from "sonner";
import { api } from "../api";

interface OutletContext {
  appEnabled: boolean;
  triggerCrisis: () => void;
  handleManualOverride: () => void;
  dimLevel: number;
  setDimLevel: (level: number) => void;
  extraDimEnabled: boolean;
  setExtraDimEnabled: (enabled: boolean) => void;
}

export function Settings() {
  const navigate = useNavigate();
  const { appEnabled, triggerCrisis, handleManualOverride, dimLevel, setDimLevel, extraDimEnabled, setExtraDimEnabled } = useOutletContext<OutletContext>();


  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoFilterEnabled, setAutoFilterEnabled] = useState(false);
  const [crisisDetectionEnabled, setCrisisDetectionEnabled] = useState(true);
  const [sensitivityLevel, setSensitivityLevel] = useState([60]);
  const [appleWatchConnected, setAppleWatchConnected] = useState(false);
  const [reduceNotificationSounds, setReduceNotificationSounds] = useState(false);
  const [dndSync, setDndSync] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      setBiometricEnabled(s.biometricEnabled);
      setNotificationsEnabled(s.notificationsEnabled);
      setAutoFilterEnabled(s.autoFilterEnabled);
      setCrisisDetectionEnabled(s.crisisDetectionEnabled);
      setSensitivityLevel([s.sensitivityLevel]);
      setAppleWatchConnected(s.appleWatchConnected);
      setReduceNotificationSounds(s.reduceNotificationSounds);
      setDndSync(s.dndSync);
    });
  }, []);

  const handleBiometricChange = (v: boolean) => { setBiometricEnabled(v); api.updateSettings({ biometricEnabled: v }); };
  const handleNotificationsChange = (v: boolean) => { setNotificationsEnabled(v); api.updateSettings({ notificationsEnabled: v }); };
  const handleAutoFilterChange = (v: boolean) => { setAutoFilterEnabled(v); api.updateSettings({ autoFilterEnabled: v }); };
  const handleCrisisDetectionChange = (v: boolean) => { setCrisisDetectionEnabled(v); api.updateSettings({ crisisDetectionEnabled: v }); };
  const handleSensitivityChange = (v: number[]) => { setSensitivityLevel(v); api.updateSettings({ sensitivityLevel: v[0] }); };
  const handleReduceSoundsChange = (v: boolean) => { setReduceNotificationSounds(v); api.updateSettings({ reduceNotificationSounds: v }); };
  const handleDndSyncChange = (v: boolean) => { setDndSync(v); api.updateSettings({ dndSync: v }); };

  const [showSemicolonDialog, setShowSemicolonDialog] = useState(false);
  const [showSemicolonInfo, setShowSemicolonInfo] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);

  // Avatar state
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);

  useEffect(() => {
    api.getAvatar().then((saved) => { if (saved) setAvatarConfig(saved); });
  }, []);

  const saveAvatar = (config: AvatarConfig) => {
    setAvatarConfig(config);
    api.saveAvatar(config);
    toast.success("Avatar saved!", { description: "Your avatar has been updated." });
  };

  // Permission states
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [audioPermission, setAudioPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [isMonitoringAudio, setIsMonitoringAudio] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.getProfile().then((data) => { if (data && data.name) setProfile(data); });
  }, []);

  const handleExportData = async () => {
    const data = await api.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "syntex-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported", {
      description: "Your biometric data has been saved to your device.",
    });
  };

  const handleDeleteData = async () => {
    await api.wipeData();
    setProfile(null);
    toast.success("Data deleted", {
      description: "All stored biometric data has been permanently removed.",
    });
  };

  const handleResetProfile = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset your profile? This will clear all your personalized settings and you'll need to build your profile again."
      )
    ) {
      await api.deleteProfile();
      toast.success("Profile reset", {
        description: "Your profile has been reset. You can now build a new profile.",
      });
      // Force a re-render by navigating to home and back
      navigate("/");
    }
  };

  const handleConnectAppleWatch = () => {
    const next = !appleWatchConnected;
    setAppleWatchConnected(next);
    api.updateSettings({ appleWatchConnected: next });
    if (next) {
      toast.success("Apple Watch connected", {
        description: "Now tracking heart rate, sleep patterns, and activity levels.",
      });
    } else {
      toast.info("Apple Watch disconnected", {
        description: "Health tracking paused.",
      });
    }
  };

  // Request location permission
  const handleRequestLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Your browser doesn't support location services.",
      });
      return;
    }

    // Directly request location - this will prompt the user
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationPermission('granted');
        toast.success("Location access granted", {
          description: "SYNTEX can now provide location-based environmental predictions.",
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied');
          toast.error("Location access denied", {
            description: "Enable location in your browser settings to use this feature. You can manually set your location in the Dashboard.",
          });
        } else {
          toast.error("Location error", {
            description: "Could not get your location. You can manually set it in the Dashboard.",
          });
        }
      }
    );
  };

  // Request microphone permission for ambient noise monitoring
  const handleRequestAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioPermission('granted');
      setIsMonitoringAudio(true);
      toast.success("Microphone access granted", {
        description: "SYNTEX will now monitor ambient noise levels (conversations are never recorded).",
      });
      // Stop the stream immediately - we'll restart it when actually monitoring
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setAudioPermission('denied');
      toast.error("Microphone access denied", {
        description: "Enable microphone access in your browser settings to monitor noise levels.",
      });
    }
  };

  const handleToggleAudioMonitoring = () => {
    if (audioPermission !== 'granted') {
      toast.error("Permission required", {
        description: "Please grant microphone access first.",
      });
      return;
    }
    setIsMonitoringAudio(!isMonitoringAudio);
    toast.success(isMonitoringAudio ? "Audio monitoring paused" : "Audio monitoring started", {
      description: isMonitoringAudio ? "" : "Measuring ambient noise levels only.",
    });
  };

  return (
    <div
      className="min-h-full px-6 py-6 pt-8"
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 10, 30, 1) 0%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl mb-2 text-white">Settings</h2>
          <p className="text-gray-400 text-sm text-white">
            Customize SYNTEX to work the way you need it to.
          </p>
        </div>

        {/* ── Avatar Creator ── */}
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/40 bg-gray-900 flex items-center justify-center flex-shrink-0">
                <AvatarSVG config={avatarConfig} size={40} />
              </div>
              <div>
                <h3 className="text-base text-white font-medium">My Avatar</h3>
                <p className="text-xs text-gray-400">Customize how you appear in SYNTEX</p>
              </div>
            </div>
            <button
              onClick={() => setShowAvatarCreator(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
              {showAvatarCreator ? "Done" : "Edit"}
              {showAvatarCreator ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showAvatarCreator && (
            <AvatarCreator config={avatarConfig} onSave={saveAvatar} />
          )}
        </Card>

        {/* User Profile Section */}
        {profile && (
          <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/20 p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg text-white mb-1">Your Profile</h3>
                <p className="text-sm text-gray-400">Personal information and preferences</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate("/calibration")}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleResetProfile}
                  variant="outline"
                  size="sm"
                  className="border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-900/20 hover:border-red-800/50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Name</div>
                <div className="text-base text-white font-medium">{profile.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Age</div>
                <div className="text-base text-white font-medium">{profile.age}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Gender</div>
                <div className="text-base text-white font-medium">{profile.gender}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Environment</div>
                <div className="text-base text-white font-medium">{profile.environment}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-400 mb-1">Sensory Triggers</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.triggers.map((trigger: string) => (
                    <span key={trigger} className="text-sm bg-cyan-500/10 text-cyan-300 px-3 py-1.5 rounded border border-cyan-500/30">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-400 mb-1">Sensory Fatigue Frequency</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                      style={{ width: `${profile.fatigueFrequency * 10}%` }}
                    />
                  </div>
                  <span className="text-base text-white font-medium">{profile.fatigueFrequency}/10</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {!profile && (
          <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/20 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base mb-2 text-white">Build Your Profile</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Create a personalized profile to help SYNTEX better understand your needs
                </p>
                <Button
                  onClick={() => navigate("/calibration")}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions Section */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20 p-6 mb-6">
          <h3 className="text-lg text-white mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Pause/Resume Monitoring */}
            <button
              onClick={() => setShowPauseDialog(true)}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                appEnabled
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                appEnabled ? 'bg-amber-500/30' : 'bg-emerald-500/30'
              }`}>
                <Power className={`w-5 h-5 ${appEnabled ? 'text-amber-400' : 'text-emerald-400'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`text-sm font-medium ${appEnabled ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {appEnabled ? 'Pause Monitoring' : 'Resume Monitoring'}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {appEnabled ? 'Temporarily stop all tracking' : 'Continue tracking your metrics'}
                </div>
              </div>
            </button>

            {/* Crisis Mode */}
            <button
              onClick={() => setShowCrisisDialog(true)}
              className="flex items-center gap-4 p-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 transition-all hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-red-400">Crisis Mode</div>
                <div className="text-xs text-gray-400 mt-0.5">Immediate support and resources</div>
              </div>
            </button>

            {/* About the Semicolon */}
            <button
              onClick={() => setShowAboutDialog(true)}
              className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-purple-400/20 to-purple-300/10 border border-purple-400/40 hover:border-purple-400/60 transition-all hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                <div
                  className="text-2xl font-bold leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 10px rgba(192, 132, 252, 0.5))',
                  }}
                >
                  ;
                </div>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-purple-400">About Semicolon</div>
                <div className="text-xs text-gray-400 mt-0.5">Learn about our philosophy</div>
              </div>
            </button>
          </div>
        </Card>

        {/* Manual Override Section */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base mb-2 text-white">Manual Override</h3>
              <p className="text-sm text-white mb-4">
                You are always in control. Use the "Pause Monitoring" button in the Quick Actions
                section to immediately stop all monitoring, alerts, and filters. No questions asked.
              </p>
              <div className="text-xs text-amber-400">
                Your autonomy is non-negotiable.
              </div>
            </div>
          </div>
        </Card>

        {/* Apple Watch Integration */}
        <Card className={`border-gray-800 p-6 mb-6 ${appleWatchConnected ? 'bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20' : 'bg-[#0f0f0f]'}`}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${appleWatchConnected ? 'bg-pink-500/20' : 'bg-gray-800'}`}>
              <Watch className={`w-6 h-6 ${appleWatchConnected ? 'text-pink-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-base mb-2 text-white flex items-center gap-2">
                Apple Watch Integration
                {appleWatchConnected && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Connected</span>
                )}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {appleWatchConnected 
                  ? "Tracking heart rate, sleep patterns, and activity levels to detect burnout, fatigue, and environmental stress."
                  : "Connect your Apple Watch to track heart rate, sleep quality, and detect signs of burnout or fatigue before overload."}
              </p>
              <Button
                onClick={handleConnectAppleWatch}
                className={appleWatchConnected 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white"}
              >
                <Watch className="w-4 h-4 mr-2" />
                {appleWatchConnected ? "Disconnect Apple Watch" : "Connect Apple Watch"}
              </Button>
            </div>
          </div>

          {appleWatchConnected && (
            <>
              <Separator className="bg-pink-500/20 mb-4" />
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-white mb-1">Heart Rate Monitoring</div>
                    <div className="text-xs text-gray-400">
                      Tracks elevated heart rate patterns that may indicate stress or anxiety
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-white mb-1">Sleep & Fatigue Detection</div>
                    <div className="text-xs text-gray-400">
                      Analyzes sleep quality to notify you when you may be tired or at risk of burnout
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-white mb-1">Ambient Noise Detection</div>
                    <div className="text-xs text-gray-400">
                      Detects loud background noise that might contribute to sensory overload
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Monitoring Settings */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-6 mb-6">
          <h3 className="text-base mb-6 flex items-center gap-2 text-white">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            Biometric Monitoring
          </h3>

          <div className="space-y-6">
            <SettingRow
              label="Enable biometric tracking"
              description="Monitor heart rate, movement, and device sensors"
              value={biometricEnabled}
              onChange={handleBiometricChange}
            />

            <Separator className="bg-gray-800" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">Alert sensitivity</div>
                  <div className="text-xs text-white">
                    How quickly the app responds to changes
                  </div>
                </div>
                <div className="text-sm text-white">{sensitivityLevel[0]}%</div>
              </div>
              <Slider
                value={sensitivityLevel}
                onValueChange={handleSensitivityChange}
                min={0}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white">
                <span>Less sensitive</span>
                <span>More sensitive</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Permissions */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-6 mb-6">
          <h3 className="text-base mb-6 flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-indigo-400" />
            App Permissions
          </h3>

          <div className="space-y-4">
            {/* Location Permission */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                locationPermission === 'granted' ? 'bg-emerald-500/10' : 'bg-gray-800'
              }`}>
                <MapPin className={`w-5 h-5 ${
                  locationPermission === 'granted' ? 'text-emerald-400' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm text-white">Location Services</div>
                  {locationPermission === 'granted' && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Granted</span>
                  )}
                  {locationPermission === 'denied' && (
                    <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">Denied</span>
                  )}
                </div>
                <div className="text-xs text-white mb-3">
                  Enable location-based environmental predictions to warn you about high-stimulation environments
                </div>
                {locationPermission !== 'granted' && (
                  <Button
                    onClick={handleRequestLocation}
                    size="sm"
                    className="bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Grant Location Access
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Audio Permission */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                audioPermission === 'granted' ? 'bg-emerald-500/10' : 'bg-gray-800'
              }`}>
                <Volume2 className={`w-5 h-5 ${
                  audioPermission === 'granted' ? 'text-emerald-400' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm text-white">Microphone (Ambient Noise)</div>
                  {audioPermission === 'granted' && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Granted</span>
                  )}
                  {audioPermission === 'denied' && (
                    <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">Denied</span>
                  )}
                </div>
                <div className="text-xs text-white mb-3">
                  Measure ambient noise levels to detect sensory overload. Conversations are <strong>never recorded</strong>.
                </div>
                {audioPermission !== 'granted' ? (
                  <Button
                    onClick={handleRequestAudio}
                    size="sm"
                    className="bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Grant Microphone Access
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleToggleAudioMonitoring}
                      size="sm"
                      className={isMonitoringAudio 
                        ? "bg-amber-600 text-white hover:bg-amber-500" 
                        : "bg-emerald-600 text-white hover:bg-emerald-500"}
                    >
                      {isMonitoringAudio ? 'Pause Monitoring' : 'Start Monitoring'}
                    </Button>
                    {isMonitoringAudio && (
                      <span className="text-xs text-cyan-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        Monitoring noise levels
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-6 mb-6">
          <h3 className="text-base mb-6 flex items-center gap-2 text-white">
            <Bell className="w-5 h-5 text-indigo-400" />
            Notifications & Alerts
          </h3>

          <div className="space-y-6">
            <SettingRow
              label="Just-in-time alerts"
              description="Surface warnings only when metrics reach critical levels"
              value={notificationsEnabled}
              onChange={handleNotificationsChange}
            />

            <Separator className="bg-gray-800" />

            <SettingRow
              label="Auto-apply sensory filters"
              description="Automatically reduce screen brightness and notifications when load is high"
              value={autoFilterEnabled}
              onChange={handleAutoFilterChange}
            />
          </div>
        </Card>

        {/* Crisis Protocol */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-6 mb-6">
          <div className="space-y-6">
            <SettingRow
              label="Enable crisis detection"
              description="Monitor for signs of panic attacks or severe overwhelm"
              value={crisisDetectionEnabled}
              onChange={handleCrisisDetectionChange}
            />

            <Separator className="bg-gray-800" />

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800">
                <Shield className="w-4 h-4 mr-2 text-white" />
                Manage trusted contacts
              </Button>
              <p className="text-xs text-white">
                People who can be notified if you activate crisis mode
              </p>
            </div>
          </div>
        </Card>

        {/* Privacy & Data */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-6 mb-6">
          <h3 className="text-base mb-6 flex items-center gap-2 text-white">
            <Lock className="w-5 h-5 text-indigo-400" />
            Privacy & Data Sovereignty
          </h3>

          <div className="space-y-4">
            <PrivacyFeature
              icon={Smartphone}
              label="On-device processing"
              description="All analysis happens locally. Your data never leaves your phone."
              status="Active"
            />
            <PrivacyFeature
              icon={Eye}
              label="Consent architecture"
              description="Only measures environmental noise, never records conversations."
              status="Active"
            />
            <PrivacyFeature
              icon={Shield}
              label="Zero third-party access"
              description="No advertisers, no analytics companies, no data brokers."
              status="Active"
            />

            <Separator className="bg-gray-800" />

            <div className="flex gap-3">
              <Button
                onClick={handleExportData}
                variant="outline"
                className="flex-1 border-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export my data
              </Button>
              <Button
                onClick={handleDeleteData}
                variant="outline"
                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete all data
              </Button>
            </div>
          </div>
        </Card>

        {/* Sensory Preferences */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-6 mb-6">
          <h3 className="text-base mb-6 flex items-center gap-2 text-white">
            <Lightbulb className="w-5 h-5 text-indigo-400" />
            Sensory Preferences
          </h3>

          <div className="space-y-4">
            <SensoryToggle
              icon={Volume2}
              label="Reduce notification sounds"
              description="Use gentle vibrations instead of audio alerts"
              value={reduceNotificationSounds}
              onChange={handleReduceSoundsChange}
            />
            <SensoryToggle
              icon={Eye}
              label="Extra dim mode"
              description="Lower brightness below system minimum"
              value={extraDimEnabled}
              onChange={setExtraDimEnabled}
              dimLevel={dimLevel}
              setDimLevel={setDimLevel}
            />
            <SensoryToggle
              icon={Bell}
              label="Do not disturb sync"
              description="Automatically enable when your phone is in DND mode"
              value={dndSync}
              onChange={handleDndSyncChange}
            />
          </div>
        </Card>

        {/* About */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-6">
          <h3 className="text-base mb-3 text-white">About SYNTEX</h3>
          <p className="text-sm text-white mb-4">
            Version 1.0.0 • Built for neurodivergent minds
          </p>
          <p className="text-xs text-white leading-relaxed">
            "Just as syntax provides the rules for language to be understood, SYNTEX provides
            the 'rules' of structure for the neurodivergent brain to thrive in an unpredictable world."
          </p>
        </Card>
      </div>

      {/* Semicolon Dialog */}
      {showSemicolonDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 border border-purple-500/30">
            <h3 className="text-lg mb-4 text-white">Would you like to learn more about the semicolon?</h3>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowSemicolonDialog(false);
                  setShowSemicolonInfo(true);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
              >
                Yes
              </Button>
              <Button
                onClick={() => setShowSemicolonDialog(false)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Semicolon Info Dialog */}
      {showSemicolonInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 border border-purple-500/30">
            <h3 className="text-base mb-4 text-white">About the Semicolon</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              The semicolon (;) represents a pause in your journey—not an ending. It's a reminder that you can take a break and continue when ready.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowSemicolonInfo(false)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Monitoring Dialog */}
      {showPauseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 border border-amber-500/30">
            <h3 className="text-lg mb-4 text-white">
              Would you like to {appEnabled ? 'pause' : 'resume'} monitoring?
            </h3>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  handleManualOverride();
                  setShowPauseDialog(false);
                }}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
              >
                Yes
              </Button>
              <Button
                onClick={() => setShowPauseDialog(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border-0"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Crisis Mode Dialog */}
      {showCrisisDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 border border-red-500/30">
            <h3 className="text-lg mb-4 text-white">
              Would you like to activate crisis mode?
            </h3>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  triggerCrisis();
                  setShowCrisisDialog(false);
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
              >
                Yes
              </Button>
              <Button
                onClick={() => setShowCrisisDialog(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border-0"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* About Semicolon Dialog */}
      {showAboutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 border border-purple-500/30">
            <h3 className="text-lg mb-4 text-white">
              Would you like to learn more about the semicolon?
            </h3>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowAboutDialog(false);
                  setShowSemicolonInfo(true);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
              >
                Yes
              </Button>
              <Button
                onClick={() => setShowAboutDialog(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border-0"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm mb-1 text-white">{label}</div>
        <div className="text-xs text-white">{description}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function PrivacyFeature({
  icon: Icon,
  label,
  description,
  status,
}: {
  icon: any;
  label: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex-1">
        <div className="text-sm mb-1 text-white">{label}</div>
        <div className="text-xs text-white">{description}</div>
      </div>
      <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
        {status}
      </div>
    </div>
  );
}

function SensoryToggle({
  icon: Icon,
  label,
  description,
  value,
  onChange,
  dimLevel,
  setDimLevel,
}: {
  icon: any;
  label: string;
  description: string;
  value?: boolean;
  onChange?: (enabled: boolean) => void;
  dimLevel?: number;
  setDimLevel?: (level: number) => void;
}) {
  const handleToggle = (enabled: boolean) => {
    if (onChange) {
      onChange(enabled);
      if (enabled) {
        toast.success("Extra Dim Mode Enabled", {
          description: "Screen brightness lowered below system minimum for reduced sensory input.",
        });
      } else {
        toast.info("Extra Dim Mode Disabled");
      }
    }
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <div className="text-sm mb-1 text-white">{label}</div>
          <div className="text-xs text-white">{description}</div>
        </div>
      </div>
      <Switch checked={value || false} onCheckedChange={handleToggle} />
    </div>
  );
}