import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import NumberInput from '../../components/common/NumberInput';
import { formatCurrency } from '../projection/projectionEngine';

export default function TaxSection() {
  const {
    country,
    setCountry,
    salaryPeriod,
    setSalaryPeriod,
    grossMonthly,
    setGrossMonthly,
    zuschlagMonthly,
    setZuschlagMonthly,
    zuschlagSvsSubject,
    setZuschlagSvsSubject,
    taxResult,
  } = useInvestmentPlanner();

  const salaryMultiplier = country === 'AT' ? 14 : 12;
  const grossYearlyValue = Math.round(grossMonthly * salaryMultiplier * 100) / 100;
  const currentSalaryValue = salaryPeriod === 'monthly' ? grossMonthly : grossYearlyValue;

  const handleSalaryChange = (val: number) => {
    if (salaryPeriod === 'monthly') {
      setGrossMonthly(val);
    } else {
      setGrossMonthly(Math.round((val / salaryMultiplier) * 100) / 100);
    }
  };

  const salaryToggle = (
    <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--surface2)', padding: '0.15rem', borderRadius: '5px', border: '1px solid var(--border)' }}>
      <button
        type="button"
        onClick={() => setSalaryPeriod('monthly')}
        style={{
          padding: '0.18rem 0.5rem',
          fontSize: '0.70rem',
          fontWeight: salaryPeriod === 'monthly' ? '700' : '500',
          borderRadius: '3px',
          border: 'none',
          background: salaryPeriod === 'monthly' ? 'var(--blue)' : 'transparent',
          color: salaryPeriod === 'monthly' ? '#ffffff' : 'var(--muted)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => setSalaryPeriod('yearly')}
        style={{
          padding: '0.18rem 0.5rem',
          fontSize: '0.70rem',
          fontWeight: salaryPeriod === 'yearly' ? '700' : '500',
          borderRadius: '3px',
          border: 'none',
          background: salaryPeriod === 'yearly' ? 'var(--blue)' : 'transparent',
          color: salaryPeriod === 'yearly' ? '#ffffff' : 'var(--muted)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        Yearly
      </button>
    </div>
  );

  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>💼 Income &amp; Tax</h2>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface2)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setCountry('AT')}
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '4px',
              border: 'none',
              background: country === 'AT' ? 'var(--blue)' : 'transparent',
              color: country === 'AT' ? '#ffffff' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🇦🇹 Austria (AT)
          </button>
          <button
            onClick={() => setCountry('HU')}
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '4px',
              border: 'none',
              background: country === 'HU' ? 'var(--blue)' : 'transparent',
              color: country === 'HU' ? '#ffffff' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🇭🇺 Hungary (HU)
          </button>
        </div>
      </div>

      <NumberInput
        label={
          salaryPeriod === 'monthly'
            ? (country === 'AT' ? "Base Gross Monthly Salary (×14)" : "Base Gross Monthly Salary (×12)")
            : (country === 'AT' ? "Base Gross Yearly Salary (14×)" : "Base Gross Yearly Salary (12×)")
        }
        value={currentSalaryValue}
        onChange={handleSalaryChange}
        prefix="€"
        step={salaryPeriod === 'monthly' ? 100 : 500}
        min={0}
        headerRight={salaryToggle}
        hint={
          salaryPeriod === 'monthly' ? (
            <span>
              ≈ <strong className="input-hint-action" onClick={() => setSalaryPeriod('yearly')}>{formatCurrency(grossYearlyValue)}</strong> / yr
            </span>
          ) : (
            <span>
              ≈ <strong className="input-hint-action" onClick={() => setSalaryPeriod('monthly')}>{formatCurrency(grossMonthly)}</strong> / mo
            </span>
          )
        }
      />

      <NumberInput
        label="Fixed Zuschlag / Bonus (Monthly)"
        value={zuschlagMonthly}
        onChange={setZuschlagMonthly}
        prefix="€"
        step={50}
        min={0}
      />

      {country === 'AT' ? (
        <div style={{ marginTop: '-0.25rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.74rem', color: 'var(--text)' }}>
            <input
              type="checkbox"
              checked={zuschlagSvsSubject}
              onChange={(e) => setZuschlagSvsSubject(e.target.checked)}
              style={{ width: '14px', height: '14px', cursor: 'pointer' }}
            />
            <span>Subject to SVS (Sozialversicherung / 18.12% Social Security)</span>
          </label>
          <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.25rem', paddingLeft: '1.4rem' }}>
            {zuschlagSvsSubject
              ? 'SVS (18.12%) is deducted from Zuschlag before income tax.'
              : 'No SVS deducted on Zuschlag; only income tax applies.'}
          </p>
        </div>
      ) : (
        <div style={{ marginTop: '-0.25rem', marginBottom: '1rem', background: 'rgba(59, 130, 246, 0.08)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p style={{ fontSize: '0.70rem', color: 'var(--text)', margin: 0, lineHeight: '1.3' }}>
            🇭🇺 <strong>Hungarian Tax Law:</strong> Flat 15% Personal Income Tax (SZJA) + 18.5% Social Security (TB) = 33.5% total deduction applied to all salary &amp; Zuschlag allowances.
          </p>
        </div>
      )}

      <div className="tax-breakdown">
        <div className="tax-row">
          <span>Gross yearly ({country === 'AT' ? '14×' : '12×'})</span>
          <span>{formatCurrency(taxResult.grossYearly)}</span>
        </div>
        <div className="tax-row">
          <span>Social security ({country === 'AT' ? 'SVS 18.12%' : 'TB 18.5%'})</span>
          <span className="negative">−{formatCurrency(taxResult.socialSecurity)}</span>
        </div>
        <div className="tax-row">
          <span>Income tax ({country === 'AT' ? 'Progressive Brackets' : 'SZJA 15%'})</span>
          <span className="negative">−{formatCurrency(taxResult.incomeTax)}</span>
        </div>
        <div className="tax-row highlight">
          <span>Net yearly</span>
          <span>{formatCurrency(taxResult.netYearly)}</span>
        </div>
        
        <div className="tax-separator" />
        
        <div className="tax-row highlight-sub">
          <span>{country === 'AT' ? 'True Monthly Net (12×)' : 'Net Monthly Salary'}</span>
          <span>{formatCurrency(taxResult.netRegularMonthly)}</span>
        </div>
        {country === 'AT' && (
          <>
            <div className="tax-row highlight-sub"><span>13th Net (Urlaubsgeld)</span><span>{formatCurrency(taxResult.net13th)}</span></div>
            <div className="tax-row highlight-sub"><span>14th Net (Weihnachtsgeld)</span><span>{formatCurrency(taxResult.net14th)}</span></div>
          </>
        )}
        <div className="tax-row"><span>Net monthly avg. (÷12)</span><span>{formatCurrency(taxResult.netMonthly)}</span></div>
        
        <div className="tax-separator" />
        
        <div className="tax-row"><span>Effective tax &amp; SS rate</span><span>{(taxResult.effectiveTaxRate * 100).toFixed(1)}%</span></div>
      </div>
    </section>
  );
}
