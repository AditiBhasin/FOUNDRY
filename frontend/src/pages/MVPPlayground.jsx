import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';
import EvidenceBadge from '../components/EvidenceBadge';

export default function MVPPlayground() {
  const { mvpSpec, startupData, idea, setCurrentScreen } = useStartup();

  // Active Screen within the prototype
  const [activeScreenId, setActiveScreenId] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Matches');
  const [selectedItem, setSelectedItem] = useState(null);
  const [generatedOutput, setGeneratedOutput] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Dynamic fallback generator if mvpSpec has not finished generating
  const dynamicSpec = useMemo(() => {
    if (mvpSpec) return mvpSpec;

    // Generate responsive profile directly from the current idea
    const cleanIdea = (idea || 'Autonomous AI Venture').trim();
    const words = cleanIdea.split(' ').filter((w) => w.length > 2);
    const appName = words.length >= 2 ? `${words[0]}${words[1]}` : `${words[0] || 'Venture'}AI`;
    const targetUser = startupData?.product?.target_user || 'Target Customers & Operators';

    return {
      app_name: appName,
      tagline: startupData?.product?.product_summary || `AI Platform for ${cleanIdea}`,
      target_persona: targetUser,
      navigation: [
        { id: 'dashboard', title: 'Command Center', icon: '⚡' },
        { id: 'discovery', title: 'Explore & Search', icon: '🔍' },
        { id: 'tracker', title: 'Pipeline Tracker', icon: '📋' },
        { id: 'assistant', title: 'AI Generator', icon: '✨' },
        { id: 'analytics', title: 'Analytics', icon: '📊' },
      ],
      screens: [
        {
          id: 'dashboard',
          title: 'Command Center',
          icon: '⚡',
          components: [
            {
              id: 'kpi-metrics',
              type: 'metric_card',
              title: 'Key Operational Metrics',
              data: [
                { label: 'Active Pipeline Items', value: '184', change: '+18.4%', trend: 'up', color: '#00F0FF' },
                { label: 'Algorithmic Match Rate', value: '96.2%', change: '+4.2%', trend: 'up', color: '#10B981' },
                { label: 'Throughput Speed', value: '0.9s', change: '-32%', trend: 'up', color: '#8B5CF6' },
                { label: 'Conversion Efficiency', value: '38.4%', change: '+14.6%', trend: 'up', color: '#FB923C' },
              ],
            },
            {
              id: 'active-feed',
              type: 'data_table',
              title: 'High-Priority Workstreams',
            },
          ],
        },
        {
          id: 'discovery',
          title: 'Discovery Explorer',
          icon: '🔍',
          components: [
            {
              id: 'search-filter-bar',
              type: 'search_filter',
              properties: {
                placeholder: `Search items by keywords, specifications, or parameters for ${cleanIdea.slice(0, 30)}...`,
                filters: ['All Matches', 'Score > 90%', 'High Priority'],
              },
            },
          ],
        },
        {
          id: 'tracker',
          title: 'Execution Tracker',
          icon: '📋',
          components: [
            {
              id: 'kanban-workflow',
              type: 'kanban',
              title: 'Status Pipeline',
              data: [
                { column: '1. Ingested', count: 18 },
                { column: '2. Processing', count: 7 },
                { column: '3. Action Active', count: 12 },
                { column: '4. Converted / Done', count: 5 },
              ],
            },
          ],
        },
        {
          id: 'assistant',
          title: 'AI Intelligence Generator',
          icon: '✨',
          components: [
            {
              id: 'tailor-form',
              type: 'form',
              title: `Generate AI Optimization Dossier for ${appName}`,
            },
          ],
        },
        {
          id: 'analytics',
          title: 'Analytics & Telemetry',
          icon: '📊',
          components: [
            {
              id: 'analytics-chart-summary',
              type: 'chart',
              title: 'Conversion Funnel & Velocity',
              data: [
                { label: '1. Total Ingested Items', value: 520 },
                { label: '2. AI Matches Identified', value: 168 },
                { label: '3. Automated Actions Synthesized', value: 48 },
                { label: '4. Active Approvals & Conversions', value: 16 },
                { label: '5. Completed Transactions', value: 6 },
              ],
            },
          ],
        },
      ],
      sample_entities: [
        {
          id: 'ent-1',
          title: `Autonomous ${cleanIdea.slice(0, 35)} Primary Flow`,
          company: `${appName} Core Network`,
          location: 'Cloud Cluster Alpha',
          match_score: 98,
          status: 'Active & Processing',
          compensation: '99.4% Efficiency',
          deadline: 'Live Now',
          badge: 'Optimal',
        },
        {
          id: 'ent-2',
          title: `High-Throughput Optimization Stream`,
          company: 'Synthetix Operations',
          location: 'Distributed Edge Pod',
          match_score: 94,
          status: 'Velocity +34%',
          compensation: '8.4k ops/sec',
          deadline: 'Running Cycle',
          badge: 'Accelerating',
        },
        {
          id: 'ent-3',
          title: `Custom Intelligence & Parameter Adapter`,
          company: 'Voxel Distributed Hub',
          location: 'Secure Node',
          match_score: 90,
          status: 'Audited by AI Agent',
          compensation: 'Zero Error Output',
          deadline: 'Scheduled in 2h',
          badge: 'Verified',
        },
        {
          id: 'ent-4',
          title: `Real-Time Performance Engine`,
          company: `${appName} Telemetry`,
          location: 'Ingestion Cluster',
          match_score: 86,
          status: 'Active Live Stream',
          compensation: '99.9% Uptime',
          deadline: 'Continuous',
          badge: 'Standard',
        },
      ],
      interactive_actions: [
        'Instant Match Workstreams',
        'One-Click AI Optimization',
        'Export Action Dossier',
        'Trigger Automated Workflow',
      ],
    };
  }, [mvpSpec, idea, startupData]);

  const spec = dynamicSpec;
  const entities = spec.sample_entities || [];

  // Extract screens from spec safely
  const screens = spec.screens || [];
  const dashboardScreen = screens.find((s) => s.id === 'dashboard') || screens[0];
  const discoveryScreen = screens.find((s) => s.id === 'discovery') || screens[1];
  const trackerScreen = screens.find((s) => s.id === 'tracker') || screens[2];
  const assistantScreen = screens.find((s) => s.id === 'assistant') || screens[3];
  const analyticsScreen = screens.find((s) => s.id === 'analytics') || screens[4];

  // Dynamic KPI metrics
  const kpiData = dashboardScreen?.components?.find((c) => c.type === 'metric_card')?.data || [
    { label: 'Active Pipeline Items', value: '184', change: '+18.4%', color: '#00F0FF' },
    { label: 'Algorithmic Accuracy', value: '96.2%', change: '+4.2%', color: '#10B981' },
    { label: 'Response Velocity', value: '0.9s', change: '-32%', color: '#8B5CF6' },
    { label: 'Conversion Rate', value: '38.4%', change: '+14.6%', color: '#FB923C' },
  ];

  // Dynamic Search placeholder & filters
  const searchFilterComp = discoveryScreen?.components?.find((c) => c.type === 'search_filter');
  const searchPlaceholder = searchFilterComp?.properties?.placeholder || `Search ${spec.app_name} items by keywords, specifications, or location...`;
  const availableFilters = searchFilterComp?.properties?.filters || ['All Matches', 'Score > 90%', 'High Priority'];

  // Dynamic Kanban Columns
  const kanbanComp = trackerScreen?.components?.find((c) => c.type === 'kanban');
  const kanbanColumns = kanbanComp?.data || [
    { column: '1. Ingested Stream', count: 18 },
    { column: '2. AI Optimization', count: 7 },
    { column: '3. Action Active', count: 12 },
    { column: '4. Converted / Done', count: 5 },
  ];

  // Dynamic Form Title
  const formComp = assistantScreen?.components?.find((c) => c.type === 'form');
  const formTitle = formComp?.title || `Generate AI-Optimized Action Package for ${spec.app_name}`;

  // Dynamic Analytics Bars
  const analyticsComp = analyticsScreen?.components?.find((c) => c.type === 'chart');
  const analyticsBars = analyticsComp?.data || [
    { label: '1. Total Ingested Items', value: 520 },
    { label: '2. High-Confidence AI Matches', value: 168 },
    { label: '3. Automated Actions Synthesized', value: 48 },
    { label: '4. Active Approvals & Conversions', value: 16 },
    { label: '5. Completed Transactions', value: 6 },
  ];

  // Show quick toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter entities by search and filter tag
  const filteredEntities = entities.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'Score > 90%' || selectedFilter === 'Match > 90%') {
      return matchesSearch && item.match_score >= 90;
    }
    if (selectedFilter === 'High Priority' || selectedFilter === 'High Match') {
      return matchesSearch && (item.badge === 'Optimal' || item.badge === 'High Match' || item.match_score >= 92);
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
        title: `AI-Optimized Action Dossier for ${selectedItem?.title || entities[0]?.title || spec.app_name}`,
        highlights: [
          `Target Domain: ${spec.app_name} (${spec.target_persona})`,
          `Confidence Match Score: 98/100 verified by ${spec.app_name} AI engine`,
          'Automated parameter synthesis & risk mitigation rules applied successfully',
          'Formatted execution output package ready for pipeline dispatch',
        ],
        timestamp: new Date().toLocaleTimeString(),
      });
      triggerToast(`✓ Generated Personalized Intelligence for ${spec.app_name}!`);
    }, 1100);
  };

  return (
    <div className="mvp-playground-screen" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Prototype Header Banner */}
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
                PERSONALIZED FOR YOUR IDEA
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              Generated prototype for: <strong style={{ color: '#fff' }}>"{idea || 'Autonomous Venture'}"</strong>.
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

      {/* Main Interactive Prototype Shell */}
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
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00F0FF, #FB923C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                color: '#070a14',
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
              }}
            >
              {spec.app_name?.charAt(0) || 'V'}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                {spec.app_name}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Target: {spec.target_persona}
              </div>
            </div>
          </div>

          {/* Dynamic Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(5, 8, 16, 0.6)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            {(spec.navigation || []).map((nav) => (
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

          {/* Quick Action Button */}
          <button
            className="btn-primary-glow"
            onClick={() => triggerToast(`⚡ Autonomous sync triggered for ${spec.app_name}!`)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
          >
            ⚡ Test Prototype Sync
          </button>
        </div>

        {/* Screen Viewport */}
        <div style={{ padding: '2rem' }}>
          {/* SCREEN 1: DASHBOARD / COMMAND CENTER */}
          {activeScreenId === 'dashboard' && (
            <div>
              {/* Dynamic KPI Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                {kpiData.map((kpi, idx) => (
                  <div key={idx} className="detail-section-card" style={{ borderLeft: `3px solid ${kpi.color || '#00F0FF'}` }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {kpi.label}
                    </div>
                    <div style={{ fontSize: '1.9rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: kpi.color || '#00F0FF', margin: '0.3rem 0' }}>
                      {kpi.value}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981' }}>{kpi.change || '↑ High velocity'}</div>
                  </div>
                ))}
              </div>

              {/* Feed & Interactive Inspector */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="detail-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="detail-section-title">
                      <span>⚡</span>
                      <span>ACTIVE WORKSTREAMS & MATCHES</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click item to inspect</span>
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
                            {item.match_score}% Score
                          </span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.deadline}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Inspector */}
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

                      <div style={{ padding: '0.75rem', background: 'rgba(5, 8, 16, 0.7)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', lineHeight: '1.6' }}>
                        <div><strong>Status:</strong> {selectedItem.status}</div>
                        <div><strong>Confidence:</strong> {selectedItem.match_score}% Algorithmic Match</div>
                        <div><strong>Value / Score:</strong> {selectedItem.compensation}</div>
                        <div><strong>Timeline:</strong> {selectedItem.deadline}</div>
                      </div>

                      <button
                        className="btn-primary-glow"
                        onClick={() => {
                          setActiveScreenId('assistant');
                          triggerToast(`Switched to AI Generator for "${selectedItem.title}"`);
                        }}
                        style={{ width: '100%', padding: '0.7rem', fontSize: '0.85rem' }}
                      >
                        ✨ Launch AI Generator
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Select any workstream item from the feed to inspect live prototype attributes and actions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: DISCOVERY / SEARCH EXPLORER */}
          {activeScreenId === 'discovery' && (
            <div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
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

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {availableFilters.map((flt) => (
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

              {/* Grid of Personalized Items */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filteredEntities.map((item) => (
                  <div
                    key={item.id}
                    className="detail-section-card"
                    style={{
                      borderTop: `3px solid ${item.match_score >= 92 ? '#10B981' : '#00F0FF'}`,
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
                        <div><strong>Metrics / Output:</strong> {item.compensation}</div>
                        <div><strong>Status & Timeline:</strong> {item.status} ({item.deadline})</div>
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
                        ✨ Optimize Now
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
                    {spec.app_name} Workflow Pipeline
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Live state transitions tracking operations from ingestion to completed execution.
                  </p>
                </div>

                <button
                  className="btn-secondary-glass"
                  onClick={() => triggerToast(`✓ Added new workstream item to ${spec.app_name} pipeline!`)}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                >
                  + Add Item
                </button>
              </div>

              {/* Dynamic Kanban Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {kanbanColumns.map((col, idx) => {
                  const colors = ['#38BDF8', '#FB923C', '#8B5CF6', '#10B981'];
                  const colColor = colors[idx % colors.length];
                  const assignedItem = entities[idx % entities.length];

                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(5, 8, 16, 0.7)',
                        borderRadius: '10px',
                        border: `1px solid ${colColor}44`,
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: colColor, fontWeight: '700', fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>
                          {col.column || col.title}
                        </span>
                        <span style={{ background: `${colColor}22`, color: colColor, padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                          {col.count || 5}
                        </span>
                      </div>

                      {assignedItem && (
                        <div
                          onClick={() => triggerToast(`Clicked Pipeline Card: ${assignedItem.title}`)}
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
                            {assignedItem.title}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            {assignedItem.company}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                            <span style={{ color: '#10B981', fontSize: '0.72rem', fontWeight: '700' }}>{assignedItem.compensation}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{assignedItem.deadline}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 4: AI INTELLIGENCE GENERATOR */}
          {activeScreenId === 'assistant' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="detail-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="detail-section-title">
                    <span>✨</span>
                    <span>{formTitle}</span>
                  </div>
                  <EvidenceBadge type="RECOMMENDATION" />
                </div>

                <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Target Workstream / Entity
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
                      Generation Tone & Execution Persona
                    </label>
                    <select style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(5, 8, 16, 0.8)', border: '1px solid var(--border-subtle)', color: '#fff', fontFamily: 'var(--font-display)' }}>
                      <option>Technical & Rigorous (AI Engineer / System Architect)</option>
                      <option>Strategic & Executive (Founder / Product Leader)</option>
                      <option>Rapid & Automated (Autonomous Agent)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Specific Constraints & Key Parameters
                    </label>
                    <textarea
                      rows={3}
                      placeholder={`e.g. Optimize for high accuracy, low latency, and tailored parameters for ${spec.app_name}...`}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(5, 8, 16, 0.8)', border: '1px solid var(--border-subtle)', color: '#fff', fontFamily: 'var(--font-display)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn-primary-glow"
                    style={{ padding: '0.85rem', fontSize: '0.95rem' }}
                  >
                    {isGenerating ? `⚡ Synthesizing Intelligence for ${spec.app_name}...` : `✨ Execute AI Generation for ${spec.app_name}`}
                  </button>
                </form>

                {/* Generated Output Box */}
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
                        onClick={() => triggerToast(`✓ Exported ${spec.app_name} package to live pipeline!`)}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                      >
                        📤 Submit / Deploy Package
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
                  <span>{spec.app_name} FUNNEL VELOCITY & PERFORMANCE TELEMETRY</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {analyticsBars.map((bar, i) => {
                    const colors = ['#38BDF8', '#00F0FF', '#FB923C', '#8B5CF6', '#10B981'];
                    const color = colors[i % colors.length];
                    const maxVal = analyticsBars[0]?.value || 500;
                    const pct = Math.max(Math.round((bar.value / maxVal) * 100), 6);

                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: '#fff' }}>{bar.label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: color, fontWeight: '700' }}>
                            {bar.value} items
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '5px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
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
