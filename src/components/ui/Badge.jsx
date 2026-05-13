export default function Badge({ children, color = "#F97316", className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: color + "22", color }}
    >
      {children}
    </span>
  );
}
