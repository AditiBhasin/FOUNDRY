import { motion, AnimatePresence } from 'motion/react';

export default function ActivityFeed({ logs = [] }) {
  return (
    <div className="activity-log-scroll">
      <AnimatePresence initial={false}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.5rem' }}>
            Awaiting agent workforce telemetry...
          </div>
        ) : (
          logs.map((log) => (
            <motion.div
              key={log.id}
              className="log-entry-row"
              style={{ '--log-color': log.color || '#00F0FF' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="log-time">{log.timestamp}</span>
              <span className="log-routing">
                {log.from} ➔ {log.to}
              </span>
              <span className="log-msg" title={log.message}>
                {log.message}
              </span>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
