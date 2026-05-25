import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { formatCurrency } from '../projection/projectionEngine';

export default function BudgetRecommendations() {
  const {
    taxResult,
    needsPercent,
    savingsPercent,
    wantsPercent,
    bufferPercent,
    activeFixedCosts,
    activeMonthlyInvest,
    activeTotalMonthlySavings,
    lifeInsurance,
    loanRepayment,
    budgetYear,
    setBudgetYear,
    projection,
    years,
    idealProjection,
    lastPoint,
    expenseMode,
  } = useInvestmentPlanner();

  return (
    <div className="card health-card">
      <h2 className="section-title">🎯 Financial Health &amp; Budgeting Recommendations</h2>
      
      <div className="health-content">
        <div className="health-left">
          <p className="health-desc">
            Based on your <strong>true monthly net ({formatCurrency(taxResult.netRegularMonthly)})</strong>, here is how your budgeting and investments compare against the standard <strong>50/30/20 financial rule</strong>:
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.85rem 0 0.5rem 0', background: 'var(--surface2)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap' }}>
              🔮 Forecast Budget in:
            </label>
            <select
              value={budgetYear}
              onChange={(e) => setBudgetYear(Number(e.target.value))}
              style={{
                flex: 1,
                padding: '0.3rem 0.5rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={0}>Year 0 (Current Baseline)</option>
              {projection.dataPoints.filter(dp => dp.year > 0).map((dp) => {
                const hasMilestone = dp.milestonesTriggered && dp.milestonesTriggered.length > 0;
                return (
                  <option key={dp.year} value={dp.year}>
                    Year {dp.year} {hasMilestone ? `🎉 (${dp.milestonesTriggered.map(m=>m.name).join(', ')})` : ''} (Invest: {formatCurrency(dp.monthlyContribActive)}/mo)
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className="budget-bar-container">
            <div className="budget-bar-segment needs" style={{ width: `${needsPercent}%` }} title={`Needs: ${needsPercent}%`}>
              {needsPercent >= 8 && `Needs: ${needsPercent}%`}
            </div>
            <div className="budget-bar-segment savings" style={{ width: `${savingsPercent}%` }} title={`Savings: ${savingsPercent}%`}>
              {savingsPercent >= 8 && `Savings: ${savingsPercent}%`}
            </div>
            <div className="budget-bar-segment wants" style={{ width: `${wantsPercent}%` }} title={`Wants: ${wantsPercent}%`}>
              {wantsPercent >= 8 && `Wants: ${wantsPercent}%`}
            </div>
            {bufferPercent > 0 && (
              <div className="budget-bar-segment buffer" style={{ width: `${bufferPercent}%` }} title={`Unallocated Buffer: ${bufferPercent}%`}>
                {bufferPercent >= 8 && `Buffer: ${bufferPercent}%`}
              </div>
            )}
          </div>
          
          <div className="budget-legend">
            <span className="legend-item"><span className="legend-dot needs" /> Needs (Ideal: ≤50%)</span>
            <span className="legend-item"><span className="legend-dot savings" /> Savings (Ideal: ≥20%)</span>
            <span className="legend-item"><span className="legend-dot wants" /> Wants (Ideal: ~30%)</span>
            {expenseMode === 'detailed' && (
              <span className="legend-item"><span className="legend-dot buffer" /> Unallocated Buffer (Ideal: 0%)</span>
            )}
          </div>

          <div className="budget-metrics">
            <div className="metric-box">
              <span className="metric-title">Fixed Costs (Needs)</span>
              <span className="metric-val">{formatCurrency(activeFixedCosts)}</span>
              <span className={`metric-badge ${needsPercent <= 50 ? 'bg-green' : needsPercent <= 60 ? 'bg-yellow' : 'bg-red'}`}>
                {needsPercent <= 50 ? '✅ Healthy' : needsPercent <= 60 ? '⚠️ High' : '🚨 Critical'}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-title">Savings Rate</span>
              <span className="metric-val" title={`${formatCurrency(activeMonthlyInvest)} portfolio + ${formatCurrency(lifeInsurance + loanRepayment)} other savings`}>
                {formatCurrency(activeTotalMonthlySavings)}
              </span>
              <span className={`metric-badge ${savingsPercent >= 20 ? 'bg-green' : savingsPercent >= 10 ? 'bg-yellow' : 'bg-red'}`}>
                {savingsPercent >= 20 ? '🚀 Wealth Builder' : savingsPercent >= 10 ? '👍 Good' : '⚠️ Low'}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-title">Emergency Fund Target</span>
              <span className="metric-val">{formatCurrency(activeFixedCosts * 3)} - {formatCurrency(activeFixedCosts * 6)}</span>
              <span className="metric-badge bg-blue">ℹ️ 3-6 months needs</span>
            </div>
          </div>
        </div>
        
        <div className="health-right">
          <h3 className="advice-title">💡 Personalized Recommendations (Year {budgetYear})</h3>
          <ul className="advice-list">
            {/* Needs Advice */}
            {needsPercent > 50 ? (
              <li>
                <strong>Optimize Fixed Costs:</strong> Your fixed costs consume {needsPercent}% of your net. Try lowering recurring bills (energy, internet) or reviewing housing/car choices to free up budget.
              </li>
            ) : (
              <li>
                <strong>Excellent Cost Control!</strong> Your fixed costs are at {needsPercent}%, well below the 50% limit. This gives you high financial security and major investing power.
              </li>
            )}
            
            {/* Savings Advice */}
            {savingsPercent < 20 ? (
              <li>
                <strong>Boost regular savings:</strong> You save {savingsPercent}% of net ({formatCurrency(activeTotalMonthlySavings)}/mo, comprising {formatCurrency(activeMonthlyInvest)} in the portfolio and {formatCurrency(lifeInsurance + loanRepayment)} in other products). Upgrading to the recommended 20% ({formatCurrency(Math.round(taxResult.netRegularMonthly * 0.2))}/mo) would boost your projected {years}-year midpoint portfolio by <strong>{formatCurrency(Math.max(0, idealProjection.dataPoints[idealProjection.dataPoints.length - 1].midpoint - lastPoint.midpoint))}</strong>!
              </li>
            ) : (
              <li>
                <strong>Supercharged Saver!</strong> You are saving {savingsPercent}% of your regular net ({formatCurrency(activeTotalMonthlySavings)}/mo, with {formatCurrency(activeMonthlyInvest)} in the portfolio and {formatCurrency(lifeInsurance + loanRepayment)} in other products). You are significantly outperforming the standard 20% recommendation, building substantial wealth.
              </li>
            )}
            
            {/* 13th & 14th Advice */}
            {projection.dataPoints[0].juneExtraActive < taxResult.net13th * 0.5 || projection.dataPoints[0].decemberExtraActive < taxResult.net14th * 0.5 ? (
              <li>
                <strong>Austrian Bonus Power-Up:</strong> You save a fraction of your 13th/14th salaries. Since bonuses are "extra" payouts, saving at least 50% of them ({formatCurrency(Math.round(taxResult.net13th * 0.5))} each in June and Dec) is a painless wealth accelerator!
              </li>
            ) : (
              <li>
                <strong>Bonus Optimization Maxed!</strong> You are smartly investing 50% or more of your 13th and 14th net salaries, using Austria's unique bonus system to full advantage.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
