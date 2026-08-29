import { useState, useRef } from 'react';
import { useInvestmentPlanner, type Draft } from '../../context/InvestmentPlannerContext';
import { formatCurrency } from '../projection/projectionEngine';

export default function TemplatesModal() {
  const {
    isTemplatesModalOpen,
    setIsTemplatesModalOpen,
    presetTemplates,
    savedDrafts,
    handleLoadDraftObject,
    handleDeleteDraft,
    handleDuplicateDraft,
    handleExportTemplates,
    handleImportTemplates,
    handleSaveDraft,
    newDraftName,
    setNewDraftName,
    setIsCompareModalOpen,
    setComparedDraftName,
  } = useInvestmentPlanner();

  const [activeTab, setActiveTab] = useState<'presets' | 'saved'>('presets');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isTemplatesModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = handleImportTemplates(content);
      if (ok) {
        setImportSuccess('Templates successfully imported!');
        setImportError(null);
        setActiveTab('saved');
      } else {
        setImportError('Invalid template JSON file format.');
        setImportSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadAndClose = (draft: Draft) => {
    handleLoadDraftObject(draft);
    setIsTemplatesModalOpen(false);
  };

  const handleCompareAndClose = (draftName: string) => {
    setComparedDraftName(draftName);
    setIsTemplatesModalOpen(false);
    setIsCompareModalOpen(true);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsTemplatesModalOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '95%', maxHeight: '88vh' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <div>
              <h2 className="section-title" style={{ marginBottom: '0.15rem' }}>
                Strategy Templates &amp; Scenarios
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
                Explore curated wealth-building blueprints or manage and export your saved scenarios.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsTemplatesModalOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Top Control Bar & Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className={`chip-btn ${activeTab === 'presets' ? 'active' : ''}`}
              onClick={() => setActiveTab('presets')}
            >
              🌟 Curated Blueprints ({presetTemplates.length})
            </button>
            <button
              type="button"
              className={`chip-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              📁 My Saved Plans ({savedDrafts.length})
            </button>
          </div>

          {/* Import / Export actions */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
              onClick={() => fileInputRef.current?.click()}
              title="Import saved templates from JSON"
            >
              📤 Import JSON
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
              onClick={handleExportTemplates}
              disabled={savedDrafts.length === 0}
              title="Export saved templates to a backup file"
            >
              📥 Export All ({savedDrafts.length})
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {importSuccess && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--green)', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '1rem' }}>
            ✓ {importSuccess}
          </div>
        )}
        {importError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--red)', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '1rem' }}>
            ⚠️ {importError}
          </div>
        )}

        {/* ── Save Current Setup Bar ── */}
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text)' }}>
            💾 Save Current Setup:
          </span>
          <input
            type="text"
            placeholder="e.g. My 2026 Horizon Plan..."
            value={newDraftName}
            onChange={(e) => setNewDraftName(e.target.value)}
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '0.35rem 0.6rem',
              fontSize: '0.76rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.76rem' }}
            onClick={() => {
              if (newDraftName.trim()) {
                handleSaveDraft();
                setActiveTab('saved');
              }
            }}
            disabled={!newDraftName.trim()}
          >
            Save as Template
          </button>
        </div>

        {/* ── Tab Content: Preset Blueprints ── */}
        {activeTab === 'presets' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {presetTemplates.map((template) => (
              <div
                key={template.name}
                className="card"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className="badge" style={{ fontSize: '0.68rem', fontWeight: '700' }}>
                      {template.country === 'AT' ? '🇦🇹 Austria' : '🇭🇺 Hungary'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                      {template.years}y Horizon
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.88rem', fontWeight: '700', margin: '0 0 0.4rem 0', color: 'var(--text)' }}>
                    {template.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gross Monthly:</span>
                      <strong style={{ color: 'var(--text)' }}>{formatCurrency(template.grossMonthly)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Monthly DCA:</span>
                      <strong style={{ color: 'var(--blue)' }}>{formatCurrency(template.monthlyInvest)}/mo</strong>
                    </div>
                    {(template.juneExtra > 0 || template.decemberExtra > 0) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>June/Dec Bonus DCA:</span>
                        <strong style={{ color: 'var(--yellow)' }}>+{formatCurrency(template.juneExtra)}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Return Profile:</span>
                      <span>{template.minRate}% – {template.maxRate}%</span>
                    </div>
                    {template.taxShieldMode && (
                      <div style={{ color: 'var(--green)', fontWeight: '600' }}>
                        🛡️ 0% Tax Shield Active (TBSZ)
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.74rem', padding: '0.35rem 0.5rem' }}
                    onClick={() => handleLoadAndClose(template)}
                  >
                    🚀 Load Blueprint
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '0.35rem 0.5rem' }}
                    title="Clone to My Saved Plans"
                    onClick={() => {
                      handleDuplicateDraft(template.name);
                      setActiveTab('saved');
                    }}
                  >
                    📋 Clone
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab Content: Saved Scenarios ── */}
        {activeTab === 'saved' && (
          <div>
            {savedDrafts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--muted)', background: 'var(--surface2)', borderRadius: '8px' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📁</span>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No custom saved plans yet.</p>
                <p style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                  Type a name above or clone a blueprint to start your custom strategy collection!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
                {savedDrafts.map((draft) => (
                  <div
                    key={draft.name}
                    className="card"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.65rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span className="badge" style={{ fontSize: '0.68rem', fontWeight: '700' }}>
                          {draft.country === 'AT' ? '🇦🇹 Austria' : '🇭🇺 Hungary'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                          {new Date(draft.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '0.88rem', fontWeight: '700', margin: '0 0 0.4rem 0', color: 'var(--text)' }}>
                        {draft.name}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--muted)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Timeline:</span>
                          <strong>{draft.years} Years</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Monthly DCA:</span>
                          <strong style={{ color: 'var(--blue)' }}>{formatCurrency(draft.monthlyInvest)}/mo</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Start Capital:</span>
                          <span>{formatCurrency(draft.startCapital)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Return Range:</span>
                          <span>{draft.minRate}% – {draft.maxRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ flex: 1, fontSize: '0.74rem', padding: '0.35rem 0.5rem' }}
                          onClick={() => handleLoadAndClose(draft)}
                        >
                          🚀 Load
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.74rem', padding: '0.35rem 0.5rem' }}
                          title="Compare with current plan"
                          onClick={() => handleCompareAndClose(draft.name)}
                        >
                          👥 Compare
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: '0.70rem', padding: '0.25rem 0.4rem' }}
                          onClick={() => handleDuplicateDraft(draft.name)}
                        >
                          📋 Duplicate
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.70rem', padding: '0.25rem 0.4rem', color: 'var(--red)' }}
                          onClick={() => handleDeleteDraft(draft.name)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsTemplatesModalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
