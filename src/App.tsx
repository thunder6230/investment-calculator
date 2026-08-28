import { InvestmentPlannerProvider, useInvestmentPlanner } from './context/InvestmentPlannerContext';
import ScenarioManager from './features/scenarios/ScenarioManager';
import TaxSection from './features/tax/TaxSection';
import InvestmentInputs from './features/projection/InvestmentInputs';
import MilestoneBuilder from './features/projection/MilestoneBuilder';
import ExtraInvestmentsBuilder from './features/projection/ExtraInvestmentsBuilder';
import BudgetRecommendations from './features/budget/BudgetRecommendations';
import ProjectionChart from './features/projection/ProjectionChart';
import ProjectionTable from './features/projection/ProjectionTable';
import ExpenseTracker from './features/expenses/ExpenseTracker';
import ExpenseBreakdown from './features/expenses/ExpenseBreakdown';
import AICopilotConsole from './features/copilot/AICopilotConsole';
import './App.css';

function MainLayout() {
  const { activeTab, setActiveTab, country } = useInvestmentPlanner();

  return (
    <div className="app">
      <header className="app-header">
        <h1>{country === 'AT' ? '🇦🇹 Austrian Investment Calculator' : '🇭🇺 Hungarian Investment Calculator'}</h1>
        <p className="subtitle">
          {country === 'AT'
            ? 'Project your wealth growth with Austrian tax considerations (Einkommensteuer & KeSt)'
            : 'Project your wealth growth with Hungarian tax rules (15% PIT & 18.5% TB)'}
        </p>
      </header>

      <div className="layout-container">
        {/* Navigation Top Bar / Tabs */}
        <nav className="navbar">
          <div className="navbar-logo">
            <span style={{ fontSize: '1.4rem' }}>{country === 'AT' ? '🏔️' : '🏰'}</span>
            <span style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text)', letterSpacing: '0.5px' }}>
              {country === 'AT' ? 'FinanzAT Pro' : 'FinanzHU Pro'}
            </span>
          </div>
          
          <div className="navbar-menu">
            <button
              className={`navbar-item ${activeTab === 'investments' ? 'active' : ''}`}
              onClick={() => setActiveTab('investments')}
            >
              <span className="navbar-icon">📈</span>
              <span className="navbar-label">Investments</span>
            </button>
            <button
              className={`navbar-item ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              <span className="navbar-icon">💸</span>
              <span className="navbar-label">Expenses &amp; Budget</span>
            </button>
            <button
              className={`navbar-item ${activeTab === 'copilot' ? 'active' : ''}`}
              onClick={() => setActiveTab('copilot')}
            >
              <span className="navbar-icon">🤖</span>
              <span className="navbar-label">AI Copilot</span>
            </button>
          </div>
          
          <div className="navbar-info">
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '0.35rem 0.60rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              {country === 'AT' ? 'ℹ️ Austrian Tax Rules 2024–2026' : 'ℹ️ Hungarian Tax Rules (15% PIT + 18.5% TB)'}
            </div>
          </div>
        </nav>

        {/* Content Tabs */}
        <div className="layout-content">
          {activeTab === 'investments' && (
            <div className="layout">
              <aside className="panel panel-inputs">
                <ScenarioManager />
                <TaxSection />
                <InvestmentInputs />
                <ExtraInvestmentsBuilder />
                <MilestoneBuilder />
              </aside>

              <main className="panel panel-results">
                <ProjectionChart />
                <ProjectionTable />
              </main>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="layout">
              <aside className="panel panel-inputs">
                <ExpenseTracker />
              </aside>

              <main className="panel panel-results">
                <ExpenseBreakdown />
                <BudgetRecommendations />
              </main>
            </div>
          )}

          {activeTab === 'copilot' && (
            <AICopilotConsole />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <InvestmentPlannerProvider>
      <MainLayout />
    </InvestmentPlannerProvider>
  );
}
