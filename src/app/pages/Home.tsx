import { motion } from "motion/react";
import { Shield, Heart, Sparkles, RefreshCw, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";

export function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const calibrationData = localStorage.getItem("syntex_calibration");
    if (calibrationData) {
      const data = JSON.parse(calibrationData);
      setUserName(data.name);
    }
  }, []);

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to reset your profile? This will clear all your personalized settings.")) {
      localStorage.removeItem("syntex_calibration");
      setUserName(null);
    }
  };

  const handleSkipProfile = () => {
    localStorage.setItem("syntex_profile_dismissed", "true");
    navigate("/dashboard");
  };

  return (
    <div 
      className="min-h-full flex flex-col items-center justify-center py-8 px-6 pt-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 10, 30, 1) 0%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center space-y-10 max-w-md relative z-10"
      >
        {/* Welcome Header */}
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 relative"
          >
            {/* Water droplet effect - fading circles */}
            <div
              className="absolute inset-0 rounded-full border-2 border-indigo-400/20 animate-ripple"
              style={{
                animation: 'ripple 3s ease-out infinite',
              }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-purple-400/20 animate-ripple"
              style={{
                animation: 'ripple 3s ease-out infinite 1s',
              }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-indigo-400/20 animate-ripple"
              style={{
                animation: 'ripple 3s ease-out infinite 2s',
              }}
            />
            <div className="text-7xl font-bold text-indigo-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>;</div>
          </motion.div>

          <div>
            <h1 className="text-3xl font-semibold text-white mb-3">
              {userName ? (
                <>Welcome back, <span className="text-indigo-400">{userName}</span></>
              ) : (
                <>Welcome to <span className="text-indigo-400">Syntex</span></>
              )}
            </h1>
            {userName && (
              <p className="text-gray-400 text-base mb-2">How's your day going?</p>
            )}
            <p className="text-gray-400 text-base">The Syntax of Focus</p>
          </div>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-gray-300 text-base leading-relaxed px-4"
        >
          Your personal companion for the neurodivergent brain to turn sensory overload into cognitive clarity.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col gap-3"
        >
          {userName ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg text-base font-medium hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/calibration"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg text-base font-medium hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Build Your Profile
              </Link>
              <button
                onClick={handleSkipProfile}
                className="text-gray-500 hover:text-gray-400 text-sm transition-colors underline cursor-pointer"
              >
                Skip for now
              </button>
            </>
          )}
        </motion.div>

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-sm text-gray-500 pt-4"
        >
          SYNTEX is a support tool, not a replacement for professional care.
        </motion.p>
      </motion.div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4 text-left hover:border-gray-700 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}