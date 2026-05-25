import { InvestmentPlannerProvider } from './context/InvestmentPlannerContext';
import ScenarioManager from './features/scenarios/ScenarioManager';
import TaxSection from './features/tax/TaxSection';
import InvestmentInputs from './features/projection/InvestmentInputs';
import MilestoneBuilder from './features/projection/MilestoneBuilder';
import BudgetRecommendations from './features/budget/BudgetRecommendations';
import ProjectionChart from './features/projection/ProjectionChart';
import ProjectionTable from './features/projection/ProjectionTable';
import './App.css';

export default function App() {
  return (
    <InvestmentPlannerProvider>
      <div className="app">
        <header className="app-header">
          <h1>🇦🇹 Austrian Investment Calculator</h1>
          <p className="subtitle">Project your wealth growth with Austrian tax considerations</p>
        </header>

        <div className="layout">
          <aside className="panel panel-inputs">
            <ScenarioManager />
            <TaxSection />
            <InvestmentInputs />
            <MilestoneBuilder />
          </aside>

          <main className="panel panel-results">
            <BudgetRecommendations />
            <ProjectionChart />
            <ProjectionTable />
          </main>
        </div>
      </div>
    </InvestmentPlannerProvider>
  );
}
