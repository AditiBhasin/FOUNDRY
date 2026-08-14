import { motion } from 'motion/react';

export default function ScoreVisual({ score = 92, label = 'BUILD READINESS', size = 160 }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine score hue
  const scoreColor =
    score >= 85 ? '#10B981' : score >= 70 ? '#00F0FF' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="readiness-gauge-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 160 160">
        {/* Background Track Circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="10"
        />

        {/* Dynamic Glowing Progress Circle */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{
            filter: `drop-shadow(0 0 8px ${scoreColor})`,
          }}
        />
      </svg>

      {/* Center Score Text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span className="gauge-score-number" style={{ color: '#fff' }}>
          {score}%
        </span>
        <span className="gauge-score-label" style={{ color: scoreColor }}>
          {label}
        </span>
      </div>
    </div>
  );
}
