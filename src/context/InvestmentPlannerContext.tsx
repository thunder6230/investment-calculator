import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { TaxResult, Country } from '../features/tax/taxCalculator';
import { calculateNetIncome } from '../features/tax/taxCalculator';
import type {
  Milestone,
  ExtraInvestmentEvent,
  YearDataPoint,
  ProjectionResult,
  FireMetrics,
} from '../features/projection/projectionEngine';
import {
  calculateProjection,
  yearlyContribution,
  calculateFireMetrics,
} from '../features/projection/projectionEngine';

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
  salaryPeriod?: 'monthly' | 'yearly';
  country?: Country;
  zuschlagMonthly?: number;
  zuschlagSvsSubject?: boolean;
  extraInvestments?: ExtraInvestmentEvent[];
  adjustForInflation?: boolean;
  inflationRate?: number;
  taxShieldMode?: boolean;
}

export interface PlannerContextType {
  // --- State Variables ---
  country: Country;
  setCountry: (c: Country) => void;
  salaryPeriod: 'monthly' | 'yearly';
  setSalaryPeriod: (p: 'monthly' | 'yearly') => void;
  grossMonthly: number;
  setGrossMonthly: (v: number) => void;
  zuschlagMonthly: number;
  setZuschlagMonthly: (v: number) => void;
  zuschlagSvsSubject: boolean;
  setZuschlagSvsSubject: (v: boolean) => void;
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
  extraInvestments: ExtraInvestmentEvent[];
  setExtraInvestments: React.Dispatch<React.SetStateAction<ExtraInvestmentEvent[]>>;
  expenseMode: 'simple' | 'detailed';
  setExpenseMode: (mode: 'simple' | 'detailed') => void;
  expenseItems: ExpenseItem[];
  setExpenseItems: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  budgetYear: number;
  setBudgetYear: (year: number) => void;
  savedDrafts: Draft[];
  newDraftName: string;
  setNewDraftName: (name: string) => void;
  activeTab: 'investments' | 'expenses' | 'fire' | 'copilot';
  setActiveTab: (tab: 'investments' | 'expenses' | 'fire' | 'copilot') => void;
  showAfterTax: boolean;
  setShowAfterTax: (s: boolean) => void;
  
  // --- New Financial Features States ---
  adjustForInflation: boolean;
  setAdjustForInflation: (v: boolean) => void;
  inflationRate: number;
  setInflationRate: (v: number) => void;
  safeWithdrawalRate: number;
  setSafeWithdrawalRate: (v: number) => void;
  taxShieldMode: boolean;
  setTaxShieldMode: (v: boolean) => void;
  isGoalSolverOpen: boolean;
  setIsGoalSolverOpen: (v: boolean) => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (v: boolean) => void;
  comparedDraftName: string | null;
  setComparedDraftName: (name: string | null) => void;

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

  // --- Extra Investment Event Builder states ---
  newEventName: string;
  setNewEventName: (v: string) => void;
  newEventAmount: number;
  setNewEventAmount: (v: number) => void;
  newEventYear: number;
  setNewEventYear: (v: number) => void;
  newEventApplyUpcoming: boolean;
  setNewEventApplyUpcoming: (v: boolean) => void;

  // --- Derived Memoized Projections ---
  taxResult: TaxResult;
  totalDetailedNeeds: number;
  totalDetailedWants: number;
  activeBaseFixedCosts: number;
  investableSurplus: number;
  projection: ProjectionResult;
  displayProjection: ProjectionResult;
  idealProjection: ProjectionResult;
  fireMetrics: FireMetrics;
  comparedDraft: Draft | null;
  comparedProjection: ProjectionResult | null;
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
  handleApplyGoalSolution: (monthlyAmount: number, yearsCount: number) => void;
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
  const [country, setCountry] = useState<Country>(() => lastSession.country ?? 'AT');
  const [salaryPeriod, setSalaryPeriod] = useState<'monthly' | 'yearly'>(() => lastSession.salaryPeriod ?? 'monthly');
  const [grossMonthly, setGrossMonthly] = useState<number>(() => lastSession.grossMonthly ?? 3_500);
  const [zuschlagMonthly, setZuschlagMonthly] = useState<number>(() => lastSession.zuschlagMonthly ?? 0);
  const [zuschlagSvsSubject, setZuschlagSvsSubject] = useState<boolean>(() => lastSession.zuschlagSvsSubject ?? true);
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

