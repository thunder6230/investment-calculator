export interface Milestone {
  id: string;
  name: string;
  amount: number;
  type: 'decrease' | 'increase';
  startYear: number; // e.g. occurs after X years
  reinvest: boolean;
}

export interface ExtraInvestmentEvent {
  id: string;
  name: string;
  amount: number;
  year: number; // target year in projection timeline
  applyUpcomingYears: boolean; // apply every year starting from `year` onwards
}

export interface YearDataPoint {
  year: number;
  paidIn: number;
  low: number;   // growth at minRate (Gross)
  high: number;  // growth at maxRate (Gross)
  midpoint: number; // midpoint between low and high (Gross)
  lowAfterTax: number;   // growth at minRate (Net of tax)
  highAfterTax: number;  // growth at maxRate (Net of tax)
  midpointAfterTax: number; // midpoint (Net of tax)
  // Dynamic parameters active in this year
  monthlyContribActive: number;
  juneExtraActive: number;
  decemberExtraActive: number;
  yearlyContribActive: number;
  fixedCostsActive: number;
  milestonesTriggered: Milestone[];
  extraInvestmentsTotal: number;
  extraInvestmentsActive: ExtraInvestmentEvent[];
}

export interface ProjectionResult {
  dataPoints: YearDataPoint[];
  totalContributed: number;
  /** Average monthly payout if the portfolio is fully liquidated at the end */
  monthlyPayoutLow: number;
  monthlyPayoutHigh: number;
  monthlyPayoutMid: number;
  monthlyPayoutLowAfterTax: number;
  monthlyPayoutHighAfterTax: number;
  monthlyPayoutMidAfterTax: number;
}

export interface ProjectionParams {
  startCapital: number;
  /** Monthly contribution for the 12 regular months */
  monthlyContribution: number;
  /** Extra lump-sum added in June (Urlaubsgeld bonus) */
  juneExtra: number;
  /** Extra lump-sum added in December (Weihnachtsgeld bonus) */
  decemberExtra: number;
  years: number;
  minRate: number; // e.g. 0.05
  maxRate: number; // e.g. 0.08
  stepUpRate: number; // e.g. 0.02
  milestones: Milestone[];
  extraInvestments?: ExtraInvestmentEvent[];
  baseFixedCosts: number;
  marginalTaxRate?: number; // employee personal marginal tax rate
  taxShieldMode?: boolean; // When true, models tax-sheltered growth (e.g. 0% KeSt / TBSZ)
}

export interface FireMetrics {
  annualExpenses: number;
  monthlyExpenses: number;
  swr: number; // e.g. 0.04 (4%)
  targetFireNumber: number; // annualExpenses / swr
  leanFireNumber: number; // 0.75 * targetFireNumber
  fatFireNumber: number; // 1.25 * targetFireNumber
  coastFireNumber: number; // targetFireNumber / (1 + r)^years
  freedomYear: number | null; // year where midpoint >= targetFireNumber
  currentProgressPercent: number; // (startCapital / targetFireNumber) * 100
  endProgressPercent: number; // (finalMidpoint / targetFireNumber) * 100
  monthlyPassiveIncomeAtEnd: number; // (finalMidpoint * swr) / 12
  isFireAchieved: boolean;
}

/**
 * Calculate year-by-year investment projections.
 * Contributions are modelled as monthly with two additional annual top-ups.
 * Accounts for annual step-up contribution growth, dynamic expense milestones,
 * extra lump-sum / recurring investment events,
 * and personal-income-bracket-adjusted capital gains taxation (Austrian KeSt or TBSZ shield).
 */
