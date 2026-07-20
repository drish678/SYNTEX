import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvatarConfig {
  skinTone: string;
  hairStyle: "buzz" | "short" | "medium" | "long" | "curly" | "bun" | "afro";
  hairColor: string;
  glasses: "none" | "round" | "rectangle" | "cat-eye";
  gender: "feminine" | "masculine";
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: "#D4956A",
  hairStyle: "medium",
  hairColor: "#3D1F0D",
  glasses: "none",
  gender: "feminine",
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const SKIN_TONES  = ["#FDDBB4", "#F4C28F", "#D4956A", "#A0674B", "#6B3F2A", "#3D1F0D"];
export const HAIR_COLORS = ["#1a1008", "#3D1F0D", "#7B4F2E", "#C49A3C", "#B03030", "#8C8C8C", "#9B4DCA", "#1E7A6E"];

const HAIR_LABELS: Record<AvatarConfig["hairStyle"], string> = {
  buzz: "Buzz", short: "Short", medium: "Medium", long: "Long",
  curly: "Curly", bun: "Bun", afro: "Afro",
};

const GLASSES_LABELS: Record<AvatarConfig["glasses"], string> = {
  none: "None", round: "Round", rectangle: "Rectangle", "cat-eye": "Cat-eye",
};

// ─── SVG hair paths ───────────────────────────────────────────────────────────

const HAIR_PATH: Record<AvatarConfig["hairStyle"], string> = {
  buzz:   "M28 48 Q28 22 50 22 Q72 22 72 48 Q70 30 50 30 Q30 30 28 48Z",
  short:  "M24 50 Q22 20 50 18 Q78 20 76 50 Q72 24 50 24 Q28 24 24 50Z",
  medium: "M22 55 Q20 18 50 16 Q80 18 78 55 Q75 20 50 20 Q25 20 22 55 M22 55 Q18 70 20 82 M78 55 Q82 70 80 82Z",
  long:   "M20 58 Q18 16 50 14 Q82 16 80 58 Q78 18 50 18 Q22 18 20 58 M20 58 Q14 80 16 100 M80 58 Q86 80 84 100Z",
  curly:  "M22 52 Q18 16 50 14 Q82 16 78 52 Q72 20 50 20 Q28 20 22 52 M22 52 Q16 60 18 72 M78 52 Q84 60 82 72 M28 20 Q24 14 30 12 M40 18 Q38 10 44 10 M60 18 Q62 10 56 10 M72 20 Q76 14 70 12Z",
  bun:    "M28 50 Q26 26 50 24 Q74 26 72 50 Q70 28 50 28 Q30 28 28 50 M50 24 Q46 14 50 10 Q54 14 50 24Z",
  afro:   "M14 52 Q10 16 50 12 Q90 16 86 52 Q80 10 50 10 Q20 10 14 52 M14 52 Q10 58 12 64 M86 52 Q90 58 88 64Z",
};

const BACK_HAIR = new Set<AvatarConfig["hairStyle"]>(["long", "medium"]);

// ─── AvatarSVG ────────────────────────────────────────────────────────────────

export function AvatarSVG({ config, size = 80 }: { config: AvatarConfig; size?: number }) {
  const { skinTone, hairStyle, hairColor, glasses, gender } = config;
  const isFeminine = gender === "feminine";

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#0f0820" />

      {/* Hair — back layer (long / medium fall behind face) */}
      {BACK_HAIR.has(hairStyle) && (
        <path d={HAIR_PATH[hairStyle]} fill={hairColor} />
      )}

      {/* Neck */}
      <rect x="42" y="74" width="16" height="12" rx="4" fill={skinTone} />

      {/* Face */}
      <ellipse cx="50" cy="55" rx="24" ry="26" fill={skinTone} />

      {/* Ears */}
      <ellipse cx="26" cy="56" rx="4" ry="5.5" fill={skinTone} />
      <ellipse cx="74" cy="56" rx="4" ry="5.5" fill={skinTone} />

      {/* Eye whites */}
      <ellipse cx="41" cy="52" rx="3.5" ry="4"   fill="#fff" />
      <ellipse cx="59" cy="52" rx="3.5" ry="4"   fill="#fff" />
      {/* Irises */}
      <ellipse cx="41" cy="52.5" rx="2" ry="2.5" fill="#1a1a1a" />
      <ellipse cx="59" cy="52.5" rx="2" ry="2.5" fill="#1a1a1a" />
      {/* Catchlights */}
      <circle cx="42" cy="51.5" r="0.8" fill="#ffffff80" />
      <circle cx="60" cy="51.5" r="0.8" fill="#ffffff80" />

      {/* Single eyelash per eye (feminine only) */}
      {isFeminine && (
        <g fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round">
          <path d="M36 49 Q41 43.5 46 49" />
          <path d="M54 49 Q59 43.5 64 49" />
        </g>
      )}

      {/* Eyebrows */}
      <path d="M36 46.5 Q41 44 46 46"   stroke="#5a3825" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M54 46 Q59 44 64 46.5"   stroke="#5a3825" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M48 58 Q50 62 52 58" stroke={skinTone === "#FDDBB4" ? "#c4915a" : "#5a3020"} strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M42 68 Q50 73 58 68" stroke="#8B5040" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Glasses */}
      {glasses === "round" && (
        <g stroke="#aaa" strokeWidth="1.5" fill="none">
          <circle cx="41" cy="52" r="6.5" />
          <circle cx="59" cy="52" r="6.5" />
          <line x1="47.5" y1="52" x2="52.5" y2="52" />
          <line x1="25"   y1="51" x2="34.5" y2="52" />
          <line x1="65.5" y1="52" x2="75"   y2="51" />
        </g>
      )}
      {glasses === "rectangle" && (
        <g stroke="#aaa" strokeWidth="1.5" fill="none">
          <rect x="33" y="47.5" width="16" height="9" rx="1.5" />
          <rect x="51" y="47.5" width="16" height="9" rx="1.5" />
          <line x1="49" y1="52" x2="51"   y2="52" />
          <line x1="25" y1="50.5" x2="33" y2="51.5" />
          <line x1="67" y1="51.5" x2="75" y2="50.5" />
        </g>
      )}
      {glasses === "cat-eye" && (
        <g stroke="#aaa" strokeWidth="1.5" fill="none">
          <path d="M33 53 Q35 46 47 46 Q49 46 49 49 L49 56 Q49 57 47 57 L35 55 Z" />
          <path d="M51 53 Q53 46 65 46 Q67 46 67 49 L67 56 Q67 57 65 57 L53 55 Z" />
          <line x1="49" y1="52" x2="51" y2="52" />
          <line x1="25" y1="50" x2="33" y2="52" />
          <line x1="67" y1="52" x2="75" y2="50" />
        </g>
      )}

      {/* Hair — front layer */}
      {!BACK_HAIR.has(hairStyle) && (
        <path d={HAIR_PATH[hairStyle]} fill={hairColor} />
      )}
    </svg>
  );
}

