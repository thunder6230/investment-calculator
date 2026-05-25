import React from 'react';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';

export default function ScenarioManager() {
  const {
    savedDrafts,
    newDraftName,
    setNewDraftName,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
  } = useInvestmentPlanner();

  return (
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
  );
}
