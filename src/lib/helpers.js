export const calcBMI = (kg, cm) => (!kg || !cm ? 0 : +(kg / Math.pow(cm / 100, 2)).toFixed(1));

export const bmiCategory = (bmi) => {
  if (!bmi) return { label: "—", color: "#94A3B8" };
  if (bmi < 18.5) return { label: "Underweight", color: "#3B82F6" };
  if (bmi < 25) return { label: "Normal", color: "#22C55E" };
  if (bmi < 30) return { label: "Overweight", color: "#EAB308" };
  return { label: "Obese", color: "#EF4444" };
};

export const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");

export const colorFromName = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const palette = ["#F97316", "#22C55E", "#3B82F6", "#A855F7", "#EC4899", "#14B8A6", "#F59E0B"];
  return palette[Math.abs(hash) % palette.length];
};

export const shortName = (full = "") => {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
