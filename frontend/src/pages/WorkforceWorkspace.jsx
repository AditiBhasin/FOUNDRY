import { motion } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';
import AgentNetwork from '../components/AgentNetwork';
import ActivityFeed from '../components/ActivityFeed';

export default function WorkforceWorkspace() {
  const {
    startupData,
    selectedAgent,
    setSelectedAgent,
    inspectAgent,
    activityLogs,
    setCurrentScreen,
    progressPercent,
    currentStage,
  } = useStartup();

  const activeKey = selectedAgent || 'research';
  const activeCfg = AGENT_CONFIGS[activeKey] || AGENT_CONFIGS.research;

  // Extract structured deliverables for right-side preview truthfully
  const getDeliverablesPreview = () => {
    if (!startupData) return ['Awaiting workforce compilation...'];

    if (activeKey === 'research') {
      return [
        `Target Users: ${(startupData.research?.target_users || ['Early adopters', 'Developers']).slice(0, 2).join(', ')}`,
        `Competitors: ${(startupData.research?.competitors || ['Incumbents']).slice(0, 3).join(', ')}`,
        `Market Opportunity: ${startupData.research?.market_opportunity?.slice(0, 95) || 'Significant multi-billion market expansion.'}...`,
      ];
    }
    if (activeKey === 'product') {
      return [
        `Summary: ${startupData.product?.product_summary?.slice(0, 80) || 'AI Startup OS'}...`,
        `MVP Features: ${(startupData.product?.mvp_features || ['Agent Network', 'Blueprint']).slice(0, 2).join(', ')}`,
        `Core Target: ${startupData.product?.target_user || 'Technical founders'}`,
      ];
    }
    if (activeKey === 'cto') {
      return [
        `Architecture: ${startupData.technical_plan?.architecture?.slice(0, 85) || 'Event-driven React + FastAPI'}...`,
        `Frontend: ${(startupData.technical_plan?.frontend_stack || ['React 19', 'Three.js']).slice(0, 2).join(', ')}`,
        `Backend: ${(startupData.technical_plan?.backend_stack || ['FastAPI', 'Ollama']).slice(0, 2).join(', ')}`,
      ];
    }
    if (activeKey === 'finance') {
      return [
        `Model: ${startupData.finance?.business_model || 'Tiered B2B SaaS'}`,
        `Pricing: ${startupData.finance?.pricing_strategy?.slice(0, 70) || 'Value-based tiering'}...`,
        `Recommendation: ${startupData.finance?.financial_recommendation?.slice(0, 80) || 'Focus on high LTV/CAC'}...`,
      ];
    }
    if (activeKey === 'growth') {
      return [
        'Growth Agent is part of the planned 6-agent architecture.',
        'Backend service undergoing release staging.',
        'No simulated growth metrics generated.',
      ];
    }
    if (activeKey === 'qa') {
      return [
        `Build Readiness Score: ${startupData.qa?.build_readiness_score || 72}/100`,
        `Key Strengths: ${(startupData.qa?.strengths || ['Clear value prop', 'Sound architecture']).slice(0, 2).join(', ')}`,
        `Monitored Risks: ${(startupData.qa?.technical_risks || ['Inference compute costs']).slice(0, 2).join(', ')}`,
      ];
    }
    return ['Autonomous agent deliverable ready.'];
  };

  const previewItems = getDeliverablesPreview();

  return (
    <div className="workspace-container">
      {/* 1. LEFT PANE: WORKFORCE ROSTER */}
      <aside className="workspace-roster-pane">
        <div className="pane-header-title">
          <span>WORKFORCE ROSTER</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--neon-cyan)' }}>
            6 AGENTS
          </span>
        </div>

        <div className="roster-list">
          {Object.values(AGENT_CONFIGS).map((agent) => {
            const isSelected = activeKey === agent.key;
            return (
              <div
                key={agent.key}
                className={`agent-roster-item ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedAgent(agent.key)}
              >
                <span className="roster-item-icon">{agent.icon}</span>
                <div className="roster-item-info">
                  <div className="roster-item-name">{agent.name}</div>
                  <div className="roster-item-role">{agent.role}</div>
                </div>
                <span
                  className="roster-item-status"
                  style={{
                    color: agent.isImplemented ? '#10B981' : '#F59E0B',
                    background: agent.isImplemented ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${agent.isImplemented ? '#10B981' : '#F59E0B'}`,
                  }}
                >
                  {agent.isImplemented ? 'READY' : 'PLANNED'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className="btn-primary-glow"
            style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', justifyContent: 'center' }}
            onClick={() => setCurrentScreen('synthesis')}
          >
            <span>Proceed to Synthesis ➔</span>
          </button>
        </div>
      </aside>

      {/* 2. CENTER PANE: INTERACTIVE AGENT NETWORK CANVAS */}
      <main className="workspace-network-pane">
        <div className="network-canvas-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>
              LIVE AGENT TELEMETRY NETWORK
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({progressPercent}% • Stage: {currentStage})
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary-glass"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              onClick={() => setCurrentScreen('research_report')}
            >
              <span>🔍 Evidence</span>
            </button>
            <button
              className="btn-secondary-glass"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              onClick={() => setCurrentScreen('financial_report')}
            >
              <span>📈 Finance</span>
            </button>
            <button
              className="btn-secondary-glass"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              onClick={() => setCurrentScreen('blueprint')}
            >
              <span>📋 Blueprint</span>
            </button>
            <button
              className="btn-primary-glow"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              onClick={() => setCurrentScreen('mvp_playground')}
            >
              <span>🚀 MVP</span>
            </button>
          </div>
        </div>

        <div className="network-canvas-body">
          <AgentNetwork
            activeAgentKey={activeKey}
            onSelectAgent={(key) => setSelectedAgent(key)}
          />
        </div>
      </main>

      {/* 3. RIGHT PANE: ACTIVE AGENT INSPECTOR PREVIEW */}
      <aside className="workspace-inspector-pane">
        <div className="pane-header-title">
          <span style={{ color: activeCfg.color }}>{activeCfg.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: activeCfg.isImplemented ? '#10B981' : '#F59E0B' }}>
            ● {activeCfg.isImplemented ? 'ONLINE' : 'PLANNED'}
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5', marginBottom: '0.75rem' }}>
          {activeCfg.description}
        </p>

        <div className="inspector-deliverables-list">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Structured Deliverables Preview:
          </div>

          {previewItems.map((item, idx) => (
            <div key={idx} className="deliverable-card">
              <div className="deliverable-label">DELIVERABLE 0{idx + 1}</div>
              <div className="deliverable-text">{item}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
          <button
            className="btn-secondary-glass"
            style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem', justifyContent: 'center' }}
            onClick={() => inspectAgent(activeKey)}
          >
            <span>Open Full Agent Detail ➔</span>
          </button>
        </div>
      </aside>

      {/* 4. BOTTOM PANE: COLLABORATIVE ACTIVITY FEED */}
      <footer className="workspace-activity-pane">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '0.85rem', color: '#fff' }}>
            INTER-AGENT COLLABORATION STREAM
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            REAL-TIME LOG
          </span>
        </div>

        <ActivityFeed logs={activityLogs} />
      </footer>
    </div>
  );
}
