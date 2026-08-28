import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { formatCurrency } from '../projection/projectionEngine';
import SliderInput from '../../components/common/SliderInput';

export default function FIRESection() {
  const {
    fireMetrics,
    safeWithdrawalRate,
    setSafeWithdrawalRate,
    startCapital,
    lastPoint,
    years,
    displayProjection,
  } = useInvestmentPlanner();

  const finalPortfolio = lastPoint ? lastPoint.midpoint : startCapital;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── Top Hero Card ── */}
      <section className="card" style={{ borderLeft: '4px solid var(--orange, #f59e0b)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🔥</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>FIRE &amp; Freedom Horizon</h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
              Calculates when your compounding returns can permanently fund 100% of your living expenses.
            </p>
          </div>

          <div style={{ background: 'var(--surface2)', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Monthly Living Costs</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{formatCurrency(fireMetrics.monthlyExpenses)}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--muted)', display: 'block' }}>({formatCurrency(fireMetrics.annualExpenses)} / yr)</span>
          </div>
        </div>

        {/* ── Status Banner ── */}
        <div
          style={{
            margin: '1.25rem 0 1rem 0',
            padding: '1rem',
            borderRadius: '10px',
            background: fireMetrics.isFireAchieved
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.05))'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.05))',
            border: fireMetrics.isFireAchieved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', color: fireMetrics.isFireAchieved ? 'var(--green)' : 'var(--yellow)' }}>
              {fireMetrics.isFireAchieved ? '🎉 Financial Independence Achievable!' : '⏳ Target in Progress'}
            </span>
            <h3 style={{ margin: '0.2rem 0', fontSize: '1.3rem', color: 'var(--text)' }}>
              {fireMetrics.isFireAchieved
                ? `Freedom Reached at Year ${fireMetrics.freedomYear}`
                : `Reaches ${fireMetrics.endProgressPercent}% of FIRE goal in ${years} yrs`}
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--muted)', margin: 0 }}>
              {fireMetrics.isFireAchieved
                ? `At Year ${fireMetrics.freedomYear}, your portfolio reaches ${formatCurrency(fireMetrics.targetFireNumber)}, generating ${formatCurrency(fireMetrics.monthlyExpenses)}/mo at a ${safeWithdrawalRate}% Safe Withdrawal Rate.`
                : `Your final projected portfolio of ${formatCurrency(finalPortfolio)} will generate ~${formatCurrency(fireMetrics.monthlyPassiveIncomeAtEnd)}/mo passive income.`}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Current / Goal</span>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)' }}>
              {formatCurrency(finalPortfolio)} <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>/ {formatCurrency(fireMetrics.targetFireNumber)}</span>
            </div>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>
            <span>FIRE Goal Progress</span>
            <strong>{fireMetrics.endProgressPercent}% Funded</strong>
          </div>
          <div style={{ height: '10px', background: 'var(--surface2)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, fireMetrics.endProgressPercent)}%`,
                background: fireMetrics.isFireAchieved
                  ? 'linear-gradient(90deg, var(--blue), var(--green))'
                  : 'linear-gradient(90deg, var(--blue), var(--yellow))',
                borderRadius: '5px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* ── Safe Withdrawal Rate Slider ── */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <SliderInput
              label="Safe Withdrawal Rate (SWR)"
              value={safeWithdrawalRate}
              onChange={setSafeWithdrawalRate}
              min={2.5}
              max={6.0}
              step={0.1}
              suffix="%"
              formatValue={(v) => v.toFixed(1)}
            />
          </div>
          <div className="chip-group" style={{ marginTop: '-0.25rem' }}>
            <span className="chip-label">Quick Presets:</span>
            <button
              type="button"
              className={`chip-btn ${safeWithdrawalRate === 3.5 ? 'active' : ''}`}
              onClick={() => setSafeWithdrawalRate(3.5)}
            >
              3.5% (Conservative)
            </button>
            <button
              type="button"
              className={`chip-btn ${safeWithdrawalRate === 4.0 ? 'active' : ''}`}
              onClick={() => setSafeWithdrawalRate(4.0)}
            >
              4.0% (Trinity Rule)
            </button>
            <button
              type="button"
              className={`chip-btn ${safeWithdrawalRate === 4.5 ? 'active' : ''}`}
              onClick={() => setSafeWithdrawalRate(4.5)}
            >
              4.5% (Dynamic / Flexible)
            </button>
          </div>
        </div>
      </section>

      {/* ── 4 FIRE Milestones Cards ── */}
      <div className="summary-grid">
        {/* Coast FIRE */}
        <div className="summary-card blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="summary-label">🏝️ Coast FIRE</span>
            <span className="badge badge-info">Start Capital</span>
          </div>
          <span className="summary-value" style={{ color: 'var(--blue)' }}>{formatCurrency(fireMetrics.coastFireNumber)}</span>
          <p style={{ fontSize: '0.70rem', color: 'var(--muted)', margin: 0, lineHeight: '1.3' }}>
            If you already have this much invested today, it will compound to full FIRE in {years} years with €0 further monthly deposits.
          </p>
        </div>

        {/* Lean FIRE */}
        <div className="summary-card teal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="summary-label">⛺ Lean FIRE (75%)</span>
            <span className="badge">Basic Needs Only</span>
          </div>
          <span className="summary-value" style={{ color: 'var(--teal)' }}>{formatCurrency(fireMetrics.leanFireNumber)}</span>
          <p style={{ fontSize: '0.70rem', color: 'var(--muted)', margin: 0, lineHeight: '1.3' }}>
            Provides {formatCurrency(Math.round(fireMetrics.monthlyExpenses * 0.75))}/mo passive income. Enough to cover strictly essential needs and housing.
          </p>
        </div>

        {/* Standard FIRE */}
        <div className="summary-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="summary-label">🎯 Full FIRE (100%)</span>
            <span className="badge badge-success">Target</span>
          </div>
          <span className="summary-value" style={{ color: 'var(--green)' }}>{formatCurrency(fireMetrics.targetFireNumber)}</span>
          <p style={{ fontSize: '0.70rem', color: 'var(--muted)', margin: 0, lineHeight: '1.3' }}>
            Fully replaces your current lifestyle: {formatCurrency(fireMetrics.monthlyExpenses)}/mo indefinitely with zero reduction in living standard.
          </p>
        </div>

        {/* Fat FIRE */}
        <div className="summary-card yellow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="summary-label">💎 Fat FIRE (125%)</span>
            <span className="badge">Luxury &amp; Buffer</span>
          </div>
          <span className="summary-value" style={{ color: 'var(--yellow)' }}>{formatCurrency(fireMetrics.fatFireNumber)}</span>
          <p style={{ fontSize: '0.70rem', color: 'var(--muted)', margin: 0, lineHeight: '1.3' }}>
            Provides {formatCurrency(Math.round(fireMetrics.monthlyExpenses * 1.25))}/mo. Includes an extra 25% buffer for frequent travel, hobbies, and peace of mind.
          </p>
        </div>
      </div>

      {/* ── Timeline Crossover Table / Analysis ── */}
      <section className="card">
        <h3 className="section-title" style={{ fontSize: '0.92rem', marginBottom: '0.75rem' }}>
          📈 Freedom Year-by-Year Passive Income Trajectory
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="projection-table" style={{ fontSize: '0.80rem' }}>
            <thead>
              <tr>
                <th>Year</th>
                <th>Portfolio Midpoint</th>
                <th>Monthly Passive Income ({safeWithdrawalRate}%)</th>
                <th>Living Cost Coverage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayProjection.dataPoints.filter((dp) => dp.year % 2 === 0 || dp.year === fireMetrics.freedomYear || dp.year === years).map((dp) => {
                const passiveMonthly = Math.round((dp.midpoint * (safeWithdrawalRate / 100)) / 12);
                const coveragePercent = Math.round((passiveMonthly / fireMetrics.monthlyExpenses) * 100);
                const isMilestoneHit = dp.year === fireMetrics.freedomYear;

                return (
                  <tr key={dp.year} style={isMilestoneHit ? { background: 'rgba(16, 185, 129, 0.12)', fontWeight: '700' } : {}}>
                    <td>Year {dp.year}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text)' }}>{formatCurrency(dp.midpoint)}</td>
                    <td style={{ color: 'var(--green)', fontWeight: '600' }}>{formatCurrency(passiveMonthly)} / mo</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, coveragePercent)}%`,
                              height: '100%',
                              background: coveragePercent >= 100 ? 'var(--green)' : 'var(--yellow)',
                            }}
                          />
                        </div>
                        <span>{coveragePercent}%</span>
                      </div>
                    </td>
                    <td>
                      {isMilestoneHit ? (
                        <span className="badge badge-success">🔥 Freedom Year!</span>
                      ) : coveragePercent >= 100 ? (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--green)' }}>✓ Self-Sustaining</span>
                      ) : coveragePercent >= 75 ? (
                        <span className="badge" style={{ background: 'rgba(20, 184, 166, 0.2)', color: 'var(--teal)' }}>⛺ Lean FIRE</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>Building</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
