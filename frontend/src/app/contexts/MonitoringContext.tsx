import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { api } from '../api';
import { locationProfiles, sensoryLoadForLocation } from '../lib/locationProfiles';

const COMPLEXITY_WEIGHT: Record<string, number> = { low: 1, medium: 2, high: 3 };

const DECAY_CONSTANT = 0.1;
const MAX_RESERVOIR = 100;
const CRITICAL_MULTIPLIER = 2;

type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

interface MonitoringState {
  sensoryLoad: number; // 0-100, from location stimulation profile + real mic reading
  mentalLoad: number; // 0-100, from active task count/complexity
  cognitiveReservoir: number; // 0-100
  timeToOverload: number | null; // minutes
}

interface MonitoringContextType extends MonitoringState {
  triggerSensoryReset: () => void;
  resetMonitoring: () => void;

  // Real ambient noise (microphone)
  noiseLevel: number | null; // dB, null until granted + measuring
  micPermission: PermissionState;
  requestMicPermission: () => Promise<void>;

  // Best-effort ambient light (screen/device brightness surroundings) — most
  // browsers do not support this; brightnessSupported reflects that honestly
  // rather than showing a fabricated number.
  brightnessLux: number | null;
  brightnessSupported: boolean;

  // Real elapsed time this tab has been visible/active this session
  sessionSeconds: number;

  // Current location + its stimulation profile (set from the Circle page)
  location: string;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export function MonitoringProvider({ children }: { children: ReactNode }) {
  const [lastResetTime, setLastResetTime] = useState<number>(Date.now());
  const [location, setLocationState] = useState("Not set");
  const [activeTaskWeight, setActiveTaskWeight] = useState(0);

  const [noiseLevel, setNoiseLevel] = useState<number | null>(null);
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const micCtxRef = useRef<{ ctx: AudioContext; stream: MediaStream } | null>(null);
  const micRafRef = useRef<number | null>(null);

  const [brightnessLux, setBrightnessLux] = useState<number | null>(null);
  const [brightnessSupported, setBrightnessSupported] = useState(false);

  const [sessionSeconds, setSessionSeconds] = useState(0);

  const [state, setState] = useState<MonitoringState>({
    sensoryLoad: 30,
    mentalLoad: 10,
    cognitiveReservoir: 100,
    timeToOverload: null,
  });

  // --- Poll location + tasks (both editable from other pages/backend) ---
  useEffect(() => {
    const poll = () => {
      api.getLocation().then((loc) => setLocationState(loc.current)).catch(() => {});
      api.listTasks().then((tasks) => {
        const weight = tasks
          .filter((t) => !t.completed)
          .reduce((sum, t) => sum + (COMPLEXITY_WEIGHT[t.complexity] ?? 2), 0);
        setActiveTaskWeight(weight);
      }).catch(() => {});
    };
    poll();
    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, []);

  // --- Real screen/session time (pauses while tab is hidden) ---
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSessionSeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // --- Best-effort Ambient Light Sensor (rarely supported; fails gracefully) ---
  useEffect(() => {
    const AmbientLightSensor = (window as any).AmbientLightSensor;
    if (typeof AmbientLightSensor === 'undefined') {
      setBrightnessSupported(false);
      return;
    }
    let sensor: any;
    try {
      sensor = new AmbientLightSensor();
      sensor.addEventListener('reading', () => setBrightnessLux(sensor.illuminance));
      sensor.addEventListener('error', () => setBrightnessSupported(false));
      sensor.start();
      setBrightnessSupported(true);
    } catch {
      setBrightnessSupported(false);
    }
    return () => sensor?.stop?.();
  }, []);

  // --- Microphone-based ambient noise ---
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      micCtxRef.current = { ctx, stream };
      setMicPermission('granted');

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSquares += v * v;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        setNoiseLevel(Math.round(Math.max(20, Math.min(95, 20 + rms * 200))));
        micRafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setMicPermission('denied');
    }
  };

  useEffect(() => {
    return () => {
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      if (micCtxRef.current) {
        micCtxRef.current.stream.getTracks().forEach((t) => t.stop());
        micCtxRef.current.ctx.close();
      }
    };
  }, []);

  const triggerSensoryReset = () => {
    setLastResetTime(Date.now());
    setState((prev) => ({ ...prev, cognitiveReservoir: Math.min(prev.cognitiveReservoir + 15, 100) }));
  };

  const resetMonitoring = () => {
    setLastResetTime(Date.now());
    setState({ sensoryLoad: 30, mentalLoad: 10, cognitiveReservoir: 100, timeToOverload: null });
  };

  // --- Recompute derived metrics whenever an input changes ---
  useEffect(() => {
    const profile = locationProfiles[location];
    const sensoryLoad = sensoryLoadForLocation(profile, noiseLevel);
    const mentalLoad = Math.round(Math.min(Math.max(activeTaskWeight * 10, 0), 100));

    const now = Date.now();
    const timeSinceReset = (now - lastResetTime) / 1000 / 60; // minutes
    let drainRate = (sensoryLoad + mentalLoad) / 2;
    if (sensoryLoad > 80 || mentalLoad > 80) drainRate *= CRITICAL_MULTIPLIER;
    const drained = drainRate * timeSinceReset * DECAY_CONSTANT;
    const cognitiveReservoir = Math.min(Math.max(MAX_RESERVOIR - drained, 0), 100);

    let timeToOverload: number | null = null;
    if (cognitiveReservoir > 20 && drainRate > 0) {
      const remaining = cognitiveReservoir - 20;
      const rate = drainRate * DECAY_CONSTANT;
      timeToOverload = rate > 0 ? remaining / rate : null;
    }

    setState({ sensoryLoad, mentalLoad, cognitiveReservoir, timeToOverload });
  }, [location, noiseLevel, activeTaskWeight, lastResetTime, sessionSeconds]);

  // --- Log a snapshot to the backend periodically for real Insights history ---
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current;
      api.createCheckin({
        sensoryLoad: s.sensoryLoad,
        mentalLoad: s.mentalLoad,
        cognitiveReservoir: s.cognitiveReservoir,
        timeToOverload: s.timeToOverload,
      }).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <MonitoringContext.Provider
      value={{
        ...state,
        triggerSensoryReset,
        resetMonitoring,
        noiseLevel,
        micPermission,
        requestMicPermission,
        brightnessLux,
        brightnessSupported,
        sessionSeconds,
        location,
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
