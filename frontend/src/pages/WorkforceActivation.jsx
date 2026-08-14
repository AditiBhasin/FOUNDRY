import { motion } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';

export default function WorkforceActivation() {
  const {
    idea,
    workflowStatus,
    currentAgent,
    progressPercent,
    completedAgents,
    activeTelemetry,
    setCurrentScreen,
  } = useStartup();

  const agentOrder = [
    { key: 'research', angle: -90 },
    { key: 'product', angle: -30 },
    { key: 'cto', angle: 30 },
    { key: 'finance', angle: 90 },
    { key: 'growth', angle: 150 },
    { key: 'qa', angle: 210 },
  ];

  const currentCfg = currentAgent ? AGENT_CONFIGS[currentAgent] : AGENT_CONFIGS.research;

  return (
    <div className="activation-screen">
      {/* Top Tag */}
      <motion.div
        className="activation-header-badge"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span>●</span>
        <span>AUTONOMOUS WORKFORCE ACTIVATION</span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        className="activation-headline"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Building your startup venture.
      </motion.h2>

      {/* Idea Preview Banner */}
      <motion.div
        className="activation-idea-preview"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span>VENTURE THESIS:</span>
        <div>"{idea || 'Autonomous AI Startup Engine'}"</div>
      </motion.div>

      {/* Orbit System with Core and 6 Agent Nodes */}
      <div className="activation-orbit-system">
        {/* Orbital Rings */}
        <div className="orbit-circle-outer" />
        <div className="orbit-circle-inner" />

        {/* Central Core */}
        <motion.div
          className="central-foundry-core"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 25px rgba(0, 240, 255, 0.3)',
              '0 0 60px rgba(0, 240, 255, 0.6)',
              '0 0 25px rgba(0, 240, 255, 0.3)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          onClick={() => setCurrentScreen('workspace')}
        >
          <span className="core-symbol">F</span>
          <span className="core-label">FOUNDry OS</span>
        </motion.div>

        {/* 6 Orbiting Agents */}
        {agentOrder.map((item, idx) => {
          const cfg = AGENT_CONFIGS[item.key];
          const rad = (item.angle * Math.PI) / 180;
          const radius = 220; // px
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          const isRunning = currentAgent === item.key;
          const isDone = completedAgents.includes(item.key);

          return (
            <motion.div
              key={item.key}
              className={`orbit-agent-node ${isRunning ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              style={{
                top: `calc(50% + ${y}px)`,
                left: `calc(50% + ${x}px)`,
                '--node-color': cfg.color,
                '--node-glow': cfg.accentGlow,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.08 }}
            >
              <div className="node-icon-row">{cfg.icon}</div>
              <div className="node-title-row">{cfg.shortName}</div>
              <span className="node-status-pill">
                {!cfg.isImplemented ? '⚙ PLANNED' : isDone ? '✓ DONE' : isRunning ? '● WORKING' : '○ QUEUED'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Stream Telemetry */}
      <div className="activation-stream-bar">
        <div className="stream-top-row">
          <div className="stream-agent-info">
            <span style={{ color: currentCfg?.color }}>{currentCfg?.icon}</span>
            <span>
              {currentCfg?.name}: {activeTelemetry}
            </span>
          </div>
          <div className="stream-percentage">{progressPercent}%</div>
        </div>

        <div className="stream-progress-track">
          <div className="stream-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          className="btn-secondary-glass"
          onClick={() => setCurrentScreen('workspace')}
          style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
        >
          <span>Open Live Workspace ➔</span>
        </button>

        {progressPercent === 100 && (
          <button
            className="btn-primary-glow"
            onClick={() => setCurrentScreen('blueprint')}
            style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
          >
            <span>View Master Blueprint ➔</span>
          </button>
        )}
      </div>
    </div>
  );
}
