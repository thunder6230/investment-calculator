import React from 'react';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import NumberInput from '../../components/common/NumberInput';
import { formatCurrency } from '../projection/projectionEngine';

export default function TaxSection() {
  const {
    grossMonthly,
    setGrossMonthly,
    fixedCosts,
    setFixedCosts,
    expenseMode,
    setExpenseMode,
    taxResult,
    totalDetailedNeeds,
    totalDetailedWants,
    expenseItems,
    setExpenseItems,
    newExpenseName,
    setNewExpenseName,
    newExpenseAmount,
    setNewExpenseAmount,
    newExpenseCategory,
    setNewExpenseCategory,
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
      
      <div className="budget-tabs" style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '8px', padding: '0.2rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
        <button
          className={`budget-tab ${expenseMode === 'simple' ? 'active' : ''}`}
          onClick={() => setExpenseMode('simple')}
          style={{
            flex: 1,
            padding: '0.4rem',
            fontSize: '0.78rem',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            background: expenseMode === 'simple' ? 'var(--surface)' : 'transparent',
            color: expenseMode === 'simple' ? 'var(--blue)' : 'var(--muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Simple Entry
        </button>
        <button
          className={`budget-tab ${expenseMode === 'detailed' ? 'active' : ''}`}
          onClick={() => setExpenseMode('detailed')}
          style={{
            flex: 1,
            padding: '0.4rem',
            fontSize: '0.78rem',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            background: expenseMode === 'detailed' ? 'var(--surface)' : 'transparent',
            color: expenseMode === 'detailed' ? 'var(--blue)' : 'var(--muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Detailed Tracker
        </button>
      </div>

      {expenseMode === 'simple' ? (
        <NumberInput
          label="Monthly Fixed Costs (Rent, Bills...)"
          value={fixedCosts}
          onChange={setFixedCosts}
          prefix="€"
          step={50}
          min={0}
        />
      ) : (
        <div className="expense-tracker-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <span>Needs: <strong style={{ color: 'var(--red)' }}>{formatCurrency(totalDetailedNeeds)}</strong></span>
            <span>Wants: <strong style={{ color: 'var(--green)' }}>{formatCurrency(totalDetailedWants)}</strong></span>
          </div>
          
          {/* Expense Items List */}
          <div className="expense-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
            {expenseItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--surface2)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${item.category === 'need' ? 'var(--red)' : 'var(--green)'}`,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--text)' }}>{item.name}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'capitalize' }}>
                    {item.category === 'need' ? '🚨 Need (Fixed)' : '🎉 Want (Flexible)'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)' }}>{formatCurrency(item.amount)}</span>
                  <button
                    onClick={() => setExpenseItems(expenseItems.filter((i) => i.id !== item.id))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--red)',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                    }}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Expense Form */}
          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Expense name (e.g. Groceries, Gym)"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.5rem',
                fontSize: '0.76rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            <div className="form-grid-half">
              <input
                type="number"
                min={1}
                placeholder="€/month"
                value={newExpenseAmount || ''}
                onChange={(e) => setNewExpenseAmount(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.76rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <select
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value as 'need' | 'want')}
                style={{
                  width: '100%',
                  padding: '0.4rem',
                  fontSize: '0.76rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="need">🚨 Need (Fixed)</option>
                <option value="want">🎉 Want (Flexible)</option>
              </select>
            </div>
            <button
              onClick={() => {
                if (!newExpenseName.trim() || !newExpenseAmount) return;
                setExpenseItems([
                  ...expenseItems,
                  {
                    id: 'exp-' + Date.now(),
                    name: newExpenseName.trim(),
                    amount: newExpenseAmount,
                    category: newExpenseCategory,
                  }
                ]);
                setNewExpenseName('');
              }}
              style={{
                width: '100%',
                padding: '0.4rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--blue)',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              Add Expense Item
            </button>
          </div>
        </div>
      )}

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
