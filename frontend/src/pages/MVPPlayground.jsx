import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';
import EvidenceBadge from '../components/EvidenceBadge';

export default function MVPPlayground() {
  const { mvpSpec, startupData, idea, setCurrentScreen } = useStartup();

  // Active Screen within the prototype
  const [activeScreenId, setActiveScreenId] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [generatedOutput, setGeneratedOutput] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [kanbanItems, setKanbanItems] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const productCfg = AGENT_CONFIGS.product;

  // Fallback spec if workflow hasn't finished
  const fallbackSpec = {
    app_name: 'VentureFlow Prototype',
    tagline: startupData?.product?.product_summary || 'Autonomous AI-Powered MVP Prototype',
    target_persona: startupData?.product?.target_user || 'Target Users & Early Operators',
    navigation: [
      { id: 'dashboard', title: 'Command Center', icon: '⚡' },
      { id: 'discovery', title: 'Discover & Search', icon: '🔍' },
      { id: 'tracker', title: 'Pipeline Tracker', icon: '📋' },
      { id: 'assistant', title: 'AI Tailor & Generator', icon: '✨' },
      { id: 'analytics', title: 'Performance Analytics', icon: '📊' },
    ],
    sample_entities: [
      { id: 'ent-1', title: 'AI Engineering Specialist Role', company: 'NeuralForge Labs', location: 'Remote', match_score: 96, status: 'Ready', compensation: '$120k / yr', deadline: '3 days left' },
      { id: 'ent-2', title: 'Product Architecture Fellowship', company: 'Axiom Dynamics', location: 'San Francisco', match_score: 92, status: 'Interview', compensation: '$95k / yr', deadline: '1 week left' },
      { id: 'ent-3', title: 'Data Pipeline Infrastructure Lead', company: 'Voxel Distributed', location: 'Remote / NYC', match_score: 88, status: 'Tailoring', compensation: '$135k / yr', deadline: '5 days left' },
      { id: 'ent-4', title: 'Autonomous Operations Associate', company: 'Hyperion AI', location: 'Austin, TX', match_score: 84, status: 'Applied', compensation: '$85k / yr', deadline: 'Closed' },
    ],
    screens: [],
  };

  const spec = mvpSpec || fallbackSpec;
  const entities = spec.sample_entities || fallbackSpec.sample_entities;

  // Show quick toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter entities by search and filter tag
  const filteredEntities = entities.filter((item) => {
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'Match > 90%') {
      return matchesSearch && item.match_score >= 90;
    }
    if (selectedFilter === 'Remote') {
      return matchesSearch && item.location.toLowerCase().includes('remote');
    }
    return matchesSearch;
  });

  // Handle prototype AI generation form
  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedOutput({
        title: `AI-Optimized Dossier for ${selectedItem?.title || 'Selected Opportunity'}`,
        highlights: [
          'High-precision alignment with job requirements (Score: 98/100)',
          'Custom tailored experience narrative highlighting relevant full-stack AI skills',
          'Formatted cover letter with matching terminology and company value proposition',
        ],
        timestamp: new Date().toLocaleTimeString(),
      });
      triggerToast('✓ Prototype Generated Tailored Application Dossier!');
    }, 1200);
  };

  return (
    <div className="mvp-playground-screen" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Prototype Prototype Banner (Required) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, rgba(251, 146, 60, 0.15), rgba(0, 240, 255, 0.15))',
          border: '1px solid rgba(251, 146, 60, 0.4)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🚀</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#FB923C', fontFamily: 'var(--font-display)', fontWeight: '800', letterSpacing: '0.04em' }}>
                AI-GENERATED MVP PROTOTYPE
              </span>
              <span style={{ background: 'rgba(251, 146, 60, 0.25)', color: '#FB923C', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                INTERACTIVE SANDBOX
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              Synthesized from Product Agent & CTO technical specifications for: <strong>"{idea || 'Autonomous Venture'}"</strong>.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary-glass" onClick={() => setCurrentScreen('blueprint')}>
            ← Blueprint
          </button>
          <button className="btn-primary-glow" onClick={() => setCurrentScreen('execution')}>
            Build Graph ➔
          </button>
        </div>
      </motion.div>

      {/* Main Prototype Shell */}
      <div
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(7, 10, 20, 0.95)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Prototype Header / App Bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(14, 21, 38, 0.85)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* App Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00F0FF, #FB923C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                color: '#070a14',
                fontFamily: 'var(--font-display)',
              }}
            >
              {spec.app_name?.charAt(0) || 'V'}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                {spec.app_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Target: {spec.target_persona}
              </div>
            </div>
          </div>

          {/* Screen Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(5, 8, 16, 0.6)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            {(spec.navigation || fallbackSpec.navigation).map((nav) => (
              <button
                key={nav.id}
                onClick={() => {
                  setActiveScreenId(nav.id);
                  setSelectedItem(null);
                }}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeScreenId === nav.id ? '#00F0FF' : 'transparent',
                  color: activeScreenId === nav.id ? '#070a14' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'var(--transition-fast)',
                }}
              >
                <span>{nav.icon}</span>
                <span>{nav.title}</span>
              </button>
            ))}
          </div>

          {/* Quick Prototype Action */}
          <button
            className="btn-primary-glow"
            onClick={() => triggerToast(`⚡ Autonomous sync triggered for ${spec.app_name}!`)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
          >
            ⚡ Test Live Sync
          </button>
        </div>

        {/* Prototype Screen Viewport */}
        <div style={{ padding: '2rem' }}>
          {/* SCREEN 1: DASHBOARD / COMMAND CENTER */}
          {activeScreenId === 'dashboard' && (
            <div>
              {/* KPI Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                <div className="detail-section-card" style={{ borderLeft: '3px solid #00F0FF' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ACTIVE PIPELINE</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#00F0FF', margin: '0.3rem 0' }}>142</div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981' }}>↑ +18.4% this week</div>
                </div>

                <div className="detail-section-card" style={{ borderLeft: '3px solid #10B981' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>AI MATCH ACCURACY</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#10B981', margin: '0.3rem 0' }}>96.2%</div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981' }}>↑ High precision validation</div>
                </div>

                <div className="detail-section-card" style={{ borderLeft: '3px solid #8B5CF6' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RESPONSE VELOCITY</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#8B5CF6', margin: '0.3rem 0' }}>1.4s</div>
                  <div style={{ fontSize: '0.72rem', color: '#8B5CF6' }}>⚡ Optimized async queue</div>
                </div>

                <div className="detail-section-card" style={{ borderLeft: '3px solid #FB923C' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>CONVERSION RATE</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#FB923C', margin: '0.3rem 0' }}>31.8%</div>
                  <div style={{ fontSize: '0.72rem', color: '#FB923C' }}>↑ 3.2x industry baseline</div>
                </div>
              </div>

              {/* Feed & Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="detail-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="detail-section-title">
                      <span>⚡</span>
                      <span>PRIORITY MATCHES READY FOR ACTION</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to inspect</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {entities.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        style={{
                          padding: '0.85rem 1.1rem',
                          borderRadius: '8px',
                          background: selectedItem?.id === item.id ? 'rgba(0, 240, 255, 0.15)' : 'rgba(5, 8, 16, 0.6)',
                          border: `1px solid ${selectedItem?.id === item.id ? '#00F0FF' : 'var(--border-subtle)'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)',
                        }}
                      >
                        <div>
                          <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.92rem' }}>{item.title}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                            {item.company} • {item.location} • <span style={{ color: '#10B981' }}>{item.compensation}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                            {item.match_score}% Match
                          </span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.deadline}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Sidebar Inspector */}
                <div className="detail-section-card" style={{ background: 'rgba(14, 21, 38, 0.5)' }}>
                  <div className="detail-section-title" style={{ marginBottom: '1rem' }}>
                    <span>🎯</span>
                    <span>PROTOTYPE INSPECTOR</span>
                  </div>

                  {selectedItem ? (
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#00F0FF', marginBottom: '0.3rem' }}>
                        {selectedItem.title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                        {selectedItem.company} ({selectedItem.location})
                      </div>

                      <div style={{ padding: '0.75rem', background: 'rgba(5, 8, 16, 0.7)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', lineHeight: '1.5' }}>
                        <div><strong>Status:</strong> {selectedItem.status}</div>
                        <div><strong>Affinity:</strong> {selectedItem.match_score}% Algorithmic Match</div>
                        <div><strong>Reward / Comp:</strong> {selectedItem.compensation}</div>
                        <div><strong>Timeline:</strong> {selectedItem.deadline}</div>
                      </div>

                      <button
                        className="btn-primary-glow"
                        onClick={() => {
                          setActiveScreenId('assistant');
                          triggerToast(`Switched to AI Tailor for "${selectedItem.title}"`);
                        }}
                        style={{ width: '100%', padding: '0.7rem', fontSize: '0.85rem' }}
                      >
                        ✨ Launch AI Tailoring Tool
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Select any opportunity from the feed to inspect live prototype attributes and actions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: DISCOVERY & SEARCH */}
          {activeScreenId === 'discovery' && (
            <div>
              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Search opportunities by title, company, skills, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '280px',
                    padding: '0.75rem 1.1rem',
                    borderRadius: '8px',
                    background: 'rgba(5, 8, 16, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                  }}
                />

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['All', 'Match > 90%', 'Remote'].map((flt) => (
                    <button
                      key={flt}
                      onClick={() => setSelectedFilter(flt)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: `1px solid ${selectedFilter === flt ? '#00F0FF' : 'var(--border-subtle)'}`,
                        background: selectedFilter === flt ? 'rgba(0, 240, 255, 0.2)' : 'rgba(14, 21, 38, 0.6)',
                        color: selectedFilter === flt ? '#fff' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {flt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Matched Opportunities */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filteredEntities.map((item) => (
                  <div
                    key={item.id}
                    className="detail-section-card"
                    style={{
                      borderTop: `3px solid ${item.match_score >= 90 ? '#10B981' : '#00F0FF'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>{item.title}</h4>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                          {item.match_score}%
                        </span>
                      </div>

                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                        🏢 {item.company} • 📍 {item.location}
                      </div>

                      <div style={{ padding: '0.6rem', background: 'rgba(5, 8, 16, 0.5)', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '1rem' }}>
                        <div><strong>Compensation:</strong> {item.compensation}</div>
                        <div><strong>Deadline:</strong> {item.deadline}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-secondary-glass"
                        onClick={() => {
                          setSelectedItem(item);
                          triggerToast(`Selected "${item.title}"`);
                        }}
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.78rem' }}
                      >
                        Inspect
                      </button>
                      <button
                        className="btn-primary-glow"
                        onClick={() => {
                          setSelectedItem(item);
                          setActiveScreenId('assistant');
                        }}
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.78rem' }}
                      >
                        ✨ Tailor Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 3: PIPELINE TRACKER (KANBAN) */}
          {activeScreenId === 'tracker' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '800' }}>
                    Active Venture Pipeline & Application Workflow
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Live state transitions tracking discovery through interview and offer conversion.
                  </p>
                </div>

                <button
                  className="btn-secondary-glass"
                  onClick={() => triggerToast('✓ Added new automated opportunity to Kanban pipeline!')}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                >
                  + Add Item
                </button>
              </div>

              {/* Kanban Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {[
                  { title: '1. Discovered', count: 14, color: '#38BDF8', item: entities[0] },
                  { title: '2. AI Tailoring', count: 6, color: '#FB923C', item: entities[2] },
                  { title: '3. Submitted', count: 9, color: '#8B5CF6', item: entities[1] },
                  { title: '4. Interviewing / Offer', count: 3, color: '#10B981', item: entities[3] || entities[0] },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(5, 8, 16, 0.7)',
                      borderRadius: '10px',
                      border: `1px solid ${col.color}44`,
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: col.color, fontWeight: '700', fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>
                        {col.title}
                      </span>
                      <span style={{ background: `${col.color}22`, color: col.color, padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                        {col.count}
                      </span>
                    </div>

                    {/* Kanban Card */}
                    {col.item && (
                      <div
                        onClick={() => triggerToast(`Clicked Kanban Card: ${col.item.title}`)}
                        style={{
                          background: 'rgba(14, 21, 38, 0.8)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.85rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                          {col.item.title}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          {col.item.company}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                          <span style={{ color: '#10B981', fontSize: '0.72rem', fontWeight: '700' }}>{col.item.compensation}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{col.item.deadline}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 4: AI TAILOR & GENERATOR */}
          {activeScreenId === 'assistant' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="detail-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="detail-section-title">
                    <span>✨</span>
                    <span>AUTONOMOUS AI APPLICATION TAILORING ENGINE</span>
                  </div>
                  <EvidenceBadge type="RECOMMENDATION" />
                </div>

                <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Target Opportunity
                    </label>
                    <select
                      value={selectedItem?.id || entities[0]?.id}
                      onChange={(e) => {
                        const found = entities.find((x) => x.id === e.target.value);
                        setSelectedItem(found);
                      }}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(5, 8, 16, 0.8)', border: '1px solid var(--border-subtle)', color: '#fff', fontFamily: 'var(--font-display)' }}
                    >
                      {entities.map((ent) => (
                        <option key={ent.id} value={ent.id}>
                          {ent.title} ({ent.company})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Positioning & Narrative Tone
                    </label>
                    <select style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(5, 8, 16, 0.8)', border: '1px solid var(--border-subtle)', color: '#fff', fontFamily: 'var(--font-display)' }}>
                      <option>Technical & Rigorous (AI Engineer / Architect)</option>
                      <option>Product & Strategic (Product Leader)</option>
                      <option>High Velocity & Results-Driven (Startup Generalist)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Custom Experience Highlights / Keywords
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Highlight React 19, FastAPI multi-agent systems, and 3x latency optimization..."
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(5, 8, 16, 0.8)', border: '1px solid var(--border-subtle)', color: '#fff', fontFamily: 'var(--font-display)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn-primary-glow"
                    style={{ padding: '0.85rem', fontSize: '0.95rem' }}
                  >
                    {isGenerating ? '⚡ Synthesizing Custom Package...' : '✨ Generate AI Application Package'}
                  </button>
                </form>

                {/* Generated Result Output Box */}
                {generatedOutput && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: '1.5rem',
                      padding: '1.25rem',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#10B981', fontSize: '0.95rem' }}>{generatedOutput.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{generatedOutput.timestamp}</span>
                    </div>

                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      {generatedOutput.highlights.map((h, i) => (
                        <li key={i} style={{ marginBottom: '0.35rem' }}>{h}</li>
                      ))}
                    </ul>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                      <button
                        className="btn-primary-glow"
                        onClick={() => triggerToast('✓ Dossier exported and submitted to pipeline!')}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                      >
                        📤 Submit Application Package
                      </button>
                      <button
                        className="btn-secondary-glass"
                        onClick={() => setGeneratedOutput(null)}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                      >
                        Clear
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 5: PERFORMANCE ANALYTICS */}
          {activeScreenId === 'analytics' && (
            <div>
              <div className="detail-section-card" style={{ marginBottom: '1.5rem' }}>
                <div className="detail-section-title" style={{ marginBottom: '1.25rem' }}>
                  <span>📊</span>
                  <span>FUNNEL VELOCITY & CONVERSION TELEMETRY</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {[
                    { label: '1. Opportunities Scanned & Scraped', count: 480, pct: 100, color: '#38BDF8' },
                    { label: '2. High-Affinity AI Matches (>85%)', count: 142, pct: 30, color: '#00F0FF' },
                    { label: '3. Custom AI Packages Tailored', count: 38, pct: 8, color: '#FB923C' },
                    { label: '4. Responses & Interviews Triggered', count: 12, pct: 2.5, color: '#8B5CF6' },
                    { label: '5. Offers / Successful Placements', count: 4, pct: 0.8, color: '#10B981' },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#fff' }}>{bar.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: bar.color, fontWeight: '700' }}>{bar.count} items</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(bar.pct, 4)}%`, height: '100%', background: bar.color, borderRadius: '5px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              background: '#070a14',
              border: '1px solid #10B981',
              color: '#10B981',
              padding: '0.85rem 1.4rem',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: '700',
              zIndex: 9999,
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
