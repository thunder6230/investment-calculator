import { useState } from 'react';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import type { Country } from './taxCalculator';

export default function CountryProfileCard() {
  const { country, setCountry } = useInvestmentPlanner();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideCountryTab, setGuideCountryTab] = useState<Country>(country);

  const openGuide = (c?: Country) => {
    setGuideCountryTab(c || country);
    setIsGuideOpen(true);
  };

  return (
    <>
      <section className="card" style={{ borderTop: '3px solid var(--blue)', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🌍</span>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Tax Jurisdiction</h2>
          </div>
          
          {/* Info Button with Tooltip */}
          <button
            type="button"
            onClick={() => openGuide(country)}
            title="Open Country Tax &amp; Investment Guide"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.72rem',
              color: 'var(--blue)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: '600',
              transition: 'all 0.15s ease',
            }}
          >
            <span>ℹ️</span> Tax Guide
          </button>
        </div>

        {/* ── Country Switcher Segmented Control ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            background: 'var(--surface2)',
            padding: '0.3rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            marginBottom: '0.85rem',
          }}
        >
          <button
            type="button"
            onClick={() => setCountry('AT')}
            style={{
              padding: '0.45rem 0.5rem',
              fontSize: '0.80rem',
              fontWeight: country === 'AT' ? '700' : '500',
              borderRadius: '6px',
              border: 'none',
              background: country === 'AT' ? 'var(--blue)' : 'transparent',
              color: country === 'AT' ? '#ffffff' : 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🇦🇹</span> Austria (AT)
          </button>
          <button
            type="button"
            onClick={() => setCountry('HU')}
            style={{
              padding: '0.45rem 0.5rem',
              fontSize: '0.80rem',
              fontWeight: country === 'HU' ? '700' : '500',
              borderRadius: '6px',
              border: 'none',
              background: country === 'HU' ? 'var(--blue)' : 'transparent',
              color: country === 'HU' ? '#ffffff' : 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🇭🇺</span> Hungary (HU)
          </button>
        </div>

        {/* ── Country Profile Overview & Badges ── */}
        {country === 'AT' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>Salary Schedule:</span>
              <strong style={{ color: 'var(--yellow)' }}>14 Payments (12 regular + 2 bonuses)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>Income Tax:</span>
              <span>Progressive (0% up to 50%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>13th &amp; 14th Tax:</span>
              <span style={{ color: 'var(--green)' }}>Flat 6% (first €620 tax-free)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>Social Security:</span>
              <span>SVS ~18.12% (cap €6,060/mo)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>Capital Gains (KeSt):</span>
              <span>27.5% (or progressive option)</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>Salary Schedule:</span>
              <strong>12 Monthly Payments</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>Income Tax (SZJA):</span>
              <span>Flat 15%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>Social Security (TB):</span>
              <span>18.5% (Total 33.5% deduction)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>TBSZ Tax Shield:</span>
              <strong style={{ color: 'var(--green)' }}>0% Tax after 5-year lock-in! 🛡️</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)' }}>
              <span style={{ color: 'var(--muted)' }}>Standard Cap Gains:</span>
              <span>15% SZJA + 13% SZOCHO</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Tax & Investment Legislation Modal ── */}
      {isGuideOpen && (
        <div className="modal-overlay" onClick={() => setIsGuideOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>📖</span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Tax &amp; Investment Legislation Guide</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsGuideOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Country Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setGuideCountryTab('AT')}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  background: guideCountryTab === 'AT' ? 'var(--blue)' : 'var(--surface2)',
                  color: guideCountryTab === 'AT' ? '#ffffff' : 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                🇦🇹 Austrian Tax &amp; ETF Guide
              </button>
              <button
                type="button"
                onClick={() => setGuideCountryTab('HU')}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  background: guideCountryTab === 'HU' ? 'var(--blue)' : 'var(--surface2)',
                  color: guideCountryTab === 'HU' ? '#ffffff' : 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                🇭🇺 Hungarian Tax &amp; TBSZ Guide
              </button>
            </div>

            {/* Guide Content */}
            {guideCountryTab === 'AT' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem', lineHeight: '1.55', color: 'var(--text)' }}>
                <div style={{ background: 'var(--surface2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--yellow)', fontSize: '0.92rem' }}>
                    🎁 13th &amp; 14th Salary Superpower (Urlaubsgeld &amp; Weihnachtsgeld)
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.78rem' }}>
                    Austrian labor law guarantees 14 salary payments. The extra 13th (June) and 14th (December) payments enjoy preferential taxation: the first <strong>€620 is completely tax-free</strong>, and the rest is taxed at only <strong>flat 6%</strong> (compared to up to 50% on regular salary).
                    <br /><strong style={{ color: 'var(--green)' }}>💡 Wealth Strategy:</strong> Investing your net 13th and 14th salaries into your ETF portfolio supercharges compounding.
                  </p>
                </div>

                <div style={{ background: 'var(--surface2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--blue)', fontSize: '0.92rem' }}>
                    🏛️ Austrian Progressive Income Tax Brackets (2024–2026)
                  </h3>
                  <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, color: 'var(--muted)', fontSize: '0.78rem' }}>
                    <li><strong>€0 – €12,816:</strong> 0% (Tax-Free Grundfreibetrag)</li>
                    <li><strong>€12,816 – €20,818:</strong> 20%</li>
                    <li><strong>€20,818 – €34,513:</strong> 30%</li>
                    <li><strong>€34,513 – €66,612:</strong> 40%</li>
                    <li><strong>€66,612 – €99,266:</strong> 48%</li>
                    <li><strong>Above €99,266:</strong> 50% (55% above €1M)</li>
                  </ul>
                </div>

                <div style={{ background: 'var(--surface2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--teal)', fontSize: '0.92rem' }}>
                    📈 Capital Gains Tax (KeSt &amp; Meldefonds)
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.78rem' }}>
                    Standard capital gains on securities &amp; ETFs are taxed at <strong>27.5% KeSt</strong> (*Kapitalertragsteuer*).
                    <br />
                    • <strong>Meldefonds:</strong> ETFs that report annual deemed distributed income (*ausschüttungsgleiche Erträge*) to the OeKB are automatically tax-optimized by Austrian tax-compliant brokers (e.g. Flatex AT).
                    <br />
                    • <strong>Regelbesteuerungsoption:</strong> If your total marginal income tax bracket is below 27.5% (under ~€20k/yr), you can elect to have investment returns taxed at your lower income tax rate instead of 27.5%.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem', lineHeight: '1.55', color: 'var(--text)' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--green)', fontSize: '0.92rem' }}>
                    🛡️ TBSZ (Tartós Befektetési Számla) — 0% Tax Shelter
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.78rem' }}>
                    The **TBSZ account** is Hungary's ultimate investment vehicle:
                    <br />
                    • <strong>Year 0 (Deposit Year):</strong> Deposit funds into the account.
                    <br />
                    • <strong>Years 1 – 3:</strong> 15% tax if withdrawn early.
                    <br />
                    • <strong>Years 3 – 5:</strong> Discounted 10% tax.
                    <br />
                    • <strong>After 5 Years:</strong> <strong style={{ color: 'var(--green)' }}>0% Capital Gains Tax &amp; 0% SZOCHO!</strong>
                    <br />All capital gains, ETF dividends, and compounded returns are 100% tax-free.
                  </p>
                </div>

                <div style={{ background: 'var(--surface2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--blue)', fontSize: '0.92rem' }}>
                    🇭🇺 Hungarian Flat Income Tax Structure
                  </h3>
                  <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, color: 'var(--muted)', fontSize: '0.78rem' }}>
                    <li><strong>Personal Income Tax (SZJA):</strong> Flat 15% on gross employment salary.</li>
                    <li><strong>Social Security Contribution (TB):</strong> Flat 18.5%.</li>
                    <li><strong>Total Standard Deduction:</strong> Flat 33.5% ($$Net = Gross \times 66.5\%$$).</li>
                    <li><strong>Family Tax Benefit:</strong> Additional tax base reductions available for families with children.</li>
                  </ul>
                </div>

                <div style={{ background: 'var(--surface2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--yellow)', fontSize: '0.92rem' }}>
                    ⚠️ Non-TBSZ Investment Taxation
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.78rem' }}>
                    If investing outside a TBSZ account in standard non-sheltered brokerage accounts, investment profits and interest are subject to <strong>15% SZJA + 13% SZOCHO</strong> (Social Contribution Tax, up to the annual cap), creating significant tax drag compared to TBSZ investing.
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsGuideOpen(false)}
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
