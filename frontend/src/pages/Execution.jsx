import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStartup } from '../state/startupState';
import ExecutionGraph from '../components/ExecutionGraph';

export default function Execution() {
  const { setCurrentScreen, startupData } = useStartup();
  const [terminalLines, setTerminalLines] = useState([]);
  const [isScaffolding, setIsScaffolding] = useState(false);

  const mockTerminalLog = [
    'FOUNDry CLI v0.1.0 — Initializing automated venture builder...',
    '✔ Loaded validated Startup Blueprint (Readiness: 92/100)',
    '✔ Generating React 19 / Three.js 3D intelligence core structure...',
    '✔ Scaffolding FastAPI async multi-agent service layer (/routes, /services)...',
    '✔ Compiling Pydantic V2 models for Research, Product, CTO, Finance, QA...',
    '✔ Injecting sequential agent orchestration pipeline with single-revision guardrails...',
    '✔ Running automated sanity check on API contracts...',
    '✔ Build verification passed with 0 errors.',
    '🚀 Scaffolding complete. Target venture is ready for local execution and deployment.',
  ];

  const handleRunScaffold = () => {
    setIsScaffolding(true);
    setTerminalLines([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < mockTerminalLog.length) {
        setTerminalLines((prev) => [...prev, mockTerminalLog[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsScaffolding(false);
      }
    }, 450);
  };

  useEffect(() => {
    handleRunScaffold();
  }, []);

  return (
    <div className="execution-screen">
      {/* Banner */}
      <motion.div
        className="execution-banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="hero-badge" style={{ marginBottom: '1rem' }}>
          <span>⚡</span>
          <span>STAGE 08 — EXECUTION & BUILD ENGINE</span>
        </div>
        <h1 className="execution-title">
          Analysis is only the beginning.
          <span className="hero-headline-gradient"> Now build.</span>
        </h1>
        <p className="execution-subtitle">
          FOUNDry bridges abstract startup intelligence into concrete system code, schemas, and live execution graphs.
        </p>
      </motion.div>

      {/* Terminal Scaffolder Simulation Window */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot dot-red" />
          <div className="terminal-dot dot-yellow" />
          <div className="terminal-dot dot-green" />
          <span className="terminal-title-text">bash — foundry-build-engine — 80x24</span>
        </div>

        <div className="terminal-body">
          {terminalLines.map((line, idx) => (
            <div key={idx} style={{ marginBottom: '0.35rem' }}>
              <span style={{ color: '#10B981', marginRight: '0.5rem' }}>$</span>
              <span>{line}</span>
            </div>
          ))}
          {isScaffolding && <span className="terminal-cursor" />}
        </div>
      </div>

      {/* Interactive Execution Graph */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>
              End-to-End Build & Execution Architecture
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Select a stage below to inspect verified artifacts vs next-generation extensions.
            </p>
          </div>

          <button
            className="btn-secondary-glass"
            onClick={handleRunScaffold}
            disabled={isScaffolding}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            {isScaffolding ? 'Scaffolding...' : '↻ Re-run Scaffolder'}
          </button>
        </div>

        <ExecutionGraph />
      </div>

      {/* Bottom Action */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
        <button
          className="btn-primary-glow"
          onClick={() => setCurrentScreen('os')}
          style={{ padding: '1.1rem 2.75rem', fontSize: '1.15rem' }}
        >
          <span>Activate Future Autonomous Operating System ➔</span>
        </button>
      </div>
    </div>
  );
}
