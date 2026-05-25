/**
 * Austrian income tax calculation (Einkommensteuer 2024/2025)
 * Brackets: https://www.bmf.gv.at/themen/steuern/einkommensteuer.html
 *
 * Austria pays 14 salaries per year (12 monthly + Urlaubsgeld in June + Weihnachtsgeld in December).
 * The two extra salaries are taxed at a flat 6% (up to a ceiling of 2x monthly gross).
 */

export interface TaxResult {
  grossYearly: number;
  netYearly: number;
  netMonthly: number; // average over 12 months
  netRegularMonthly: number; // true net for standard months
  net13th: number; // net 13th salary (Urlaubsgeld)
  net14th: number; // net 14th salary (Weihnachtsgeld)
  incomeTax: number;
  socialSecurity: number;
  effectiveTaxRate: number;
  marginalTaxRate: number; // Austrian personal marginal tax rate
}

/** Austrian social security contribution rates for employees (2025, approx.) */
const SOCIAL_SECURITY_RATE = 0.1812; // ~18.12% employee share

/** Austrian income tax brackets (on taxable income after social security) */
function incomeTax(taxableIncome: number): number {
  if (taxableIncome <= 12_816) return 0;
  if (taxableIncome <= 20_818) return (taxableIncome - 12_816) * 0.2;
  if (taxableIncome <= 34_513) return 1_600.4 + (taxableIncome - 20_818) * 0.3;
  if (taxableIncome <= 66_612) return 5_709.1 + (taxableIncome - 34_513) * 0.41;
  if (taxableIncome <= 99_266) return 18_869.3 + (taxableIncome - 66_612) * 0.48;
  if (taxableIncome <= 1_000_000) return 34_543.5 + (taxableIncome - 99_266) * 0.5;
  return 485_087.8 + (taxableIncome - 1_000_000) * 0.55;
}

/**
 * Calculate net yearly/monthly income for an Austrian employee
 * receiving 14 salaries per year.
 *
 * @param grossYearly  Annual gross including the two extra salaries (i.e. gross monthly × 14)
 */
export function calculateAustrianNetIncome(grossYearly: number): TaxResult {
  const grossMonthly = grossYearly / 14;

  // Social security on full 14 salaries
  const socialSecurity = grossYearly * SOCIAL_SECURITY_RATE;

  // Taxable base for regular 12 salaries
  const regularGross = grossMonthly * 12;
  const regularSS = regularGross * SOCIAL_SECURITY_RATE;
  const regularTaxable = regularGross - regularSS;
  const regularTax = incomeTax(regularTaxable);
  const regularNetYearly = regularGross - regularSS - regularTax;
  const netRegularMonthly = regularNetYearly / 12;

  // Extra two salaries: flat 6% tax, social security still applies
  const extraGross = grossMonthly * 2;
  const extraSS = extraGross * SOCIAL_SECURITY_RATE;
  const extraTax = (extraGross - extraSS) * 0.06;
  const extraNetTotal = extraGross - extraSS - extraTax;

  const net13th = extraNetTotal / 2;
  const net14th = extraNetTotal / 2;

  const totalTax = regularTax + extraTax;
  const netYearly = grossYearly - socialSecurity - totalTax;
  const netMonthly = netYearly / 12;

  // Compute personal marginal tax rate
  let marginalTaxRate = 0;
  if (regularTaxable <= 12_816) marginalTaxRate = 0;
  else if (regularTaxable <= 20_818) marginalTaxRate = 0.20;
  else if (regularTaxable <= 34_513) marginalTaxRate = 0.30;
  else if (regularTaxable <= 66_612) marginalTaxRate = 0.41;
  else if (regularTaxable <= 99_266) marginalTaxRate = 0.48;
  else if (regularTaxable <= 1_000_000) marginalTaxRate = 0.50;
  else marginalTaxRate = 0.55;

  return {
    grossYearly,
    netYearly,
    netMonthly,
    netRegularMonthly,
    net13th,
    net14th,
    incomeTax: totalTax,
    socialSecurity,
    effectiveTaxRate: (socialSecurity + totalTax) / grossYearly,
    marginalTaxRate,
  };
}
