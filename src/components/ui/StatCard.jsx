import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, sub, color = "#F97316", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-bg-secondary border border-bordr rounded-card p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary font-medium">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "22" }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-text-primary animate-count-up">{value}</p>
        {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}
