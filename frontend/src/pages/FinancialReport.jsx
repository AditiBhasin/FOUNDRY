import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStartup, AGENT_CONFIGS } from '../state/startupState';
import EvidenceBadge from '../components/EvidenceBadge';

export default function FinancialReport() {
  const { startupData, financialModel, recalculateFinance, setCurrentScreen, loading } = useStartup();

  const cfg = AGENT_CONFIGS.finance;

  // Local state for editable assumptions
  const [inputs, setInputs] = useState({
    customers: 50,
    arpu: 79.0,
    marketing_spend: 1500.0,
    new_customers: 15,
    gross_margin: 0.80,
    average_lifetime_months: 18.0,
    fixed_costs: 2500.0,
  });

  const [hasEdited, setHasEdited] = useState(false);

  // Sync with loaded backend financial model if present
  useEffect(() => {
    if (financialModel?.inputs) {
      setInputs((prev) => ({
        ...prev,
        customers: financialModel.inputs.customers ?? prev.customers,
        arpu: financialModel.inputs.arpu ?? prev.arpu,
        marketing_spend: financialModel.inputs.marketing_spend ?? prev.marketing_spend,
        new_customers: financialModel.inputs.new_customers ?? prev.new_customers,
        gross_margin: financialModel.inputs.gross_margin ?? prev.gross_margin,
        average_lifetime_months: financialModel.inputs.average_lifetime_months ?? prev.average_lifetime_months,
        fixed_costs: financialModel.inputs.fixed_costs ?? prev.fixed_costs,
      }));
    }
  }, [financialModel]);

  const handleChange = (field, val) => {
    setHasEdited(true);
    setInputs((prev) => ({
      ...prev,
      [field]: val === '' ? null : Number(val),
    }));
  };

  const handleRecalculate = (e) => {
    e?.preventDefault();
    recalculateFinance(inputs);
    setHasEdited(false);
  };

  // Extract formula metrics safely
  const mrr = financialModel?.mrr;
  const arr = financialModel?.annual_revenue;
  const cac = financialModel?.cac;
  const ltv = financialModel?.ltv;
  const ltvCac = financialModel?.ltv_to_cac;
  const beCust = financialModel?.breakeven_customers;
  const beRev = financialModel?.breakeven_revenue;

  const formulaRows = [
    { metric: mrr, fallbackName: 'Monthly Recurring Revenue (MRR)', fallbackFormula: 'Customers × ARPU' },
    { metric: arr, fallbackName: 'Annual Run Rate (ARR)', fallbackFormula: 'MRR × 12' },
    { metric: cac, fallbackName: 'Customer Acquisition Cost (CAC)', fallbackFormula: 'Marketing Spend / New Customers' },
    { metric: ltv, fallbackName: 'Customer Lifetime Value (LTV)', fallbackFormula: 'ARPU × Gross Margin × Avg Lifetime (Mo)' },
    { metric: ltvCac, fallbackName: 'LTV:CAC Capital Efficiency', fallbackFormula: 'LTV / CAC' },
    { metric: beCust, fallbackName: 'Break-even Customers', fallbackFormula: 'Fixed Costs / (ARPU × Gross Margin)' },
    { metric: beRev, fallbackName: 'Break-even Monthly Revenue', fallbackFormula: 'Fixed Costs / Gross Margin' },
  ];

  return (
    <div className="financial-report-screen" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <motion.div
        className="detail-header-card"
        style={{ '--agent-theme-color': cfg.color, marginBottom: '1.5rem' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="detail-top-bar">
          <div className="detail-agent-title">
            <span>{cfg.icon}</span>
            <span>DETERMINISTIC UNIT ECONOMICS & FINANCIAL MODEL</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary-glass" onClick={() => setCurrentScreen('research_report')}>
              ← Research
            </button>
            <button className="btn-primary-glow" onClick={() => setCurrentScreen('blueprint')}>
              Venture Blueprint →
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginTop: '0.5rem' }}>
          Pure mathematical calculations. Unknown inputs remain tagged as <strong>[ASSUMPTION]</strong>. Edit assumptions below for live recalculation.
        </p>
      </motion.div>

      {/* Grid: Editable Inputs on Left, Key Summary on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.4fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Editable Assumptions Panel */}
        <div className="detail-section-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="detail-section-title">
              <span style={{ color: cfg.color }}>⚙️</span>
              <span>FOUNDER ASSUMPTIONS</span>
            </div>
            <EvidenceBadge type="ASSUMPTION" />
          </div>

          <form onSubmit={handleRecalculate} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Active Customers */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Active Paying Customers (count)
              </label>
              <input
                type="number"
                value={inputs.customers ?? ''}
                onChange={(e) => handleChange('customers', e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(5, 8, 16, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. 50"
              />
            </div>

            {/* ARPU */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Average Monthly Revenue Per User / Account ($ ARPU)
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.arpu ?? ''}
                onChange={(e) => handleChange('arpu', e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(5, 8, 16, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. 79.00"
              />
            </div>

            {/* Marketing Spend */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Monthly Marketing & Acquisition Spend ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.marketing_spend ?? ''}
                onChange={(e) => handleChange('marketing_spend', e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(5, 8, 16, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. 1500.00"
              />
            </div>

            {/* New Customers Acquired */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                New Customers Acquired Per Month (count)
              </label>
              <input
                type="number"
                value={inputs.new_customers ?? ''}
                onChange={(e) => handleChange('new_customers', e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(5, 8, 16, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. 15"
              />
            </div>

            {/* Gross Margin */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Gross Margin Percentage (0.0 to 1.0, e.g. 0.80 = 80%)
              </label>
              <input
                type="number"
                step="0.01"
                max="1.0"
                min="0.0"
                value={inputs.gross_margin ?? ''}
                onChange={(e) => handleChange('gross_margin', e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(5, 8, 16, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. 0.80"
              />
            </div>

            {/* Lifetime (Months) */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Average Customer Retention Lifespan (Months)
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.average_lifetime_months ?? ''}
                onChange={(e) => handleChange('average_lifetime_months', e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(5, 8, 16, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. 18.0"
              />
            </div>

            {/* Fixed Costs */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Monthly Fixed Operating Overhead ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.fixed_costs ?? ''}
                onChange={(e) => handleChange('fixed_costs', e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(5, 8, 16, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. 2500.00"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: hasEdited ? '#10B981' : 'rgba(16, 185, 129, 0.2)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              {loading ? 'Recalculating...' : hasEdited ? '⚡ Recalculate Model Now' : '✓ Model Up to Date'}
            </button>
          </form>
        </div>

        {/* High-Level Unit Economics Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Key Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="detail-section-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PROJECTED MRR</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#10B981', margin: '0.4rem 0' }}>
                {mrr?.formatted_result || '$3,950.00'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>ARR: {arr?.formatted_result || '$47,400.00'}</div>
            </div>

            <div className="detail-section-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LTV : CAC RATIO</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: ltvCac?.result && ltvCac.result >= 3.0 ? '#10B981' : '#F59E0B', margin: '0.4rem 0' }}>
                {ltvCac?.formatted_result || '11.38x'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Healthy SaaS Benchmark ≥ 3.0x</div>
            </div>
          </div>

          {/* Break-even Summary Card */}
          <div className="detail-section-card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <span style={{ color: '#10B981', fontSize: '1.2rem' }}>🎯</span>
              <strong style={{ color: '#fff', fontSize: '1rem' }}>Break-Even Horizon</strong>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              To cover <strong>${inputs.fixed_costs?.toLocaleString() || '2,500'}/mo</strong> fixed overhead with <strong>{((inputs.gross_margin || 0.8) * 100).toFixed(0)}%</strong> margin, the venture requires <strong>{beCust?.formatted_result || '40 customers'}</strong> producing at least <strong>{beRev?.formatted_result || '$3,125.00/mo'}</strong> in revenue.
            </p>
          </div>

          {/* Finance Agent Recommendation */}
          <div className="detail-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="detail-section-title">
                <span style={{ color: '#38BDF8' }}>💡</span>
                <span>FINANCE AGENT STRATEGY</span>
              </div>
              <EvidenceBadge type="RECOMMENDATION" />
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {startupData?.finance?.financial_recommendation || 'Validate willingness to pay and initial customer acquisition channel velocity prior to scaling marketing spend.'}
            </p>
          </div>
        </div>
      </div>

      {/* INPUT → FORMULA → RESULT → INTERPRETATION Table */}
      <div className="detail-section-card" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>
            Formula Decomposition: [INPUT → FORMULA → RESULT → INTERPRETATION]
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Transparent deterministic unit economics logic audited by FOUNDry Finance Agent.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {formulaRows.map((row, idx) => {
            const m = row.metric;
            const name = m?.name || row.fallbackName;
            const formula = m?.formula || row.fallbackFormula;
            const res = m?.formatted_result || 'UNSPECIFIED';
            const interp = m?.interpretation || 'Calculated deterministically from founder inputs.';
            const isCalc = m?.status === 'CALCULATED';

            return (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(5, 8, 16, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1.2fr) minmax(180px, 1.3fr) minmax(140px, 1fr) minmax(220px, 1.8fr)',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                {/* 1. INPUT / METRIC */}
                <div>
                  <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '700' }}>{name}</div>
                  <div style={{ marginTop: '0.3rem' }}>
                    <EvidenceBadge type={isCalc ? 'DATA' : 'ASSUMPTION'} />
                  </div>
                </div>

                {/* 2. FORMULA */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.08)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                  {formula}
                </div>

                {/* 3. RESULT */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: '800', color: isCalc ? '#10B981' : '#F59E0B' }}>
                  {res}
                </div>

                {/* 4. INTERPRETATION */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {interp}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-secondary-glass" onClick={() => setCurrentScreen('research_report')}>
          ← Back to Research
        </button>
        <button className="btn-primary-glow" onClick={() => setCurrentScreen('blueprint')}>
          Proceed to Venture Blueprint ➔
        </button>
      </div>
    </div>
  );
}
