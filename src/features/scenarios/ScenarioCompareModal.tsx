import { useState } from 'react';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { calculateProjection, formatCurrency } from '../projection/projectionEngine';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function ScenarioCompareModal() {
  const {
    isCompareModalOpen,
    setIsCompareModalOpen,
    savedDrafts,
    years,
    projection: activeProjection,
  } = useInvestmentPlanner();

  const [selectedDraftName, setSelectedDraftName] = useState<string>(() => {
    return savedDrafts.length > 0 ? savedDrafts[0].name : '';
  });

  if (!isCompareModalOpen) return null;

  const comparedDraft = savedDrafts.find((d) => d.name === selectedDraftName) || savedDrafts[0];

  const comparedProjection = comparedDraft
    ? calculateProjection({
        startCapital: comparedDraft.startCapital,
        monthlyContribution: comparedDraft.monthlyInvest,
        juneExtra: comparedDraft.juneExtra,
        decemberExtra: comparedDraft.decemberExtra,
        years: comparedDraft.years,
        minRate: comparedDraft.minRate / 100,
        maxRate: comparedDraft.maxRate / 100,
        stepUpRate: (comparedDraft.stepUpRate ?? 0) / 100,
        milestones: comparedDraft.milestones ?? [],
        extraInvestments: comparedDraft.extraInvestments ?? [],
        baseFixedCosts: comparedDraft.fixedCosts,
        taxShieldMode: comparedDraft.taxShieldMode,
      })
    : null;

  // Build combined data points for chart
  const maxYears = Math.max(years, comparedDraft ? comparedDraft.years : years);
  const chartData = [];
  for (let y = 0; y <= maxYears; y++) {
    const activePoint = activeProjection.dataPoints.find((p) => p.year === y);
    const compPoint = comparedProjection ? comparedProjection.dataPoints.find((p) => p.year === y) : null;

    chartData.push({
      year: y,
      activeMid: activePoint ? activePoint.midpoint : null,
      activePaid: activePoint ? activePoint.paidIn : null,
      compMid: compPoint ? compPoint.midpoint : null,
      compPaid: compPoint ? compPoint.paidIn : null,
    });
  }

  const finalActive = activeProjection.dataPoints[activeProjection.dataPoints.length - 1];
  const finalComp = comparedProjection
    ? comparedProjection.dataPoints[comparedProjection.dataPoints.length - 1]
    : null;

  const deltaFinal = finalComp ? finalActive.midpoint - finalComp.midpoint : 0;
  const deltaPaid = finalComp ? finalActive.paidIn - finalComp.paidIn : 0;

  return (
    <div className="modal-overlay" onClick={() => setIsCompareModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '92%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👥</span>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Side-by-Side Scenario Comparison</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsCompareModalOpen(false)}
          >
            ✕
          </button>
        </div>

        {savedDrafts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--surface2)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--muted)', margin: 0 }}>
              You don't have any saved drafts yet. Save a draft in the <strong>Preset Scenarios</strong> panel first to compare it against your active setup!
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: '600' }}>
                Compare Active Plan with Saved Draft:
              </label>
              <select
                value={selectedDraftName}
                onChange={(e) => setSelectedDraftName(e.target.value)}
                style={{
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {savedDrafts.map((d) => (
                  <option key={d.name} value={d.name}>
                    📁 {d.name} ({formatCurrency(d.monthlyInvest)}/mo, {d.years}y)
                  </option>
                ))}
              </select>
            </div>

            {/* ── Summary Delta Box ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div className="summary-card blue">
                <span className="summary-label">Active Plan (End Value)</span>
                <span className="summary-value" style={{ color: 'var(--blue)' }}>{formatCurrency(finalActive.midpoint)}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Paid in: {formatCurrency(finalActive.paidIn)}</span>
              </div>

              <div className="summary-card teal">
                <span className="summary-label">Draft: {comparedDraft?.name}</span>
                <span className="summary-value" style={{ color: 'var(--teal)' }}>
                  {finalComp ? formatCurrency(finalComp.midpoint) : '€0'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  Paid in: {finalComp ? formatCurrency(finalComp.paidIn) : '€0'}
                </span>
              </div>

              <div className="summary-card green">
                <span className="summary-label">Growth Difference (Delta)</span>
                <span className="summary-value" style={{ color: deltaFinal >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {deltaFinal >= 0 ? `+${formatCurrency(deltaFinal)}` : `-${formatCurrency(Math.abs(deltaFinal))}`}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  Additional deposit diff: {deltaPaid >= 0 ? `+${formatCurrency(deltaPaid)}` : `-${formatCurrency(Math.abs(deltaPaid))}`}
                </span>
              </div>
            </div>

            {/* ── Visual Overlaid Chart ── */}
            <div style={{ height: '300px', width: '100%', marginBottom: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Y${v}`} stroke="var(--muted)" />
                  <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} stroke="var(--muted)" />
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [
                      formatCurrency(typeof value === 'number' ? value : Number(value)),
                      String(name),
                    ]}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="activeMid" name="Active Plan (Midpoint)" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="activePaid" name="Active Paid-In" stroke="#60a5fa" strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="compMid" name={`${comparedDraft?.name} (Midpoint)`} stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="compPaid" name={`${comparedDraft?.name} Paid-In`} stroke="#34d399" strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsCompareModalOpen(false)}
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
