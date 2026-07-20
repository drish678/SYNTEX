import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Brain, Eye, Target, Calendar, Clock } from "lucide-react";
import { api, CheckIn } from "../api";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function last7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

// Forward/backward-fill gaps so the line chart stays continuous instead of
// dropping to zero for periods with no logged check-ins.
function fillGaps(values: (number | null)[]): number[] {
  const out = [...values];
  for (let i = 1; i < out.length; i++) if (out[i] == null) out[i] = out[i - 1];
  for (let i = out.length - 2; i >= 0; i--) if (out[i] == null) out[i] = out[i + 1];
  return out.map((v) => v ?? 0);
}

function average(checkins: CheckIn[], key: keyof CheckIn): number {
  return Math.round(checkins.reduce((s, c) => s + (c[key] as number), 0) / checkins.length);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function useCheckinBasedCharts(checkins: CheckIn[] | null) {
  const dailyData = useMemo(() => {
    if (!checkins) return [];
    const days = last7Days();
    const sensory: (number | null)[] = [];
    const mental: (number | null)[] = [];
    for (const day of days) {
      const dayCheckins = checkins.filter((c) => new Date(c.timestamp).toDateString() === day.toDateString());
      if (dayCheckins.length) {
        sensory.push(average(dayCheckins, "sensoryLoad"));
        mental.push(average(dayCheckins, "mentalLoad"));
      } else {
        sensory.push(null); mental.push(null);
      }
    }
    const s = fillGaps(sensory), m = fillGaps(mental);
    return days.map((d, i) => ({ id: `day-${i}`, day: DAY_LABELS[d.getDay()], sensoryLoad: s[i], mentalLoad: m[i] }));
  }, [checkins]);

  const hourlyData = useMemo(() => {
    if (!checkins) return [];
    const today = new Date().toDateString();
    const todays = checkins.filter((c) => new Date(c.timestamp).toDateString() === today);
    const sensory: (number | null)[] = [];
    const mental: (number | null)[] = [];
    for (let h = 0; h < 24; h++) {
      const hourCheckins = todays.filter((c) => new Date(c.timestamp).getHours() === h);
      if (hourCheckins.length) {
        sensory.push(average(hourCheckins, "sensoryLoad"));
        mental.push(average(hourCheckins, "mentalLoad"));
      } else {
        sensory.push(null); mental.push(null);
      }
    }
    const s = fillGaps(sensory), m = fillGaps(mental);
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i % 12 || 12;
      const period = i < 12 ? "AM" : "PM";
      return { id: `hour-${i}`, time: `${hour}${period}`, sensoryLoad: s[i], mentalLoad: m[i] };
    });
  }, [checkins]);

  // Require at least a full day's worth of usage (oldest check-in at least
  // 24h old) before surfacing weekly patterns — a handful of check-ins from
  // the last few minutes isn't a "pattern" yet.
  const hasWeekData = useMemo(() => {
    if (!checkins || checkins.length === 0) return false;
    const oldest = Math.min(...checkins.map((c) => new Date(c.timestamp).getTime()));
    return Date.now() - oldest >= DAY_MS;
  }, [checkins]);
  const hasTodayData = !!checkins && checkins.some((c) => new Date(c.timestamp).toDateString() === new Date().toDateString());

  return { dailyData, hourlyData, hasWeekData, hasTodayData };
}

