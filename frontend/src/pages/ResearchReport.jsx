import { useState } from 'react';
import { motion } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';
import EvidenceBadge from '../components/EvidenceBadge';
import LiveDataBanner from '../components/LiveDataBanner';

export default function ResearchReport() {
  const { startupData, idea, setCurrentScreen, webResearchAvailable, evidence } = useStartup();
  const [filterCategory, setFilterCategory] = useState('ALL');

  const research = startupData?.research || {};
  const cfg = AGENT_CONFIGS.research;

  const filteredEvidence = filterCategory === 'ALL'
    ? evidence
    : evidence.filter((ev) => ev.category === filterCategory);

  return (
    <div className="research-report-screen" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <motion.div
        className="detail-header-card"
        style={{ '--agent-theme-color': cfg.color, marginBottom: '1.5rem' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="detail-top-bar">
          <div className="detail-agent-title">
            <span>{cfg.icon}</span>
            <span>RESEARCH INTELLIGENCE & EVIDENCE DOSSIER</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary-glass" onClick={() => setCurrentScreen('workspace')}>
              ← Workspace
            </button>
            <button className="btn-primary-glow" onClick={() => setCurrentScreen('financial_report')}>
              Unit Economics Report →
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginTop: '0.5rem' }}>
          Truthful multi-agent market audit for: <strong style={{ color: '#fff' }}>"{idea || 'Autonomous AI Venture'}"</strong>.
        </p>
      </motion.div>

      {/* Live Data Availability Banner */}
      <LiveDataBanner available={webResearchAvailable} />

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {/* Core Problem Statement */}
        <div className="detail-section-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="detail-section-title">
              <span style={{ color: cfg.color }}>●</span>
              <span>VALIDATED PROBLEM STATEMENT</span>
            </div>
            <EvidenceBadge type="AI_INFERENCE" />
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {research.problem_statement || 'Problem analysis generated from venture thesis.'}
          </p>
        </div>

        {/* Market Opportunity */}
        <div className="detail-section-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="detail-section-title">
              <span style={{ color: cfg.color }}>●</span>
              <span>MARKET OPPORTUNITY</span>
            </div>
            <EvidenceBadge type="AI_INFERENCE" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {research.market_opportunity || 'Market opportunity evaluated via LLM domain knowledge.'}
          </p>
        </div>
      </div>

      {/* Detailed Market Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {/* Target Segments */}
        <div className="detail-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="detail-section-title">
              <span style={{ color: '#00F0FF' }}>👥</span>
              <span>TARGET USER PERSONAS</span>
            </div>
            <EvidenceBadge type="AI_INFERENCE" />
          </div>
          <ul className="detail-list" style={{ '--agent-theme-color': '#00F0FF' }}>
            {(research.target_users || ['Early Adopters', 'Product Leaders']).map((item, i) => (
              <li key={i} className="detail-list-item">
                <span className="detail-list-bullet">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Competitor Landscape */}
        <div className="detail-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="detail-section-title">
              <span style={{ color: '#FB923C' }}>⚔️</span>
              <span>COMPETITORS & ALTERNATIVES</span>
            </div>
            <EvidenceBadge type="AI_INFERENCE" />
          </div>
          <ul className="detail-list" style={{ '--agent-theme-color': '#FB923C' }}>
            {(research.competitors || ['Manual spreadsheet workflows', 'Legacy consultancies']).map((item, i) => (
              <li key={i} className="detail-list-item">
                <span className="detail-list-bullet">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Differentiation */}
        <div className="detail-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="detail-section-title">
              <span style={{ color: '#10B981' }}>💎</span>
              <span>DIFFERENTIATION LEVERS</span>
            </div>
            <EvidenceBadge type="AI_INFERENCE" />
          </div>
          <ul className="detail-list" style={{ '--agent-theme-color': '#10B981' }}>
            {(research.differentiation || ['Continuous multi-agent runtime', 'Deterministic unit economics']).map((item, i) => (
              <li key={i} className="detail-list-item">
                <span className="detail-list-bullet">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hypotheses to Validate */}
        <div className="detail-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="detail-section-title">
              <span style={{ color: '#F59E0B' }}>⚠️</span>
              <span>CRITICAL ASSUMPTIONS & RISKS</span>
            </div>
            <EvidenceBadge type="ASSUMPTION" />
          </div>
          <ul className="detail-list" style={{ '--agent-theme-color': '#F59E0B' }}>
            {(research.research_risks || ['Willingness to pay requires customer discovery validation']).map((item, i) => (
              <li key={i} className="detail-list-item">
                <span className="detail-list-bullet" style={{ color: '#F59E0B' }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Structured Evidence Ledger */}
      <div className="detail-section-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              Truthful Evidence Audit Ledger
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Every claim is strictly classified by origin. No AI inference is misrepresented as verified external data.
            </p>
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'DATA', 'AI_INFERENCE', 'ASSUMPTION', 'RECOMMENDATION'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${filterCategory === cat ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`,
                  background: filterCategory === cat ? 'rgba(0, 240, 255, 0.15)' : 'rgba(14, 21, 38, 0.5)',
                  color: filterCategory === cat ? '#fff' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredEvidence.length > 0 ? (
            filteredEvidence.map((ev) => (
              <div
                key={ev.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(5, 8, 16, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <EvidenceBadge type={ev.category} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      Origin: {ev.agent.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {ev.claim}
                  </div>
                  {ev.notes && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                      Context: {ev.notes}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', minWidth: '130px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                    Source:
                  </div>
                  <div style={{ color: '#38BDF8', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                    {ev.source || 'Ollama llama3.2:3b'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No claims found under filter '{filterCategory}'.
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-secondary-glass" onClick={() => setCurrentScreen('workspace')}>
          ← Back to Workspace
        </button>
        <button className="btn-primary-glow" onClick={() => setCurrentScreen('financial_report')}>
          Proceed to Financial Report & Economics ➔
        </button>
      </div>
    </div>
  );
}
