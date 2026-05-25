import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import NumberInput from '../../components/common/NumberInput';
import SliderInput from '../../components/common/SliderInput';
import { formatCurrency } from './projectionEngine';

export default function InvestmentInputs() {
  const {
    startCapital,
    setStartCapital,
    monthlyInvest,
    setMonthlyInvest,
    juneExtra,
    setJuneExtra,
    decemberExtra,
    setDecemberExtra,
    lifeInsurance,
    setLifeInsurance,
    loanRepayment,
    setLoanRepayment,
    stepUpRate,
    setStepUpRate,
    expenseMode,
    investableSurplus,
    yearlyContrib,
    taxResult,
  } = useInvestmentPlanner();

  return (
    <section className="card">
      <h2 className="section-title">💰 Investment Parameters</h2>
      <NumberInput label="Start Capital" value={startCapital} onChange={setStartCapital} prefix="€" step={500} />
      <NumberInput
        label="Monthly Investment"
        value={monthlyInvest}
        onChange={setMonthlyInvest}
        prefix="€"
        step={50}
        hint={
          <span>
            true net: <strong className="input-hint-action" onClick={() => setMonthlyInvest(Math.round(taxResult.netRegularMonthly))}>{formatCurrency(taxResult.netRegularMonthly)}</strong>
          </span>
        }
      />

      {expenseMode === 'detailed' && (
        <div
          className="surplus-glow-box"
          style={{
            background: 'rgba(52, 211, 153, 0.06)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.78rem',
            marginBottom: '1rem',
            marginTop: '-0.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ color: 'var(--emerald)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              🚀 Investable Surplus Found
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.7rem', marginTop: '0.15rem' }}>
              You have <strong style={{ color: 'var(--text)' }}>{formatCurrency(investableSurplus)}/mo</strong> leftover cash.
            </div>
          </div>
          <button
            onClick={() => setMonthlyInvest(investableSurplus)}
            disabled={monthlyInvest === investableSurplus}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: '700',
              borderRadius: '6px',
              border: 'none',
              background: monthlyInvest === investableSurplus ? 'var(--border)' : 'var(--green)',
              color: monthlyInvest === investableSurplus ? 'var(--muted)' : '#0f172a',
              cursor: monthlyInvest === investableSurplus ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {monthlyInvest === investableSurplus ? 'Fully Invested' : 'Invest It'}
          </button>
        </div>
      )}

      <NumberInput
        label="June Bonus Extra (Urlaubsgeld)"
        value={juneExtra}
        onChange={setJuneExtra}
        prefix="€"
        step={100}
        hint={
          <span>
            13th net: <strong className="input-hint-action" onClick={() => setJuneExtra(Math.round(taxResult.net13th))}>{formatCurrency(taxResult.net13th)}</strong>
          </span>
        }
      />
      <NumberInput
        label="December Bonus Extra (Weihnachtsgeld)"
        value={decemberExtra}
        onChange={setDecemberExtra}
        prefix="€"
        step={100}
        hint={
          <span>
            14th net: <strong className="input-hint-action" onClick={() => setDecemberExtra(Math.round(taxResult.net14th))}>{formatCurrency(taxResult.net14th)}</strong>
          </span>
        }
      />

      <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
        <SliderInput
          label="Annual Contribution Growth (Step-Up)"
          value={stepUpRate}
          onChange={setStepUpRate}
          min={0}
          max={10}
          step={0.5}
          suffix="%"
          formatValue={(v) => v.toFixed(1)}
        />
        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '-0.25rem', lineHeight: '1.3' }}>
          Compounds annually. Try <strong className="input-hint-action" onClick={() => setStepUpRate(2)}>2%</strong> for inflation indexing or <strong className="input-hint-action" onClick={() => setStepUpRate(5)}>5%</strong> for planned salary raises.
        </p>
      </div>

      <div className="extra-savings-divider" style={{ borderTop: '1px solid var(--border)', margin: '1rem 0', paddingTop: '0.75rem' }} />
      <h3 className="section-title" style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>🛡️ Other Savings (Excluded from growth)</h3>
      <NumberInput
        label="Life Insurance Savings"
        value={lifeInsurance}
        onChange={setLifeInsurance}
        prefix="€"
        step={50}
      />
      <NumberInput
        label="Loan Repayment Fund"
        value={loanRepayment}
        onChange={setLoanRepayment}
        prefix="€"
        step={100}
      />
      <div className="summary-pill">
        Avg. yearly contribution: <strong>{formatCurrency(yearlyContrib)}</strong>
      </div>
    </section>
  );
}
