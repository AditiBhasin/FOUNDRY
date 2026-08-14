import { useState } from 'react';
import { motion } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';
import ScoreVisual from '../components/ScoreVisual';
import EvidenceBadge from '../components/EvidenceBadge';

export default function StartupBlueprint() {
  const { startupData, finalResult, idea, setCurrentScreen } = useStartup();
  const [copied, setCopied] = useState(false);
  const [openSections, setOpenSections] = useState({
    vision: true,
    market: true,
    product: true,
    tech: false,
    finance: false,
    qa: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const score = startupData?.qa?.build_readiness_score || finalResult?.build_readiness_score || 72;

  const handleCopy = () => {
    const text = `# FOUNDry MASTER STARTUP BLUEPRINT\n\nVENTURE THESIS:\n${idea}\n\nBUILD READINESS SCORE: ${score}/100\n\nEXECUTIVE SUMMARY:\n${startupData?.product?.product_summary || ''}\n\nTECHNICAL ARCHITECTURE:\n${startupData?.technical_plan?.architecture || ''}\n\nBUSINESS MODEL:\n${startupData?.finance?.business_model || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportJSON = () => {
    const payload = {
      startup_idea: idea,
      build_readiness_score: score,
      startup_data: startupData,
      financial_model: startupData?.financial_model,
      mvp_spec: startupData?.mvp_spec,
      evidence: startupData?.evidence,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foundry-blueprint-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="blueprint-screen">
      {/* Hero Header */}
      <motion.div
        className="blueprint-hero-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="blueprint-title-wrap">
          <div className="blueprint-badge">● FOUNDry MASTER STARTUP BLUEPRINT</div>
          <h1 className="blueprint-main-title">Validated Venture Intelligence</h1>
          <p className="blueprint-idea-pill">
            <strong style={{ color: 'var(--neon-cyan)' }}>THESIS:</strong> "{idea || 'Autonomous AI Startup Venture'}"
          </p>
        </div>

        {/* Circular Readiness Score Gauge */}
        <ScoreVisual score={score} label="READINESS SCORE" size={170} />
      </motion.div>

      {/* 6-Factor Assessment Tiles */}
      <div className="blueprint-scores-grid">
        <div className="score-mini-card" style={{ borderTop: '3px solid #38BDF8' }}>
          <div className="score-card-label">RESEARCH AUDIT</div>
          <div className="score-card-value" style={{ color: '#38BDF8' }}>Verified</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assumptions Isolated</div>
        </div>
        <div className="score-mini-card" style={{ borderTop: '3px solid #FB923C' }}>
          <div className="score-card-label">PRODUCT SCOPE</div>
          <div className="score-card-value" style={{ color: '#FB923C' }}>Lean MVP</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MVPSpec Generated</div>
        </div>
        <div className="score-mini-card" style={{ borderTop: '3px solid #00F0FF' }}>
          <div className="score-card-label">TECH STACK</div>
          <div className="score-card-value" style={{ color: '#00F0FF' }}>Validated</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FastAPI + React 19</div>
        </div>
        <div className="score-mini-card" style={{ borderTop: '3px solid #10B981' }}>
          <div className="score-card-label">UNIT ECONOMICS</div>
          <div className="score-card-value" style={{ color: '#10B981' }}>Calculated</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deterministic Formulas</div>
        </div>
        <div className="score-mini-card" style={{ borderTop: '3px solid #F59E0B' }}>
          <div className="score-card-label">GTM STRATEGY</div>
          <div className="score-card-value" style={{ color: '#F59E0B' }}>Planned</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Growth Extensible</div>
        </div>
        <div className="score-mini-card" style={{ borderTop: '3px solid #F43F5E' }}>
          <div className="score-card-label">QA SCORE</div>
          <div className="score-card-value" style={{ color: '#F43F5E' }}>{score}/100</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Audited by QA Agent</div>
        </div>
      </div>

      {/* Export & Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary-glass" onClick={handleCopy}>
            <span>{copied ? '✓ Copied Markdown' : '📋 Copy Markdown'}</span>
          </button>
          <button className="btn-secondary-glass" onClick={handleExportJSON}>
            <span>📥 Export Complete JSON</span>
          </button>
          <button className="btn-secondary-glass" onClick={() => setCurrentScreen('research_report')}>
            <span>🔍 Research Evidence Dossier</span>
          </button>
          <button className="btn-secondary-glass" onClick={() => setCurrentScreen('financial_report')}>
            <span>📈 Financial Model</span>
          </button>
        </div>

        <button
          className="btn-primary-glow"
          onClick={() => setCurrentScreen('mvp_playground')}
          style={{ padding: '0.85rem 2rem' }}
        >
          <span>🚀 Interact with AI MVP Prototype ➔</span>
        </button>
      </div>

      {/* Expandable Intelligence Sections */}
      <div className="blueprint-sections-list">
        {/* 1. VISION & PROBLEM */}
        <div className={`blueprint-accordion-item ${openSections.vision ? 'open' : ''}`}>
          <button className="accordion-header-btn" onClick={() => toggleSection('vision')}>
            <span>01. VISION & VALIDATED PROBLEM STATEMENT</span>
            <span>{openSections.vision ? '−' : '+'}</span>
          </button>
          {openSections.vision && (
            <div className="accordion-body-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.6', flex: 1 }}>
                  {startupData?.research?.problem_statement ||
                    'Founders spend over 70% of early-stage venture creation conducting manual market analysis, drafting technical architectures, and modeling unit economics.'}
                </p>
                <EvidenceBadge type="AI_INFERENCE" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(5, 8, 16, 0.5)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38BDF8', marginBottom: '0.5rem' }}>TARGET USERS:</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                    {(startupData?.research?.target_users || ['Solo Technical Founders', 'Early Operators']).map((u, i) => (
                      <li key={i} style={{ marginBottom: '0.3rem' }}>{u}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: 'rgba(5, 8, 16, 0.5)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#FB923C', marginBottom: '0.5rem' }}>CUSTOMER SEGMENTS:</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                    {(startupData?.research?.customer_segments || ['Early-Stage Startups', 'Venture Studios']).map((s, i) => (
                      <li key={i} style={{ marginBottom: '0.3rem' }}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. MARKET & COMPETITORS */}
        <div className={`blueprint-accordion-item ${openSections.market ? 'open' : ''}`}>
          <button className="accordion-header-btn" onClick={() => toggleSection('market')}>
            <span>02. MARKET OPPORTUNITY & COMPETITIVE LANDSCAPE</span>
            <span>{openSections.market ? '−' : '+'}</span>
          </button>
          {openSections.market && (
            <div className="accordion-body-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', flex: 1 }}>
                  {startupData?.research?.market_opportunity || 'Rapid expansion driven by specialized multi-agent AI ecosystems.'}
                </p>
                <EvidenceBadge type="AI_INFERENCE" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(5, 8, 16, 0.5)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#F43F5E', marginBottom: '0.5rem' }}>INCUMBENTS / COMPETITORS:</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                    {(startupData?.research?.competitors || ['Manual spreadsheet workflows', 'Generic LLM chatbots']).map((c, i) => (
                      <li key={i} style={{ marginBottom: '0.3rem' }}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: 'rgba(5, 8, 16, 0.5)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#10B981', marginBottom: '0.5rem' }}>KEY DIFFERENTIATION:</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                    {(startupData?.research?.differentiation || ['Continuous Autonomous OS', 'Deterministic Economics Engine']).map((d, i) => (
                      <li key={i} style={{ marginBottom: '0.3rem' }}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. PRODUCT & MVP */}
        <div className={`blueprint-accordion-item ${openSections.product ? 'open' : ''}`}>
          <button className="accordion-header-btn" onClick={() => toggleSection('product')}>
            <span>03. PRODUCT SCOPE & MVP SPECIFICATION</span>
            <span>{openSections.product ? '−' : '+'}</span>
          </button>
          {openSections.product && (
            <div className="accordion-body-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <p style={{ flex: 1, color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {startupData?.product?.product_summary || 'Lean MVP architecture scoped for high-velocity validation.'}
                </p>
                <EvidenceBadge type="RECOMMENDATION" />
              </div>

              <div style={{ background: 'rgba(5, 8, 16, 0.5)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#FB923C', marginBottom: '0.75rem' }}>CORE MVP FEATURE SCOPE:</div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                  {(startupData?.product?.mvp_features || ['Autonomous Intelligence Engine', 'Interactive Workflow Dashboard']).map((f, i) => (
                    <li key={i} style={{ marginBottom: '0.4rem' }}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 4. TECH ARCHITECTURE */}
        <div className={`blueprint-accordion-item ${openSections.tech ? 'open' : ''}`}>
          <button className="accordion-header-btn" onClick={() => toggleSection('tech')}>
            <span>04. ENGINEERING ARCHITECTURE & SYSTEM DESIGN</span>
            <span>{openSections.tech ? '−' : '+'}</span>
          </button>
          {openSections.tech && (
            <div className="accordion-body-content">
              <p style={{ marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                {startupData?.technical_plan?.technical_summary}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(5, 8, 16, 0.5)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#00F0FF', marginBottom: '0.5rem' }}>FRONTEND STACK:</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                    {(startupData?.technical_plan?.frontend_stack || ['React 19', 'Vite', 'Motion', 'Three.js']).map((st, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{st}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: 'rgba(5, 8, 16, 0.5)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#10B981', marginBottom: '0.5rem' }}>BACKEND & AI ENGINE:</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                    {(startupData?.technical_plan?.backend_stack || ['FastAPI Python Async', 'Pydantic V2', 'Ollama llama3.2:3b']).map((st, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{st}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. FINANCIAL MODEL */}
        <div className={`blueprint-accordion-item ${openSections.finance ? 'open' : ''}`}>
          <button className="accordion-header-btn" onClick={() => toggleSection('finance')}>
            <span>05. UNIT ECONOMICS & MONETIZATION STRATEGY</span>
            <span>{openSections.finance ? '−' : '+'}</span>
          </button>
          {openSections.finance && (
            <div className="accordion-body-content">
              <p style={{ marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                {startupData?.finance?.financial_recommendation}
              </p>
              <div style={{ background: 'rgba(5, 8, 16, 0.5)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#10B981', marginBottom: '0.5rem' }}>REVENUE STREAMS & MONETIZATION:</div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                  {(startupData?.finance?.revenue_streams || ['Subscription SaaS tier', 'Usage-based compute token add-ons']).map((r, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
        <button
          className="btn-primary-glow"
          onClick={() => setCurrentScreen('mvp_playground')}
          style={{ padding: '1.1rem 2.75rem', fontSize: '1.15rem' }}
        >
          <span>Launch AI-Generated MVP Prototype ➔</span>
        </button>
      </div>
    </div>
  );
}
