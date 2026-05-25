import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { TaxResult } from '../features/tax/taxCalculator';
import { calculateAustrianNetIncome } from '../features/tax/taxCalculator';
import type { Milestone, YearDataPoint, ProjectionResult } from '../features/projection/projectionEngine';
import { calculateProjection, yearlyContribution } from '../features/projection/projectionEngine';

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: 'need' | 'want';
}

export interface Draft {
  name: string;
  timestamp: number;
  grossMonthly: number;
  fixedCosts: number;
  startCapital: number;
  monthlyInvest: number;
  juneExtra: number;
  decemberExtra: number;
  years: number;
  minRate: number;
  maxRate: number;
  lifeInsurance: number;
  loanRepayment: number;
  stepUpRate?: number;
  milestones?: Milestone[];
  expenseMode?: 'simple' | 'detailed';
  expenseItems?: ExpenseItem[];
}

export interface PlannerContextType {
  // --- State Variables ---
  grossMonthly: number;
  setGrossMonthly: (v: number) => void;
  fixedCosts: number;
  setFixedCosts: (v: number) => void;
  startCapital: number;
  setStartCapital: (v: number) => void;
  monthlyInvest: number;
  setMonthlyInvest: (v: number) => void;
  juneExtra: number;
  setJuneExtra: (v: number) => void;
  decemberExtra: number;
  setDecemberExtra: (v: number) => void;
  years: number;
  setYears: (v: number) => void;
  minRate: number;
  setMinRate: (v: number) => void;
  maxRate: number;
  setMaxRate: (v: number) => void;
  lifeInsurance: number;
  setLifeInsurance: (v: number) => void;
  loanRepayment: number;
  setLoanRepayment: (v: number) => void;
  stepUpRate: number;
  setStepUpRate: (v: number) => void;
  milestones: Milestone[];
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  expenseMode: 'simple' | 'detailed';
  setExpenseMode: (mode: 'simple' | 'detailed') => void;
  expenseItems: ExpenseItem[];
  setExpenseItems: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  budgetYear: number;
  setBudgetYear: (year: number) => void;
  savedDrafts: Draft[];
  newDraftName: string;
  setNewDraftName: (name: string) => void;
  activeTab: 'investments' | 'expenses' | 'copilot';
  setActiveTab: (tab: 'investments' | 'expenses' | 'copilot') => void;
  showAfterTax: boolean;
  setShowAfterTax: (s: boolean) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  apiProvider: 'gemini' | 'openai' | 'openrouter';
  setApiProvider: (p: 'gemini' | 'openai' | 'openrouter') => void;
  aiOutput: string;
  setAiOutput: (o: string) => void;
  
  // --- Expense Tracker Builder states ---
  newExpenseName: string;
  setNewExpenseName: (v: string) => void;
  newExpenseAmount: number;
  setNewExpenseAmount: (v: number) => void;
  newExpenseCategory: 'need' | 'want';
  setNewExpenseCategory: (cat: 'need' | 'want') => void;

  // --- Milestone Builder states ---
  newMilestoneName: string;
  setNewMilestoneName: (v: string) => void;
  newMilestoneAmount: number;
  setNewMilestoneAmount: (v: number) => void;
  newMilestoneType: 'decrease' | 'increase';
  setNewMilestoneType: (v: 'decrease' | 'increase') => void;
  newMilestoneStartYear: number;
  setNewMilestoneStartYear: (v: number) => void;
  newMilestoneReinvest: boolean;
  setNewMilestoneReinvest: (v: boolean) => void;

  // --- Derived Memoized Projections ---
  taxResult: TaxResult;
  totalDetailedNeeds: number;
  totalDetailedWants: number;
  activeBaseFixedCosts: number;
  investableSurplus: number;
  projection: ProjectionResult;
  idealProjection: ProjectionResult;
  activeFixedCosts: number;
  activeMonthlyInvest: number;
  activeTotalMonthlySavings: number;
  needsPercent: number;
  savingsPercent: number;
  wantsPercent: number;
  bufferPercent: number;
  yearlyContrib: number;
  lastPoint: YearDataPoint;

