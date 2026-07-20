import { Card } from "./ui/card";
import { LucideIcon, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface FuelGaugeProps {
  title: string;
  subtitle: string;
  value: number;
  icon: LucideIcon;
  color: "cyan" | "purple" | "emerald" | "pink";
  status: { label: string; color: string };
  inverted: boolean;
}

export function FuelGauge({
  title,
  subtitle,
  value,
  icon: Icon,
  color,
  status,
  inverted,
}: FuelGaugeProps) {
  const colorMap = {
    cyan: {
      gradient: "from-blue-600/30 to-blue-700/20",
      text: "text-blue-400",
      bar: "bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400",
      glow: "shadow-blue-600/30",
    },
    purple: {
      gradient: "from-purple-500/20 to-indigo-500/20",
      text: "text-purple-400",
      bar: "bg-gradient-to-t from-purple-500 via-purple-400 to-purple-300",
      glow: "shadow-purple-500/20",
    },
    emerald: {
      gradient: "from-emerald-500/30 to-emerald-600/20",
      text: "text-emerald-300",
      bar: "bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300",
      glow: "shadow-emerald-500/30",
    },
    pink: {
      gradient: "from-pink-500/20 to-rose-500/20",
      text: "text-pink-400",
      bar: "bg-gradient-to-t from-pink-400 via-pink-300 to-pink-200",
      glow: "shadow-pink-500/20",
    },
  };

  const colors = colorMap[color];

  // Status color mapping based on label
  const getStatusColor = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('optimal') || lower.includes('good') || lower.includes('excellent')) {
      return 'text-green-300';
    } else if (lower.includes('moderate') || lower.includes('medium') || lower.includes('fair')) {
      return 'text-yellow-300';
    } else if (lower.includes('critical') || lower.includes('high') || lower.includes('severe')) {
      return 'text-red-400';
    } else if (lower.includes('low') || lower.includes('minimal')) {
      return 'text-blue-300';
    }
    return 'text-white';
  };

  const getStatusGlow = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('optimal') || lower.includes('good') || lower.includes('excellent')) {
      return '0 0 30px rgba(34, 197, 94, 1), 0 0 15px rgba(34, 197, 94, 0.8), 0 2px 12px rgba(0, 0, 0, 0.9)';
    } else if (lower.includes('moderate') || lower.includes('medium') || lower.includes('fair')) {
      return '0 0 30px rgba(250, 204, 21, 1), 0 0 15px rgba(250, 204, 21, 0.8), 0 2px 12px rgba(0, 0, 0, 0.9)';
    } else if (lower.includes('critical') || lower.includes('high') || lower.includes('severe')) {
      return '0 0 30px rgba(248, 113, 113, 1), 0 0 15px rgba(248, 113, 113, 0.8), 0 2px 12px rgba(0, 0, 0, 0.9)';
    } else if (lower.includes('low') || lower.includes('minimal')) {
      return '0 0 30px rgba(96, 165, 250, 1), 0 0 15px rgba(96, 165, 250, 0.8), 0 2px 12px rgba(0, 0, 0, 0.9)';
    }
    return '0 2px 12px rgba(0, 0, 0, 0.9)';
  };

  const statusColor = getStatusColor(status.label);
  const statusGlow = getStatusGlow(status.label);

  const [isOpen, setIsOpen] = useState(false);

  // Define range information for each gauge type
  const getRangeInfo = () => {
    if (title === "Sensory Load") {
      return [
        { range: "Low (0-30%)", color: "text-emerald-400", description: "Environment is calm, minimal stimulation" },
        { range: "Optimal (30-60%)", color: "text-green-400", description: "Balanced sensory input, comfortable range" },
        { range: "High (60-85%)", color: "text-yellow-400", description: "Approaching your threshold, consider reducing stimuli" },
        { range: "Critical (85-100%)", color: "text-red-400", description: "Sensory overload imminent, immediate action needed" }
      ];
    } else if (title === "Mental Load Level") {
      return [
        { range: "Low (0-30%)", color: "text-emerald-400", description: "Mind is clear, capacity for complex tasks" },
        { range: "Optimal (30-60%)", color: "text-green-400", description: "Engaged but not overwhelmed, good productivity zone" },
        { range: "High (60-85%)", color: "text-yellow-400", description: "Cognitive fatigue building, time to simplify" },
        { range: "Critical (85-100%)", color: "text-red-400", description: "Mental exhaustion, rest required" }
      ];
    }
    return [];
  };

  const rangeInfo = getRangeInfo();

  return (
    <div className="flex flex-col relative">
    <Card className={`bg-gradient-to-br ${colors.gradient} border-gray-800 p-3 flex flex-col h-full transition-all duration-300 hover:scale-105 hover:border-${color}-500/50 cursor-pointer group`}
      style={{
        boxShadow: 'none'
      }}
      onMouseEnter={(e) => {
        const glowColors = {
          cyan: '0 0 20px rgba(37, 99, 235, 0.5), 0 0 40px rgba(37, 99, 235, 0.3)',
          purple: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
          emerald: '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)',
          pink: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
        };
        (e.currentTarget as HTMLElement).style.boxShadow = glowColors[color];
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Header Section - Icon and Text stacked vertically */}
      <div className="flex flex-col items-center text-center mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <div className="w-full">
          <h3 className="text-xs mb-0.5 text-white leading-tight" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, letterSpacing: '0.01em' }}>{title}</h3>
          <p className="text-[10px] text-gray-400 leading-tight" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.005em' }}>{subtitle}</p>
        </div>
      </div>

      {/* Value OUTSIDE the gauge bar */}
      <div className="flex justify-center items-center mb-2 h-8">
        <motion.div
          className="text-2xl text-white drop-shadow-lg text-center"
          style={{
            textShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3)',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            minWidth: '60px'
          }}
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(value)}
        </motion.div>
      </div>

      {/* Gauge Container - compact fixed-height bar */}
      <div className="relative h-20">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-gray-700"
              style={{ bottom: `${(i + 1) * 20}%` }}
            />
          ))}
        </div>

        {/* Fill */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 rounded-lg ${colors.bar} ${colors.glow} shadow-lg`}
          initial={{ height: 0 }}
          animate={{ height: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Status INSIDE the gauge - at bottom */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 pb-4">
          {/* Status - Stacked at bottom */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="text-[10px] text-white font-medium" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.01em', textShadow: '0 0 12px rgba(255, 255, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.8)' }}>Status</div>
            <div className={`text-xs ${statusColor} font-medium`} style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.02em', textShadow: statusGlow }}>{status.label}</div>
          </div>
        </div>
      </div>
    </Card>

      {/* Range Guide Button */}
      {rangeInfo.length > 0 && (
        <div className="relative mt-2">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 rounded-lg text-xs text-gray-300 transition-all duration-200"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Range Guide</span>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[340px]"
            >
              <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-br ${colors.gradient} p-5 border-b border-gray-700/50 flex items-center justify-between relative overflow-hidden`}>
                  {/* Decorative element */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-xl bg-gray-900/40 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-base text-white font-semibold tracking-tight">{title}</h3>
                      <p className="text-xs text-gray-300/80 font-medium">Range Guide</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-9 h-9 rounded-xl bg-gray-900/40 backdrop-blur-sm hover:bg-gray-800/60 flex items-center justify-center transition-all flex-shrink-0 relative z-10 shadow-lg hover:scale-105"
                  >
                    <X className="w-4 h-4 text-gray-300" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                  {rangeInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className="relative group"
                    >
                      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-gray-600/50 transition-all">
                        <div className={`text-base font-bold ${info.color} mb-2 tracking-tight`}>
                          {info.range}
                        </div>
                        <div className="text-sm text-gray-300/90 leading-relaxed">
                          {info.description}
                        </div>
                      </div>
                      
                      {/* Divider (not on last item) */}
                      {index < rangeInfo.length - 1 && (
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-700/30 to-transparent mt-3" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}