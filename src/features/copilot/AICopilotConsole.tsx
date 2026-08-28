import { useState } from 'react';
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { executeAudit, getMockAudit } from '../../utils/aiCopilotService';

export default function AICopilotConsole() {
  const {
    grossMonthly,
    fixedCosts,
    startCapital,
    monthlyInvest,
    juneExtra,
    decemberExtra,
    years,
    stepUpRate,
    lifeInsurance,
    loanRepayment,
    expenseMode,
    expenseItems,
    taxResult,
    projection,
    lastPoint,
    investableSurplus,
    activeFixedCosts,
    totalDetailedNeeds,
    totalDetailedWants,
    wantsPercent,
    activeTotalMonthlySavings,
    extraInvestments,
    apiKey,
    setApiKey,
    apiProvider,
    setApiProvider,
    aiOutput,
    setAiOutput,
  } = useInvestmentPlanner();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Compile active data payload for audit execution
  const getAuditPayload = () => ({
    grossMonthly,
    fixedCosts,
    startCapital,
    monthlyInvest,
    juneExtra,
    decemberExtra,
    years,
    stepUpRate,
    lifeInsurance,
    loanRepayment,
    expenseMode,
    expenseItems,
    taxResult,
    projection,
    lastPoint,
    investableSurplus,
    activeFixedCosts,
    totalDetailedNeeds,
    totalDetailedWants,
    wantsPercent,
    activeTotalMonthlySavings,
    extraInvestments,
  });

  const handleRunRealAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = getAuditPayload();
      const output = await executeAudit(apiProvider, apiKey, payload);
      setAiOutput(output);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during API execution.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMockAudit = () => {
    setLoading(true);
    setError(null);
    // Simulate loading for realistic micro-animation feel
    setTimeout(() => {
      try {
        const payload = getAuditPayload();
        const output = getMockAudit(payload);
        setAiOutput(output);
      } catch {
        setError('Failed to run mock simulated audit.');
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  // Premium Custom Markdown Parser to translate raw strings to styled HTML elements
  const parseMarkdownToReact = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let keyCounter = 0;
    
    // Auxiliary state trackers for custom alerts & lists
    let activeAlert: { type: string; content: string[] } | null = null;
    let activeList: string[] = [];

    const flushAlert = () => {
      if (activeAlert) {
        const type = activeAlert.type;
        
        let bgColor = 'rgba(96, 165, 250, 0.08)';
        let borderColor = 'rgba(96, 165, 250, 0.3)';
        let titleColor = 'var(--blue)';
        let emoji = 'ℹ️';

        if (type === 'WARNING') {
          bgColor = 'rgba(250, 204, 21, 0.08)';
          borderColor = 'rgba(250, 204, 21, 0.3)';
          titleColor = 'var(--yellow)';
          emoji = '⚠️';
        } else if (type === 'IMPORTANT') {
          bgColor = 'rgba(52, 211, 153, 0.08)';
          borderColor = 'rgba(52, 211, 153, 0.3)';
          titleColor = 'var(--emerald)';
          emoji = '🚀';
        }

        elements.push(
          <div
            key={`alert-${keyCounter++}`}
            style={{
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              padding: '0.85rem 1.1rem',
              margin: '1rem 0',
              fontSize: '0.8rem',
              lineHeight: '1.45',
            }}
          >
            <div style={{ color: titleColor, fontWeight: '700', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{emoji}</span> <span>{type}</span>
            </div>
            <div style={{ color: 'var(--text)' }}>
              {activeAlert.content.map((c, i) => <p key={i} style={{ margin: '0.2rem 0' }}>{renderBoldText(c)}</p>)}
            </div>
          </div>
        );
        activeAlert = null;
      }
    };

    const flushList = () => {
      if (activeList.length > 0) {
        elements.push(
          <ul key={`list-${keyCounter++}`} style={{ paddingLeft: '1.2rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {activeList.map((item, index) => (
              <li key={index} style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.45' }}>
                {renderBoldText(item)}
              </li>
            ))}
          </ul>
        );
        activeList = [];
      }
    };

    const renderBoldText = (str: string) => {
      const parts = str.split('**');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} style={{ color: 'var(--text)', fontWeight: '600' }}>{part}</strong>;
        }
        return part;
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle Alert block starters
      if (line.startsWith('> [!')) {
        flushList();
        const type = line.replace('> [!', '').replace(']', '').trim();
        activeAlert = { type, content: [] };
        continue;
      }

      // Handle Alert block contents
      if (activeAlert && line.startsWith('>')) {
        const text = line.replace('>', '').trim();
        activeAlert.content.push(text);
        continue;
      }

      // If alert was active but line does not start with '>', flush it
      if (activeAlert && !line.startsWith('>')) {
        flushAlert();
      }

      // Handle standard lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        activeList.push(text);
        continue;
      }

      // Flush list if active but current line is not list item
      if (activeList.length > 0) {
        flushList();
      }

      // Handle Headings
      if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1-${keyCounter++}`} style={{ fontSize: '1.25rem', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--text)' }}>{renderBoldText(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2-${keyCounter++}`} style={{ fontSize: '1.05rem', fontWeight: '700', marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--blue)' }}>{renderBoldText(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={`h3-${keyCounter++}`} style={{ fontSize: '0.88rem', fontWeight: '700', marginTop: '1rem', marginBottom: '0.4rem', color: 'var(--text)' }}>{renderBoldText(line.substring(4))}</h3>);
      } 
      // Handle dividers
      else if (line.trim() === '---') {
        elements.push(<hr key={`divider-${keyCounter++}`} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />);
      } 
      // Handle standard paragraphs
      else if (line.trim().length > 0) {
        elements.push(<p key={`p-${keyCounter++}`} style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.5', margin: '0.5rem 0' }}>{renderBoldText(line)}</p>);
      }
    }

    // Flush any leftover open blocks
    flushAlert();
    flushList();

    return elements;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* LEFT: Credentials & Privacy Setup */}
      <aside className="panel panel-inputs">
        {/* Privacy Card */}
        <section className="card" style={{ borderLeft: '3px solid var(--blue)' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            🔒 Local Client Privacy
          </h2>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', lineHeight: '1.45' }}>
            All computations occur local to your browser. Your salaries, asset valuations, investments, and API keys are **never** uploaded to any external database or server.
          </div>
        </section>

        {/* Credentials Panel */}
        <section className="card">
          <h2 className="section-title">🗝️ AI API Key Settings</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Provider Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                Select API Provider
              </label>
              <select
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value as 'gemini' | 'openai' | 'openrouter')}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  fontSize: '0.78rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="gemini">Google Gemini API (Recommended)</option>
                <option value="openai">OpenAI ChatGPT API</option>
                <option value="openrouter">OpenRouter API</option>
              </select>
            </div>

            {/* API Key Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                Enter Secret API Key
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="e.g. AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 2rem 0.45rem 0.5rem',
                    fontSize: '0.74rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface2)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {showKey ? '👁️' : '🙈'}
                </button>
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--muted)', display: 'block', marginTop: '0.25rem' }}>
                Fully stored inside your local browser storage.
              </span>
            </div>

            {/* Actions Trigger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleRunRealAudit}
                disabled={loading || !apiKey.trim()}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  background: loading || !apiKey.trim() ? 'var(--border)' : 'var(--blue)',
                  color: loading || !apiKey.trim() ? 'var(--muted)' : '#0f172a',
                  cursor: loading || !apiKey.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {loading ? '🔮 Auditing...' : '🔍 Run AI Financial Audit'}
              </button>

              <button
                onClick={handleRunMockAudit}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                ✨ Run Simulated Audit (No Key)
              </button>
            </div>
            
            {error && (
              <div style={{ color: 'var(--red)', background: 'rgba(248, 113, 113, 0.1)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.7rem', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                🚨 {error}
              </div>
            )}
          </div>
        </section>
      </aside>

      {/* RIGHT: recommendations analysis visual output */}
      <main className="panel panel-results">
        <section className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem 0' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--border)',
                borderTop: '3px solid var(--blue)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500', animation: 'pulse 1.5s infinite alternate ease-in-out' }}>
                FinanzAT Pro AI compiling progressive tax brackets, caching growth data, and running cash flow security check...
              </div>
            </div>
          ) : aiOutput ? (
            <div className="ai-report-body" style={{ padding: '0.25rem 0.5rem' }}>
              {parseMarkdownToReact(aiOutput)}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem 0', color: 'var(--muted)', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem', opacity: '0.5' }}>🤖</span>
              <div>
                <h3 style={{ color: 'var(--text)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>FinanzAT Pro Copilot Idle</h3>
                <p style={{ fontSize: '0.76rem', maxWidth: '360px', margin: '0 auto', lineHeight: '1.4' }}>
                  Enter your API key or click **Simulated Audit** to analyze your personal progressive income taxes, expense logs, and KeSt growth brackets.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Keyframe animations injected for loader spinners */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
