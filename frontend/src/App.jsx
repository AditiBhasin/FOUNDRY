import { motion, AnimatePresence } from 'motion/react';
import './index.css';
import { StartupProvider, useStartup } from './state/startupState';
import BackgroundEffects from './components/BackgroundEffects';
import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import IdeaIntake from './pages/IdeaIntake';
import WorkforceActivation from './pages/WorkforceActivation';
import WorkforceWorkspace from './pages/WorkforceWorkspace';
import AgentDetail from './pages/AgentDetail';
import Synthesis from './pages/Synthesis';
import ResearchReport from './pages/ResearchReport';
import FinancialReport from './pages/FinancialReport';
import StartupBlueprint from './pages/StartupBlueprint';
import MVPPlayground from './pages/MVPPlayground';
import Execution from './pages/Execution';

function MainRouter() {
  const { currentScreen } = useStartup();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <Landing key="landing" />;
      case 'intake':
        return <IdeaIntake key="intake" />;
      case 'activation':
        return <WorkforceActivation key="activation" />;
      case 'workspace':
        return <WorkforceWorkspace key="workspace" />;
      case 'agent_detail':
        return <AgentDetail key="agent_detail" />;
      case 'synthesis':
        return <Synthesis key="synthesis" />;
      case 'research_report':
        return <ResearchReport key="research_report" />;
      case 'financial_report':
        return <FinancialReport key="financial_report" />;
      case 'blueprint':
        return <StartupBlueprint key="blueprint" />;
      case 'mvp_playground':
        return <MVPPlayground key="mvp_playground" />;
      case 'execution':
        return <Execution key="execution" />;
      default:
        return <Landing key="landing" />;
    }
  };

  return (
    <div className="app-container">
      {/* Animated Ambient Lighting & Matrix Grid */}
      <BackgroundEffects />

      {/* Global AI Operating System Navigation Bar */}
      <Navbar />

      {/* Dynamic Screen Viewport with Choreographed Motion Transitions */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            className="screen-wrapper"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StartupProvider>
      <MainRouter />
    </StartupProvider>
  );
}