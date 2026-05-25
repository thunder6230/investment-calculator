import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { formatCurrency } from '../projection/projectionEngine';

export default function ExpenseBreakdown() {
  const {
    taxResult,
    needsPercent,
    savingsPercent,
    wantsPercent,
    bufferPercent,
    activeFixedCosts,
    totalDetailedWants,
    activeMonthlyInvest,
    activeTotalMonthlySavings,
    investableSurplus,
    setMonthlyInvest,
    setActiveTab,
    expenseMode,
    lifeInsurance,
    loanRepayment,
  } = useInvestmentPlanner();

  const handleInvestSurplus = () => {
    setMonthlyInvest(investableSurplus);
    // Smoothly transition the user back to the investments tab to see the change
    setActiveTab('investments');
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 className="section-title">📊 Cash Flow &amp; Expense Breakdown</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'var(--surface2)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>True Net Monthly</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)', marginTop: '0.2rem' }}>{formatCurrency(taxResult.netRegularMonthly)}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Normalized 12-month baseline</div>
        </div>
        
        <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Allocated Expenses</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--red)', marginTop: '0.2rem' }}>
            {formatCurrency(activeFixedCosts + (expenseMode === 'detailed' ? totalDetailedWants : 0))}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            Fixed Needs + Flexible Wants
          </div>
        </div>
      </div>

      {/* Progress Gauges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meters &amp; Targets</h3>

        {/* Needs Meter */}
        <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🚨 Needs &amp; Bills <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>(Ideal: ≤50%)</span></span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(activeFixedCosts)} ({needsPercent}%)</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${needsPercent}%`, background: 'var(--red)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Wants Meter */}
        <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🎉 Wants &amp; Lifestyle <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>(Ideal: ~30%)</span></span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(expenseMode === 'detailed' ? totalDetailedWants : (taxResult.netRegularMonthly * wantsPercent / 100))} ({wantsPercent}%)</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${wantsPercent}%`, background: 'var(--green)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Savings Meter */}
        <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🚀 Monthly Savings <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>(Ideal: ≥20%)</span></span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(activeTotalMonthlySavings)} ({savingsPercent}%)</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${savingsPercent}%`, background: 'var(--blue)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
          </div>
          {(lifeInsurance > 0 || loanRepayment > 0) && (
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.35rem', textAlign: 'right' }}>
              ({formatCurrency(activeMonthlyInvest)} portfolio + {formatCurrency(lifeInsurance + loanRepayment)} other savings)
            </div>
          )}
        </div>

        {/* Buffer Meter (detailed mode only) */}
        {expenseMode === 'detailed' && bufferPercent > 0 && (
          <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: '500' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🪙 Unallocated Buffer <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>(Ideal: 0% - fully automated)</span></span>
              <span style={{ fontWeight: '600', color: 'var(--yellow)' }}>{formatCurrency(investableSurplus)} ({bufferPercent}%)</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${bufferPercent}%`, background: 'var(--yellow)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Invest Surplus Booster Card */}
      {expenseMode === 'detailed' && investableSurplus > 0 && (
        <div
          className="surplus-glow-box"
          style={{
            background: 'rgba(52, 211, 153, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: '10px',
            padding: '0.9rem 1.1rem',
            marginTop: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--emerald)', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              🚀 Optimize Cash Flow Surplus
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: '0.2rem', lineHeight: '1.4' }}>
              You have <strong style={{ color: 'var(--text)' }}>{formatCurrency(investableSurplus)}/month</strong> of unallocated money. Feed it directly into your portfolio!
            </div>
          </div>
          <button
            onClick={handleInvestSurplus}
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: '700',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--emerald)',
              color: '#0f172a',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: '0 2px 8px rgba(52, 211, 153, 0.2)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Invest It &amp; View Growth
          </button>
        </div>
      )}
    </div>
  );
}
