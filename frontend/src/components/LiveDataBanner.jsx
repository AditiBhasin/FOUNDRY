export default function LiveDataBanner({ available, provider }) {
  if (available) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#10B981',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>🌐</span>
        <div>
          <strong style={{ letterSpacing: '0.04em' }}>LIVE WEB RESEARCH ACTIVE</strong>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
            External research retrieved live via {provider || 'verified search provider'}. Empirical claims categorized as [DATA].
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        color: '#38BDF8',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem',
        marginBottom: '1.5rem',
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>⚡</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong style={{ letterSpacing: '0.04em' }}>LIVE WEB RESEARCH UNAVAILABLE</strong>
          <span style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem' }}>
            TRUTHFUL AUDIT MODE
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
          No external search API provider configured. Market analysis is derived directly from <strong>Ollama (llama3.2:3b)</strong> parametric reasoning and categorized as <strong>[AI INFERENCE]</strong>. FOUNDry never fabricates live internet citations or statistics.
        </div>
      </div>
    </div>
  );
}