export function calculateProjection(params: ProjectionParams): ProjectionResult {
  const {
    startCapital,
    monthlyContribution,
    juneExtra,
    decemberExtra,
    years,
    minRate,
    maxRate,
    stepUpRate,
    milestones,
    extraInvestments = [],
    baseFixedCosts,
    marginalTaxRate,
    taxShieldMode = false,
  } = params;

  const midRate = (minRate + maxRate) / 2;

  // Monthly rates
  const monthlyLow = Math.pow(1 + minRate, 1 / 12) - 1;
  const monthlyMid = Math.pow(1 + midRate, 1 / 12) - 1;
  const monthlyHigh = Math.pow(1 + maxRate, 1 / 12) - 1;

  let balLow = startCapital;
  let balMid = startCapital;
  let balHigh = startCapital;
  let totalContributed = startCapital;

  // Personal marginal income rate compared to flat KeSt (27.5%), or 0% if tax-shielded (e.g. TBSZ / tax shelter)
  const personalRate = marginalTaxRate ?? 0.3;
  const capGainsTaxRate = taxShieldMode ? 0 : Math.min(0.275, personalRate);

  const dataPoints: YearDataPoint[] = [
    {
      year: 0,
      paidIn: startCapital,
      low: startCapital,
      high: startCapital,
      midpoint: startCapital,
      lowAfterTax: startCapital,
      highAfterTax: startCapital,
      midpointAfterTax: startCapital,
      monthlyContribActive: monthlyContribution,
      juneExtraActive: juneExtra,
      decemberExtraActive: decemberExtra,
      yearlyContribActive: monthlyContribution * 12 + juneExtra + decemberExtra,
      fixedCostsActive: baseFixedCosts,
      milestonesTriggered: [],
      extraInvestmentsTotal: 0,
      extraInvestmentsActive: [],
    },
  ];

  for (let y = 1; y <= years; y++) {
    // 1. Calculate active growth step-up factor
    const stepUpFactor = Math.pow(1 + stepUpRate, y - 1);

    // 2. Identify active milestones (triggered when year > startYear)
    const activeMilestones = milestones.filter((m) => y > m.startYear);
    
    // Milestones that trigger EXACTLY in this year (first year of activity, i.e., y === startYear + 1)
    const milestonesTriggered = milestones.filter((m) => y === m.startYear + 1);

    // 3. Identify active extra investment events for year y
    const extraInvestmentsActive = extraInvestments.filter((e) =>
      e.applyUpcomingYears ? y >= e.year : y === e.year
    );
    const extraInvestmentsTotal = extraInvestmentsActive.reduce((sum, e) => sum + e.amount, 0);

    // 4. Sum up reinvested savings from active decrease milestones
    const reinvestedSavings = activeMilestones
      .filter((m) => m.type === 'decrease' && m.reinvest)
      .reduce((sum, m) => sum + m.amount, 0);

    // 5. Calculate active contribution amounts
    const monthlyContribActive = Math.round(monthlyContribution * stepUpFactor + reinvestedSavings);
    const juneExtraActive = Math.round(juneExtra * stepUpFactor);
    const decemberExtraActive = Math.round(decemberExtra * stepUpFactor);
    const yearlyContribActive = monthlyContribActive * 12 + juneExtraActive + decemberExtraActive + extraInvestmentsTotal;

    // 6. Calculate active fixed costs
    const expenseReduction = activeMilestones
      .filter((m) => m.type === 'decrease')
      .reduce((sum, m) => sum + m.amount, 0);
    const expenseIncrease = activeMilestones
      .filter((m) => m.type === 'increase')
      .reduce((sum, m) => sum + m.amount, 0);
    const fixedCostsActive = Math.max(0, baseFixedCosts - expenseReduction + expenseIncrease);

    for (let m = 1; m <= 12; m++) {
      // Apply monthly growth
      balLow *= 1 + monthlyLow;
      balMid *= 1 + monthlyMid;
      balHigh *= 1 + monthlyHigh;

      // Regular monthly contribution
      balLow += monthlyContribActive;
      balMid += monthlyContribActive;
      balHigh += monthlyContribActive;
      totalContributed += monthlyContribActive;

      // Extra contributions in June (month 6) and December (month 12)
      if (m === 6) {
        balLow += juneExtraActive;
        balMid += juneExtraActive;
        balHigh += juneExtraActive;
        totalContributed += juneExtraActive;
      }
      if (m === 12) {
        balLow += decemberExtraActive;
        balMid += decemberExtraActive;
        balHigh += decemberExtraActive;
        totalContributed += decemberExtraActive;
      }
    }

    // Add extra investment event contributions for year y
    if (extraInvestmentsTotal > 0) {
      balLow += extraInvestmentsTotal;
      balMid += extraInvestmentsTotal;
      balHigh += extraInvestmentsTotal;
      totalContributed += extraInvestmentsTotal;
    }

    // Calculate after-tax estimates for year-end data points
    const lowGains = Math.max(0, balLow - totalContributed);
    const lowAfterTax = Math.round(balLow - lowGains * capGainsTaxRate);

    const highGains = Math.max(0, balHigh - totalContributed);
    const highAfterTax = Math.round(balHigh - highGains * capGainsTaxRate);

    const midGains = Math.max(0, balMid - totalContributed);
    const midpointAfterTax = Math.round(balMid - midGains * capGainsTaxRate);

    dataPoints.push({
      year: y,
      paidIn: totalContributed,
      low: Math.round(balLow),
      high: Math.round(balHigh),
      midpoint: Math.round(balMid),
      lowAfterTax,
      highAfterTax,
      midpointAfterTax,
      monthlyContribActive,
      juneExtraActive,
      decemberExtraActive,
      yearlyContribActive,
      fixedCostsActive,
      milestonesTriggered,
      extraInvestmentsTotal,
      extraInvestmentsActive,
    });
  }

  // Liquidated after-tax amounts
  const finalLowGains = Math.max(0, balLow - totalContributed);
  const finalLowAfterTax = balLow - finalLowGains * capGainsTaxRate;

  const finalHighGains = Math.max(0, balHigh - totalContributed);
  const finalHighAfterTax = balHigh - finalHighGains * capGainsTaxRate;

  const finalMidGains = Math.max(0, balMid - totalContributed);
  const finalMidPointAfterTax = balMid - finalMidGains * capGainsTaxRate;

  // Average monthly equivalent drawdowns
  const monthlyPayoutLow = balLow / (years * 12);
  const monthlyPayoutHigh = balHigh / (years * 12);
  const monthlyPayoutMid = balMid / (years * 12);

  const monthlyPayoutLowAfterTax = finalLowAfterTax / (years * 12);
  const monthlyPayoutHighAfterTax = finalHighAfterTax / (years * 12);
  const monthlyPayoutMidAfterTax = finalMidPointAfterTax / (years * 12);

  return {
    dataPoints,
    totalContributed,
    monthlyPayoutLow: Math.round(monthlyPayoutLow),
    monthlyPayoutHigh: Math.round(monthlyPayoutHigh),
    monthlyPayoutMid: Math.round(monthlyPayoutMid),
    monthlyPayoutLowAfterTax: Math.round(monthlyPayoutLowAfterTax),
    monthlyPayoutHighAfterTax: Math.round(monthlyPayoutHighAfterTax),
    monthlyPayoutMidAfterTax: Math.round(monthlyPayoutMidAfterTax),
  };
}

