import { Shield } from "lucide-react";
import { Card } from "./ui/card";

export function ManualOverride() {
  return (
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
  );
}