  // --- Action Handlers ---
  handleSaveDraft: () => void;
  handleLoadDraft: (name: string) => void;
  handleDeleteDraft: (name: string) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const lastSession = (() => {
  try {
    const saved = localStorage.getItem('investment-calculator-last-session');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Failed to parse auto-save', e);
    return {};
  }
})();

export const InvestmentPlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Baseline inputs ──────────────────────────────────────────────────────
  const [grossMonthly, setGrossMonthly] = useState<number>(() => lastSession.grossMonthly ?? 3_500);
  const [fixedCosts, setFixedCosts] = useState<number>(() => lastSession.fixedCosts ?? 1_500);
  const [startCapital, setStartCapital] = useState<number>(() => lastSession.startCapital ?? 10_000);
  const [monthlyInvest, setMonthlyInvest] = useState<number>(() => lastSession.monthlyInvest ?? 300);
  const [juneExtra, setJuneExtra] = useState<number>(() => lastSession.juneExtra ?? 500);
  const [decemberExtra, setDecemberExtra] = useState<number>(() => lastSession.decemberExtra ?? 500);
  const [years, setYears] = useState<number>(() => lastSession.years ?? 20);
  const [minRate, setMinRate] = useState<number>(() => lastSession.minRate ?? 5);
  const [maxRate, setMaxRate] = useState<number>(() => lastSession.maxRate ?? 8);
  const [lifeInsurance, setLifeInsurance] = useState<number>(() => lastSession.lifeInsurance ?? 0);
  const [loanRepayment, setLoanRepayment] = useState<number>(() => lastSession.loanRepayment ?? 0);

