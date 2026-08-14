import { useState } from 'react';
import { motion } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';
import EvidenceBadge from '../components/EvidenceBadge';

export default function AgentDetail() {
  const { startupData, selectedAgent, setSelectedAgent, setCurrentScreen } = useStartup();
  const [activeTab, setActiveTab] = useState('deliverables');

  const currentKey = selectedAgent || 'research';
  const cfg = AGENT_CONFIGS[currentKey] || AGENT_CONFIGS.research;

  // Extract relevant agent data slice truthfully
  const getAgentSlice = () => {
    if (!startupData) return {};
    if (currentKey === 'research') return startupData.research || {};
    if (currentKey === 'product') return startupData.product || {};
    if (currentKey === 'cto') return startupData.technical_plan || {};
    if (currentKey === 'finance') return startupData.finance || {};
    if (currentKey === 'growth') {
      // Growth is architecturally defined but not yet implemented in backend
      return null;
    }
    if (currentKey === 'qa') return startupData.qa || {};
    return {};
  };

  const slice = getAgentSlice();

  return (
    <div className="agent-detail-screen">
      {/* Agent Selector Bar */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {Object.values(AGENT_CONFIGS).map((agent) => (
          <button
            key={agent.key}
            onClick={() => setSelectedAgent(agent.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: `1px solid ${currentKey === agent.key ? agent.color : 'var(--border-subtle)'}`,
              background: currentKey === agent.key ? `${agent.color}22` : 'rgba(14, 21, 38, 0.6)',
              color: currentKey === agent.key ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'var(--transition-fast)',
            }}
          >
            <span>{agent.icon}</span>
            <span>{agent.shortName}</span>
            {!agent.isImplemented && (
              <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                PLANNED
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Header Card */}
      <motion.div
        className="detail-header-card"
        style={{ '--agent-theme-color': cfg.color }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        key={currentKey}
      >
        <div className="detail-top-bar">
          <div className="detail-agent-title">
            <span>{cfg.icon}</span>
            <span>{cfg.name}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary-glass" onClick={() => setCurrentScreen('workspace')}>
              ← Back to Workspace
            </button>
            <button className="btn-primary-glow" onClick={() => setCurrentScreen('research_report')}>
              Evidence Dossier →
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '850px' }}>
          {cfg.description}
        </p>
      </motion.div>

      {/* GROWTH AGENT EXPLICIT NOT IMPLEMENTED BANNER */}
      {currentKey === 'growth' ? (
        <div
          className="detail-section-card"
          style={{
            borderLeft: '4px solid #F59E0B',
            background: 'rgba(245, 158, 11, 0.06)',
            padding: '2.5rem',
            textAlign: 'center',
            marginTop: '1.5rem',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ color: '#F59E0B', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            GROWTH AGENT — NOT YET IMPLEMENTED IN BACKEND
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 1.5rem auto', lineHeight: '1.6', fontSize: '0.92rem' }}>
            FOUNDry adheres strictly to the Truthful Evidence System. The Growth Agent is part of our planned 6-agent architecture, but its backend reasoning service is currently undergoing release staging. We never fabricate placeholder growth metrics or false acquisition channels.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn-secondary-glass" onClick={() => setSelectedAgent('finance')}>
              Inspect Finance Agent ➔
            </button>
            <button className="btn-primary-glow" onClick={() => setSelectedAgent('product')}>
              Inspect Product Agent ➔
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Sub Navigation Tabs */}
          <div className="detail-tabs-row" style={{ '--agent-theme-color': cfg.color }}>
            <button
              className={`detail-tab-btn ${activeTab === 'deliverables' ? 'active' : ''}`}
              onClick={() => setActiveTab('deliverables')}
            >
              Structured Deliverables
            </button>
            <button
              className={`detail-tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
              onClick={() => setActiveTab('risks')}
            >
              Risks & Validation
            </button>
            <button
              className={`detail-tab-btn ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              Raw JSON Contract
            </button>
          </div>

          {/* TAB CONTENT: DELIVERABLES */}
          {activeTab === 'deliverables' && (
            <div className="detail-content-grid">
              {slice && Object.entries(slice)
                .filter(([k]) => !k.toLowerCase().includes('risk') && !k.toLowerCase().includes('problem') && k !== 'web_research_available' && k !== 'evidence_notes')
                .map(([key, val]) => (
                  <div key={key} className="detail-section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div className="detail-section-title">
                        <span style={{ color: cfg.color }}>●</span>
                        <span style={{ textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</span>
                      </div>
                      <EvidenceBadge type={currentKey === 'qa' ? 'RECOMMENDATION' : 'AI_INFERENCE'} />
                    </div>

                    {Array.isArray(val) ? (
                      <ul className="detail-list" style={{ '--agent-theme-color': cfg.color }}>
                        {val.map((item, i) => (
                          <li key={i} className="detail-list-item">
                            <span className="detail-list-bullet">›</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{String(val)}</p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* TAB CONTENT: RISKS */}
          {activeTab === 'risks' && (
            <div className="detail-content-grid">
              <div className="detail-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div className="detail-section-title">
                    <span style={{ color: '#F43F5E' }}>⚠️</span>
                    <span>IDENTIFIED RISKS & UNCERTAINTIES</span>
                  </div>
                  <EvidenceBadge type="ASSUMPTION" />
                </div>
                <ul className="detail-list" style={{ '--agent-theme-color': '#F43F5E' }}>
                  {(slice?.research_risks || slice?.technical_risks || slice?.business_risks || slice?.problems || [
                    'Customer willingness to pay requires discovery validation.',
                    'Unit economics sensitivity to CAC fluctuations.',
                  ]).map((risk, i) => (
                    <li key={i} className="detail-list-item">
                      <span className="detail-list-bullet" style={{ color: '#F43F5E' }}>•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="detail-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div className="detail-section-title">
                    <span style={{ color: '#10B981' }}>🛡️</span>
                    <span>VALIDATION CHECKS & REQUIRED ACTIONS</span>
                  </div>
                  <EvidenceBadge type="RECOMMENDATION" />
                </div>
                <ul className="detail-list" style={{ '--agent-theme-color': '#10B981' }}>
                  {(slice?.validation_questions || slice?.required_changes || slice?.financial_assumptions || [
                    'Conduct customer discovery interviews with 15 target users.',
                    'Validate API token compute latencies under peak load.',
                  ]).map((item, i) => (
                    <li key={i} className="detail-list-item">
                      <span className="detail-list-bullet" style={{ color: '#10B981' }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB CONTENT: JSON */}
          {activeTab === 'json' && (
            <div
              style={{
                background: '#070a14',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                padding: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: cfg.color,
                overflowX: 'auto',
                maxHeight: '500px',
              }}
            >
              <pre>{JSON.stringify(slice, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
