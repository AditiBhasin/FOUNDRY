import { useStartup } from '../state/startupState';

export default function Navbar() {
  const { currentScreen, setCurrentScreen, backendHealth, resetApp } = useStartup();

  const screens = [
    { id: 'landing', label: '1. Landing' },
    { id: 'intake', label: '2. Intake' },
    { id: 'activation', label: '3. Activation' },
    { id: 'workspace', label: '4. Workspace' },
    { id: 'agent_detail', label: '5. Agents' },
    { id: 'synthesis', label: '6. Synthesis' },
    { id: 'research_report', label: '7. Research & Data' },
    { id: 'financial_report', label: '8. Finance' },
    { id: 'blueprint', label: '9. Blueprint' },
    { id: 'mvp_playground', label: '10. MVP Prototype' },
    { id: 'execution', label: '11. Build & Code' },
  ];

  const screenNames = {
    landing: 'LANDING CORE',
    intake: 'IDEA INTAKE CONSOLE',
    activation: 'WORKFORCE ACTIVATION',
    workspace: 'LIVE MULTI-AGENT WORKSPACE',
    agent_detail: 'SPECIALIZED AGENT INSPECTOR',
    synthesis: 'CEO MULTI-AGENT SYNTHESIS',
    research_report: 'RESEARCH INTELLIGENCE & EVIDENCE',
    financial_report: 'DETERMINISTIC FINANCIAL MODEL',
    blueprint: 'MASTER STARTUP BLUEPRINT',
    mvp_playground: 'AI-GENERATED MVP PROTOTYPE',
    execution: 'BUILD & EXECUTION ENGINE',
  };

  return (
    <header className="app-navbar">
      {/* Brand */}
      <div className="nav-brand" onClick={resetApp} style={{ cursor: 'pointer' }}>
        <div className="brand-icon-wrap">
          <span className="brand-symbol">F</span>
        </div>
        <div className="brand-title">
          FOUND<span>ry</span>
        </div>
      </div>

      {/* Breadcrumb State Display */}
      <div className="nav-breadcrumbs">
        <span className="breadcrumb-tag">STAGE:</span>
        <span className="breadcrumb-active">{screenNames[currentScreen] || currentScreen.toUpperCase()}</span>
      </div>

      {/* Screen Navigation Menu (Enables effortless judge evaluation across all 11 stages) */}
      <div className="nav-screens-menu" style={{ overflowX: 'auto', maxWidth: '60vw', scrollbarWidth: 'none' }}>
        {screens.map((s) => (
          <button
            key={s.id}
            className={`nav-screen-btn ${currentScreen === s.id ? 'active' : ''}`}
            onClick={() => setCurrentScreen(s.id)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Actions & Health */}
      <div className="nav-actions">
        <div className={`health-badge ${backendHealth.healthy ? '' : 'offline'}`}>
          <span className="health-dot" />
          <span>{backendHealth.healthy ? 'Ollama Online' : 'FastAPI Offline'}</span>
        </div>

        <button className="btn-reset" onClick={resetApp} title="Reset to Start">
          ↺ Reset
        </button>
      </div>
    </header>
  );
}