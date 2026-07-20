import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Power, Settings, AlertCircle, BookOpen, X } from "lucide-react";
import { useNavigate } from "react-router";

interface SemicolonMenuProps {
  appEnabled: boolean;
  onToggle: () => void;
  onCrisis: () => void;
}

export function SemicolonMenu({ appEnabled, onToggle, onCrisis }: SemicolonMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: Power,
      label: appEnabled ? "Pause Monitoring" : "Resume Monitoring",
      description: appEnabled ? "Take a break" : "Start tracking",
      onClick: () => {
        onToggle();
        setIsOpen(false);
      },
      color: "text-amber-400",
    },
    {
      icon: AlertCircle,
      label: "Crisis Mode",
      description: "Immediate support",
      onClick: () => {
        onCrisis();
        setIsOpen(false);
      },
      color: "text-red-400",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Configure app",
      onClick: () => {
        navigate("/settings");
        setIsOpen(false);
      },
      color: "text-indigo-400",
    },
    {
      icon: BookOpen,
      label: "About the Semicolon",
      description: "Learn more",
      onClick: () => {
        setIsOpen(false);
      },
      color: "text-purple-400",
    },
  ];

  return (
    <div className="relative">
      {/* Semicolon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-400/30 to-purple-300/20 border border-purple-400/40 hover:border-purple-400/60 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
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
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-12 w-72 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">Quick Actions</h3>
                    <p className="text-xs text-gray-400 mt-0.5">The semicolon (;) represents a pause—not a full stop.</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={item.onClick}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/50 transition-colors text-left"
                    whileHover={{ x: 4 }}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gray-900/50 flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border-t border-gray-800 px-4 py-3">
                <p className="text-xs text-gray-500 text-center">
                  Continue when you're ready.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}