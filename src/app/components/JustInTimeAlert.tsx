import { motion } from "motion/react";
import { AlertTriangle, Volume2, Eye, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface JustInTimeAlertProps {
  onClose: () => void;
  onAction: () => void;
  onCrisis: () => void;
}

export function JustInTimeAlert({
  onClose,
  onAction,
  onCrisis,
}: JustInTimeAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-md w-full"
      >
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 p-6">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          {/* Title */}
          <h2 className="text-xl text-center mb-2">Environment Alert</h2>
          <p className="text-center text-gray-400 text-sm mb-6">
            Your sensory load is critically high. The environment might be overwhelming right now.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatBadge icon={Volume2} label="Noise" value="92dB" />
            <StatBadge icon={Eye} label="Brightness" value="High" />
            <StatBadge icon={Heart} label="Heart Rate" value="98" />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onAction}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
              size="lg"
            >
              Apply Sensory Filter
            </Button>

            <Button
              onClick={onCrisis}
              variant="outline"
              className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              I need help (Crisis Mode)
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-200"
              size="sm"
            >
              Dismiss
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-center text-gray-500 mt-4">
            This alert only appears when your metrics indicate risk
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
      <Icon className="w-4 h-4 mx-auto mb-1 text-red-400" />
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-sm text-white">{value}</div>
    </div>
  );
}
