export default function Button({ children, variant = "primary", className = "", ...p }) {
  const v = {
    primary: "bg-accent hover:bg-accent-hover text-white",
    secondary: "bg-transparent border border-bordr text-text-primary hover:border-accent",
    danger: "bg-danger hover:bg-red-600 text-white",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-btn px-6 py-3 font-medium min-h-[44px] transition disabled:opacity-50 disabled:cursor-not-allowed ${v[variant]} ${className}`}
      {...p}
    >
      {children}
    </button>
  );
}
