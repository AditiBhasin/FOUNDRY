import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  checkBackendHealth,
  submitStartupIdea,
  fetchStartupStatus,
  fetchStartupFullState,
  fetchStartupResult,
  retryStartupWorkflow,
  updateFinancialModelApi,
} from '../services/api';

const StartupContext = createContext(null);

/**
 * 6 Domain Agents Configuration with Strict Semantic Color Palette:
 * - Research: #38BDF8 (Sky Blue)
 * - Product:  #FB923C (Orange)
 * - CTO:      #00F0FF (Cyan)
 * - Finance:  #10B981 (Emerald)
 * - Growth:   #F59E0B (Amber - Flagged Not Yet Implemented, no fake output)
 * - QA:       #F43F5E (Rose Pink)
 */
export const AGENT_CONFIGS = {
  research: {
    key: 'research',
    name: 'RESEARCH AGENT',
    shortName: 'RESEARCH',
    role: 'Market & Competitive Intelligence (AI Inference)',
    color: '#38BDF8', // Sky Blue
    accentGlow: 'rgba(56, 189, 248, 0.35)',
    icon: '🔍',
    description: 'Analyzes target problems, customer segments, competitors, and market assumptions without pretending to have live web data.',
    outputKey: 'research',
    isImplemented: true,
  },
  product: {
    key: 'product',
    name: 'PRODUCT AGENT',
    shortName: 'PRODUCT',
    role: 'MVP Scoping & UX Architecture',
    color: '#FB923C', // Orange
    accentGlow: 'rgba(251, 146, 60, 0.35)',
    icon: '✨',
    description: 'Transforms market opportunities into lean MVP features, user flows, and structured MVPSpec prototypes.',
    outputKey: 'product',
    isImplemented: true,
  },
  cto: {
    key: 'cto',
    name: 'CTO AGENT',
    shortName: 'CTO / ENG',
    role: 'System Architecture & Tech Stack',
    color: '#00F0FF', // Cyan
    accentGlow: 'rgba(0, 240, 255, 0.35)',
    icon: '⚡',
    description: 'Designs frontend/backend architecture, database plans, API schemas, and technical build steps.',
    outputKey: 'technical_plan',
    isImplemented: true,
  },
  finance: {
    key: 'finance',
    name: 'FINANCE AGENT',
    shortName: 'FINANCE',
    role: 'Business Model & Unit Economics',
    color: '#10B981', // Emerald
    accentGlow: 'rgba(16, 185, 129, 0.35)',
    icon: '📈',
    description: 'Calculates deterministic unit economics (MRR, ARR, CAC, LTV, Break-even) and flags assumptions.',
    outputKey: 'finance',
    isImplemented: true,
  },
  growth: {
    key: 'growth',
    name: 'GROWTH AGENT',
    shortName: 'GROWTH',
    role: 'GTM Strategy & Acquisition Loops (Planned)',
    color: '#F59E0B', // Amber
    accentGlow: 'rgba(245, 158, 11, 0.35)',
    icon: '🚀',
    description: 'Go-to-market positioning and acquisition strategy (Architectural domain agent planned for upcoming release).',
    outputKey: 'growth',
    isImplemented: false, // Explicitly marked as not yet implemented
  },
  qa: {
    key: 'qa',
    name: 'QA & VALIDATION AGENT',
    shortName: 'QA / VALIDATION',
    role: 'Risk Audit & Readiness Scoring',
    color: '#F43F5E', // Rose Pink
    accentGlow: 'rgba(244, 63, 94, 0.35)',
    icon: '🛡️',
    description: 'Audits unvalidated assumptions, checks technical/business risks, and calculates the Build Readiness Score.',
    outputKey: 'qa',
    isImplemented: true,
  },
};

