import { useState, useMemo, useEffect } from 'react';
import GrowthChart from './components/GrowthChart';
import SliderInput from './components/SliderInput';
import NumberInput from './components/NumberInput';
import { calculateProjection, yearlyContribution, formatCurrency } from './utils/investmentCalc';
import { calculateAustrianNetIncome } from './utils/austrianTax';
import './App.css';

import type { Milestone } from './utils/investmentCalc';

interface Draft {
  name: string;
  timestamp: number;
  grossMonthly: number;
  fixedCosts: number;
  startCapital: number;
  monthlyInvest: number;
  juneExtra: number;
  decemberExtra: number;
  years: number;
  minRate: number;
  maxRate: number;
  lifeInsurance: number;
  loanRepayment: number;
  stepUpRate?: number;
  milestones?: Milestone[];
}

const lastSession = (() => {
  try {
    const saved = localStorage.getItem('investment-calculator-last-session');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Failed to parse auto-save', e);
    return {};
  }
})();

export default function App() {

  // ── Income & Tax ─────────────────────────────────────────────────────────
  const [grossMonthly, setGrossMonthly] = useState<number>(() => lastSession.grossMonthly ?? 3_500);
  const [fixedCosts, setFixedCosts] = useState<number>(() => lastSession.fixedCosts ?? 1_500);

  // ── Investment Inputs ─────────────────────────────────────────────────────
  const [startCapital, setStartCapital] = useState<number>(() => lastSession.startCapital ?? 10_000);
  const [monthlyInvest, setMonthlyInvest] = useState<number>(() => lastSession.monthlyInvest ?? 300);
  const [juneExtra, setJuneExtra] = useState<number>(() => lastSession.juneExtra ?? 500);
  const [decemberExtra, setDecemberExtra] = useState<number>(() => lastSession.decemberExtra ?? 500);
  const [years, setYears] = useState<number>(() => lastSession.years ?? 20);
  const [minRate, setMinRate] = useState<number>(() => lastSession.minRate ?? 5);
  const [maxRate, setMaxRate] = useState<number>(() => lastSession.maxRate ?? 8);

  // Other savings (ignored from compound interest, used in 50/30/20 rule)
  const [lifeInsurance, setLifeInsurance] = useState<number>(() => lastSession.lifeInsurance ?? 0);
  const [loanRepayment, setLoanRepayment] = useState<number>(() => lastSession.loanRepayment ?? 0);

  // ── New Planning States ───────────────────────────────────────────────────
  const [stepUpRate, setStepUpRate] = useState<number>(() => lastSession.stepUpRate ?? 0);
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    if (lastSession.milestones) return lastSession.milestones;
    return [
      {
        id: 'default-loan-payoff',
        name: 'Car Loan Paid Off',
        amount: 300,
        type: 'decrease',
        startYear: 5,
        reinvest: true,
      }
    ];
  });

  // Milestone Builder inputs
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState<number>(300);
  const [newMilestoneType, setNewMilestoneType] = useState<'decrease' | 'increase'>('decrease');
  const [newMilestoneStartYear, setNewMilestoneStartYear] = useState<number>(5);
  const [newMilestoneReinvest, setNewMilestoneReinvest] = useState<boolean>(true);

  // Interactive budget forecasting year state
  const [budgetYear, setBudgetYear] = useState<number>(0);

  // ── Scenario Manager (Drafts) State ───────────────────────────────────────
  const [savedDrafts, setSavedDrafts] = useState<Draft[]>(() => {
    const drafts = localStorage.getItem('investment-calculator-drafts');
    if (drafts) {
      try {
        return JSON.parse(drafts);
      } catch (e) {
        console.error('Failed to parse drafts', e);
      }
    }
    return [];
  });
  const [newDraftName, setNewDraftName] = useState('');

  // Auto-save state changes
  useEffect(() => {
    const data = {
      grossMonthly,
      fixedCosts,
      startCapital,
      monthlyInvest,
      juneExtra,
      decemberExtra,
      years,
      minRate,
      maxRate,
      lifeInsurance,
      loanRepayment,
      stepUpRate,
      milestones,
    };
    localStorage.setItem('investment-calculator-last-session', JSON.stringify(data));
  }, [
    grossMonthly,
    fixedCosts,
    startCapital,
    monthlyInvest,
    juneExtra,
    decemberExtra,
    years,
    minRate,
    maxRate,
    lifeInsurance,
    loanRepayment,
    stepUpRate,
    milestones,
  ]);

  // Save current state as a new named draft
  const handleSaveDraft = () => {
    if (!newDraftName.trim()) return;
    const newDraft: Draft = {
      name: newDraftName.trim(),
      timestamp: Date.now(),
      grossMonthly,
      fixedCosts,
      startCapital,
      monthlyInvest,
      juneExtra,
      decemberExtra,
      years,
      minRate,
      maxRate,
      lifeInsurance,
      loanRepayment,
      stepUpRate,
      milestones,
    };
    const updated = [newDraft, ...savedDrafts.filter((d) => d.name !== newDraft.name)];
    setSavedDrafts(updated);
    localStorage.setItem('investment-calculator-drafts', JSON.stringify(updated));
    setNewDraftName('');
  };

  // Load a named draft
  const handleLoadDraft = (name: string) => {
    const found = savedDrafts.find((d) => d.name === name);
    if (found) {
      setGrossMonthly(found.grossMonthly);
      setFixedCosts(found.fixedCosts);
      setStartCapital(found.startCapital);
      setMonthlyInvest(found.monthlyInvest);
      setJuneExtra(found.juneExtra);
      setDecemberExtra(found.decemberExtra);
      setYears(found.years);
      setMinRate(found.minRate);
      setMaxRate(found.maxRate);
      setLifeInsurance(found.lifeInsurance ?? 0);
      setLoanRepayment(found.loanRepayment ?? 0);
      setStepUpRate(found.stepUpRate ?? 0);
      setMilestones(found.milestones ?? []);
    }
  };

  // Delete a named draft
  const handleDeleteDraft = (name: string) => {
    const updated = savedDrafts.filter((d) => d.name !== name);
    setSavedDrafts(updated);
    localStorage.setItem('investment-calculator-drafts', JSON.stringify(updated));
  };

  const taxResult = useMemo(
    () => calculateAustrianNetIncome(grossMonthly * 14),
    [grossMonthly]
  );

  const projection = useMemo(
    () =>
      calculateProjection({
        startCapital,
        monthlyContribution: monthlyInvest,
        juneExtra,
        decemberExtra,
        years,
        minRate: minRate / 100,
        maxRate: maxRate / 100,
        stepUpRate: stepUpRate / 100,
        milestones,
        baseFixedCosts: fixedCosts,
      }),
    [startCapital, monthlyInvest, juneExtra, decemberExtra, years, minRate, maxRate, stepUpRate, milestones, fixedCosts]
  );

  const idealProjection = useMemo(
    () =>
      calculateProjection({
        startCapital,
        monthlyContribution: Math.round(taxResult.netRegularMonthly * 0.2),
        juneExtra: Math.round(taxResult.net13th * 0.5),
        decemberExtra: Math.round(taxResult.net14th * 0.5),
        years,
        minRate: minRate / 100,
        maxRate: maxRate / 100,
        stepUpRate: 0,
        milestones: [],
        baseFixedCosts: fixedCosts,
      }),
    [startCapital, taxResult.netRegularMonthly, taxResult.net13th, taxResult.net14th, years, minRate, maxRate, fixedCosts]
  );

  // Auto-cap forecast year if years is reduced
  useEffect(() => {
    if (budgetYear > years) {
      setBudgetYear(years);
    }
  }, [years, budgetYear]);

  // Selected year data point for forecasting financial health
  const activePointForBudget = useMemo(() => {
    return projection.dataPoints.find((dp) => dp.year === budgetYear) || projection.dataPoints[0];
  }, [projection.dataPoints, budgetYear]);

  const activeFixedCosts = activePointForBudget.fixedCostsActive;
  const activeMonthlyInvest = activePointForBudget.monthlyContribActive;
  const activeTotalMonthlySavings = activeMonthlyInvest + lifeInsurance + loanRepayment;

  const needsPercent = Math.min(100, Math.round((fixedCosts / taxResult.netRegularMonthly) * 100));
