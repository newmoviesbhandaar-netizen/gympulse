import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { calcBMI, bmiCategory } from "../lib/helpers";
import { generateRoutine } from "../lib/routineGenerator";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";

const STEPS = ["Personal Info", "Body Metrics", "Fitness Goal", "Review"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "male",
    weight_kg: "",
    height_cm: "",
    goal: "general_fitness",
    phone: "",
    emergency_contact: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const bmi = calcBMI(parseFloat(form.weight_kg), parseFloat(form.height_cm));
  const bmiInfo = bmiCategory(bmi);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: form.full_name,
        age: parseInt(form.age),
        gender: form.gender,
        weight_kg: parseFloat(form.weight_kg),
        height_cm: parseFloat(form.height_cm),
        goal: form.goal,
        phone: form.phone,
        emergency_contact: form.emergency_contact,
        bmi,
        onboarded: true,
      });
      if (profileErr) throw profileErr;

      const routine = generateRoutine(
        parseInt(form.age),
        bmi,
        form.gender,
        form.goal
      );

      const rows = routine.flatMap((day) =>
        day.exercises.map((ex, idx) => ({
          user_id: user.id,
          day_number: day.dayNumber,
          day_label: day.label,
          is_rest_day: day.isRestDay,
          exercise_order: idx,
          name: ex.name,
          sets: ex.sets,
          reps_or_duration: ex.repsOrDuration,
          rest_seconds: ex.restSeconds,
          category: ex.category,
          muscle_group: ex.muscleGroup,
        }))
      );

      const { error: routineErr } = await supabase
        .from("exercise_routines")
        .insert(rows);
      if (routineErr) throw routineErr;

      toast.success("Profile set up! Welcome to GymPulse 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.full_name && form.age && form.gender;
    if (step === 1) return form.weight_kg && form.height_cm;
    if (step === 2) return form.goal;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <div className="w-full max-w-lg">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                  i < step
                    ? "bg-accent text-white"
                    : i === step
                    ? "bg-accent/20 text-accent border border-accent"
                    : "bg-bg-tertiary text-text-secondary"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 ${i < step ? "bg-accent" : "bg-bordr"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-bg-secondary border border-bordr rounded-card p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                  <Input label="Full Name" value={form.full_name} onChange={set("full_name")} placeholder="John Doe" />
                  <Input label="Age" type="number" value={form.age} onChange={set("age")} placeholder="25" min="13" max="100" />
                  <Select label="Gender" value={form.gender} onChange={set("gender")}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                  <Input label="Phone (optional)" value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
                  <Input label="Emergency Contact (optional)" value={form.emergency_contact} onChange={set("emergency_contact")} placeholder="Name & phone" />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Body Metrics</h2>
                  <Input label="Weight (kg)" type="number" value={form.weight_kg} onChange={set("weight_kg")} placeholder="70" />
                  <Input label="Height (cm)" type="number" value={form.height_cm} onChange={set("height_cm")} placeholder="175" />
                  {bmi > 0 && (
                    <div className="bg-bg-primary rounded-btn p-4 border border-bordr">
                      <p className="text-text-secondary text-sm">Your BMI</p>
                      <p className="text-3xl font-bold mt-1" style={{ color: bmiInfo.color }}>
                        {bmi}
                      </p>
                      <p className="text-sm mt-1" style={{ color: bmiInfo.color }}>
                        {bmiInfo.label}
                      </p>
                      <p className="text-xs text-text-secondary mt-2">
                        Your routine will be tailored to your BMI category
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">What's your goal?</h2>
                  {[
                    { value: "weight_loss", label: "Weight Loss", desc: "Burn fat, increase cardio" },
                    { value: "muscle_gain", label: "Muscle Gain", desc: "Build strength and mass" },
                    { value: "general_fitness", label: "General Fitness", desc: "Stay healthy and active" },
                    { value: "flexibility", label: "Flexibility", desc: "Improve mobility and stretch" },
                  ].map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
                      className={`w-full text-left p-4 rounded-btn border transition ${
                        form.goal === g.value
                          ? "border-accent bg-accent/10"
                          : "border-bordr hover:border-accent/50"
                      }`}
                    >
                      <p className="font-semibold">{g.label}</p>
                      <p className="text-text-secondary text-sm">{g.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Review your profile</h2>
                  <div className="space-y-3">
                    {[
                      ["Name", form.full_name],
                      ["Age", `${form.age} years`],
                      ["Gender", form.gender],
                      ["Weight", `${form.weight_kg} kg`],
                      ["Height", `${form.height_cm} cm`],
                      ["BMI", `${bmi} — ${bmiInfo.label}`],
                      ["Goal", form.goal.replace("_", " ")],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-text-secondary">{k}</span>
                        <span className="font-medium capitalize">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-accent/10 border border-accent/30 rounded-btn p-3 mt-4">
                    <p className="text-accent text-sm font-medium">
                      A personalized 7-day routine will be generated for you based on your profile.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)} className="flex-1">
                <ChevronLeft size={16} /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="flex-1">
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? "Setting up..." : "Start Training 🚀"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
