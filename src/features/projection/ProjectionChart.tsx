import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { formatCurrency } from './projectionEngine';
import type { YearDataPoint } from './projectionEngine';

function CustomTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  const { showAfterTax, adjustForInflation, inflationRate } = useInvestmentPlanner();
  if (!active || !payload?.length) return null;
  const rawData = payload[0].payload as YearDataPoint;
  
  const grossVal = rawData.midpoint;
  const netVal = rawData.midpointAfterTax;
  const taxAccrued = grossVal - netVal;

  return (
    <div className="tooltip-box">
      <p className="tooltip-title">
        Year {label} {adjustForInflation && <span style={{ color: 'var(--yellow)', fontSize: '0.70rem' }}>(Real -{inflationRate}% Inf)</span>}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: '0.2rem 0', fontSize: '0.78rem' }}>
          {entry.name}: {formatCurrency(entry.value as number)}
        </p>
      ))}
      
      {rawData && rawData.year > 0 && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)', fontSize: '0.74rem', color: 'var(--muted)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Invested Capital: <strong>{formatCurrency(rawData.paidIn)}</strong></span>
              <span>Invest Rate: <strong>{formatCurrency(rawData.monthlyContribActive)}/mo</strong></span>
            </div>
            
            {showAfterTax && taxAccrued > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--red)', fontWeight: '500', marginTop: '0.1rem' }}>
                <span>KeSt Tax Liability (Accrued):</span>
                <span>−{formatCurrency(taxAccrued)}</span>
              </div>
            )}
          </div>
          {rawData.milestonesTriggered && rawData.milestonesTriggered.length > 0 && (
            <div style={{ marginTop: '0.25rem', color: 'var(--emerald)', fontWeight: '600' }}>
              🎉 Triggered: {rawData.milestonesTriggered.map((m) => m.name).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectionChart() {
  const {
    displayProjection,
    minRate,
    maxRate,
    showAfterTax,
    setShowAfterTax,
    taxResult,
    country,
    adjustForInflation,
    setAdjustForInflation,
    inflationRate,
    taxShieldMode,
    setTaxShieldMode,
    fireMetrics,
    setIsGoalSolverOpen,
    setIsCompareModalOpen,
  } = useInvestmentPlanner();

  // Personal marginal income rate compared to flat KeSt (27.5%)
  const personalRate = taxResult.marginalTaxRate;
  const capGainsTaxRate = Math.min(0.275, personalRate);

  return (
    <div className="card chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0 1.25rem 0.5rem 1.25rem' }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: '0.15rem' }}>Portfolio Growth Over Time</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.72rem', color: 'var(--muted)' }}>
            <span>{adjustForInflation ? `📉 Showing Real Purchasing Power (adjusted for ${inflationRate}% inflation)` : '📈 Nominal Values'}</span>
          </div>
        </div>

        {/* ── Action Toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Reverse Goal Solver launcher button */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => setIsGoalSolverOpen(true)}
          >
            🎯 Goal Solver
          </button>

          {/* Scenario Compare Button */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => setIsCompareModalOpen(true)}
          >
            👥 Compare
          </button>

          {/* Inflation Toggle Pill */}
          <div style={{ display: 'flex', gap: '0.15rem', background: 'var(--surface2)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setAdjustForInflation(false)}
              style={{
                padding: '0.18rem 0.45rem',
                fontSize: '0.70rem',
                fontWeight: !adjustForInflation ? '700' : '500',
                borderRadius: '4px',
                border: 'none',
                background: !adjustForInflation ? 'var(--blue)' : 'transparent',
                color: !adjustForInflation ? '#ffffff' : 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              Nominal
            </button>
            <button
              type="button"
              onClick={() => setAdjustForInflation(true)}
              style={{
                padding: '0.18rem 0.45rem',
                fontSize: '0.70rem',
                fontWeight: adjustForInflation ? '700' : '500',
                borderRadius: '4px',
                border: 'none',
                background: adjustForInflation ? 'var(--yellow)' : 'transparent',
                color: adjustForInflation ? '#000000' : 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              Real (-{inflationRate}%)
            </button>
          </div>

          {/* Tax Deduction / Tax Shield Toggle */}
          {country === 'HU' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', cursor: 'pointer', background: 'var(--surface2)', padding: '0.3rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border)', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={taxShieldMode}
                onChange={(e) => setTaxShieldMode(e.target.checked)}
                style={{ width: '13px', height: '13px', cursor: 'pointer' }}
              />
              <span style={{ color: taxShieldMode ? 'var(--green)' : 'var(--text)', fontWeight: '600' }}>
                🇭🇺 TBSZ Shield (0% Tax)
              </span>
            </label>
          ) : (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', cursor: 'pointer', background: 'var(--surface2)', padding: '0.3rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border)', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={showAfterTax}
                onChange={(e) => setShowAfterTax(e.target.checked)}
                style={{ width: '13px', height: '13px', cursor: 'pointer' }}
              />
              <span style={{ color: showAfterTax ? 'var(--blue)' : 'var(--text)', fontWeight: '600' }}>
                🇦🇹 KeSt ({(capGainsTaxRate * 100).toFixed(1)}%)
              </span>
            </label>
          )}
        </div>
      </div>

      <p className="chart-legend-hint" style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
        <span className="dot blue-dot" /> Paid In &nbsp;
        <span className="dot green-dot" /> {minRate}%–{maxRate}% {showAfterTax ? 'Net Band' : 'Growth Band'} &nbsp;
        <span className="dot yellow-dot" /> Midpoint {showAfterTax ? '(Net)' : '(Gross)'}
        {fireMetrics.targetFireNumber > 0 && (
          <span style={{ marginLeft: '1rem', color: '#f97316' }}>
            🔥 Target FIRE: {formatCurrency(fireMetrics.targetFireNumber)}
          </span>
        )}
      </p>
      
      <ResponsiveContainer width="100%" height={380}>
        <AreaChart data={displayProjection.dataPoints} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPaidIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            label={{ value: 'Years', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }}
          />
          <YAxis
            stroke="#94a3b8"
            tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />

          {/* FIRE Target Reference Line */}
          {fireMetrics.targetFireNumber > 0 && (
            <ReferenceLine
              y={fireMetrics.targetFireNumber}
              stroke="#f97316"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: '🔥 FIRE Number', fill: '#f97316', position: 'top', fontSize: 11 }}
            />
          )}

          {/* Paid-in capital (blue baseline) */}
          <Area
            type="monotone"
            dataKey="paidIn"
            name="Paid In Capital"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#colorPaidIn)"
          />

          {/* Growth band: low boundary */}
          <Area
            type="monotone"
            dataKey={showAfterTax ? "lowAfterTax" : "low"}
            name={`Low Portfolio (${minRate}%)`}
            stroke="#22c55e"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fill="url(#colorLow)"
          />

          {/* Growth band: high boundary */}
          <Area
            type="monotone"
            dataKey={showAfterTax ? "highAfterTax" : "high"}
            name={`High Portfolio (${maxRate}%)`}
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#colorBand)"
          />

          {/* Midpoint line */}
          <Area
            type="monotone"
            dataKey={showAfterTax ? "midpointAfterTax" : "midpoint"}
            name="Midpoint Value"
            stroke="#facc15"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

