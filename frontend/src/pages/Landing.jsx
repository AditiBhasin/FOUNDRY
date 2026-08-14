import { motion } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';
import IntelligenceCore from '../components/IntelligenceCore';

export default function Landing() {
  const { setCurrentScreen, submitIdea } = useStartup();

  const handleQuickStart = () => {
    setCurrentScreen('intake');
  };

  const handleDemoPreset = () => {
    submitIdea('An autonomous AI platform that helps indie developers validate, architect, and launch startups in 60 seconds.');
  };

  const agentsList = Object.values(AGENT_CONFIGS);

  return (
    <div className="landing-hero">
      {/* Top Eyebrow Badge */}
      <motion.div
        className="hero-badge"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span>⚡</span>
        <span>THE AI WORKFORCE FOR YOUR STARTUP</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        className="hero-headline"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        Don't just build the startup.
        <span className="hero-headline-gradient">
          Build the intelligence that runs it.
        </span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        className="hero-subtext"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        Give FOUNDry an idea. A coordinated autonomous workforce of specialized AI agents
        researches the market, scopes the MVP, designs the technical architecture, models unit
        economics, audits risk, and scaffolds the code.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="hero-cta-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <button className="btn-primary-glow" onClick={handleQuickStart}>
          <span>Build with FOUNDry</span>
          <span>→</span>
        </button>

        <button className="btn-secondary-glass" onClick={handleDemoPreset}>
          <span>⚡ Launch Demo Venture</span>
        </button>
      </motion.div>

      {/* 3D WebGL Intelligence Core Canvas */}
      <motion.div
        className="hero-3d-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35 }}
      >
        <IntelligenceCore size={460} />
      </motion.div>

      {/* 6 Agent Roster Cards */}
      <motion.div
        className="hero-agents-roster"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {agentsList.map((agent, index) => (
          <div
            key={agent.key}
            className="roster-card"
            style={{
              '--card-color': agent.color,
              '--card-glow': agent.accentGlow,
            }}
          >
            <div className="roster-top">
              <span className="roster-icon">{agent.icon}</span>
              <span className="roster-index">0{index + 1}</span>
            </div>
            <div className="roster-name">{agent.shortName}</div>
            <div className="roster-role">{agent.role}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
