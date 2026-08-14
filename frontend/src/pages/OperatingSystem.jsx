import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';

export default function OperatingSystem() {
  const { setCurrentScreen, resetApp } = useStartup();
  const [activeScenario, setActiveScenario] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);

  const scenarios = [
    {
      id: 'competitor',
      title: '🚨 New Competitor Signal: Freemium Pricing Launch',
      description: 'Major competitor announced an aggressive free tier targeting early-stage indie hackers.',
      cascade: [
        { agent: 'research', action: 'Scraped competitor pricing matrix & identified feature limitations in their free tier.' },
        { agent: 'product', action: 'Drafted rapid counter-feature: Automated one-click GitHub repo generation.' },
        { agent: 'growth', action: 'Launched targeted comparison landing page highlighting FOUNDry continuous OS advantage.' },
        { agent: 'finance', action: 'Calculated zero margin loss by retaining annual pre-paid founder tiers.' },
        { agent: 'qa', action: 'Audited retention impact: 98% founder retention maintained.' },
        { agent: 'core', action: 'RECOMMENDATION: Maintain premium positioning and ship GitHub export.' },
      ],
    },
    {
      id: 'churn_signal',
      title: '📉 User Telemetry Alert: Enterprise Onboarding Drop-off',
      description: 'Analytics detected 18% friction during SSO / SAML authentication setup.',
      cascade: [
        { agent: 'research', action: 'Audited enterprise compliance expectations for SOC2 & SAML.' },
        { agent: 'product', action: 'Simplified OAuth2 flow into a 2-step setup wizard.' },
        { agent: 'cto', action: 'Deployed pre-configured Okta / Azure AD connector schema.' },
        { agent: 'finance', action: 'Unblocked $48k in stalled enterprise pipeline deals.' },
        { agent: 'qa', action: 'Validated zero authentication regression in sandbox.' },
        { agent: 'core', action: 'RECOMMENDATION: Merge SAML hotfix immediately into main branch.' },
      ],
    },
    {
      id: 'ai_cost',
      title: '⚡ Compute Optimization: High LLM Inference Burst',
      description: 'Viral product launch caused 300% spike in concurrent agent reasoning cycles.',
      cascade: [
        { agent: 'cto', action: 'Implemented multi-tiered semantic cache with Redis & Vector embeddings.' },
        { agent: 'research', action: 'Identified redundant prompt queries across similar startup ideas.' },
        { agent: 'finance', action: 'Reduced monthly GPU cloud expenditure by 62%.' },
        { agent: 'product', action: 'Preserved sub-second response times for all active workspaces.' },
        { agent: 'qa', action: 'Verified 100% data fidelity with cached schema templates.' },
        { agent: 'core', action: 'RECOMMENDATION: Activate persistent edge caching globally.' },
      ],
    },
  ];

  const handleTriggerScenario = (sc) => {
    setActiveScenario(sc);
    setSimulationStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < sc.cascade.length) {
        setSimulationStep(step);
      } else {
        clearInterval(interval);
      }
    }, 900);
  };

  return (
    <div className="os-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '2.5rem' }}
      >
        <div className="hero-badge" style={{ marginBottom: '1rem' }}>
          <span>⚡</span>
          <span>STAGE 09 — DAY-2 AUTONOMOUS STARTUP COMMAND CENTER</span>
        </div>
        <h1 className="execution-title">Continuous Startup Operating System</h1>
        <p className="execution-subtitle">
          FOUNDry does not shut down after launch. It continues monitoring signals, stress-testing competitors,
          and autonomously optimizing your venture.
        </p>
      </motion.div>

      {/* Live Signals & Telemetry Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="score-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span className="score-card-label">MARKET SIGNALS</span>
            <span className="signal-status-dot" />
          </div>
          <div className="score-card-value" style={{ color: '#00F0FF', fontSize: '1.4rem' }}>48 / HR</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scanning 140+ Feeds</div>
        </div>

        <div className="score-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span className="score-card-label">USER FEEDBACK</span>
            <span className="signal-status-dot" />
          </div>
          <div className="score-card-value" style={{ color: '#8B5CF6', fontSize: '1.4rem' }}>96.4%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Positive Sentiment</div>
        </div>

        <div className="score-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span className="score-card-label">MONTHLY REVENUE</span>
            <span className="signal-status-dot" />
          </div>
          <div className="score-card-value" style={{ color: '#10B981', fontSize: '1.4rem' }}>$18,450</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+28% MoM Velocity</div>
        </div>

        <div className="score-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span className="score-card-label">SYSTEM HEALTH</span>
            <span className="signal-status-dot" />
          </div>
          <div className="score-card-value" style={{ color: '#38BDF8', fontSize: '1.4rem' }}>99.98%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Zero Critical Failures</div>
        </div>
      </div>

      {/* Main Interactive Signal Cascade Grid */}
      <div className="os-dashboard-grid">
        {/* Left: Simulation Cascade */}
        <div className="os-signal-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
              Autonomous Multi-Agent Reaction Stream
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--neon-cyan)' }}>
              LIVE ADAPTIVE INTELLIGENCE
            </span>
          </div>

          {!activeScenario ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1rem',
                color: 'var(--text-muted)',
                background: 'rgba(5, 8, 16, 0.4)',
                borderRadius: '12px',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📡</div>
              <div style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>
                Continuous OS Monitoring Active
              </div>
              <p style={{ maxWidth: '420px', margin: '0 auto', fontSize: '0.85rem' }}>
                Select a simulated real-world market event on the right to observe the autonomous multi-agent reaction cascade.
              </p>
            </div>
          ) : (
            <div>
              <div
                style={{
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: '#fff', fontSize: '1rem' }}>
                  {activeScenario.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {activeScenario.description}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeScenario.cascade.slice(0, simulationStep + 1).map((step, idx) => {
                  const cfg = AGENT_CONFIGS[step.agent] || {
                    color: '#00F0FF',
                    icon: '⚡',
                    shortName: 'FOUNDry CORE',
                  };

                  return (
                    <motion.div
                      key={idx}
                      className="os-signal-item"
                      style={{ borderLeft: `3px solid ${cfg.color}` }}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '0.85rem', color: cfg.color }}>
                            {cfg.shortName}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.15rem' }}>
                            {step.action}
                          </div>
                        </div>
                      </div>

                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#10B981' }}>
                        ✓ EXECUTED
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Simulation Event Triggers */}
        <div className="os-signal-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.85rem', textTransform: 'uppercase' }}>
            Simulate Real-World Scenarios:
          </div>

          <div className="scenario-grid">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                className="scenario-btn"
                onClick={() => handleTriggerScenario(sc)}
              >
                <div style={{ fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>
                  {sc.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {sc.description}
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn-primary-glow"
              onClick={resetApp}
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', justifyContent: 'center' }}
            >
              <span>Build Another Venture ➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