export function yearlyContribution(
  monthlyContribution: number,
  juneExtra: number,
  decemberExtra: number
): number {
  return monthlyContribution * 12 + juneExtra + decemberExtra;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Calculates FIRE (Financial Independence / Retire Early) milestones and metrics
 */
export function calculateFireMetrics(
  monthlyExpenses: number,
  swr: number,
  startCapital: number,
  dataPoints: YearDataPoint[],
  years: number,
  growthRate: number = 0.065
): FireMetrics {
  const safeMonthlyExpenses = Math.max(1, monthlyExpenses);
  const annualExpenses = safeMonthlyExpenses * 12;
  const safeSwr = Math.max(0.01, swr);
  const targetFireNumber = Math.round(annualExpenses / safeSwr);
  const leanFireNumber = Math.round(targetFireNumber * 0.75);
  const fatFireNumber = Math.round(targetFireNumber * 1.25);
  const coastFireNumber = Math.round(targetFireNumber / Math.pow(1 + growthRate, Math.max(1, years)));

  let freedomYear: number | null = null;
  for (const dp of dataPoints) {
    if (dp.midpoint >= targetFireNumber && freedomYear === null && dp.year > 0) {
      freedomYear = dp.year;
      break;
    }
  }

  const finalPoint = dataPoints[dataPoints.length - 1];
  const finalVal = finalPoint ? finalPoint.midpoint : startCapital;
  const currentProgressPercent = Math.min(100, Math.round((startCapital / targetFireNumber) * 100));
  const endProgressPercent = Math.min(200, Math.round((finalVal / targetFireNumber) * 100));
  const monthlyPassiveIncomeAtEnd = Math.round((finalVal * safeSwr) / 12);

  return {
    annualExpenses,
    monthlyExpenses: safeMonthlyExpenses,
    swr: safeSwr,
    targetFireNumber,
    leanFireNumber,
    fatFireNumber,
    coastFireNumber,
    freedomYear,
    currentProgressPercent,
    endProgressPercent,
    monthlyPassiveIncomeAtEnd,
    isFireAchieved: freedomYear !== null,
  };
}

/**
 * Reverse Goal Solver: Solves for required monthly investment to hit a target wealth
 */
export function solveRequiredContribution(
  targetCapital: number,
  targetYears: number,
  startCapital: number,
  rate: number = 0.065,
  juneBonus: number = 0,
  decemberBonus: number = 0
): number {
  if (targetYears <= 0 || targetCapital <= 0) return 0;
  
  // Quick check if initial capital alone compound-hits target
  const futureStartCap = startCapital * Math.pow(1 + rate, targetYears);
  if (futureStartCap >= targetCapital) return 0;

  const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;
  let low = 0;
  let high = Math.max(20000, targetCapital / (targetYears * 12));
  let result = high;

  for (let iter = 0; iter < 50; iter++) {
    const mid = (low + high) / 2;
    let bal = startCapital;
    for (let y = 1; y <= targetYears; y++) {
      for (let m = 1; m <= 12; m++) {
        bal = bal * (1 + monthlyRate) + mid;
        if (m === 6) bal += juneBonus;
        if (m === 12) bal += decemberBonus;
      }
    }
    if (bal >= targetCapital) {
      result = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.max(0, Math.round(result));
}

/**
 * Discount a nominal future value to real purchasing power today
 */
export function discountByInflation(value: number, inflationRate: number, years: number): number {
  if (inflationRate <= 0 || years <= 0) return value;
  return Math.round(value / Math.pow(1 + inflationRate, years));
}
