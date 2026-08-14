import { useState } from 'react';
import { motion } from 'motion/react';
import { useStartup } from '../state/startupState';

export default function IdeaIntake() {
  const { idea, setIdea, submitIdea, loading } = useStartup();
  const [localIdea, setLocalIdea] = useState(idea || '');

  const starterPrompts = [
    'An AI platform that helps college students discover and apply for relevant internships with automated resume tailoring.',
    'An autonomous DevOps agent that detects production latency spikes and auto-generates optimized SQL index migrations.',
    'A B2B SaaS workflow copilot for dental clinics that eliminates manual insurance claim denials and automates billing.',
    'A decentralized GPU marketplace allowing indie developers to rent underutilized gaming PCs for LLM fine-tuning.',
  ];

  const handleActivate = () => {
    if (!localIdea.trim() || loading) return;
    setIdea(localIdea);
    submitIdea(localIdea);
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleActivate();
    }
  };

  const handleSelectPrompt = (prompt) => {
    setLocalIdea(prompt);
  };

  return (
    <div className="intake-screen">
      <motion.div
        className="intake-console-card"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="intake-header">
          <div className="intake-step-tag">
            <span>●</span>
            <span>STEP 01 — VENTURE INTAKE CONSOLE</span>
          </div>
          <h2 className="intake-title">Tell FOUNDry what you're imagining.</h2>
          <p className="intake-subtitle">
            Don't write a business plan. Simply describe the core problem, target audience, or product
            concept in your own words.
          </p>
        </div>

        <div className="intake-input-box">
          <textarea
            className="intake-textarea"
            value={localIdea}
            onChange={(e) => setLocalIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. An AI platform that helps college students discover and apply for internships..."
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="intake-footer-row">
          <div className="char-counter">
            <span>{localIdea.length} characters</span>
            <span style={{ marginLeft: '0.75rem', opacity: 0.7 }}>[Press Ctrl+Enter to activate]</span>
          </div>

          <button
            className="btn-primary-glow"
            onClick={handleActivate}
            disabled={!localIdea.trim() || loading}
            style={{
              opacity: !localIdea.trim() || loading ? 0.5 : 1,
              cursor: !localIdea.trim() || loading ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{loading ? 'Initializing Workforce...' : 'Activate FOUNDry →'}</span>
          </button>
        </div>

        {/* Starter Prompts */}
        <div className="starter-prompts">
          <div className="starter-label">💡 OR SELECT AN EXAMPLE VENTURE THESIS:</div>
          <div className="starter-grid">
            {starterPrompts.map((p, idx) => (
              <button
                key={idx}
                className="starter-btn"
                onClick={() => handleSelectPrompt(p)}
              >
                "{p.slice(0, 52)}..."
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
