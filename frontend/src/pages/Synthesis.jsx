import { motion } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';

export default function Synthesis() {
  const { setCurrentScreen, startupData, finalResult, idea } = useStartup();

  const ceoReview = startupData?.ceo_review || finalResult?.ceo_review;
  const score = startupData?.qa?.build_readiness_score || finalResult?.build_readiness_score || 72;

  const agents = Object.values(AGENT_CONFIGS);

  return (
    <div className="synthesis-screen" style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
      <motion.div
        className="hero-badge"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <span>⚡</span>
        <span>STAGE 06 — MULTI-AGENT INTELLIGENCE CONVERGENCE</span>
      </motion.div>

      <motion.h1
        className="hero-headline"
        style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', marginBottom: '1rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Workforce Synthesis Complete.
        <span className="hero-headline-gradient">
          Six specialized agent workstreams unified into one venture.
        </span>
      </motion.h1>

      <motion.p
        className="hero-subtext"
        style={{ maxWidth: '700px', margin: '0 auto 2rem auto' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Market research, product scoping, system architecture, unit economics, and QA risk validations have converged under CEO synthesis.
      </motion.p>

      {/* CEO Review Executive Box */}
      {ceoReview && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            background: 'rgba(14, 21, 38, 0.85)',
            border: `1px solid ${ceoReview.approved ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
            borderRadius: '14px',
            padding: '1.5rem 2rem',
            textAlign: 'left',
            maxWidth: '850px',
            margin: '0 auto 2.5rem auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>👔</span>
              <strong style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                CEO EXECUTIVE AUDIT & VERDICT
              </strong>
            </div>

            <span
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                background: ceoReview.approved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: ceoReview.approved ? '#10B981' : '#F59E0B',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                fontSize: '0.8rem',
              }}
            >
              {ceoReview.approved ? `✓ APPROVED (Score: ${score}/100)` : `REVISION AUDITED (Score: ${score}/100)`}
            </span>
          </div>

          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {ceoReview.summary}
          </p>

          {ceoReview.revision_reason && (
            <div style={{ marginTop: '0.75rem', color: '#F59E0B', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              Revision Audit Note: {ceoReview.revision_reason}
            </div>
          )}
        </motion.div>
      )}

      {/* Cinematic Convergence Visual Core */}
      <div className="synthesis-core-wrap" style={{ margin: '2rem auto' }}>
        <div className="synthesis-ring" />
        <div className="synthesis-ring-2" />

        <motion.div
          className="central-foundry-core"
          style={{ width: '180px', height: '180px' }}
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              '0 0 35px rgba(0, 240, 255, 0.4)',
              '0 0 85px rgba(251, 146, 60, 0.6)',
              '0 0 35px rgba(0, 240, 255, 0.4)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span className="core-symbol" style={{ fontSize: '3.2rem' }}>
            F
          </span>
          <span className="core-label" style={{ fontSize: '0.75rem' }}>
            SYNTHESIZED
          </span>
        </motion.div>

        {/* 6 Converging Stream Nodes */}
        {agents.map((agent, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const dist = 180;
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;

          return (
            <motion.div
              key={agent.key}
              style={{
                position: 'absolute',
                top: `calc(50% + ${y}px)`,
                left: `calc(50% + ${x}px)`,
                transform: 'translate(-50%, -50%)',
                background: 'rgba(14, 21, 38, 0.92)',
                border: `1px solid ${agent.color}`,
                borderRadius: '999px',
                padding: '0.4rem 0.85rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: `0 0 15px ${agent.color}44`,
                whiteSpace: 'nowrap',
              }}
              animate={{
                x: [0, -Math.cos(angle) * 30, 0],
                y: [0, -Math.sin(angle) * 30, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            >
              <span>{agent.icon}</span>
              <span>{agent.shortName}</span>
              <span style={{ color: agent.isImplemented ? '#10B981' : '#F59E0B' }}>
                {agent.isImplemented ? '✓' : '⚙'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '2.5rem' }}
      >
        <button
          className="btn-secondary-glass"
          onClick={() => setCurrentScreen('research_report')}
          style={{ padding: '1rem 2rem', fontSize: '1rem' }}
        >
          <span>🔍 Research & Evidence Dossier ➔</span>
        </button>

        <button
          className="btn-secondary-glass"
          onClick={() => setCurrentScreen('financial_report')}
          style={{ padding: '1rem 2rem', fontSize: '1rem' }}
        >
          <span>📈 Unit Economics Model ➔</span>
        </button>

        <button
          className="btn-primary-glow"
          onClick={() => setCurrentScreen('blueprint')}
          style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}
        >
          <span>Master Startup Blueprint ➔</span>
        </button>
      </motion.div>
    </div>
  );
}
