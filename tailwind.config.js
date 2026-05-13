/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: { primary: "#0F172A", secondary: "#1E293B", tertiary: "#334155" },
        accent: { DEFAULT: "#F97316", hover: "#EA6C0A" },
        success: "#22C55E", warning: "#EAB308", danger: "#EF4444",
        text: { primary: "#F8FAFC", secondary: "#94A3B8" },
        bordr: "#334155",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "monospace"] },
      borderRadius: { card: "16px", btn: "10px" },
      keyframes: {
        pulseGlow: { "0%,100%": { boxShadow: "0 0 0 0 rgba(249,115,22,0.7)" }, "50%": { boxShadow: "0 0 0 12px rgba(249,115,22,0)" } },
        countUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      animation: { "pulse-glow": "pulseGlow 2s infinite", "count-up": "countUp 0.4s ease-out" },
    },
  },
  plugins: [],
};
