import React from 'react';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { formatCurrency, Milestone } from './projectionEngine';

export default function MilestoneBuilder() {
  const {
    milestones,
    setMilestones,
    years,
    newMilestoneName,
    setNewMilestoneName,
    newMilestoneAmount,
    setNewMilestoneAmount,
    newMilestoneType,
    setNewMilestoneType,
    newMilestoneStartYear,
    setNewMilestoneStartYear,
    newMilestoneReinvest,
    setNewMilestoneReinvest,
  } = useInvestmentPlanner();

  return (
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

          <div className="form-grid-half">
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

          <div className="form-grid-split">
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
  );
}
