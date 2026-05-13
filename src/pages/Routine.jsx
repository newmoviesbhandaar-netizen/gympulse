import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, CheckCircle, Circle, ChevronDown, ChevronUp, Lock, Trophy, Clock, RotateCcw } from "lucide-react";
import { useRoutine, useTodayLog, useSubmitWorkout, useTodayCheckin } from "../hooks/useGymData";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const categoryColors = {
  strength: "#3B82F6",
  cardio: "#F97316",
  core: "#A855F7",
  flexibility: "#22C55E",
  mobility: "#14B8A6",
};

export default function Routine() {
  const { data: routineRows, isLoading } = useRoutine();
  const { data: todayLog } = useTodayLog();
  const { data: checkin } = useTodayCheckin();
  const { mutateAsync: submitWorkout, isPending } = useSubmitWorkout();
  const [activeDay, setActiveDay] = useState(TODAY_IDX);
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState(null);

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-card" />)}
      </div>
    );

  if (!routineRows?.length)
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Dumbbell size={48} className="text-text-secondary mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No routine yet</h2>
        <p className="text-text-secondary">Complete your profile to get a personalized routine.</p>
      </div>
    );

  // Group by day_number
  const days = Array.from({ length: 7 }, (_, i) => {
    const dayRows = routineRows.filter((r) => r.day_number === i + 1);
    return {
      dayNumber: i + 1,
      label: DAY_LABELS[i],
      isRestDay: dayRows[0]?.is_rest_day || false,
      exercises: dayRows.sort((a, b) => a.exercise_order - b.exercise_order),
    };
  });

  const day = days[activeDay];
  const isToday = activeDay === TODAY_IDX;
  const alreadyLogged = isToday && !!todayLog;

  const toggle = (id) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const checkedCount = day.exercises.filter((e) => checked[e.id]).length;

  const handleSubmit = async () => {
    if (!checkin) {
      toast.error("Please check in at the gym first");
      return;
    }
    try {
      const result = await submitWorkout({
        exercises_completed: checkedCount,
        checkin_id: checkin.id,
      });
      toast.success(`Workout logged! +${result?.points_awarded || 0} pts 🎉`);
      setChecked({});
    } catch (err) {
      toast.error(err.message || "Failed to log workout");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weekly Routine</h1>
        <p className="text-text-secondary mt-1">Your personalized training plan</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {days.map((d, i) => (
          <button
            key={d.dayNumber}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 flex flex-col items-center gap-1 w-12 py-2.5 rounded-btn border transition ${
              i === activeDay
                ? "border-accent bg-accent/10 text-accent"
                : i === TODAY_IDX
                ? "border-bordr text-text-primary bg-bg-tertiary/30"
                : "border-bordr text-text-secondary hover:border-accent/50"
            }`}
          >
            <span className="text-xs font-medium">{d.label}</span>
            {i === TODAY_IDX && (
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Day content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {day.isRestDay ? (
            <Card className="text-center py-10">
              <span className="text-5xl mb-4 block">🧘</span>
              <h3 className="font-bold text-lg">Rest Day</h3>
              <p className="text-text-secondary mt-2">Recovery is part of training. Light stretching recommended.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">{day.label} — {day.exercises.length} exercises</h2>
                  {alreadyLogged && (
                    <p className="text-success text-sm flex items-center gap-1 mt-1">
                      <CheckCircle size={14} /> Logged — {todayLog.exercises_completed} exercises
                    </p>
                  )}
                </div>
                {isToday && !alreadyLogged && checkedCount > 0 && (
                  <Button onClick={handleSubmit} disabled={isPending} className="text-sm py-2 px-4">
                    {isPending ? "Saving..." : `Log ${checkedCount}/${day.exercises.length}`}
                  </Button>
                )}
              </div>

              {/* Exercises */}
              {day.exercises.map((ex, idx) => {
                const isChecked = checked[ex.id];
                const isExpanded = expanded === ex.id;
                return (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <div
                      className={`bg-bg-secondary border rounded-card p-4 transition ${
                        isChecked ? "border-success/40 bg-success/5" : "border-bordr"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isToday && !alreadyLogged ? (
                          <button
                            onClick={() => toggle(ex.id)}
                            className="flex-shrink-0 transition"
                          >
                            {isChecked ? (
                              <CheckCircle size={22} className="text-success" />
                            ) : (
                              <Circle size={22} className="text-text-secondary hover:text-accent" />
                            )}
                          </button>
                        ) : (
                          <div className="flex-shrink-0">
                            <Lock size={18} className="text-text-secondary" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-medium ${isChecked ? "line-through text-text-secondary" : ""}`}>
                              {ex.name}
                            </p>
                            <Badge
                              color={categoryColors[ex.category] || "#94A3B8"}
                            >
                              {ex.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-text-secondary text-sm">
                            <span>{ex.sets} sets × {ex.reps_or_duration}</span>
                            {ex.rest_seconds > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {ex.rest_seconds}s rest
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setExpanded(isExpanded ? null : ex.id)}
                          className="text-text-secondary hover:text-text-primary transition"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 mt-3 border-t border-bordr text-sm text-text-secondary space-y-1">
                              <p>Muscle group: <span className="text-text-primary capitalize">{ex.muscle_group}</span></p>
                              <p>Rest between sets: <span className="text-text-primary">{ex.rest_seconds}s</span></p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}

              {/* Already logged banner */}
              {alreadyLogged && (
                <div className="bg-success/10 border border-success/30 rounded-card p-4 flex items-center gap-3">
                  <Trophy size={20} className="text-success" />
                  <div>
                    <p className="font-semibold text-success">Workout Complete!</p>
                    <p className="text-text-secondary text-sm">
                      You earned {todayLog.points_awarded || 0} points today
                    </p>
                  </div>
                </div>
              )}

              {/* Check-in prompt */}
              {isToday && !checkin && !alreadyLogged && (
                <div className="bg-warning/10 border border-warning/30 rounded-card p-4 flex items-center gap-3">
                  <RotateCcw size={20} className="text-warning" />
                  <p className="text-warning text-sm">
                    Check in at the gym first before logging your workout
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
