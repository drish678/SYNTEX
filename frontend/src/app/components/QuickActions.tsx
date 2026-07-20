import { useState } from "react";
import { Power, AlertCircle, Zap } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface QuickActionsProps {
  appEnabled: boolean;
  handleManualOverride: () => void;
  triggerCrisis: () => void;
}

export function QuickActions({ appEnabled, handleManualOverride, triggerCrisis }: QuickActionsProps) {
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showSemicolonInfo, setShowSemicolonInfo] = useState(false);

  return (
    <>
      {/* Quick Actions Section */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-base text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {/* Pause/Resume Monitoring */}
          <button
            onClick={() => setShowPauseDialog(true)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:scale-105 ${
              appEnabled
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40'
            }`}
          >
            <Power className={`w-5 h-5 ${appEnabled ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className={`text-xs ${appEnabled ? 'text-amber-300' : 'text-emerald-300'}`}>
              {appEnabled ? 'Pause' : 'Resume'}
            </span>
          </button>

          {/* Crisis Mode */}
          <button
            onClick={() => setShowCrisisDialog(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 transition-all hover:scale-105"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-xs text-red-300">Crisis</span>
          </button>

          {/* About the Semicolon */}
          <button
            onClick={() => setShowAboutDialog(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-purple-400/30 to-purple-300/20 border border-purple-400/40 hover:border-purple-400/60 transition-all hover:scale-105"
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
            <span className="text-xs text-purple-300">About</span>
          </button>
        </div>
      </Card>

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
    </>
  );
}