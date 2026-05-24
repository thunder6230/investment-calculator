/**
 * Core investment projection calculations.
 *
 * Austria charges KESt (Kapitalertragsteuer) of 27.5% on investment gains.
 * The percentages the user enters are therefore already after-tax returns.
 */

export interface YearDataPoint {
  year: number;
  paidIn: number;
  low: number;   // growth at minRate
  high: number;  // growth at maxRate
  midpoint: number; // midpoint between low and high
}

export interface ProjectionResult {
  dataPoints: YearDataPoint[];
  totalContributed: number;
  /** Average monthly payout if the portfolio is fully liquidated at the end */
  monthlyPayoutLow: number;
  monthlyPayoutHigh: number;
  monthlyPayoutMid: number;
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
}

/**
 * Calculate year-by-year investment projections.
 * Contributions are modelled as monthly with two additional annual top-ups.
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

  const dataPoints: YearDataPoint[] = [
    { year: 0, paidIn: startCapital, low: startCapital, high: startCapital, midpoint: startCapital },
  ];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      // Apply monthly growth
      balLow *= 1 + monthlyLow;
      balMid *= 1 + monthlyMid;
      balHigh *= 1 + monthlyHigh;

      // Regular monthly contribution
      balLow += monthlyContribution;
      balMid += monthlyContribution;
      balHigh += monthlyContribution;
      totalContributed += monthlyContribution;

      // Extra contributions in June (month 6) and December (month 12)
      if (m === 6) {
        balLow += juneExtra;
        balMid += juneExtra;
        balHigh += juneExtra;
        totalContributed += juneExtra;
      }
      if (m === 12) {
        balLow += decemberExtra;
        balMid += decemberExtra;
        balHigh += decemberExtra;
        totalContributed += decemberExtra;
      }
    }

    dataPoints.push({
      year: y,
      paidIn: totalContributed,
      low: Math.round(balLow),
      high: Math.round(balHigh),
      midpoint: Math.round(balMid),
    });
  }

  // Average monthly income if you draw down the portfolio over the remaining life expectancy
  // Here we offer a simple "monthly equivalent" = final value / (years * 12) for illustration
  const monthlyPayoutLow = balLow / (years * 12);
  const monthlyPayoutHigh = balHigh / (years * 12);
  const monthlyPayoutMid = balMid / (years * 12);

  return {
    dataPoints,
    totalContributed,
    monthlyPayoutLow: Math.round(monthlyPayoutLow),
    monthlyPayoutHigh: Math.round(monthlyPayoutHigh),
    monthlyPayoutMid: Math.round(monthlyPayoutMid),
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
