/**
 * Austrian income tax calculation (Einkommensteuer 2024/2025)
 * Brackets: https://www.bmf.gv.at/themen/steuern/einkommensteuer.html
 *
 * Austria pays 14 salaries per year (12 monthly + Urlaubsgeld in June + Weihnachtsgeld in December).
 * The two extra salaries are taxed at a flat 6% (up to a ceiling of 2x monthly gross).
 */

export type Country = 'AT' | 'HU';

export interface TaxResult {
  country: Country;
  grossYearly: number;
  netYearly: number;
  netMonthly: number; // average over 12 months
  netRegularMonthly: number; // true net for standard months
  net13th: number; // net 13th salary (Urlaubsgeld in AT)
  net14th: number; // net 14th salary (Weihnachtsgeld in AT)
  incomeTax: number;
  socialSecurity: number;
  effectiveTaxRate: number;
  marginalTaxRate: number; // personal marginal income tax rate
  zuschlagMonthly: number;
  zuschlagSvsSubject: boolean;
}

/** Austrian social security contribution rates for employees (2025, approx.) */
const AUSTRIAN_SOCIAL_SECURITY_RATE = 0.1812; // ~18.12% employee share

/** Hungarian flat tax rates */
const HUNGARIAN_PIT_RATE = 0.15; // 15% Személyi jövedelemadó
const HUNGARIAN_TB_RATE = 0.185; // 18.5% Social security contribution

/** Austrian income tax brackets (on taxable income after social security) */
function incomeTaxAT(taxableIncome: number): number {
  if (taxableIncome <= 12_816) return 0;
  if (taxableIncome <= 20_818) return (taxableIncome - 12_816) * 0.2;
  if (taxableIncome <= 34_513) return 1_600.4 + (taxableIncome - 20_818) * 0.3;
  if (taxableIncome <= 66_612) return 5_709.1 + (taxableIncome - 34_513) * 0.41;
  if (taxableIncome <= 99_266) return 18_869.3 + (taxableIncome - 66_612) * 0.48;
  if (taxableIncome <= 1_000_000) return 34_543.5 + (taxableIncome - 99_266) * 0.5;
  return 485_087.8 + (taxableIncome - 1_000_000) * 0.55;
}

/**
 * Calculate net income for Austrian or Hungarian employees.
 *
 * @param grossMonthly  Monthly base gross salary
 * @param country       'AT' or 'HU'
 * @param zuschlagMonthly Fixed monthly bonus / allowance next to gross
 * @param zuschlagSvsSubject Whether Zuschlag is subject to SVS (Austria AT only)
 */
export function calculateNetIncome(
  grossMonthly: number,
  country: Country = 'AT',
  zuschlagMonthly: number = 0,
  zuschlagSvsSubject: boolean = true
): TaxResult {
  const safeZuschlag = Math.max(0, zuschlagMonthly);

  if (country === 'HU') {
    // Hungarian Tax Calculation: Flat 15% PIT + 18.5% TB (33.5% total deduction)
    // Hungary receives 12 monthly salaries
    const totalGrossMonthly = Math.max(0, grossMonthly) + safeZuschlag;
    const grossYearly = totalGrossMonthly * 12;

    const socialSecurity = grossYearly * HUNGARIAN_TB_RATE;
    const incomeTax = grossYearly * HUNGARIAN_PIT_RATE;
    const totalDeduction = socialSecurity + incomeTax;
    const netYearly = grossYearly - totalDeduction;
    const netMonthly = netYearly / 12;

    return {
      country: 'HU',
      grossYearly,
      netYearly,
      netMonthly,
      netRegularMonthly: netMonthly,
      net13th: 0,
      net14th: 0,
      incomeTax,
      socialSecurity,
      effectiveTaxRate: grossYearly > 0 ? totalDeduction / grossYearly : 0,
      marginalTaxRate: HUNGARIAN_PIT_RATE,
      zuschlagMonthly: safeZuschlag,
      zuschlagSvsSubject: false,
    };
  }

  // Austrian Tax Calculation: 14 salaries per year (12 monthly + 13th + 14th)
  const baseGrossYearly = grossMonthly * 14;
  const zuschlagYearly = safeZuschlag * 12; // Zuschlag is 12 monthly payments
  const grossYearly = baseGrossYearly + zuschlagYearly;

  // Social Security (SVS)
  const baseSVS = baseGrossYearly * AUSTRIAN_SOCIAL_SECURITY_RATE;
  const zuschlagSVS = zuschlagSvsSubject ? zuschlagYearly * AUSTRIAN_SOCIAL_SECURITY_RATE : 0;
  const totalSocialSecurity = baseSVS + zuschlagSVS;

  // Taxable base for regular 12 salaries + Zuschlag
  const regularGross = grossMonthly * 12 + zuschlagYearly;
  const regularSS = grossMonthly * 12 * AUSTRIAN_SOCIAL_SECURITY_RATE + zuschlagSVS;
  const regularTaxable = Math.max(0, regularGross - regularSS);
  const regularTax = incomeTaxAT(regularTaxable);
  const regularNetYearly = regularGross - regularSS - regularTax;
  const netRegularMonthly = regularNetYearly / 12;

  // Extra two salaries (13th + 14th): flat 6% tax on taxable base
  const extraGross = grossMonthly * 2;
  const extraSS = extraGross * AUSTRIAN_SOCIAL_SECURITY_RATE;
  const extraTaxable = Math.max(0, extraGross - extraSS);
  const extraTax = extraTaxable * 0.06;
  const extraNetTotal = extraGross - extraSS - extraTax;

  const net13th = extraNetTotal / 2;
  const net14th = extraNetTotal / 2;

  const totalTax = regularTax + extraTax;
  const netYearly = grossYearly - totalSocialSecurity - totalTax;
  const netMonthly = netYearly / 12;

  // Personal marginal income tax rate
  let marginalTaxRate: number;
  if (regularTaxable <= 12_816) marginalTaxRate = 0;
  else if (regularTaxable <= 20_818) marginalTaxRate = 0.20;
  else if (regularTaxable <= 34_513) marginalTaxRate = 0.30;
  else if (regularTaxable <= 66_612) marginalTaxRate = 0.41;
  else if (regularTaxable <= 99_266) marginalTaxRate = 0.48;
  else if (regularTaxable <= 1_000_000) marginalTaxRate = 0.50;
  else marginalTaxRate = 0.55;

  return {
    country: 'AT',
    grossYearly,
    netYearly,
    netMonthly,
    netRegularMonthly,
    net13th,
    net14th,
    incomeTax: totalTax,
    socialSecurity: totalSocialSecurity,
    effectiveTaxRate: grossYearly > 0 ? (totalSocialSecurity + totalTax) / grossYearly : 0,
    marginalTaxRate,
    zuschlagMonthly: safeZuschlag,
    zuschlagSvsSubject,
  };
}

/** Legacy alias for backward compatibility */
export function calculateAustrianNetIncome(grossYearly: number): TaxResult {
  return calculateNetIncome(grossYearly / 14, 'AT', 0, true);
}