// ─── AvatarCreator ────────────────────────────────────────────────────────────

export function AvatarCreator({
  config,
  onSave,
  saveLabel = "Save Avatar",
}: {
  config: AvatarConfig;
  onSave: (c: AvatarConfig) => void;
  saveLabel?: string;
}) {
  const [draft, setDraft] = useState<AvatarConfig>(config);
  const update = (patch: Partial<AvatarConfig>) => setDraft(prev => ({ ...prev, ...patch }));

  return (
    <div className="space-y-5">
      {/* Live preview */}
      <div className="flex justify-center">
        <div
          className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/30 bg-gray-950 shadow-xl"
          style={{ boxShadow: "0 0 30px rgba(99,102,241,0.2)" }}
        >
          <AvatarSVG config={draft} size={112} />
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Gender</p>
        <div className="grid grid-cols-2 gap-2">
          {(["feminine", "masculine"] as const).map(g => (
            <button
              key={g}
              onClick={() => update({ gender: g })}
              className={`py-2 rounded-xl text-xs border font-medium transition-all ${
                draft.gender === g
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              {g === "feminine" ? "♀ Female" : "♂ Male"}
            </button>
          ))}
        </div>
      </div>

      {/* Skin tone */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Skin Tone</p>
        <div className="flex gap-2.5 flex-wrap">
          {SKIN_TONES.map(tone => (
            <button
              key={tone}
              onClick={() => update({ skinTone: tone })}
              className={`w-9 h-9 rounded-full transition-all ${
                draft.skinTone === tone
                  ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-950 scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: tone }}
            />
          ))}
        </div>
      </div>

      {/* Hair style */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Hair Style</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(HAIR_LABELS) as AvatarConfig["hairStyle"][]).map(style => (
            <button
              key={style}
              onClick={() => update({ hairStyle: style })}
              className={`py-1.5 rounded-lg text-xs border transition-all ${
                draft.hairStyle === style
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              {HAIR_LABELS[style]}
            </button>
          ))}
        </div>
      </div>

      {/* Hair color */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Hair Color</p>
        <div className="flex gap-2.5 flex-wrap">
          {HAIR_COLORS.map(color => (
            <button
              key={color}
              onClick={() => update({ hairColor: color })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                draft.hairColor === color
                  ? "border-indigo-400 scale-110"
                  : "border-gray-700 hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Glasses */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Glasses</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(GLASSES_LABELS) as AvatarConfig["glasses"][]).map(g => (
            <button
              key={g}
              onClick={() => update({ glasses: g })}
              className={`py-1.5 rounded-lg text-xs border transition-all ${
                draft.glasses === g
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              {GLASSES_LABELS[g]}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={() => onSave(draft)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium transition-all"
      >
        {saveLabel}
      </button>
    </div>
  );
}
