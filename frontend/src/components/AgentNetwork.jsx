import { motion } from 'motion/react';
import { AGENT_CONFIGS } from '../state/startupState';

export default function AgentNetwork({
  activeAgentKey = 'research',
  completedAgents = ['research', 'product', 'cto', 'finance', 'growth', 'qa'],
  onSelectAgent,
  width = 620,
  height = 440,
}) {
  const agentKeys = ['research', 'product', 'cto', 'finance', 'growth', 'qa'];

  // Node positions arranged in an elliptical orbit
  const positions = {
    research: { x: 130, y: 90 },
    product: { x: 310, y: 60 },
    cto: { x: 490, y: 90 },
    finance: { x: 500, y: 310 },
    growth: { x: 310, y: 360 },
    qa: { x: 120, y: 310 },
  };

  const corePos = { x: 310, y: 210 };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 620 440"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          overflow: 'visible',
        }}
      >
        <defs>
          <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Orbit Ellipse Guide */}
        <ellipse
          cx={corePos.x}
          cy={corePos.y}
          rx="210"
          ry="150"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Connection Curves from Core to Nodes */}
        {agentKeys.map((key) => {
          const p = positions[key];
          const cfg = AGENT_CONFIGS[key];
          const isActive = activeAgentKey === key;
          const isCompleted = completedAgents.includes(key);

          return (
            <g key={`conn-${key}`}>
              <path
                d={`M ${corePos.x} ${corePos.y} Q ${(corePos.x + p.x) / 2} ${(corePos.y + p.y) / 2 - 15} ${p.x} ${p.y}`}
                fill="none"
                stroke={isActive ? cfg.color : isCompleted ? 'rgba(0, 240, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}
                strokeWidth={isActive ? '2.5' : '1.5'}
                filter={isActive ? 'url(#glow-filter)' : 'none'}
              />

              {/* Animated Glowing Packet */}
              {(isActive || isCompleted) && (
                <circle r={isActive ? '4' : '2.5'} fill={cfg.color}>
                  <animateMotion
                    path={`M ${corePos.x} ${corePos.y} Q ${(corePos.x + p.x) / 2} ${(corePos.y + p.y) / 2 - 15} ${p.x} ${p.y}`}
                    dur={isActive ? '1.8s' : '3.5s'}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Inter-Agent Sequenced Data Bridges */}
        <path
          d={`M ${positions.research.x} ${positions.research.y} L ${positions.product.x} ${positions.product.y} L ${positions.cto.x} ${positions.cto.y} L ${positions.finance.x} ${positions.finance.y} L ${positions.growth.x} ${positions.growth.y} L ${positions.qa.x} ${positions.qa.y} Z`}
          fill="none"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        {/* Central Core Circle */}
        <g
          transform={`translate(${corePos.x}, ${corePos.y})`}
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectAgent?.('research')}
        >
          <circle r="46" fill="rgba(0, 240, 255, 0.1)" />
          <circle
            r="38"
            fill="#0b0f20"
            stroke="url(#core-grad)"
            strokeWidth="2.5"
            filter="url(#glow-filter)"
          />
          <text
            y="2"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="800"
            fontSize="18"
          >
            FOUNDry
          </text>
          <text
            y="18"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#00F0FF"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="600"
            fontSize="8"
            letterSpacing="0.1em"
          >
            CORE OS
          </text>
        </g>

        {/* Agent Nodes */}
        {agentKeys.map((key) => {
          const p = positions[key];
          const cfg = AGENT_CONFIGS[key];
          const isActive = activeAgentKey === key;
          const isCompleted = completedAgents.includes(key);

          return (
            <g
              key={`node-${key}`}
              transform={`translate(${p.x}, ${p.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectAgent?.(key)}
            >
              {/* Outer Pulse Ring if Active */}
              {isActive && (
                <circle
                  r="34"
                  fill="none"
                  stroke={cfg.color}
                  strokeWidth="1.5"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="28;40;28"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0.1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Node Body */}
              <circle
                r="26"
                fill="#0a0e1c"
                stroke={isActive ? cfg.color : isCompleted ? cfg.color : 'rgba(255, 255, 255, 0.2)'}
                strokeWidth={isActive ? '2.5' : '1.5'}
                filter={isActive ? 'url(#glow-filter)' : 'none'}
              />

              {/* Node Icon */}
              <text
                y="-3"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
              >
                {cfg.icon}
              </text>

              {/* Node Label Below */}
              <text
                y="14"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? '#ffffff' : '#cbd5e1'}
                fontFamily="'Space Grotesk', sans-serif"
                fontWeight="700"
                fontSize="8.5"
                letterSpacing="0.04em"
              >
                {cfg.shortName}
              </text>

              {/* Status Dot */}
              <circle
                cx="18"
                cy="-18"
                r="4.5"
                fill={isCompleted ? '#10B981' : isActive ? '#00F0FF' : '#64748B'}
                stroke="#05070D"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
