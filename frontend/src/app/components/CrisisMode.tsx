import { motion } from "motion/react";
import { Heart, Phone, MapPin, X, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface CrisisModeProps {
  onExit: () => void;
}

export function CrisisMode({ onExit }: CrisisModeProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="bg-[#0f0f0f] border-gray-800 p-8">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={onExit}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-10 h-10 text-indigo-400 fill-indigo-400/30" />
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-2xl text-center mb-3 text-gray-100 font-medium">You're Safe</h1>
          <p className="text-center text-gray-400 text-sm mb-8">
            Take a moment. Breathe. Everything else can wait.
          </p>

          {/* Breathing Exercise */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6 mb-6">
            <h3 className="text-sm text-indigo-400 mb-3 text-center">Calming Breath</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>1. Breathe in through nose for 4 seconds</p>
              <p>2. Hold for 2-4 seconds</p>
              <p>3. Breathe out through mouth for 6 seconds</p>
            </div>
            <p className="text-xs text-center text-gray-500 mt-3">Focus on slow, deep breaths</p>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            <ActionButton
              icon={MapPin}
              label="Find a quiet place nearby"
              description="Low-stimulation locations"
            />
            <ActionButton
              icon={Phone}
              label="Call someone you trust"
              description="Emergency contacts"
            />
            <ActionButton
              icon={Home}
              label="Navigate home safely"
              description="Step-by-step directions"
            />
          </div>

          {/* Emergency Line */}
          <Card className="bg-red-500/10 border-red-500/30 p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">In a medical emergency</p>
            <a
              href="tel:911"
              className="text-base text-red-400 hover:text-red-300 transition-colors"
            >
              Call 911
            </a>
          </Card>

          {/* Footer */}
          <p className="text-xs text-center text-gray-500 mt-6">
            Crisis mode clears all non-essential information and focuses on your immediate wellbeing.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  description,
}: {
  icon: any;
  label: string;
  description: string;
}) {
  return (
    <Button
      variant="outline"
      className="w-full h-auto py-4 px-4 border-gray-700 bg-gray-900/50 hover:bg-gray-800 justify-start"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="text-left flex-1">
          <div className="text-sm text-white">{label}</div>
          <div className="text-xs text-gray-400">{description}</div>
        </div>
      </div>
    </Button>
  );
}