export default function Input({ label, error, className = "", ...p }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-text-secondary mb-2">{label}</label>}
      <input
        className={`w-full bg-bg-primary border border-bordr rounded-btn px-4 py-3 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition ${className}`}
        {...p}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