const savingsPercent = Math.min(100, Math.round((activeTotalMonthlySavings / taxResult.netRegularMonthly) * 100));
const wantsPercent = Math.max(0, 100 - needsPercent - savingsPercent);
 
  const yearlyContrib = yearlyContribution(monthlyInvest, juneExtra, decemberExtra);
  const lastPoint = projection.dataPoints[projection.dataPoints.length - 1];

  return (
    <div className="app">
      <header className="app-header">
        <h1>🇦🇹 Austrian Investment Calculator</h1>
        <p className="subtitle">Project your wealth growth with Austrian tax considerations</p>
      </header>

      <div className="layout">
        <aside className="panel panel-inputs">
          <section className="card drafts-card">
            <h2 className="section-title">📁 Saved Scenarios (Local Drafts)</h2>
            <div className="drafts-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <select
                className="drafts-select"
                value=""
                onChange={(e) => {
                  const draftName = e.target.value;
                  if (draftName) handleLoadDraft(draftName);
                }}
              >
                <option value="" disabled>Select a saved plan...</option>
                {savedDrafts.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="draft-actions" style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="Draft name..."
                  value={newDraftName}
                  onChange={(e) => setNewDraftName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface2)',
                    color: 'var(--text)',
                    outline: 'none'
                  }}
                />
                <button
                  className="input-hint-action"
                  onClick={handleSaveDraft}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--blue)',
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
            {savedDrafts.length > 0 && (
              <div className="drafts-tags-container" style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>Saved Plans:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {savedDrafts.map((d) => (
                    <span
                      key={d.name}
                      className="draft-tag"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.72rem',
                        color: 'var(--text)'
                      }}
                    >
                      <span style={{ cursor: 'pointer', fontWeight: '500' }} onClick={() => handleLoadDraft(d.name)}>
                        {d.name}
                      </span>
                      <span
                        style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: '700', paddingLeft: '0.15rem' }}
                        onClick={() => handleDeleteDraft(d.name)}
                        title="Delete scenario"
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

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
            <NumberInput
              label="Monthly Fixed Costs (Rent, Bills...)"
              value={fixedCosts}
              onChange={setFixedCosts}
              prefix="€"
              step={50}
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

          <section className="card">
            <h2 className="section-title">⏳ Future Expense Milestones</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Model future changes in expenses (e.g. paying off a car loan, finishing a mortgage, school costs). 
              <strong> Auto-reinvesting</strong> savings dynamically boosts your monthly investments from that year onwards!
            </p>

            {/* Milestones list */}
            {milestones.length > 0 ? (
              <div className="milestones-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`milestone-item ${m.type}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--surface2)',
                      border: `1px solid ${m.type === 'decrease' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                      borderLeft: `4px solid ${m.type === 'decrease' ? 'var(--green)' : 'var(--red)'}`,
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)' }}>
                        {m.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                        {m.type === 'decrease' ? 'Saves' : 'Costs'} {formatCurrency(m.amount)}/mo • triggers after Year {m.startYear}
                      </span>
                      {m.type === 'decrease' && m.reinvest && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--emerald)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          ⚡ Auto-reinvested into growth portfolio!
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setMilestones(milestones.filter((item) => item.id !== m.id))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--red)',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        padding: '0.25rem',
                      }}
                      title="Remove milestone"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface2)', borderRadius: '6px', border: '1px dashed var(--border)', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                No future expense milestones configured yet.
              </div>
            )}

            {/* Form to add a milestone */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.75rem' }}>➕ Add Expense Milestone</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Milestone Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Car loan finished, Rent increase"
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface2)',
                      color: 'var(--text)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Amount (€/month)</label>
                    <input
                      type="number"
                      min={10}
                      step={50}
                      value={newMilestoneAmount}
                      onChange={(e) => setNewMilestoneAmount(Math.max(0, Number(e.target.value)))}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface2)',
                        color: 'var(--text)',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Timing (After Year)</label>
                    <input
                      type="number"
                      min={1}
                      max={years}
                      value={newMilestoneStartYear}
                      onChange={(e) => setNewMilestoneStartYear(Math.min(years, Math.max(1, Number(e.target.value))))}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface2)',
                        color: 'var(--text)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Type of change</label>
                    <select
                      value={newMilestoneType}
                      onChange={(e) => {
                        const type = e.target.value as 'decrease' | 'increase';
                        setNewMilestoneType(type);
                        if (type === 'increase') setNewMilestoneReinvest(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface2)',
                        color: 'var(--text)',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="decrease">📉 Decrease Expenses</option>
                      <option value="increase">📈 Increase Expenses</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (!newMilestoneName.trim()) return;
                      const newItem: Milestone = {
                        id: 'milestone-' + Date.now(),
                        name: newMilestoneName.trim(),
                        amount: newMilestoneAmount,
                        type: newMilestoneType,
                        startYear: newMilestoneStartYear,
                        reinvest: newMilestoneType === 'decrease' ? newMilestoneReinvest : false,
                      };
                      setMilestones([...milestones, newItem]);
                      setNewMilestoneName('');
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--green)',
                      color: '#0f172a',
                      cursor: 'pointer',
                      height: '35px',
                      alignSelf: 'end',
                    }}
                  >
                    Add Trigger
                  </button>
                </div>

                {newMilestoneType === 'decrease' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                    <input
                      type="checkbox"
                      checked={newMilestoneReinvest}
                      onChange={(e) => setNewMilestoneReinvest(e.target.checked)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text)' }}>
                      Auto-reinvest savings into monthly contributions
                    </span>
                  </label>
                )}
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">📈 Growth &amp; Duration</h2>
            <SliderInput label="Investment period" value={years} onChange={setYears} min={1} max={50} suffix=" yrs" />
            <SliderInput
              label="Min return (after tax)"
              value={minRate}
              onChange={(v) => setMinRate(Math.min(v, maxRate))}
              min={1} max={15} step={0.5} suffix="%" formatValue={(v) => v.toFixed(1)}
            />
            <SliderInput
              label="Max return (after tax)"
              value={maxRate}
              onChange={(v) => setMaxRate(Math.max(v, minRate))}
              min={1} max={15} step={0.5} suffix="%" formatValue={(v) => v.toFixed(1)}
            />
          </section>
        </aside>

        <main className="panel panel-results">
          <div className="summary-grid">
            <div className="summary-card blue"><span className="sc-label">Total Paid In</span><span className="sc-value">{formatCurrency(projection.totalContributed)}</span></div>
            <div className="summary-card green"><span className="sc-label">Portfolio @ {minRate}% after {years} yrs</span><span className="sc-value">{formatCurrency(lastPoint.low)}</span></div>
            <div className="summary-card emerald"><span className="sc-label">Portfolio @ {maxRate}% after {years} yrs</span><span className="sc-value">{formatCurrency(lastPoint.high)}</span></div>
            <div className="summary-card yellow"><span className="sc-label">Midpoint Portfolio</span><span className="sc-value">{formatCurrency(lastPoint.midpoint)}</span></div>
            <div className="summary-card teal">
              <span className="sc-label">Avg. Monthly Payout (low)</span>
              <span className="sc-value">{formatCurrency(projection.monthlyPayoutLow)}</span>
              <span className="sc-sub">if drawn down over {years} yrs</span>
            </div>
            <div className="summary-card teal">
              <span className="sc-label">Avg. Monthly Payout (high)</span>
              <span className="sc-value">{formatCurrency(projection.monthlyPayoutHigh)}</span>
              <span className="sc-sub">if drawn down over {years} yrs</span>
            </div>
          </div>

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
                </div>
                
                <div className="budget-legend">
                  <span className="legend-item"><span className="legend-dot needs" /> Needs (Ideal: ≤50%)</span>
                  <span className="legend-item"><span className="legend-dot savings" /> Savings (Ideal: ≥20%)</span>
                  <span className="legend-item"><span className="legend-dot wants" /> Wants (Ideal: ~30%)</span>
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
                  {juneExtra < taxResult.net13th * 0.5 || decemberExtra < taxResult.net14th * 0.5 ? (
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

          <div className="card chart-card">
            <h2 className="section-title">Portfolio Growth Over Time</h2>
            <p className="chart-legend-hint">
              <span className="dot blue-dot" /> Paid In &nbsp;
              <span className="dot green-dot" /> {minRate}%–{maxRate}% Growth Band &nbsp;
              <span className="dot yellow-dot" /> Midpoint
            </p>
            <GrowthChart data={projection.dataPoints} />
          </div>

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
                    <th>@ {minRate}%</th>
                    <th>Midpoint</th>
                    <th>@ {maxRate}%</th>
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
                        <td>{formatCurrency(d.low)}</td>
                        <td>{formatCurrency(d.midpoint)}</td>
                        <td>{formatCurrency(d.high)}</td>
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
        </main>
      </div>
    </div>
  );
}
