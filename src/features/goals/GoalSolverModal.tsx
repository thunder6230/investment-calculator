import { useState } from 'react';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { solveRequiredContribution, formatCurrency } from '../projection/projectionEngine';
import NumberInput from '../../components/common/NumberInput';

export default function GoalSolverModal() {
  const {
    isGoalSolverOpen,
    setIsGoalSolverOpen,
    startCapital,
    minRate,
    maxRate,
    juneExtra,
    decemberExtra,
    monthlyInvest,
    years: currentYears,
    handleApplyGoalSolution,
  } = useInvestmentPlanner();

  const [targetCapital, setTargetCapital] = useState<number>(500_000);
  const [targetYears, setTargetYears] = useState<number>(currentYears || 15);
  const avgRate = (minRate + maxRate) / 200;

  if (!isGoalSolverOpen) return null;

  const requiredMonthly = solveRequiredContribution(
    targetCapital,
    targetYears,
    startCapital,
    avgRate,
    juneExtra,
    decemberExtra
  );

  const totalPaidInEstimated = startCapital + (requiredMonthly * 12 + juneExtra + decemberExtra) * targetYears;
  const growthGained = Math.max(0, targetCapital - totalPaidInEstimated);

  return (
    <div className="modal-overlay" onClick={() => setIsGoalSolverOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🎯</span>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Reverse Wealth Goal Solver</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsGoalSolverOpen(false)}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.80rem', color: 'var(--muted)', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
          Define your target nest egg and desired horizon. The engine reverse-calculates the exact monthly contribution needed.
        </p>

        <NumberInput
          label="Target Net Worth / Portfolio Goal"
          value={targetCapital}
          onChange={setTargetCapital}
          prefix="€"
          step={10000}
          min={1000}
        />

        <div className="chip-group" style={{ marginTop: '-0.35rem', marginBottom: '1.1rem' }}>
          <span className="chip-label">Presets:</span>
          {[250_000, 500_000, 1_000_000, 2_000_000].map((preset) => (
            <button
              key={preset}
              type="button"
              className={`chip-btn ${targetCapital === preset ? 'active' : ''}`}
              onClick={() => setTargetCapital(preset)}
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>

        <NumberInput
          label="Target Timeframe (Years)"
          value={targetYears}
          onChange={setTargetYears}
          step={1}
          min={1}
          suffix="years"
        />

        <div className="chip-group" style={{ marginTop: '-0.35rem', marginBottom: '1.25rem' }}>
          <span className="chip-label">Quick Horizon:</span>
          {[5, 10, 15, 20, 25, 30].map((yr) => (
            <button
              key={yr}
              type="button"
              className={`chip-btn ${targetYears === yr ? 'active' : ''}`}
              onClick={() => setTargetYears(yr)}
            >
              {yr} yrs
            </button>
          ))}
        </div>

        {/* ── Calculation Solution Box ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.08))',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            padding: '1.1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--blue)', textTransform: 'uppercase' }}>
                Required Monthly Investment
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)', margin: '0.2rem 0' }}>
                {formatCurrency(requiredMonthly)} <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>/ month</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Current Setup</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--muted)' }}>
                {formatCurrency(monthlyInvest)}/mo
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.76rem' }}>
            <div>
              <span style={{ color: 'var(--muted)' }}>Your Contributions:</span>{' '}
              <strong style={{ color: 'var(--text)' }}>{formatCurrency(totalPaidInEstimated)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--muted)' }}>Compound Returns:</span>{' '}
              <strong style={{ color: 'var(--green)' }}>+{formatCurrency(growthGained)}</strong>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsGoalSolverOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleApplyGoalSolution(requiredMonthly, targetYears)}
          >
            ✨ Apply to My Plan ({formatCurrency(requiredMonthly)}/mo for {targetYears}y)
          </button>
        </div>
      </div>
    </div>
  );
}
