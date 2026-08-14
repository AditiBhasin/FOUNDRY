import { motion } from 'motion/react';

export default function BackgroundEffects() {
  return (
    <div className="bg-ambient-layer">
      {/* Dynamic Animated Ambient Orbs */}
      <motion.div
        className="ambient-orb orb-1"
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="ambient-orb orb-2"
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="ambient-orb orb-3"
        animate={{
          x: [0, 30, -50, 0],
          y: [0, 50, -30, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Grid Pattern */}
      <div className="bg-matrix-grid" />
    </div>
  );
}