  // ── Step ups & Milestones ────────────────────────────────────────────────
  const [stepUpRate, setStepUpRate] = useState<number>(() => lastSession.stepUpRate ?? 0);
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    if (lastSession.milestones) return lastSession.milestones;
    return [
      {
        id: 'default-loan-payoff',
        name: 'Car Loan Paid Off',
        amount: 300,
        type: 'decrease',
        startYear: 5,
        reinvest: true,
      }
    ];
  });

  // Milestone Builder local input states
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState<number>(300);
  const [newMilestoneType, setNewMilestoneType] = useState<'decrease' | 'increase'>('decrease');
  const [newMilestoneStartYear, setNewMilestoneStartYear] = useState<number>(5);
  const [newMilestoneReinvest, setNewMilestoneReinvest] = useState<boolean>(true);

  // ── Expense tracker ──────────────────────────────────────────────────────
  const [expenseMode, setExpenseMode] = useState<'simple' | 'detailed'>(() => lastSession.expenseMode ?? 'simple');
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(() => {
    if (lastSession.expenseItems) return lastSession.expenseItems;
    return [
      { id: 'exp-rent', name: 'Rent & Utilities', amount: 800, category: 'need' },
      { id: 'exp-groceries', name: 'Groceries', amount: 300, category: 'need' },
      { id: 'exp-insurance', name: 'Insurances & Bills', amount: 150, category: 'need' },
      { id: 'exp-dining', name: 'Restaurants & Hobbies', amount: 150, category: 'want' },
      { id: 'exp-gym', name: 'Gym & Sports', amount: 30, category: 'want' },
      { id: 'exp-streaming', name: 'Netflix & Spotify', amount: 20, category: 'want' },
    ];
  });

  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(50);
  const [newExpenseCategory, setNewExpenseCategory] = useState<'need' | 'want'>('need');

  // Forecasting Year
  const [budgetYear, setBudgetYear] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'investments' | 'expenses' | 'copilot'>('investments');
  const [showAfterTax, setShowAfterTax] = useState<boolean>(() => lastSession.showAfterTax ?? false);

  // AI Copilot credentials & outputs (loaded securely from standard localStorage)
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('finanzat-api-key') ?? '');
  const [apiProvider, setApiProvider] = useState<'gemini' | 'openai' | 'openrouter'>(() => {
    return (localStorage.getItem('finanzat-api-provider') as any) ?? 'gemini';
  });
  const [aiOutput, setAiOutput] = useState<string>(() => localStorage.getItem('finanzat-ai-output') ?? '');

  // Drafts
  const [savedDrafts, setSavedDrafts] = useState<Draft[]>(() => {
    const drafts = localStorage.getItem('investment-calculator-drafts');
    if (drafts) {
      try {
        return JSON.parse(drafts);
      } catch (e) {
        console.error('Failed to parse drafts', e);
      }
    }
    return [];
  });
  const [newDraftName, setNewDraftName] = useState('');

  // ── Auto-save to localStorage ───────────────────────────────────────────
  useEffect(() => {
    const data = {
      grossMonthly,
      fixedCosts,
      startCapital,
      monthlyInvest,
      juneExtra,
      decemberExtra,
      years,
      minRate,
      maxRate,
      lifeInsurance,
      loanRepayment,
      stepUpRate,
      milestones,
      expenseMode,
      expenseItems,
      showAfterTax,
    };
    localStorage.setItem('investment-calculator-last-session', JSON.stringify(data));
  }, [
    grossMonthly,
    fixedCosts,
    startCapital,
    monthlyInvest,
    juneExtra,
    decemberExtra,
    years,
    minRate,
    maxRate,
    lifeInsurance,
    loanRepayment,
    stepUpRate,
    milestones,
    expenseMode,
    expenseItems,
    showAfterTax,
  ]);

  // AI Key syncs
  useEffect(() => {
    localStorage.setItem('finanzat-api-key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('finanzat-api-provider', apiProvider);
  }, [apiProvider]);

  useEffect(() => {
    localStorage.setItem('finanzat-ai-output', aiOutput);
  }, [aiOutput]);

  // Adjust forecast timeline limits if projection years shrinks
  useEffect(() => {
    if (budgetYear > years) {
      setBudgetYear(years);
    }
  }, [years, budgetYear]);

  // ── Memoized derived logic & mathematical computations ───────────────────
  const taxResult = useMemo(
    () => calculateAustrianNetIncome(grossMonthly * 14),
    [grossMonthly]
  );

  const totalDetailedNeeds = useMemo(() => {
    return expenseItems.filter(item => item.category === 'need').reduce((sum, item) => sum + item.amount, 0);
  }, [expenseItems]);

  const totalDetailedWants = useMemo(() => {
    return expenseItems.filter(item => item.category === 'want').reduce((sum, item) => sum + item.amount, 0);
  }, [expenseItems]);

  const activeBaseFixedCosts = expenseMode === 'detailed' ? totalDetailedNeeds : fixedCosts;

  const investableSurplus = Math.max(0, taxResult.netRegularMonthly - activeBaseFixedCosts - totalDetailedWants);

  const projection = useMemo(
    () =>
      calculateProjection({
        startCapital,
        monthlyContribution: monthlyInvest,
        juneExtra,
        decemberExtra,
        years,
        minRate: minRate / 100,
        maxRate: maxRate / 100,
        stepUpRate: stepUpRate / 100,
        milestones,
        baseFixedCosts: activeBaseFixedCosts,
        marginalTaxRate: taxResult.marginalTaxRate,
      }),
    [startCapital, monthlyInvest, juneExtra, decemberExtra, years, minRate, maxRate, stepUpRate, milestones, activeBaseFixedCosts, taxResult.marginalTaxRate]
  );

  const idealProjection = useMemo(
    () =>
      calculateProjection({
        startCapital,
        monthlyContribution: Math.round(taxResult.netRegularMonthly * 0.2),
        juneExtra: Math.round(taxResult.net13th * 0.5),
        decemberExtra: Math.round(taxResult.net14th * 0.5),
        years,
        minRate: minRate / 100,
        maxRate: maxRate / 100,
        stepUpRate: 0,
        milestones: [],
        baseFixedCosts: activeBaseFixedCosts,
        marginalTaxRate: taxResult.marginalTaxRate,
      }),
    [startCapital, taxResult.netRegularMonthly, taxResult.net13th, taxResult.net14th, years, minRate, maxRate, activeBaseFixedCosts, taxResult.marginalTaxRate]
  );

  const activePointForBudget = useMemo(() => {
    return projection.dataPoints.find((dp) => dp.year === budgetYear) || projection.dataPoints[0];
  }, [projection.dataPoints, budgetYear]);

  const activeFixedCosts = activePointForBudget.fixedCostsActive;
  const activeMonthlyInvest = activePointForBudget.monthlyContribActive;
  const activeTotalMonthlySavings = activeMonthlyInvest + lifeInsurance + loanRepayment;

  const needsPercent = Math.min(100, Math.round((activeFixedCosts / taxResult.netRegularMonthly) * 100));
  const savingsPercent = Math.min(100, Math.round((activeTotalMonthlySavings / taxResult.netRegularMonthly) * 100));
  
  const baseWantsPercent = Math.min(100, Math.round((totalDetailedWants / taxResult.netRegularMonthly) * 100));
  const wantsPercent = expenseMode === 'detailed' ? baseWantsPercent : Math.max(0, 100 - needsPercent - savingsPercent);
  const bufferPercent = expenseMode === 'detailed' ? Math.max(0, 100 - needsPercent - savingsPercent - wantsPercent) : 0;

  const yearlyContrib = yearlyContribution(monthlyInvest, juneExtra, decemberExtra);
  const lastPoint = projection.dataPoints[projection.dataPoints.length - 1];

  // ── Scenarios / Named Plans handlers ────────────────────────────────────
  const handleSaveDraft = () => {
    if (!newDraftName.trim()) return;
    const newDraft: Draft = {
      name: newDraftName.trim(),
      timestamp: Date.now(),
      grossMonthly,
      fixedCosts,
      startCapital,
      monthlyInvest,
      juneExtra,
      decemberExtra,
      years,
      minRate,
      maxRate,
      lifeInsurance,
      loanRepayment,
      stepUpRate,
      milestones,
      expenseMode,
      expenseItems,
    };
    const updated = [newDraft, ...savedDrafts.filter((d) => d.name !== newDraft.name)];
    setSavedDrafts(updated);
    localStorage.setItem('investment-calculator-drafts', JSON.stringify(updated));
    setNewDraftName('');
  };

  const handleLoadDraft = (name: string) => {
    const found = savedDrafts.find((d) => d.name === name);
    if (found) {
      setGrossMonthly(found.grossMonthly);
      setFixedCosts(found.fixedCosts);
      setStartCapital(found.startCapital);
      setMonthlyInvest(found.monthlyInvest);
      setJuneExtra(found.juneExtra);
      setDecemberExtra(found.decemberExtra);
      setYears(found.years);
      setMinRate(found.minRate);
      setMaxRate(found.maxRate);
      setLifeInsurance(found.lifeInsurance ?? 0);
      setLoanRepayment(found.loanRepayment ?? 0);
      setStepUpRate(found.stepUpRate ?? 0);
      setMilestones(found.milestones ?? []);
      setExpenseMode(found.expenseMode ?? 'simple');
      setExpenseItems(found.expenseItems ?? []);
    }
  };

  const handleDeleteDraft = (name: string) => {
    const updated = savedDrafts.filter((d) => d.name !== name);
    setSavedDrafts(updated);
    localStorage.setItem('investment-calculator-drafts', JSON.stringify(updated));
  };

  return (
    <PlannerContext.Provider
      value={{
        grossMonthly, setGrossMonthly,
        fixedCosts, setFixedCosts,
        startCapital, setStartCapital,
        monthlyInvest, setMonthlyInvest,
        juneExtra, setJuneExtra,
        decemberExtra, setDecemberExtra,
        years, setYears,
        minRate, setMinRate,
        maxRate, setMaxRate,
        lifeInsurance, setLifeInsurance,
        loanRepayment, setLoanRepayment,
        stepUpRate, setStepUpRate,
        milestones, setMilestones,
        expenseMode, setExpenseMode,
        expenseItems, setExpenseItems,
        budgetYear, setBudgetYear,
        activeTab, setActiveTab,
        showAfterTax, setShowAfterTax,
        apiKey, setApiKey,
        apiProvider, setApiProvider,
        aiOutput, setAiOutput,
        savedDrafts,
        newDraftName, setNewDraftName,

        newExpenseName, setNewExpenseName,
        newExpenseAmount, setNewExpenseAmount,
        newExpenseCategory, setNewExpenseCategory,

        newMilestoneName, setNewMilestoneName,
        newMilestoneAmount, setNewMilestoneAmount,
        newMilestoneType, setNewMilestoneType,
        newMilestoneStartYear, setNewMilestoneStartYear,
        newMilestoneReinvest, setNewMilestoneReinvest,

        taxResult,
        totalDetailedNeeds,
        totalDetailedWants,
        activeBaseFixedCosts,
        investableSurplus,
        projection,
        idealProjection,
        activeFixedCosts,
        activeMonthlyInvest,
        activeTotalMonthlySavings,
        needsPercent,
        savingsPercent,
        wantsPercent,
        bufferPercent,
        yearlyContrib,
        lastPoint,

        handleSaveDraft,
        handleLoadDraft,
        handleDeleteDraft,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const useInvestmentPlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('useInvestmentPlanner must be used within an InvestmentPlannerProvider');
  }
  return context;
};
