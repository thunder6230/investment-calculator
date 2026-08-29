import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';

export default function ScenarioManager() {
  const {
    savedDrafts,
    newDraftName,
    setNewDraftName,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    setIsCompareModalOpen,
    setIsTemplatesModalOpen,
  } = useInvestmentPlanner();

  return (
    <section className="card drafts-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.35rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>📁 Templates &amp; Scenarios</h2>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button
            type="button"
            className="badge badge-info"
            style={{ cursor: 'pointer', fontSize: '0.70rem' }}
            onClick={() => setIsTemplatesModalOpen(true)}
            title="Open Templates &amp; Scenarios Library"
          >
            📚 Library ({savedDrafts.length})
          </button>
          {savedDrafts.length > 0 && (
            <button
              type="button"
              className="badge"
              style={{ cursor: 'pointer', background: 'var(--surface2)', color: 'var(--blue)', border: '1px solid var(--border)', fontSize: '0.70rem' }}
              onClick={() => setIsCompareModalOpen(true)}
            >
              👥 Compare
            </button>
          )}
        </div>
      </div>

      <div className="drafts-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <select
          className="drafts-select"
          value=""
          onChange={(e) => {
            const draftName = e.target.value;
            if (draftName) handleLoadDraft(draftName);
          }}
        >
          <option value="" disabled>Load a saved template...</option>
          {savedDrafts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name} ({d.country === 'AT' ? '🇦🇹' : '🇭🇺'} {d.years}y • €{d.monthlyInvest}/mo)
            </option>
          ))}
        </select>

        <div className="draft-actions" style={{ display: 'flex', gap: '0.4rem' }}>
          <input
            type="text"
            placeholder="Save template as..."
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
            className="btn btn-primary"
            onClick={handleSaveDraft}
            disabled={!newDraftName.trim()}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {savedDrafts.length > 0 && (
        <div className="drafts-tags-container" style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
          <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>Saved Templates:</p>
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
                  title="Delete template"
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
