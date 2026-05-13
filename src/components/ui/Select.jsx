export default function Select({ label, error, children, className = "", ...p }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-text-secondary mb-2">{label}</label>}
      <select
        className={`w-full bg-bg-primary border border-bordr rounded-btn px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition appearance-none ${className}`}
        {...p}
      >
        {children}
      </select>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
