export interface LocationProfile {
  noiseLevel: number;
  visualStim: number;
  socialLoad: number;
  type: string;
}

export const locationProfiles: Record<string, LocationProfile> = {
  "Library":           { noiseLevel: 35, visualStim: 20, socialLoad: 10, type: "Low-Stim" },
  "Coffee Shop":       { noiseLevel: 75, visualStim: 65, socialLoad: 45, type: "High-Stim" },
  "Quiet Study Room":  { noiseLevel: 30, visualStim: 15, socialLoad: 5,  type: "Low-Stim" },
  "Lecture Hall":      { noiseLevel: 55, visualStim: 70, socialLoad: 60, type: "Medium-Stim" },
  "Cafeteria":         { noiseLevel: 80, visualStim: 75, socialLoad: 70, type: "High-Stim" },
  "Dorm Room":         { noiseLevel: 40, visualStim: 30, socialLoad: 20, type: "Low-Stim" },
  "Campus Quad":       { noiseLevel: 65, visualStim: 60, socialLoad: 50, type: "Medium-Stim" },
  "Shopping Mall":     { noiseLevel: 85, visualStim: 90, socialLoad: 80, type: "Very High-Stim" },
  "Park":              { noiseLevel: 45, visualStim: 40, socialLoad: 25, type: "Low-Stim" },
  "Gym":               { noiseLevel: 70, visualStim: 65, socialLoad: 40, type: "High-Stim" },
  "Home (Alone)":      { noiseLevel: 25, visualStim: 20, socialLoad: 0,  type: "Very Low-Stim" },
  "Restaurant":        { noiseLevel: 75, visualStim: 70, socialLoad: 55, type: "High-Stim" },
  "Transit Hub":       { noiseLevel: 78, visualStim: 80, socialLoad: 65, type: "High-Stim" },
  "Clinic / Hospital": { noiseLevel: 50, visualStim: 55, socialLoad: 40, type: "Medium-Stim" },
};

// Sensory Load (0-100) from a location's stimulation profile, optionally
// blended with a real measured ambient noise reading (dB) when available.
export function sensoryLoadForLocation(profile: LocationProfile | undefined, measuredDb: number | null): number {
  if (!profile && measuredDb == null) return 30; // neutral baseline, no signal yet
  const noise = measuredDb ?? profile?.noiseLevel ?? 30;
  const noiseScore = Math.min(noise / 90, 1) * 45;
  const visualScore = ((profile?.visualStim ?? 30) / 100) * 30;
  const socialScore = ((profile?.socialLoad ?? 10) / 100) * 25;
  return Math.round(Math.min(Math.max(noiseScore + visualScore + socialScore, 0), 100));
}
