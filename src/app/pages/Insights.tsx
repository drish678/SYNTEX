import { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Brain, Eye, Target, Calendar, Clock } from "lucide-react";

// Generate mock data for the past 7 days
const generateDailyData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, index) => ({
    id: `day-${index}`,
    day,
    sensoryLoad: Math.floor(Math.random() * 40 + 30),
    mentalLoad: Math.floor(Math.random() * 40 + 40),
    taskFocus: Math.floor(Math.random() * 30 + 60),
  }));
};

const generateHourlyData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const period = i < 12 ? "AM" : "PM";
    return `${hour}${period}`;
  });

  return hours.map((time, index) => ({
    id: `hour-${index}`,
    time,
    sensoryLoad: index < 6 || index > 22 ? 20 : Math.floor(Math.random() * 40 + 40),
    mentalLoad: index < 6 || index > 20 ? 30 : Math.floor(Math.random() * 40 + 50),
    taskFocus: index < 8 || index > 22 ? 20 : Math.floor(Math.random() * 50 + 40),
  }));
};

const generatePatternData = () => {
  return [
    { id: "pattern-1", activity: "Morning Routine", avgLoad: 42, frequency: 7 },
    { id: "pattern-2", activity: "Commute", avgLoad: 78, frequency: 10 },
    { id: "pattern-3", activity: "Work Session", avgLoad: 55, frequency: 15 },
    { id: "pattern-4", activity: "Social Event", avgLoad: 85, frequency: 3 },
    { id: "pattern-5", activity: "Exercise", avgLoad: 65, frequency: 4 },
    { id: "pattern-6", activity: "Evening Wind-down", avgLoad: 35, frequency: 7 },
  ];
};

export function Insights() {

  const [dailyData] = useState(generateDailyData());
  const [hourlyData] = useState(generateHourlyData());
  const [patternData] = useState(generatePatternData());
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
            <TabsTrigger 
              value="patterns" 
              className="data-[state=active]:bg-purple-900 data-[state=inactive]:bg-transparent"
              style={{ 
                color: '#ffffff',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)'
              }}
            >
              Your Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-500">
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-lg mb-2 text-white">How Your Week Has Been</h3>
              <p className="text-sm text-white mb-6">Each line shows a different measurement over the past 7 days</p>
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
                    <linearGradient id="weeklyColorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  <Area
                    key="w-focus"
                    type="monotone"
                    dataKey="taskFocus"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#weeklyColorFocus)"
                    dot={{ r: 3, fill: "#ffffff", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#ffffff" }}
                    name="Focus Status"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-lg mb-4 text-white">What This Means</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <span className="text-2xl">💚</span>
                  <div>
                    <div className="text-base text-emerald-400 mb-1">Wednesday afternoons work well for you</div>
                    <div className="text-sm text-gray-400">Your focus is strongest then. Try scheduling important tasks during this time.</div>
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
          </TabsContent>

          <TabsContent value="daily" className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-500">
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-lg mb-2 text-white">Your Day So Far</h3>
              <p className="text-sm text-white mb-6">Hour by hour breakdown</p>
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
                  <Line key="d-focus"   type="monotone" dataKey="taskFocus"   stroke="#10b981" strokeWidth={3} dot={false} name="Focus Status" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-500">
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-lg mb-2 text-white">How Different Activities Affect You</h3>
              <p className="text-sm text-white mb-6">Higher numbers mean more overwhelming</p>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={patternData} margin={{ bottom: 80 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9}/>
                      <stop offset="50%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity={1}/>
                      <stop offset="50%" stopColor="#818cf8" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis 
                    dataKey="activity" 
                    stroke="#9ca3af" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    style={{ fontSize: '13px' }}
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
                      color: "#ffffff",
                    }}
                    labelStyle={{ color: "#fff", marginBottom: "8px" }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar
                    key="p-avgload"
                    dataKey="avgLoad"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    name="Average Load"
                    activeBar={{
                      fill: "url(#barGradientHover)",
                      radius: [8, 8, 0, 0],
                      style: { 
                        filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.5)) drop-shadow(0 2px 10px rgba(99, 102, 241, 0.3))',
                      }
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-lg mb-4 text-white">Things I've Learned About You</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="text-base text-red-400 mb-1">Social events are really draining</div>
                    <div className="text-sm text-gray-400">They push your sensory load way up. Make sure to plan quiet time afterwards.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <span className="text-2xl">🚗</span>
                  <div>
                    <div className="text-base text-amber-400 mb-1">Your commute is tough</div>
                    <div className="text-sm text-gray-400">It takes a lot out of you. Headphones or a different route might help.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="text-base text-emerald-400 mb-1">Your morning routine helps a lot</div>
                    <div className="text-sm text-gray-400">Keeping it consistent keeps things stable. This is working well.</div>
                  </div>
                </li>
              </ul>
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