export function Insights() {

  const [checkins, setCheckins] = useState<CheckIn[] | null>(null);
  useEffect(() => {
    api.listCheckins(7).then(setCheckins);
  }, []);
  const { dailyData, hourlyData, hasWeekData, hasTodayData } = useCheckinBasedCharts(checkins);
  const [currentCapacity] = useState(72); // Current capacity usage out of 100

  // Calculate status based on capacity
  const getCapacityStatus = (capacity: number) => {
    if (capacity < 60) return { status: 'Safe', color: '#10b981', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', textColor: 'text-emerald-400', emoji: '✅' };
    if (capacity < 80) return { status: 'Reaching Overload', color: '#f59e0b', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', textColor: 'text-amber-400', emoji: '⚠️' };
    return { status: 'Near Overload', color: '#ef4444', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', textColor: 'text-red-400', emoji: '🚨' };
  };

  const capacityStatus = getCapacityStatus(currentCapacity);

  return (
    <div 
      className="min-h-full px-6 py-6 pt-8"
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 10, 30, 1) 0%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl mb-2 text-white tracking-wide flex items-center gap-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, letterSpacing: '0.02em' }}>
            Your Patterns
            <span className="text-purple-200" style={{ textShadow: '0 0 12px rgba(216, 180, 254, 0.6), 0 0 6px rgba(216, 180, 254, 0.4)' }}>✦</span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.01em' }}>
            Simple insights to help you understand your rhythms.
          </p>
        </div>

        {/* Charts */}
        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList className="bg-[#0f0f0f] border border-gray-800">
            <TabsTrigger 
              value="weekly" 
              className="data-[state=active]:bg-purple-900 data-[state=inactive]:bg-transparent"
              style={{ 
                color: '#ffffff',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)'
              }}
            >
              This Week
            </TabsTrigger>
            <TabsTrigger 
              value="daily" 
              className="data-[state=active]:bg-purple-900 data-[state=inactive]:bg-transparent"
              style={{ 
                color: '#ffffff',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)'
              }}
            >
              Today
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-500">
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-lg mb-2 text-white">How Your Week Has Been</h3>
              <p className="text-sm text-white mb-6">Each line shows a different measurement over the past 7 days</p>
              {!hasWeekData ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  Keep SYNTEX open a bit longer — patterns unlock once it has at least a full day of usage to learn from.
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="weeklyColorSensory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="weeklyColorMental" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af" 
                    style={{ fontSize: '14px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '14px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      padding: "12px",
                      fontSize: "14px",
                    }}
                    labelStyle={{ color: "#fff", marginBottom: "8px" }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                  />
                  <Area
                    key="w-sensory"
                    type="monotone"
                    dataKey="sensoryLoad"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fill="url(#weeklyColorSensory)"
                    dot={{ r: 3, fill: "#ffffff", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#06b6d4", strokeWidth: 2, stroke: "#ffffff" }}
                    name="Sensory Load"
                  />
                  <Area
                    key="w-mental"
                    type="monotone"
                    dataKey="mentalLoad"
                    stroke="#a855f7"
                    strokeWidth={3}
                    fill="url(#weeklyColorMental)"
                    dot={{ r: 3, fill: "#ffffff", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#a855f7", strokeWidth: 2, stroke: "#ffffff" }}
                    name="Mental Load"
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </Card>

            {hasWeekData && (
              <Card className="bg-[#0f0f0f] border-gray-800 p-6">
                <h3 className="text-lg mb-4 text-white">What This Means</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                    <span className="text-2xl">💚</span>
                    <div>
                      <div className="text-base text-emerald-400 mb-1">Wednesday afternoons work well for you</div>
                      <div className="text-sm text-gray-400">Mental load is lowest then. Try scheduling important tasks during this time.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                    <span className="text-2xl">🌊</span>
                    <div>
                      <div className="text-base text-cyan-400 mb-1">Mondays are quieter for you</div>
                      <div className="text-sm text-gray-400">Less sensory overwhelm. Good days to tackle things that usually feel like too much.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                    <span className="text-2xl">🌙</span>
                    <div>
                      <div className="text-base text-purple-400 mb-1">Your brain gets tired after 8 PM</div>
                      <div className="text-sm text-gray-400">Mental load peaks in the evening. Time to wind down and rest.</div>
                    </div>
                  </li>
                </ul>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="daily" className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-500">
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-lg mb-2 text-white">Your Day So Far</h3>
              <p className="text-sm text-white mb-6">Hour by hour breakdown</p>
              {!hasTodayData ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No check-ins logged yet today — check back after SYNTEX has tracked a bit of your day.
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    style={{ fontSize: '13px' }}
                    interval={2}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '14px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      padding: "12px",
                      fontSize: "14px",
                    }}
                    labelStyle={{ color: "#fff", marginBottom: "8px" }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                  />
                  <Line key="d-sensory" type="monotone" dataKey="sensoryLoad" stroke="#06b6d4" strokeWidth={3} dot={false} name="Sensory Load" />
                  <Line key="d-mental"  type="monotone" dataKey="mentalLoad"  stroke="#a855f7" strokeWidth={3} dot={false} name="Mental Load"  />
                </LineChart>
              </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

        </Tabs>

        {/* Privacy Notice */}
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6 mt-8">
          <h3 className="text-base text-indigo-400 mb-2">Your Data Stays With You</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Everything you see here is calculated on your device. Your information never gets sent anywhere.
            No companies can see it. No one can sell it. It's just yours.
          </p>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendPositive,
}: {
  icon: any;
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
}) {
  return (
    <Card className="bg-[#0f0f0f] border-gray-800 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      <div className="text-2xl mb-1 text-white" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3)' }}>{value}</div>
      <div className="text-sm mb-2 text-white" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.2)' }}>{label}</div>
      <div className="text-xs text-white" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)' }}>
        {trend}
      </div>
    </Card>
  );
}