import { motion, AnimatePresence } from "motion/react";
import { Shield, Volume2, Wifi, Heart } from "lucide-react";
import { useState } from "react";

interface StatusToastProps {
  appEnabled: boolean;
  distractionsDetected: number;
}

export function StatusToast({ appEnabled, distractionsDetected }: StatusToastProps) {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  
  if (!appEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-0 left-0 right-0 z-50"
      >
        <motion.div
          initial={{ y: -55 }}
          animate={{ y: -55 }}
          whileHover={{ y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 backdrop-blur-xl border-b border-indigo-500/10 px-6 py-3 shadow-2xl group hover:from-indigo-500/20 hover:to-purple-500/20 hover:border-indigo-500/30 transition-all duration-600"
          style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}
        >
          <div className="flex flex-col items-center gap-1.5">
            {/* Header with Pulse - Always Visible */}
            <motion.div 
              className="flex items-center gap-3 justify-center"
              initial={{ opacity: 1 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="relative">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{
                    opacity: [1, 0.5, 1],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              
              <span className="text-sm text-white/90 font-medium" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.03em' }}>
                Syntex is active
              </span>
            </motion.div>

            {/* Monitoring Indicators - Show on Hover */}
            <motion.div 
              className="max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 overflow-hidden flex items-center gap-3 justify-center group-hover:mt-1.5"
              style={{ 
                transition: 'max-height 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), margin-top 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'
              }}
            >
              <div 
                className="flex items-center gap-1 relative cursor-help"
                onMouseEnter={() => setHoveredIcon('sound')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400/70" />
                <div className="w-1 h-1 rounded-full bg-cyan-400/70" />
                {hoveredIcon === 'sound' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 border border-cyan-500/30 rounded text-xs text-cyan-300 whitespace-nowrap pointer-events-none"
                  >
                    Environmental noise monitoring
                  </motion.div>
                )}
              </div>
              <div 
                className="flex items-center gap-1 relative cursor-help"
                onMouseEnter={() => setHoveredIcon('heart')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <Heart className="w-3.5 h-3.5 text-rose-400/70" />
                <div className="w-1 h-1 rounded-full bg-rose-400/70" />
                {hoveredIcon === 'heart' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 border border-rose-500/30 rounded text-xs text-rose-300 whitespace-nowrap pointer-events-none"
                  >
                    Heart rate monitoring
                  </motion.div>
                )}
              </div>
              <div 
                className="flex items-center gap-1 relative cursor-help"
                onMouseEnter={() => setHoveredIcon('wifi')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <Wifi className="w-3.5 h-3.5 text-purple-400/70" />
                <div className="w-1 h-1 rounded-full bg-purple-400/70" />
                {hoveredIcon === 'wifi' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 border border-purple-500/30 rounded text-xs text-purple-300 whitespace-nowrap pointer-events-none"
                  >
                    Digital distraction tracking
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Distractions Count - Show on Hover */}
            <motion.div 
              className="max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 overflow-hidden text-sm text-center group-hover:mt-1"
              style={{ 
                transition: 'max-height 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), margin-top 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'
              }}
            >
              <span className="text-emerald-400 font-bold text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {distractionsDetected}
              </span>
              <span className="text-gray-300 ml-2">
                background distractions detected
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}