import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import NumberInput from '../../components/common/NumberInput';
import { formatCurrency } from '../projection/projectionEngine';

export default function TaxSection() {
  const {
    grossMonthly,
    setGrossMonthly,
    taxResult,
  } = useInvestmentPlanner();

  return (
    <section className="card">
      <h2 className="section-title">💼 Income &amp; Austrian Tax</h2>
      <NumberInput
        label="Gross Monthly Salary (×14)"
        value={grossMonthly}
        onChange={setGrossMonthly}
        prefix="€"
        step={100}
        min={0}
      />

      <div className="tax-breakdown">
        <div className="tax-row"><span>Gross yearly (14×)</span><span>{formatCurrency(taxResult.grossYearly)}</span></div>
        <div className="tax-row"><span>Social security</span><span className="negative">−{formatCurrency(taxResult.socialSecurity)}</span></div>
        <div className="tax-row"><span>Income tax</span><span className="negative">−{formatCurrency(taxResult.incomeTax)}</span></div>
        <div className="tax-row highlight"><span>Net yearly</span><span>{formatCurrency(taxResult.netYearly)}</span></div>
        
        <div className="tax-separator" />
        
        <div className="tax-row highlight-sub"><span>True Monthly Net (12×)</span><span>{formatCurrency(taxResult.netRegularMonthly)}</span></div>
        <div className="tax-row highlight-sub"><span>13th Net (Urlaubsgeld)</span><span>{formatCurrency(taxResult.net13th)}</span></div>
        <div className="tax-row highlight-sub"><span>14th Net (Weihnachtsgeld)</span><span>{formatCurrency(taxResult.net14th)}</span></div>
        <div className="tax-row"><span>Net monthly avg. (÷12)</span><span>{formatCurrency(taxResult.netMonthly)}</span></div>
        
        <div className="tax-separator" />
        
        <div className="tax-row"><span>Effective tax rate</span><span>{(taxResult.effectiveTaxRate * 100).toFixed(1)}%</span></div>
      </div>
    </section>
  );
}
