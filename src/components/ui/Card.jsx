import { motion } from "framer-motion";
export default function Card({ children, className = "", hover = false, ...p }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, borderColor: "#475569" } : undefined}
      transition={{ duration: 0.15 }}
      className={`bg-bg-secondary border border-bordr rounded-card p-6 ${className}`}
      {...p}
    >
      {children}
    </motion.div>
  );
}
