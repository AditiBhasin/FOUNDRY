import { useState } from 'react';
import { motion } from 'motion/react';

export default function ExecutionGraph({ onSelectStage }) {
  const [selectedNode, setSelectedNode] = useState('build_frontend');

  const nodes = [
    {
      id: 'research',
      label: '01. RESEARCH',
      sub: 'Market Intelligence',
      status: 'VERIFIED',
      type: 'live',
      color: '#00F0FF',
      deliverables: ['Competitor landscape mapped', 'Customer segments prioritized', 'Differentiation matrix saved'],
    },
    {
      id: 'product',
      label: '02. PRODUCT',
      sub: 'MVP Specification',
      status: 'VERIFIED',
      type: 'live',
      color: '#8B5CF6',
      deliverables: ['Core user journey documented', 'Priority MVP features locked', 'Success metrics baseline established'],
    },
    {
      id: 'architecture',
      label: '03. ARCHITECTURE',
      sub: 'System Design',
      status: 'VERIFIED',
      type: 'live',
      color: '#0284C7',
      deliverables: ['Decoupled React/FastAPI schema', 'Pydantic data models validated', 'REST API contracts structured'],
    },
    {
      id: 'build_frontend',
      label: '04. BUILD: FRONTEND',
      sub: 'UI / 3D Canvas / State',
      status: 'IMPLEMENTED',
      type: 'live',
      color: '#38BDF8',
      deliverables: ['React 19 + Vite app core', 'Three.js 3D WebGL Intelligence canvas', 'Full responsive design tokens'],
    },
    {
      id: 'build_backend',
      label: '05. BUILD: BACKEND',
      sub: 'FastAPI / Async Worker',
      status: 'IMPLEMENTED',
      type: 'live',
      color: '#10B981',
      deliverables: ['FastAPI REST endpoints online', 'Thread-safe in-memory store', 'Multi-agent orchestration pipeline'],
    },
    {
      id: 'build_ai',
      label: '06. BUILD: AI LAYER',
      sub: 'Ollama / Local LLMs',
      status: 'IMPLEMENTED',
      type: 'live',
      color: '#F59E0B',
      deliverables: ['6 Specialized system prompts', 'JSON schema extractor with aliases', 'Single-revision QA loop'],
    },
    {
      id: 'integrate',
      label: '07. INTEGRATION',
      sub: 'End-to-End Testing',
      status: 'READY',
      type: 'live',
      color: '#EC4899',
      deliverables: ['Live polling synchronization', 'Telemetry activity log bridging', 'Error recovery & retry triggers'],
    },
    {
      id: 'deploy',
      label: '08. CLOUD DEPLOY',
      sub: 'Vercel + Modal / Fly.io',
      status: 'NEXT STAGE',
      type: 'future',
      color: '#94A3B8',
      deliverables: ['One-click GitHub repo generation', 'Automated CI/CD pipeline', 'Custom domain SSL provisioning'],
    },
    {
      id: 'operate',
      label: '09. CONTINUOUS OS',
      sub: 'Autonomous Feedback Loops',
      status: 'FUTURE VISION',
      type: 'future',
      color: '#64748B',
      deliverables: ['Real-time market signal monitoring', 'Competitor pricing scrapers', 'Automated GTM campaign manager'],
    },
  ];

  const current = nodes.find((n) => n.id === selectedNode) || nodes[3];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      {/* Node Graph List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {nodes.map((node, index) => {
          const isSelected = selectedNode === node.id;
          const isFuture = node.type === 'future';

          return (
            <motion.div
              key={node.id}
              onClick={() => {
                setSelectedNode(node.id);
                onSelectStage?.(node);
              }}
              style={{
                background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(14, 21, 38, 0.65)',
                border: `1px solid ${isSelected ? node.color : 'var(--border-subtle)'}`,
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backdropFilter: 'blur(16px)',
                boxShadow: isSelected ? `0 0 20px ${node.color}33` : 'none',
                opacity: isFuture ? 0.75 : 1,
              }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.15 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: node.color,
                    boxShadow: isFuture ? 'none' : `0 0 8px ${node.color}`,
                  }}
                />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>
                    {node.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{node.sub}</div>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: isFuture ? 'rgba(255, 255, 255, 0.05)' : `${node.color}22`,
                  color: isFuture ? '#94A3B8' : node.color,
                  border: `1px solid ${isFuture ? 'rgba(255, 255, 255, 0.1)' : `${node.color}55`}`,
                }}
              >
                {node.status}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Node Inspector Detail Panel */}
      <div
        style={{
          background: 'rgba(11, 16, 30, 0.85)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '1.75rem',
          backdropFilter: 'blur(25px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: current.color,
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
            }}
          >
            STAGE EXECUTION INSPECTION
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '0.25rem',
            }}
          >
            {current.label}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {current.sub}
          </p>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--neon-cyan)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            Key Output Artifacts:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {current.deliverables.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  background: 'rgba(5, 8, 16, 0.5)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ color: current.color, fontWeight: 'bold' }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Status: {current.status}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: current.type === 'live' ? '#10B981' : '#F59E0B',
            }}
          >
            {current.type === 'live' ? '● RUNTIME VERIFIED' : '○ PROJECTED EXTENSION'}
          </span>
        </div>
      </div>
    </div>
  );
}
