import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Sparkles, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { AvatarConfig, AvatarCreator, AvatarSVG, DEFAULT_AVATAR } from "../components/AvatarCreator";

export function Calibration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [diagnosis, setDiagnosis] = useState<string[]>([]);
  const [environment, setEnvironment] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [fatigueFrequency, setFatigueFrequency] = useState(5);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [avatarBuilt, setAvatarBuilt] = useState(false);

  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];

  const diagnosisOptions = [
    "ADHD",
    "ADD",
    "Autism Spectrum Disorder (ASD)",
    "Sensory Processing Disorder (SPD)",
    "Dyslexia",
    "Anxiety Disorder",
    "None",
    "Prefer not to say",
    "Other"
  ];

  const environments = [
    "Home Office",
    "Corporate Office",
    "Coworking Space",
    "Classroom",
    "Public Transport",
    "Other"
  ];

  const triggerOptions = [
    "Loud Noise",
    "Bright Light",
    "Social Chatter",
    "Crowded Spaces",
    "Sudden Sounds",
    "Fluorescent Lighting",
    "Phone Notifications",
    "Background Music",
    "Strong Smells",
    "Temperature Changes"
  ];

  const toggleTrigger = (trigger: string) => {
    if (triggers.includes(trigger)) {
      setTriggers(triggers.filter(t => t !== trigger));
    } else if (triggers.length < 3) {
      setTriggers([...triggers, trigger]);
    }
  };

  const toggleDiagnosis = (item: string) => {
    if (item === "None" || item === "Prefer not to say") {
      // If selecting "None" or "Prefer not to say", clear all others and select only this
      setDiagnosis([item]);
    } else {
      // Remove "None" and "Prefer not to say" if selecting a specific diagnosis
      const filtered = diagnosis.filter(d => d !== "None" && d !== "Prefer not to say");
      if (diagnosis.includes(item)) {
        setDiagnosis(filtered.filter(d => d !== item));
      } else {
        setDiagnosis([...filtered, item]);
      }
    }
  };

  const handleComplete = () => {
    const calibrationData = {
      name, age, gender, diagnosis, environment, triggers, fatigueFrequency,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem("syntex_calibration", JSON.stringify(calibrationData));
    if (avatarBuilt) {
      localStorage.setItem("syntex_avatar", JSON.stringify(avatarConfig));
    }
    navigate("/dashboard");
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/");
    } else {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (step === 1) return name !== "";
    if (step === 2) return age !== "";
    if (step === 3) return gender !== "";
    if (step === 4) return diagnosis.length > 0;
    if (step === 5) return environment !== "";
    if (step === 6) return triggers.length === 3;
    if (step === 7) return true;
    return true; // step 8 (avatar) is optional
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 pt-8"
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 10, 30, 1) 0%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-300" style={{ filter: 'drop-shadow(0 0 8px rgba(216, 180, 254, 0.6))' }} />
            <h1 className="text-3xl text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}>
              Build Your Profile
            </h1>
          </div>
          <p className="text-gray-400 text-sm" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            Let's personalize SYNTEX for your unique needs
          </p>
          <button
            onClick={() => {
              localStorage.setItem("syntex_profile_dismissed", "true");
              navigate("/dashboard");
            }}
            className="text-gray-500 hover:text-gray-400 text-sm mt-2 transition-colors underline"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            Skip for now
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {step <= 4 ? (
            // Show steps 1-4
            [1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= num
                      ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-800 text-gray-500"
                  }`}
                  style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div className={`w-12 h-1 mx-2 rounded ${step > num ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-gray-800"}`} />
                )}
              </div>
            ))
          ) : (
            // Show steps 5-8
            [5, 6, 7, 8].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= num
                      ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-800 text-gray-500"
                  }`}
                  style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  {num}
                </div>
                {num < 8 && (
                  <div className={`w-8 h-1 mx-1.5 rounded ${step > num ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-gray-800"}`} />
                )}
              </div>
            ))
          )}
        </div>

        {/* Steps */}
        <Card className="bg-gray-900/50 border-gray-800 p-8 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl text-white mb-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
                  Personal Information
                </h2>
                <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Enter your basic details to get started
                </p>
                <div className="flex justify-center">
                  <div className="w-full max-w-md p-6 rounded-lg border-2 transition-all text-center border-gray-700 bg-gray-800/50 hover:border-gray-600">
                    <span className="text-sm font-medium text-gray-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                      Name
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 text-white text-center"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl text-white mb-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
                  Personal Information
                </h2>
                <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Enter your basic details to get started
                </p>
                <div className="flex justify-center">
                  <div className="w-full max-w-md p-6 rounded-lg border-2 transition-all text-center border-gray-700 bg-gray-800/50 hover:border-gray-600">
                    <span className="text-sm font-medium text-gray-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                      Age
                    </span>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full mt-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 text-white text-center"
                      placeholder="Enter your age"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl text-white mb-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
                  Personal Information
                </h2>
                <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Enter your basic details to get started
                </p>
                <div className="flex justify-center">
                  <div className="w-full max-w-md p-6 rounded-lg border-2 transition-all text-center border-gray-700 bg-gray-800/50 hover:border-gray-600">
                    <span className="text-sm font-medium text-gray-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                      Gender
                    </span>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full mt-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 text-white text-center"
                    >
                      <option value="">Select your gender</option>
                      {genderOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl text-white mb-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
                  Do you have any neurodivergent diagnosis?
                </h2>
                <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Select all that apply • This helps us calibrate the app to your needs
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {diagnosisOptions.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleDiagnosis(item)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        diagnosis.includes(item)
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <span className={`text-sm font-medium ${diagnosis.includes(item) ? "text-indigo-300" : "text-gray-300"}`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl text-white mb-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
                  What is your primary focus environment?
                </h2>
                <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Select the environment where you spend most of your focused time
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {environments.map((env) => (
                    <button
                      key={env}
                      onClick={() => setEnvironment(env)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        environment === env
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <span className={`text-sm font-medium ${environment === env ? "text-purple-300" : "text-gray-300"}`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {env}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl text-gray-100 mb-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
                  What are your top 3 sensory triggers?
                </h2>
                <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Select exactly 3 triggers that most affect your focus • Selected: {triggers.length}/3
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {triggerOptions.map((trigger) => (
                    <button
                      key={trigger}
                      onClick={() => toggleTrigger(trigger)}
                      disabled={!triggers.includes(trigger) && triggers.length >= 3}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        triggers.includes(trigger)
                          ? "border-cyan-500 bg-cyan-500/10"
                          : triggers.length >= 3
                          ? "border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <span className={`text-sm font-medium ${triggers.includes(trigger) ? "text-cyan-300" : "text-gray-300"}`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {trigger}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl text-gray-100 mb-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
                  How frequently do you reach sensory fatigue?
                </h2>
                <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  On a scale of 1-10, where 1 is rarely and 10 is very frequently
                </p>
                
                {/* Scale Visualization */}
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs text-gray-500" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>Rarely</span>
                    <span className="text-xs text-gray-500" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>Very Frequently</span>
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={fatigueFrequency}
                    onChange={(e) => setFatigueFrequency(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${(fatigueFrequency - 1) * 11.11}%, rgb(55, 65, 81) ${(fatigueFrequency - 1) * 11.11}%, rgb(55, 65, 81) 100%)`
                    }}
                  />
                  
                  {/* Current Value Display */}
                  <div className="flex justify-center mt-6">
                    <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl px-8 py-4">
                      <div className="text-sm text-purple-300 mb-1 text-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>Your Frequency</div>
                      <div className="text-4xl text-white font-bold text-center" style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
                        {fatigueFrequency}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl text-white mb-1" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
                  Build your avatar
                </h2>
                <p className="text-gray-400 text-sm mb-5" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Create a look that feels like you — you can always change it in Settings.
                </p>
                <AvatarCreator
                  config={avatarConfig}
                  onSave={(c) => { setAvatarConfig(c); setAvatarBuilt(true); }}
                  saveLabel="Save & Continue"
                />
                {avatarBuilt && (
                  <p className="text-center text-xs text-emerald-400 mt-3">Avatar saved! Hit Complete below when ready.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800 gap-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 8 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm px-4 py-2"
              >
                Complete Profile
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Custom Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(168, 85, 247), rgb(34, 211, 238));
          cursor: pointer;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(168, 85, 247), rgb(34, 211, 238));
          cursor: pointer;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4);
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
}