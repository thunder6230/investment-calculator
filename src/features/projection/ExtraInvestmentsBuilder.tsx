import { useState } from 'react';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { formatCurrency } from './projectionEngine';
import type { ExtraInvestmentEvent } from './projectionEngine';

function generateEventId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export default function ExtraInvestmentsBuilder() {
  const {
    extraInvestments,
    setExtraInvestments,
    years,
    newEventName,
    setNewEventName,
    newEventAmount,
    setNewEventAmount,
    newEventYear,
    setNewEventYear,
    newEventApplyUpcoming,
    setNewEventApplyUpcoming,
  } = useInvestmentPlanner();

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editYear, setEditYear] = useState<number>(1);
  const [editApplyUpcoming, setEditApplyUpcoming] = useState<boolean>(false);

  const handleStartEdit = (evt: ExtraInvestmentEvent) => {
    setEditingId(evt.id);
    setEditName(evt.name);
    setEditAmount(evt.amount);
    setEditYear(evt.year);
    setEditApplyUpcoming(evt.applyUpcomingYears);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    setExtraInvestments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: editName.trim(),
              amount: editAmount,
              year: editYear,
              applyUpcomingYears: editApplyUpcoming,
            }
          : item
      )
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleCloneEvent = (evt: ExtraInvestmentEvent) => {
    const cloned: ExtraInvestmentEvent = {
      ...evt,
      id: generateEventId('event'),
      name: `${evt.name} (Copy)`,
    };
    setExtraInvestments((prev) => [...prev, cloned]);
  };

  return (
    <section className="card">
      <h2 className="section-title">🚀 Extra Investment Events</h2>
      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
        Model extra lump-sum investments (e.g., promotion bonus, inheritance, asset sales). 
        Check <strong>"Apply for all upcoming years"</strong> to repeat the extra contribution every year from that year onward!
      </p>

      {/* Events list */}
      {extraInvestments.length > 0 ? (
        <div className="events-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {extraInvestments.map((evt) => (
            <div
              key={evt.id}
              className="event-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface2)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderLeft: '4px solid var(--blue)',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
              }}
            >
              {editingId === evt.id ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Event Label"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface1)',
                      color: 'var(--text)',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder="Amount (€)"
                      value={editAmount}
                      onChange={(e) => setEditAmount(Math.max(0, Number(e.target.value)))}
                      style={{
                        width: '50%',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface1)',
                        color: 'var(--text)',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Target Year"
                      min={1}
                      max={years}
                      value={editYear}
                      onChange={(e) => setEditYear(Math.min(years, Math.max(1, Number(e.target.value))))}
                      style={{
                        width: '50%',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface1)',
                        color: 'var(--text)',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editApplyUpcoming}
                        onChange={(e) => setEditApplyUpcoming(e.target.checked)}
                      />
                      Apply for all upcoming years
                    </label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleSaveEdit(evt.id)}
                        style={{
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          background: 'var(--blue)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.72rem',
                          background: 'var(--surface1)',
                          color: 'var(--muted)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)' }}>
                      {evt.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                      Adds +{formatCurrency(evt.amount)} {evt.applyUpcomingYears ? `every year from Year ${evt.year} onwards 🔁` : `in Year ${evt.year} 🎯`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      onClick={() => handleStartEdit(evt)}
                      style={{
                        background: 'var(--surface1)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        padding: '0.25rem 0.45rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        transition: 'all 0.15s ease',
                      }}
                      title="Edit this event"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleCloneEvent(evt)}
                      style={{
                        background: 'rgba(96, 165, 250, 0.12)',
                        border: '1px solid rgba(96, 165, 250, 0.4)',
                        color: 'var(--blue)',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        padding: '0.25rem 0.45rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.15s ease',
                      }}
                      title="Clone this event"
                    >
                      📋 Duplicate
                    </button>
                    <button
                      onClick={() => setExtraInvestments(extraInvestments.filter((item) => item.id !== evt.id))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--red)',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        padding: '0.25rem',
                      }}
                      title="Remove event"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface2)', borderRadius: '6px', border: '1px dashed var(--border)', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
          No extra investment events configured yet.
        </div>
      )}

      {/* Form to add an extra investment event */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <h3 style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.75rem' }}>➕ Add Extra Investment Event</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Event Label</label>
            <input
              type="text"
              placeholder="e.g. Promotion Bonus, Stock Option Vesting"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
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
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Extra Amount (€)</label>
              <input
                type="number"
                min={50}
                step={500}
                value={newEventAmount}
                onChange={(e) => setNewEventAmount(Math.max(0, Number(e.target.value)))}
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
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Target Year</label>
              <input
                type="number"
                min={1}
                max={years}
                value={newEventYear}
                onChange={(e) => setNewEventYear(Math.min(years, Math.max(1, Number(e.target.value))))}
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={newEventApplyUpcoming}
                onChange={(e) => setNewEventApplyUpcoming(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text)' }}>
                Apply for all upcoming years (recurring)
              </span>
            </label>

            <button
              onClick={() => {
                if (!newEventName.trim()) return;
                const newItem: ExtraInvestmentEvent = {
                  id: generateEventId('event'),
                  name: newEventName.trim(),
                  amount: newEventAmount,
                  year: newEventYear,
                  applyUpcomingYears: newEventApplyUpcoming,
                };
                setExtraInvestments([...extraInvestments, newItem]);
                setNewEventName('');
              }}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--blue)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Add Event
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