  // ── Inflation, FIRE, Tax Shields & Modal states ────────────────────────
  const [adjustForInflation, setAdjustForInflation] = useState<boolean>(() => lastSession.adjustForInflation ?? false);
  const [inflationRate, setInflationRate] = useState<number>(() => lastSession.inflationRate ?? 2.0);
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(() => lastSession.safeWithdrawalRate ?? 4.0);
  const [taxShieldMode, setTaxShieldMode] = useState<boolean>(() => lastSession.taxShieldMode ?? false);
  
  // Modals & Comparison
  const [isGoalSolverOpen, setIsGoalSolverOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [comparedDraftName, setComparedDraftName] = useState<string | null>(null);

  // ── Extra Investment Events ──────────────────────────────────────────────
  const [extraInvestments, setExtraInvestments] = useState<ExtraInvestmentEvent[]>(() => {
    if (lastSession.extraInvestments) return lastSession.extraInvestments;
    return [
      {
        id: 'default-promo-bonus',
        name: 'Promotion Bonus',
        amount: 2500,
        year: 2,
        applyUpcomingYears: false,
      }
    ];
  });

  const [newEventName, setNewEventName] = useState('');
  const [newEventAmount, setNewEventAmount] = useState<number>(1000);
  const [newEventYear, setNewEventYear] = useState<number>(3);
  const [newEventApplyUpcoming, setNewEventApplyUpcoming] = useState<boolean>(false);

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
  const [activeTab, setActiveTab] = useState<'investments' | 'expenses' | 'fire' | 'copilot'>('investments');
  const [showAfterTax, setShowAfterTax] = useState<boolean>(() => lastSession.showAfterTax ?? false);

  // AI Copilot credentials & outputs (loaded securely from standard localStorage)
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('finanzat-api-key') ?? '');
  const [apiProvider, setApiProvider] = useState<'gemini' | 'openai' | 'openrouter'>(() => {
    return (localStorage.getItem('finanzat-api-provider') as 'gemini' | 'openai' | 'openrouter') ?? 'gemini';
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
      country,
      salaryPeriod,
      grossMonthly,
      zuschlagMonthly,
      zuschlagSvsSubject,
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
      extraInvestments,
      expenseMode,
      expenseItems,
      showAfterTax,
      adjustForInflation,
      inflationRate,
      safeWithdrawalRate,
      taxShieldMode,
    };
    localStorage.setItem('investment-calculator-last-session', JSON.stringify(data));
  }, [
    country,
    salaryPeriod,
    grossMonthly,
    zuschlagMonthly,
    zuschlagSvsSubject,
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
    extraInvestments,
    expenseMode,
    expenseItems,
    showAfterTax,
    adjustForInflation,
    inflationRate,
    safeWithdrawalRate,
    taxShieldMode,
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

  const effectiveBudgetYear = Math.min(budgetYear, years);

  // ── Memoized derived logic & mathematical computations ───────────────────
  const taxResult = useMemo(
    () => calculateNetIncome(grossMonthly, country, zuschlagMonthly, zuschlagSvsSubject),
    [grossMonthly, country, zuschlagMonthly, zuschlagSvsSubject]
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
        extraInvestments,
        baseFixedCosts: activeBaseFixedCosts,
        marginalTaxRate: taxResult.marginalTaxRate,
        taxShieldMode,
      }),
    [
      startCapital,
      monthlyInvest,
      juneExtra,
      decemberExtra,
      years,
      minRate,
      maxRate,
      stepUpRate,
      milestones,
      extraInvestments,
      activeBaseFixedCosts,
      taxResult.marginalTaxRate,
      taxShieldMode,
    ]
  );

  // Projection with Inflation Purchasing Power discount applied if enabled
  const displayProjection = useMemo(() => {
    if (!adjustForInflation || inflationRate <= 0) return projection;
    const infDecimal = inflationRate / 100;
    const discountedDataPoints = projection.dataPoints.map((dp) => {
      const discount = Math.pow(1 + infDecimal, dp.year);
      return {
        ...dp,
        paidIn: Math.round(dp.paidIn / discount),
        low: Math.round(dp.low / discount),
        high: Math.round(dp.high / discount),
        midpoint: Math.round(dp.midpoint / discount),
        lowAfterTax: Math.round(dp.lowAfterTax / discount),
        highAfterTax: Math.round(dp.highAfterTax / discount),
        midpointAfterTax: Math.round(dp.midpointAfterTax / discount),
      };
    });
    return {
      ...projection,
      dataPoints: discountedDataPoints,
      monthlyPayoutLow: Math.round(projection.monthlyPayoutLow / Math.pow(1 + infDecimal, years)),
      monthlyPayoutHigh: Math.round(projection.monthlyPayoutHigh / Math.pow(1 + infDecimal, years)),
      monthlyPayoutMid: Math.round(projection.monthlyPayoutMid / Math.pow(1 + infDecimal, years)),
      monthlyPayoutLowAfterTax: Math.round(projection.monthlyPayoutLowAfterTax / Math.pow(1 + infDecimal, years)),
      monthlyPayoutHighAfterTax: Math.round(projection.monthlyPayoutHighAfterTax / Math.pow(1 + infDecimal, years)),
      monthlyPayoutMidAfterTax: Math.round(projection.monthlyPayoutMidAfterTax / Math.pow(1 + infDecimal, years)),
    };
  }, [projection, adjustForInflation, inflationRate, years]);

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
        extraInvestments: [],
        baseFixedCosts: activeBaseFixedCosts,
        marginalTaxRate: taxResult.marginalTaxRate,
        taxShieldMode,
      }),
    [startCapital, taxResult.netRegularMonthly, taxResult.net13th, taxResult.net14th, years, minRate, maxRate, activeBaseFixedCosts, taxResult.marginalTaxRate, taxShieldMode]
  );

  // ── FIRE calculation ──────────────────────────────────────────────────────
  const totalMonthlyExpenses = activeBaseFixedCosts + totalDetailedWants;
  const fireMetrics = useMemo(() => {
    return calculateFireMetrics(
      totalMonthlyExpenses > 0 ? totalMonthlyExpenses : fixedCosts,
      safeWithdrawalRate / 100,
      startCapital,
      projection.dataPoints,
      years,
      (minRate + maxRate) / 200
    );
  }, [totalMonthlyExpenses, fixedCosts, safeWithdrawalRate, startCapital, projection.dataPoints, years, minRate, maxRate]);

  // ── Compared Draft calculations ──────────────────────────────────────────
  const comparedDraft = useMemo(() => {
    if (!comparedDraftName) return null;
    return savedDrafts.find((d) => d.name === comparedDraftName) ?? null;
  }, [comparedDraftName, savedDrafts]);

  const comparedProjection = useMemo(() => {
    if (!comparedDraft) return null;
    return calculateProjection({
      startCapital: comparedDraft.startCapital,
      monthlyContribution: comparedDraft.monthlyInvest,
      juneExtra: comparedDraft.juneExtra,
      decemberExtra: comparedDraft.decemberExtra,
      years: comparedDraft.years,
      minRate: comparedDraft.minRate / 100,
      maxRate: comparedDraft.maxRate / 100,
      stepUpRate: (comparedDraft.stepUpRate ?? 0) / 100,
      milestones: comparedDraft.milestones ?? [],
      extraInvestments: comparedDraft.extraInvestments ?? [],
      baseFixedCosts: comparedDraft.fixedCosts,
      taxShieldMode: comparedDraft.taxShieldMode,
    });
  }, [comparedDraft]);

  const activePointForBudget = useMemo(() => {
    return projection.dataPoints.find((dp) => dp.year === effectiveBudgetYear) || projection.dataPoints[0];
  }, [projection.dataPoints, effectiveBudgetYear]);

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
      extraInvestments,
      expenseMode,
      expenseItems,
      salaryPeriod,
      country,
      zuschlagMonthly,
      zuschlagSvsSubject,
      adjustForInflation,
      inflationRate,
      taxShieldMode,
    };
    const updated = [newDraft, ...savedDrafts.filter((d) => d.name !== newDraft.name)];
    setSavedDrafts(updated);
    localStorage.setItem('investment-calculator-drafts', JSON.stringify(updated));
    setNewDraftName('');
  };

  const handleLoadDraft = (name: string) => {
    const found = savedDrafts.find((d) => d.name === name);
    if (found) {
      setCountry(found.country ?? 'AT');
      if (found.salaryPeriod) setSalaryPeriod(found.salaryPeriod);
      setGrossMonthly(found.grossMonthly);
      setZuschlagMonthly(found.zuschlagMonthly ?? 0);
      setZuschlagSvsSubject(found.zuschlagSvsSubject ?? true);
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
      setExtraInvestments(found.extraInvestments ?? []);
      setExpenseMode(found.expenseMode ?? 'simple');
      setExpenseItems(found.expenseItems ?? []);
      if (found.adjustForInflation !== undefined) setAdjustForInflation(found.adjustForInflation);
      if (found.inflationRate !== undefined) setInflationRate(found.inflationRate);
      if (found.taxShieldMode !== undefined) setTaxShieldMode(found.taxShieldMode);
    }
  };

  const handleDeleteDraft = (name: string) => {
    const updated = savedDrafts.filter((d) => d.name !== name);
    setSavedDrafts(updated);
    localStorage.setItem('investment-calculator-drafts', JSON.stringify(updated));
  };

  const handleApplyGoalSolution = (monthlyAmount: number, yearsCount: number) => {
    setMonthlyInvest(monthlyAmount);
    setYears(yearsCount);
    setIsGoalSolverOpen(false);
  };

  return (
    <PlannerContext.Provider
      value={{
        country, setCountry,
        salaryPeriod, setSalaryPeriod,
        grossMonthly, setGrossMonthly,
        zuschlagMonthly, setZuschlagMonthly,
        zuschlagSvsSubject, setZuschlagSvsSubject,
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
        extraInvestments, setExtraInvestments,
        expenseMode, setExpenseMode,
        expenseItems, setExpenseItems,
        budgetYear, setBudgetYear,
        activeTab, setActiveTab,
        showAfterTax, setShowAfterTax,

        adjustForInflation, setAdjustForInflation,
        inflationRate, setInflationRate,
        safeWithdrawalRate, setSafeWithdrawalRate,
        taxShieldMode, setTaxShieldMode,
        isGoalSolverOpen, setIsGoalSolverOpen,
        isCompareModalOpen, setIsCompareModalOpen,
        comparedDraftName, setComparedDraftName,

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

        newEventName, setNewEventName,
        newEventAmount, setNewEventAmount,
        newEventYear, setNewEventYear,
        newEventApplyUpcoming, setNewEventApplyUpcoming,

        taxResult,
        totalDetailedNeeds,
        totalDetailedWants,
        activeBaseFixedCosts,
        investableSurplus,
        projection,
        displayProjection,
        idealProjection,
        fireMetrics,
        comparedDraft,
        comparedProjection,
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
        handleApplyGoalSolution,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useInvestmentPlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('useInvestmentPlanner must be used within an InvestmentPlannerProvider');
  }
  return context;
};
