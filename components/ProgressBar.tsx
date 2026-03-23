"use client";

import { motion } from "framer-motion";

type Props = {
  value: number;
  max: number;
  label?: string;
};

export function ProgressBar({ value, max, label }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full space-y-1">
      {label && (
        <p className="text-sm font-medium text-kid-ink/80">{label}</p>
      )}
      <div className="h-4 w-full overflow-hidden rounded-full bg-kid-surface/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-kid-mint to-kid-teal"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
