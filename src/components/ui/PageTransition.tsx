"use client";

import { motion } from "motion/react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 28,
        mass: 0.6,
      }}
    >
      {children}
    </motion.div>
  );
}