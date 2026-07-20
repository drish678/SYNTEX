import { Outlet, Link, useLocation } from "react-router";
import { Activity, LineChart, Settings, AlertCircle, Power, Sparkles, CheckSquare, LayoutDashboard, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { CrisisMode } from "../components/CrisisMode";
import { toast } from "sonner";
import { StatusToast } from "../components/StatusToast";
import Logo from "../components/Logo";

export function Root() {
  const location = useLocation();
  const [crisisMode, setCrisisMode] = useState(false);
  const [appEnabled, setAppEnabled] = useState(true);
  const [distractionsDetected] = useState(0); // Real-time tracking of background distractions
  const [hasProfile, setHasProfile] = useState(() => {
    return !!(
      localStorage.getItem("syntex_calibration") ||
      localStorage.getItem("syntex_profile_dismissed") ||
      localStorage.getItem("syntex_circles") ||
      localStorage.getItem("syntex_circles_v")
    );
  });

  // Screen dimming state
  const [dimLevel, setDimLevel] = useState(0); // 0-100, 0 = no dim, 100 = max dim
  const [extraDimEnabled, setExtraDimEnabled] = useState(false);

  useEffect(() => {
    const hasData = !!(
      localStorage.getItem("syntex_calibration") ||
      localStorage.getItem("syntex_profile_dismissed") ||
      localStorage.getItem("syntex_circles") ||
      localStorage.getItem("syntex_circles_v")
    );
    setHasProfile(hasData);
  }, [location.pathname]);

  const handleManualOverride = () => {
    setAppEnabled(!appEnabled);
    toast.success(appEnabled ? "All monitoring paused" : "Monitoring resumed", {
      description: appEnabled 
        ? "You have full control. The app will stay quiet." 
        : "SYNTEX is back online and watching your metrics.",
    });
  };

  const triggerCrisis = () => {
    setCrisisMode(true);
  };

  if (crisisMode) {
    return <CrisisMode onExit={() => setCrisisMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex items-center justify-center p-4">
      {/* Mobile App Container */}
      <div
        className="w-full max-w-md bg-[#0a0a0a] rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-900 flex flex-col relative"
        style={{
          height: "min(844px, calc(100vh - 2rem))",
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: 'center center'
        }}
      >
        {/* App Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] pt-11">
          {/* Status Bar */}
          {!appEnabled && (
            <div className="bg-amber-500/10 border-b border-amber-500/30">
              <div className="px-6 py-2 text-center text-sm text-amber-400">
                Monitoring paused. You're in control.
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet context={{ 
              appEnabled, 
              triggerCrisis, 
              handleManualOverride,
              dimLevel,
              setDimLevel,
              extraDimEnabled,
              setExtraDimEnabled
            }} />
          </main>

          {/* Screen Dimming Overlay */}
          {(dimLevel > 0 || extraDimEnabled) && (
            <div 
              className="fixed inset-0 bg-black pointer-events-none transition-opacity duration-500 z-50"
              style={{ 
                opacity: extraDimEnabled ? 0.7 : dimLevel / 100 * 0.6
              }}
            />
          )}

          {/* Bottom Navigation */}
          {(hasProfile || !["/", "/calibration"].includes(location.pathname)) && location.pathname !== "/calibration" && (
            <nav className="border-t border-gray-800 bg-[#0f0f0f] pb-5">
              <div className="grid grid-cols-6 pt-2">
                <NavLink to="/" active={location.pathname === "/"}>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Home</span>
                </NavLink>
                <NavLink to="/dashboard" active={location.pathname === "/dashboard"}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Dash</span>
                </NavLink>
                <NavLink to="/tasks" active={location.pathname === "/tasks"}>
                  <CheckSquare className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Tasks</span>
                </NavLink>
                <NavLink to="/insights" active={location.pathname === "/insights"}>
                  <LineChart className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Insights</span>
                </NavLink>
                <NavLink to="/circle" active={location.pathname === "/circle"}>
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Circle</span>
                </NavLink>
                <NavLink to="/settings" active={location.pathname === "/settings"}>
                  <Settings className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Settings</span>
                </NavLink>
              </div>
            </nav>
          )}
        </div>

        {/* Status Toast - "Magic Moment" */}
        <StatusToast 
          appEnabled={appEnabled}
          distractionsDetected={distractionsDetected}
        />

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
      </div>
    </div>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 w-full transition-all duration-200 hover:scale-110 active:scale-95 ${
        active 
          ? "text-indigo-400" 
          : "text-gray-400 hover:text-indigo-300"
      }`}
      style={{
        filter: active 
          ? "drop-shadow(0 0 15px rgba(99, 102, 241, 0.5))" 
          : undefined
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.filter = "drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.filter = "";
        }
      }}
    >
      {children}
    </Link>
  );
}