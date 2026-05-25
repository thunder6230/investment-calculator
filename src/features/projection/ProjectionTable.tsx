import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { formatCurrency } from './projectionEngine';

export default function ProjectionTable() {
  const { projection, minRate, maxRate, showAfterTax } = useInvestmentPlanner();

  return (
    <div className="card">
      <h2 className="section-title">Year-by-Year Breakdown</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Monthly Invest</th>
              <th>Fixed Costs</th>
              <th>Paid In</th>
              <th>@ {minRate}% {showAfterTax ? '(Net)' : '(Gross)'}</th>
              <th>Midpoint {showAfterTax ? '(Net)' : '(Gross)'}</th>
              <th>@ {maxRate}% {showAfterTax ? '(Net)' : '(Gross)'}</th>
              <th>Triggered Events</th>
            </tr>
          </thead>
          <tbody>
            {projection.dataPoints.map((d) => {
              const isTriggered = d.milestonesTriggered && d.milestonesTriggered.length > 0;
              return (
                <tr
                  key={d.year}
                  style={
                    isTriggered
                      ? { background: 'rgba(74, 222, 128, 0.08)', borderLeft: '3px solid var(--green)' }
                      : undefined
                  }
                >
                  <td>{d.year === 0 ? 'Start' : `Year ${d.year}`}</td>
                  <td>{d.year === 0 ? '—' : formatCurrency(d.monthlyContribActive)}</td>
                  <td>{formatCurrency(d.fixedCostsActive)}</td>
                  <td>{formatCurrency(d.paidIn)}</td>
                  <td>{formatCurrency(showAfterTax ? d.lowAfterTax : d.low)}</td>
                  <td>{formatCurrency(showAfterTax ? d.midpointAfterTax : d.midpoint)}</td>
                  <td>{formatCurrency(showAfterTax ? d.highAfterTax : d.high)}</td>
                  <td style={{ textAlign: 'left', fontSize: '0.74rem' }}>
                    {isTriggered ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {d.milestonesTriggered.map((m) => (
                          <span
                            key={m.id}
                            style={{
                              display: 'inline-block',
                              background: m.type === 'decrease' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                              color: m.type === 'decrease' ? 'var(--green)' : 'var(--red)',
                              border: `1px solid ${m.type === 'decrease' ? 'var(--green)' : 'var(--red)'}`,
                              borderRadius: '4px',
                              padding: '0.1rem 0.35rem',
                              fontWeight: '600',
                              fontSize: '0.68rem',
                            }}
                          >
                            {m.type === 'decrease' ? '🎉' : '⚠️'} {m.name} ({m.type === 'decrease' ? '+' : '-'}{formatCurrency(m.amount)}/mo {m.reinvest ? 'reinvested' : 'saved'})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
