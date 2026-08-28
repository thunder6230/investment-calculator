import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { formatCurrency } from './projectionEngine';

export default function ProjectionTable() {
  const {
    displayProjection,
    minRate,
    maxRate,
    showAfterTax,
    adjustForInflation,
    inflationRate,
    country,
  } = useInvestmentPlanner();

  const handleExportCSV = () => {
    const headers = [
      'Year',
      'Monthly_Invest_EUR',
      'Fixed_Costs_EUR',
      'Paid_In_EUR',
      `Low_${minRate}pct_EUR`,
      'Midpoint_EUR',
      `High_${maxRate}pct_EUR`,
      'Events_Triggered',
    ];

    const rows = displayProjection.dataPoints.map((d) => {
      const milestonesStr = d.milestonesTriggered?.map((m) => `${m.name} (${m.type})`).join('; ') || '';
      const eventsStr = d.extraInvestmentsActive?.map((e) => `${e.name} (+${e.amount})`).join('; ') || '';
      const combinedEvents = [milestonesStr, eventsStr].filter(Boolean).join(' | ');

      return [
        d.year,
        d.monthlyContribActive,
        d.fixedCostsActive,
        d.paidIn,
        showAfterTax ? d.lowAfterTax : d.low,
        showAfterTax ? d.midpointAfterTax : d.midpoint,
        showAfterTax ? d.highAfterTax : d.high,
        `"${combinedEvents}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_projection_${country.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Year-by-Year Breakdown</h2>
          {adjustForInflation && (
            <span style={{ fontSize: '0.70rem', color: 'var(--yellow)' }}>
              (Values adjusted for {inflationRate}% annual inflation purchasing power)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: '600' }}
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: '600' }}
            onClick={handlePrint}
          >
            🖨️ Print / PDF
          </button>
        </div>
      </div>

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
            {displayProjection.dataPoints.map((d) => {
              const hasMilestone = d.milestonesTriggered && d.milestonesTriggered.length > 0;
              const hasExtraEvent = d.extraInvestmentsActive && d.extraInvestmentsActive.length > 0;
              const isTriggered = hasMilestone || hasExtraEvent;

              return (
                <tr
                  key={d.year}
                  style={
                    isTriggered
                      ? { background: 'rgba(96, 165, 250, 0.08)', borderLeft: '3px solid var(--blue)' }
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
                        {hasMilestone && d.milestonesTriggered.map((m) => (
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

                        {hasExtraEvent && d.extraInvestmentsActive.map((e) => (
                          <span
                            key={e.id}
                            style={{
                              display: 'inline-block',
                              background: 'rgba(96, 165, 250, 0.15)',
                              color: 'var(--blue)',
                              border: '1px solid var(--blue)',
                              borderRadius: '4px',
                              padding: '0.1rem 0.35rem',
                              fontWeight: '600',
                              fontSize: '0.68rem',
                            }}
                          >
                            🚀 {e.name} (+{formatCurrency(e.amount)}{e.applyUpcomingYears ? ' / yr 🔁' : ' 🎯'})
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