export function StartupProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [idea, setIdea] = useState('');
  const [startupId, setStartupId] = useState(null);
  
  // Real Backend State
  const [workflowStatus, setWorkflowStatus] = useState(null); // /ideas/{id}/status
  const [startupFullState, setStartupFullState] = useState(null); // /ideas/{id}
  const [finalResult, setFinalResult] = useState(null); // /ideas/{id}/result
  
  const [selectedAgent, setSelectedAgent] = useState('research');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendHealth, setBackendHealth] = useState({ healthy: false, checked: false });
  const [activityLogs, setActivityLogs] = useState([]);
  const [activeTelemetry, setActiveTelemetry] = useState('FOUNDry AI Operating System Initialized.');

  const pollingRef = useRef(null);
  const previousStageRef = useRef(null);

  // Helper to add activity log
  const addLog = useCallback((from, to, message, type = 'info', color = '#00F0FF') => {
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      from,
      to,
      message,
      type,
      color,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setActivityLogs((prev) => [newLog, ...prev].slice(0, 50));
    setActiveTelemetry(`[${from} → ${to}]: ${message}`);
  }, []);

  // Periodic Backend Health Check
  const checkHealth = useCallback(async () => {
    const health = await checkBackendHealth();
    setBackendHealth({ healthy: health.healthy, checked: true, error: health.error });
    return health.healthy;
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Start True Backend Polling Loop (every 1.5 seconds)
  const startStatusPolling = useCallback((id) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    previousStageRef.current = null;

    pollingRef.current = setInterval(async () => {
      try {
        const statusData = await fetchStartupStatus(id);
        setWorkflowStatus(statusData);

        // Fetch intermediate full state periodically to populate live views
        if (statusData.status === 'running') {
          try {
            const intermediateState = await fetchStartupFullState(id);
            setStartupFullState(intermediateState);
          } catch (e) {
            // Ignore temporary polling glitch
          }
        }

        // Record Stage Change Log if updated
        if (statusData.current_stage && statusData.current_stage !== previousStageRef.current) {
          const prev = previousStageRef.current || 'initialized';
          previousStageRef.current = statusData.current_stage;

          const agentName = statusData.current_agent
            ? AGENT_CONFIGS[statusData.current_agent]?.shortName || statusData.current_agent.toUpperCase()
            : 'FOUNDry CORE';

          addLog(
            'ORCHESTRATOR',
            agentName,
            `Stage updated to '${statusData.current_stage}' (Progress: ${statusData.progress_percent}%)`,
            'system',
            statusData.current_agent ? AGENT_CONFIGS[statusData.current_agent]?.color || '#00F0FF' : '#38BDF8'
          );
        }

        // On Workflow Completed
        if (statusData.status === 'completed') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          addLog('FOUNDry CORE', 'WORKFORCE', 'Multi-agent workflow completed. Fetching synthesized build plan & MVP Spec...', 'success', '#10B981');

          // Fetch full internal state and final result
          try {
            const [fullState, resultData] = await Promise.all([
              fetchStartupFullState(id),
              fetchStartupResult(id),
            ]);
            setStartupFullState(fullState);
            setFinalResult(resultData);
            addLog('FOUNDry CORE', 'ALL AGENTS', 'Startup Blueprint & Interactive MVP Playground ready.', 'success', '#00F0FF');
          } catch (fetchErr) {
            console.error('Error fetching final state:', fetchErr);
            setError(`Completed with data fetch error: ${fetchErr.message}`);
          }
        }

        // On Workflow Failed
        else if (statusData.status === 'failed') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          const failureReason = statusData.error || 'Workflow failed during execution in backend.';
          setError(failureReason);
          addLog('FOUNDry CORE', 'ALERT', `Workflow execution failed: ${failureReason}`, 'error', '#F43F5E');
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError(`Connection to backend interrupted: ${err.message}`);
      }
    }, 1500);
  }, [addLog]);

  // Submit Startup Idea
  const submitIdea = async (ideaText) => {
    const trimmed = ideaText.trim();
    if (!trimmed) return;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    setIdea(trimmed);
    setLoading(true);
    setError(null);
    setStartupFullState(null);
    setFinalResult(null);
    setWorkflowStatus(null);
    setActivityLogs([]);
    setCurrentScreen('activation');

    addLog('FOUNDry CORE', 'ORCHESTRATOR', `Submitting venture thesis to backend: "${trimmed.slice(0, 50)}..."`, 'system', '#00F0FF');

    try {
      const initData = await submitStartupIdea(trimmed);
      setStartupId(initData.id);

      addLog('FOUNDry CORE', 'WORKFORCE', `Workflow registered with ID: ${initData.id}. Status: ${initData.status}`, 'system', '#38BDF8');

      // Begin polling real backend status
      startStatusPolling(initData.id);
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.message);
      addLog('FOUNDry CORE', 'ERROR', `Failed to start workflow: ${err.message}`, 'error', '#F43F5E');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate Finance Model with custom founder inputs
  const recalculateFinance = async (inputs) => {
    if (!startupId) return;
    try {
      setLoading(true);
      const res = await updateFinancialModelApi(startupId, inputs);
      if (res && res.financial_model) {
        setStartupFullState((prev) => prev ? { ...prev, financial_model: res.financial_model } : prev);
        setFinalResult((prev) => prev ? { ...prev, financial_model: res.financial_model } : prev);
        addLog('FOUNDry FINANCE', 'USER', 'Recalculated deterministic unit economics with updated assumptions.', 'success', '#10B981');
      }
    } catch (err) {
      console.error('Failed to update financial assumptions:', err);
      setError(`Finance update error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Retry Failed Workflow
  const handleRetry = async () => {
    if (!startupId) {
      if (idea) submitIdea(idea);
      return;
    }

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    try {
      setLoading(true);
      setError(null);
      addLog('FOUNDry CORE', 'ORCHESTRATOR', `Triggering retry for workflow: ${startupId}...`, 'system', '#38BDF8');
      
      await retryStartupWorkflow(startupId);
      startStatusPolling(startupId);
    } catch (err) {
      console.error('Retry failed:', err);
      setError(`Retry failed: ${err.message}`);
      addLog('FOUNDry CORE', 'ERROR', `Retry error: ${err.message}`, 'error', '#F43F5E');
    } finally {
      setLoading(false);
    }
  };

  // Reset entire application
  const resetApp = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setCurrentScreen('landing');
    setIdea('');
    setStartupId(null);
    setWorkflowStatus(null);
    setStartupFullState(null);
    setFinalResult(null);
    setActivityLogs([]);
    setError(null);
    setLoading(false);
    previousStageRef.current = null;
  };

  const inspectAgent = (agentKey) => {
    setSelectedAgent(agentKey);
    setCurrentScreen('agent_detail');
  };

  // Convenience aliases
  const startupData = startupFullState;
  const financialModel = startupFullState?.financial_model || finalResult?.financial_model || null;
  const mvpSpec = startupFullState?.mvp_spec || finalResult?.mvp_spec || null;
  const evidence = startupFullState?.evidence || finalResult?.evidence || [];
  const webResearchAvailable = workflowStatus?.web_research_available ?? startupFullState?.web_research_available ?? false;

  return (
    <StartupContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        idea,
        setIdea,
        startupId,
        
        // Truthful backend state
        workflowStatus,
        startupFullState,
        startupData,
        finalResult,
        financialModel,
        mvpSpec,
        evidence,
        webResearchAvailable,
        
        // Convenience state mapped to real backend polling
        currentAgent: workflowStatus?.current_agent || null,
        progressPercent: workflowStatus?.progress_percent || 0,
        completedAgents: workflowStatus?.completed_agents || [],
        buildReadinessScore: workflowStatus?.build_readiness_score ?? startupFullState?.qa?.build_readiness_score ?? null,
        hasFinalPlan: workflowStatus?.has_final_plan || Boolean(finalResult?.final_build_plan),
        agentStates: workflowStatus?.agents || {},
        currentStage: workflowStatus?.current_stage || 'idle',
        
        selectedAgent,
        setSelectedAgent,
        inspectAgent,
        
        loading,
        error,
        backendHealth,
        activityLogs,
        activeTelemetry,
        
        submitIdea,
        resetApp,
        handleRetry,
        recalculateFinance,
        addLog,
        checkHealth,
      }}
    >
      {children}
    </StartupContext.Provider>
  );
}

export function useStartup() {
  const context = useContext(StartupContext);
  if (!context) {
    throw new Error('useStartup must be used within a StartupProvider');
  }
  return context;
}
