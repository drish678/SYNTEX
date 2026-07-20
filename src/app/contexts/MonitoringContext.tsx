import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SensoryDataPoint {
  timestamp: number;
  noise: number; // decibels
  brightness: number; // lux
  locationChanges: number;
}

interface TaskSession {
  startTime: number;
  endTime?: number;
  taskType: 'high-logic' | 'passive' | 'medium';
  cognitiveWeight: number;
}

interface EngagementPoint {
  timestamp: number;
  isActive: boolean;
  duration: number; // seconds
}

interface MonitoringState {
  sensoryLoad: number; // 0-100
  mentalLoad: number; // 0-100
  focusStatus: number; // 0-100
  cognitiveReservoir: number; // 0-100
  timeToOverload: number | null; // minutes, null if not approaching overload
}

interface MonitoringContextType extends MonitoringState {
  addSensoryData: (noise: number, brightness: number, locationChange: boolean) => void;
  startTask: (taskType: 'high-logic' | 'passive' | 'medium') => void;
  endTask: () => void;
  recordActivity: (isActive: boolean) => void;
  triggerSensoryReset: () => void;
  resetMonitoring: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

const COGNITIVE_WEIGHTS = {
  'high-logic': 2.5, // Coding, writing, research
  'medium': 1.5, // Planning, organizing
  'passive': 0.5, // Media consumption, scrolling
};

const DECAY_CONSTANT = 0.1; // Exponential decay rate
const SLIDING_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_RESERVOIR = 100;
const CRITICAL_MULTIPLIER = 2; // 2x drain when in critical state

export function MonitoringProvider({ children }: { children: ReactNode }) {
  const [sensoryHistory, setSensoryHistory] = useState<SensoryDataPoint[]>([]);
  const [taskSessions, setTaskSessions] = useState<TaskSession[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskSession | null>(null);
  const [engagementHistory, setEngagementHistory] = useState<EngagementPoint[]>([]);
  const [lastResetTime, setLastResetTime] = useState<number>(Date.now());
  
  const [state, setState] = useState<MonitoringState>({
    sensoryLoad: 35,
    mentalLoad: 45,
    focusStatus: 75,
    cognitiveReservoir: 72,
    timeToOverload: null,
  });

  // Calculate Sensory Load using exponential decay model
  const calculateSensoryLoad = (history: SensoryDataPoint[]): number => {
    const now = Date.now();
    const recentData = history.filter(
      point => now - point.timestamp < SLIDING_WINDOW_MS
    );

    if (recentData.length === 0) return 30; // Baseline

    let weightedSum = 0;
    let totalWeight = 0;

    recentData.forEach(point => {
      const age = (now - point.timestamp) / 1000; // seconds
      const weight = Math.exp(-DECAY_CONSTANT * age / 60); // Exponential decay
      
      // Normalize inputs
      const noiseScore = Math.min(point.noise / 85, 1) * 40; // 85dB = max comfortable
      const brightnessScore = Math.min(point.brightness / 1000, 1) * 30; // 1000 lux = max comfortable
      const locationScore = point.locationChanges * 30; // High-intensity changes
      
      const totalScore = noiseScore + brightnessScore + locationScore;
      
      weightedSum += totalScore * weight;
      totalWeight += weight;
    });

    const sensoryLoad = totalWeight > 0 ? weightedSum / totalWeight : 30;
    return Math.min(Math.max(sensoryLoad, 0), 100);
  };

  // Calculate Mental Load using Cognitive Demand Index
  const calculateMentalLoad = (sessions: TaskSession[], currentTask: TaskSession | null): number => {
    const now = Date.now();
    const recentWindow = 30 * 60 * 1000; // 30 minutes
    
    // Get recent completed sessions
    const recentSessions = sessions.filter(
      session => session.endTime && now - session.endTime < recentWindow
    );

    // Include current task if active
    const allSessions = currentTask 
      ? [...recentSessions, currentTask]
      : recentSessions;

    if (allSessions.length === 0) return 35; // Baseline

    let totalLoad = 0;

    allSessions.forEach(session => {
      const endTime = session.endTime || now;
      const duration = (endTime - session.startTime) / 1000 / 60; // minutes
      const intensity = session.cognitiveWeight;
      
      // Mental Load = Σ(Task_intensity × Duration_time)
      totalLoad += intensity * duration;
    });

    // Normalize to 0-100 scale (assume 60 minutes of high-logic work = 100%)
    const normalizedLoad = (totalLoad / (COGNITIVE_WEIGHTS['high-logic'] * 60)) * 100;
    return Math.min(Math.max(normalizedLoad, 0), 100);
  };

  // Calculate Focus Status using Engagement Intensity
  const calculateFocusStatus = (engagement: EngagementPoint[]): number => {
    const now = Date.now();
    const recentWindow = 20 * 60 * 1000; // 20 minutes
    
    const recentEngagement = engagement.filter(
      point => now - point.timestamp < recentWindow
    );

    if (recentEngagement.length === 0) return 50; // Neutral baseline

    let activeTime = 0;
    let idleTime = 0;

    recentEngagement.forEach(point => {
      if (point.isActive) {
        activeTime += point.duration;
      } else {
        // Distinguish cognitive processing from distraction
        // Short pauses (<30s) are "processing", long pauses are "distraction"
        if (point.duration < 30) {
          activeTime += point.duration * 0.5; // Count as partial focus
        } else {
          idleTime += point.duration;
        }
      }
    });

    const totalTime = activeTime + idleTime;
    if (totalTime === 0) return 50;

    // Focus Status = (Active Engagement / Total Time) × 100
    const focusRatio = activeTime / totalTime;
    return Math.min(Math.max(focusRatio * 100, 0), 100);
  };

  // Calculate Cognitive Reservoir and Time to Overload
  const calculateReservoir = (sensory: number, mental: number, focusStatus: number): {
    reservoir: number;
    timeToOverload: number | null;
  } => {
    const now = Date.now();
    const timeSinceReset = (now - lastResetTime) / 1000 / 60; // minutes

    // Calculate drain rate
    let drainRate = (sensory + mental) / 2;
    
    // Critical state accelerates drain
    if (sensory > 80 || mental > 80) {
      drainRate *= CRITICAL_MULTIPLIER;
    }

    // Focus helps buffer the drain slightly
    const focusBuffer = (focusStatus / 100) * 0.3; // Max 30% reduction
    drainRate *= (1 - focusBuffer);

    // Reservoir = Total Capacity - ∫(Sensory + Mental)dt
    const drainedAmount = drainRate * timeSinceReset;
    const currentReservoir = Math.max(MAX_RESERVOIR - drainedAmount, 0);

    // Predict time to overload (when reservoir hits 20%)
    let timeToOverload = null;
    if (currentReservoir > 20 && drainRate > 0) {
      const remainingCapacity = currentReservoir - 20;
      timeToOverload = remainingCapacity / drainRate;
    }

    return {
      reservoir: Math.min(Math.max(currentReservoir, 0), 100),
      timeToOverload: timeToOverload && timeToOverload > 0 ? timeToOverload : null,
    };
  };

  // Add sensory data point
  const addSensoryData = (noise: number, brightness: number, locationChange: boolean) => {
    const dataPoint: SensoryDataPoint = {
      timestamp: Date.now(),
      noise,
      brightness,
      locationChanges: locationChange ? 1 : 0,
    };

    setSensoryHistory(prev => {
      const newHistory = [...prev, dataPoint];
      // Keep only last 15 minutes of data
      const cutoff = Date.now() - (15 * 60 * 1000);
      return newHistory.filter(point => point.timestamp > cutoff);
    });
  };

  // Start a task session
  const startTask = (taskType: 'high-logic' | 'passive' | 'medium') => {
    // End current task if exists
    if (currentTask) {
      const endedTask = { ...currentTask, endTime: Date.now() };
      setTaskSessions(prev => [...prev, endedTask]);
    }

    const newTask: TaskSession = {
      startTime: Date.now(),
      taskType,
      cognitiveWeight: COGNITIVE_WEIGHTS[taskType],
    };

    setCurrentTask(newTask);
  };

  // End current task
  const endTask = () => {
    if (currentTask) {
      const endedTask = { ...currentTask, endTime: Date.now() };
      setTaskSessions(prev => [...prev, endedTask]);
      setCurrentTask(null);
    }
  };

  // Record activity/engagement
  const recordActivity = (isActive: boolean) => {
    const point: EngagementPoint = {
      timestamp: Date.now(),
      isActive,
      duration: 1, // 1 second increment
    };

    setEngagementHistory(prev => {
      const newHistory = [...prev, point];
      // Keep only last 30 minutes
      const cutoff = Date.now() - (30 * 60 * 1000);
      return newHistory.filter(p => p.timestamp > cutoff);
    });
  };

  // Trigger sensory reset (recharge reservoir)
  const triggerSensoryReset = () => {
    setLastResetTime(Date.now());
    setState(prev => ({
      ...prev,
      cognitiveReservoir: Math.min(prev.cognitiveReservoir + 15, 100), // +15% recharge
    }));
  };

  // Reset all monitoring
  const resetMonitoring = () => {
    setSensoryHistory([]);
    setTaskSessions([]);
    setCurrentTask(null);
    setEngagementHistory([]);
    setLastResetTime(Date.now());
    setState({
      sensoryLoad: 35,
      mentalLoad: 45,
      focusStatus: 75,
      cognitiveReservoir: 72,
      timeToOverload: null,
    });
  };

  // Update calculations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const sensoryLoad = calculateSensoryLoad(sensoryHistory);
      const mentalLoad = calculateMentalLoad(taskSessions, currentTask);
      const focusStatus = calculateFocusStatus(engagementHistory);
      const { reservoir, timeToOverload } = calculateReservoir(sensoryLoad, mentalLoad, focusStatus);

      setState({
        sensoryLoad,
        mentalLoad,
        focusStatus,
        cognitiveReservoir: reservoir,
        timeToOverload,
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [sensoryHistory, taskSessions, currentTask, engagementHistory, lastResetTime]);

  // Simulate environmental data for demo purposes
  useEffect(() => {
    const simulateEnvironment = setInterval(() => {
      // Simulate varying noise levels (30-70 dB typical indoor)
      const baseNoise = 40 + Math.sin(Date.now() / 60000) * 15;
      const noise = baseNoise + (Math.random() * 10 - 5);
      
      // Simulate brightness (200-800 lux typical indoor)
      const brightness = 400 + Math.sin(Date.now() / 120000) * 200 + (Math.random() * 100);
      
      // Occasional location changes
      const locationChange = Math.random() < 0.05; // 5% chance per interval
      
      addSensoryData(noise, brightness, locationChange);
    }, 5000); // Every 5 seconds

    return () => clearInterval(simulateEnvironment);
  }, []);

  // Simulate task activity for demo
  useEffect(() => {
    const taskTypes: ('high-logic' | 'passive' | 'medium')[] = ['high-logic', 'passive', 'medium'];
    
    // Start with a random task
    startTask(taskTypes[Math.floor(Math.random() * taskTypes.length)]);

    const switchTask = setInterval(() => {
      // Randomly switch tasks
      if (Math.random() < 0.3) { // 30% chance to switch
        const newTaskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
        startTask(newTaskType);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(switchTask);
  }, []);

  // Simulate engagement patterns for demo
  useEffect(() => {
    const trackEngagement = setInterval(() => {
      // Simulate active vs idle patterns
      const isActive = Math.random() < 0.7; // 70% active, 30% idle
      recordActivity(isActive);
    }, 1000); // Every second

    return () => clearInterval(trackEngagement);
  }, []);

  return (
    <MonitoringContext.Provider
      value={{
        ...state,
        addSensoryData,
        startTask,
        endTask,
        recordActivity,
        triggerSensoryReset,
        resetMonitoring,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within MonitoringProvider');
  }
  return context;
}
