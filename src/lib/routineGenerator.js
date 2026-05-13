const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TEMPLATES = {
  underweight: [
    { name: "Push-ups", sets: 3, repsOrDuration: "10 reps", restSeconds: 60, category: "strength", muscleGroup: "chest" },
    { name: "Dumbbell Rows", sets: 3, repsOrDuration: "12 reps", restSeconds: 60, category: "strength", muscleGroup: "back" },
    { name: "Goblet Squats", sets: 3, repsOrDuration: "12 reps", restSeconds: 75, category: "strength", muscleGroup: "legs" },
    { name: "Walking Lunges", sets: 3, repsOrDuration: "10/leg", restSeconds: 60, category: "strength", muscleGroup: "legs" },
    { name: "Plank", sets: 3, repsOrDuration: "45 sec", restSeconds: 45, category: "core", muscleGroup: "core" },
    { name: "Shoulder Press", sets: 3, repsOrDuration: "10 reps", restSeconds: 60, category: "strength", muscleGroup: "shoulders" },
  ],
  normal: [
    { name: "Running", sets: 1, repsOrDuration: "20 min", restSeconds: 0, category: "cardio", muscleGroup: "cardio" },
    { name: "Pull-ups", sets: 3, repsOrDuration: "8 reps", restSeconds: 90, category: "strength", muscleGroup: "back" },
    { name: "Bench Press", sets: 4, repsOrDuration: "8 reps", restSeconds: 90, category: "strength", muscleGroup: "chest" },
    { name: "HIIT Circuit", sets: 3, repsOrDuration: "5 min", restSeconds: 60, category: "cardio", muscleGroup: "cardio" },
    { name: "Core Workout", sets: 3, repsOrDuration: "60 sec", restSeconds: 45, category: "core", muscleGroup: "core" },
    { name: "Cycling", sets: 1, repsOrDuration: "15 min", restSeconds: 0, category: "cardio", muscleGroup: "cardio" },
  ],
  overweight: [
    { name: "Brisk Walking", sets: 1, repsOrDuration: "30 min", restSeconds: 0, category: "cardio", muscleGroup: "cardio" },
    { name: "Resistance Band Rows", sets: 3, repsOrDuration: "15 reps", restSeconds: 60, category: "strength", muscleGroup: "back" },
    { name: "Bodyweight Squats", sets: 3, repsOrDuration: "15 reps", restSeconds: 60, category: "strength", muscleGroup: "legs" },
    { name: "Cycling", sets: 1, repsOrDuration: "20 min", restSeconds: 0, category: "cardio", muscleGroup: "cardio" },
    { name: "Light Dumbbell Rows", sets: 3, repsOrDuration: "12 reps", restSeconds: 60, category: "strength", muscleGroup: "back" },
  ],
  obese: [
    { name: "Walking", sets: 1, repsOrDuration: "25 min", restSeconds: 0, category: "cardio", muscleGroup: "cardio" },
    { name: "Chair Exercises", sets: 2, repsOrDuration: "10 reps", restSeconds: 60, category: "mobility", muscleGroup: "core" },
    { name: "Seated Stretches", sets: 2, repsOrDuration: "30 sec", restSeconds: 30, category: "flexibility", muscleGroup: "core" },
    { name: "Water Aerobics Style", sets: 1, repsOrDuration: "15 min", restSeconds: 0, category: "cardio", muscleGroup: "cardio" },
    { name: "Gentle Yoga", sets: 1, repsOrDuration: "15 min", restSeconds: 0, category: "flexibility", muscleGroup: "core" },
  ],
};

const WARMUP = { name: "Warm-up Stretch", sets: 1, repsOrDuration: "5 min", restSeconds: 0, category: "flexibility", muscleGroup: "core" };
const EXTRA_CARDIO = { name: "Extra Cardio", sets: 1, repsOrDuration: "10 min", restSeconds: 0, category: "cardio", muscleGroup: "cardio" };
const FULL_STRETCH = { name: "Full Body Stretch", sets: 1, repsOrDuration: "10 min", restSeconds: 0, category: "flexibility", muscleGroup: "core" };
const FEMALE_EXTRAS = [
  { name: "Hip Thrusts", sets: 3, repsOrDuration: "12 reps", restSeconds: 60, category: "strength", muscleGroup: "legs" },
  { name: "Glute Bridges", sets: 3, repsOrDuration: "15 reps", restSeconds: 45, category: "strength", muscleGroup: "legs" },
  { name: "Side Leg Raises", sets: 3, repsOrDuration: "15 reps", restSeconds: 30, category: "strength", muscleGroup: "legs" },
];
const MALE_EXTRAS = [
  { name: "Deadlifts", sets: 4, repsOrDuration: "6 reps", restSeconds: 120, category: "strength", muscleGroup: "back" },
  { name: "Overhead Press", sets: 3, repsOrDuration: "8 reps", restSeconds: 90, category: "strength", muscleGroup: "shoulders" },
  { name: "Weighted Rows", sets: 3, repsOrDuration: "10 reps", restSeconds: 75, category: "strength", muscleGroup: "back" },
];

const REST_DAY = {
  dayNumber: 7, label: "Sun", isRestDay: true,
  exercises: [
    { name: "Gentle Yoga Flow", sets: 1, repsOrDuration: "20 min", restSeconds: 0, category: "flexibility", muscleGroup: "core" },
    { name: "Deep Stretching", sets: 1, repsOrDuration: "15 min", restSeconds: 0, category: "flexibility", muscleGroup: "core" },
    { name: "Meditation", sets: 1, repsOrDuration: "10 min", restSeconds: 0, category: "flexibility", muscleGroup: "core" },
  ],
};

export function generateRoutine(age, bmi, gender, goal) {
  let key = "normal";
  if (bmi < 18.5) key = "underweight";
  else if (bmi >= 30) key = "obese";
  else if (bmi >= 25) key = "overweight";

  const base = [...TEMPLATES[key]];
  if (gender === "female") base.push(...FEMALE_EXTRAS);
  else if (gender === "male") base.push(...MALE_EXTRAS);

  const days = [];
  for (let i = 1; i <= 6; i++) {
    let dayEx = base.map((e) => ({ ...e }));
    if (age > 50) {
      dayEx = dayEx
        .filter((e) => !/jump|hiit|sprint/i.test(e.name))
        .map((e) => ({ ...e, sets: Math.max(1, e.sets - 1) }));
      dayEx.unshift({ ...WARMUP });
    }
    if (goal === "weight_loss" && [1, 3, 5].includes(i)) dayEx.push({ ...EXTRA_CARDIO });
    if (goal === "muscle_gain") dayEx = dayEx.map((e) => e.category === "strength" ? { ...e, sets: e.sets + 1 } : e);
    if (goal === "flexibility") dayEx.push({ ...FULL_STRETCH });
    days.push({ dayNumber: i, label: LABELS[i - 1], isRestDay: false, exercises: dayEx });
  }
  days.push(REST_DAY);
  return days;
}
