import type { TaxResult } from '../features/tax/taxCalculator';
import type { ProjectionResult, YearDataPoint, ExtraInvestmentEvent } from '../features/projection/projectionEngine';
import type { ExpenseItem } from '../context/InvestmentPlannerContext';
import { formatCurrency } from '../features/projection/projectionEngine';

export interface AuditData {
  grossMonthly: number;
  fixedCosts: number;
  startCapital: number;
  monthlyInvest: number;
  juneExtra: number;
  decemberExtra: number;
  years: number;
  stepUpRate: number;
  lifeInsurance: number;
  loanRepayment: number;
  expenseMode: 'simple' | 'detailed';
  expenseItems: ExpenseItem[];
  taxResult: TaxResult;
  projection: ProjectionResult;
  lastPoint: YearDataPoint;
  investableSurplus: number;
  activeFixedCosts: number;
  totalDetailedNeeds: number;
  totalDetailedWants: number;
  wantsPercent: number;
  activeTotalMonthlySavings: number;
  extraInvestments?: ExtraInvestmentEvent[];
}

/**
 * Builds a highly structured financial context prompt.
 */
function buildPrompt(data: AuditData): string {
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
    extraInvestments = [],
  } = data;

  const countryName = taxResult.country === 'HU' ? 'Hungary 🇭🇺' : 'Austria 🇦🇹';
  const personalRate = taxResult.marginalTaxRate;
  const capGainsTaxRate = Math.min(0.275, personalRate);
  
  // Format detailed expenses & extra investment events
  const detailedExpensesList = expenseItems.map(item => `- ${item.name}: €${item.amount}/mo (${item.category === 'need' ? 'Need' : 'Want'})`).join('\n');
  const extraEventsList = extraInvestments.map(evt => `- ${evt.name}: +€${evt.amount} in Year ${evt.year} (${evt.applyUpcomingYears ? 'Recurring every year onwards' : 'Single year lump-sum'})`).join('\n');

  return `You are FinanzAT/HU Pro AI Copilot, a senior financial adviser specialized in ${countryName} wealth building, personal budgeting, and taxation. 

Please perform a comprehensive, actionable, and visually beautiful Financial Security Audit based on the user's detailed data below:

### 💼 Income & ${countryName} Taxation
- **Selected Country**: ${countryName}
- **Base Gross Monthly Salary**: €${grossMonthly}
- **Fixed Monthly Zuschlag / Bonus**: €${taxResult.zuschlagMonthly}${taxResult.country === 'AT' ? (taxResult.zuschlagSvsSubject ? ' (Subject to SVS)' : ' (Exempt from SVS)') : ''}
- **Gross Yearly Income**: €${taxResult.grossYearly} (${taxResult.country === 'AT' ? '14 payouts' : '12 payouts'})
- **Monthly Net Equivalent (avg. over 12 payouts)**: €${Math.round(taxResult.netMonthly)}/month
- **True Monthly Net Regular Payout**: €${Math.round(taxResult.netRegularMonthly)}/month
${taxResult.country === 'AT' ? `- **Holiday Bonus (13th Net - Urlaubsgeld)**: €${Math.round(taxResult.net13th)}
- **Christmas Bonus (14th Net - Weihnachtsgeld)**: €${Math.round(taxResult.net14th)}` : ''}
- **Social Security Contribution Share**: €${Math.round(taxResult.socialSecurity)}/year
- **Income Tax Paid**: €${Math.round(taxResult.incomeTax)}/year
- **Effective personal tax & SS rate**: ${ (taxResult.effectiveTaxRate * 100).toFixed(1) }%

### 🛒 Expenses & Monthly Cash Flow
- **Budgeting Entry Mode**: ${expenseMode === 'detailed' ? 'Detailed itemized tracker' : 'Simple fixed costs estimate'}
- **Current Monthly Fixed Costs (Needs)**: €${Math.round(fixedCosts)}/month
${expenseMode === 'detailed' ? `- **Itemized Expenses logged**:\n${detailedExpensesList}\n- **Leftover Cash Surplus (Investable Buffer)**: €${investableSurplus}/month` : ''}

### 💰 Investment & Savings Parameters
- **Start Capital**: €${startCapital}
- **Regular Monthly Contribution**: €${monthlyInvest}/month
- **June Bonus Top-up**: €${juneExtra}
- **December Bonus Top-up**: €${decemberExtra}
- **Annual step-up growth indexation (contribution increase rate)**: ${stepUpRate}% per year
- **Shielded savings excluded from projection (Life Insurance)**: €${lifeInsurance}/month
- **Shielded savings excluded from projection (Loan Fund)**: €${loanRepayment}/month
${extraInvestments.length > 0 ? `- **Configured Extra Investment Events**:\n${extraEventsList}` : ''}

### 📈 Projections & Capital Gains
- **Timeline Range**: ${years} years
- **Expected Final Gross Value (Before Tax Midpoint)**: €${Math.round(lastPoint.midpoint)}
- **Expected Final Net Value (After Capital Gains Tax)**: €${Math.round(lastPoint.midpointAfterTax)}
- **Estimated gains tax rate applied**: ${(capGainsTaxRate * 100).toFixed(1)}%
- **Net average monthly payout equivalent over remaining lifecycle**: €${projection.monthlyPayoutMidAfterTax}/month

---

### Output Requirements:
1. Provide a professional, encouraging and highly specific audit formatted using elegant markdown (use header hierarchies, bullet lists, and **bold key figures**).
2. **Cash Flow Critique**: Analyze their budgeting ratios. Address if they satisfy the 50/30/20 rule (Needs ≤ 50%, Savings ≥ 20%, Wants ~ 30%). Comment explicitly on their unallocated investable surplus of €${investableSurplus}/mo if detailed mode is active.
3. **Tax Savings Strategy for ${countryName}**: Explain how tax rules apply in ${countryName} (such as flat 15% PIT + 18.5% SS in Hungary or progressive brackets + 13th/14th salary discounts in Austria).
4. **Actionable wealth recommendations**: Outline exactly 3 immediate steps they can take to secure their wealth, reduce tax leakages, or supercharge compounding, taking into account any configured extra lump-sum investments or Zuschläge.
5. End with a humble, reassuring sentence reminding them that all calculations are local and private. Do not mention any databases.`;
}

/**
 * Executes a secure API call to selected AI provider directly from the browser.
 */
export async function executeAudit(
  provider: 'gemini' | 'openai' | 'openrouter',
  apiKey: string,
  data: AuditData
): Promise<string> {
  const prompt = buildPrompt(data);

  if (!apiKey.trim()) {
    throw new Error('API key is empty. Please enter a valid API key in the credentials panel.');
  }

  try {
    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `Gemini API returned status ${response.status}`);
      }
      const json = await response.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from Gemini.';
    } 
    
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are FinanzAT Pro Copilot, an Austrian and Hungarian financial planning assistant.' },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `OpenAI API returned status ${response.status}`);
      }
      const json = await response.json();
      return json.choices?.[0]?.message?.content || 'No response returned from OpenAI.';
    } 
    
    if (provider === 'openrouter') {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'FinanzAT Pro Calculator',
        },
        body: JSON.stringify({
          model: 'google/gemini-3.1-flash-lite',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `OpenRouter API returned status ${response.status}`);
      }
      const json = await response.json();
      return json.choices?.[0]?.message?.content || 'No response returned from OpenRouter.';
    }

    throw new Error('Unsupported API provider selected.');
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('AI Copilot request failed', e);
    throw new Error(`Audit failed: ${message}`, { cause: e });
  }
}

/**
 * Returns a gorgeous mock static audit for users testing the calculator without an API key.
 */
export function getMockAudit(data: AuditData): string {
  const { years, lastPoint, investableSurplus, taxResult } = data;

  const personalRate = taxResult.marginalTaxRate;
  const capGainsTaxRate = Math.min(0.275, personalRate);
  const netFinalValue = lastPoint.midpointAfterTax;
  const grossFinalValue = lastPoint.midpoint;
  const taxDeducted = grossFinalValue - netFinalValue;
  const trueNet = Math.round(taxResult.netRegularMonthly);

  return `# 🏔️ Local Financial Security Audit: *FinanzAT Pro Copilot*
*Simulated Analysis based on your active planning configurations.*

---

## 🧐 1. Cash Flow & Budgeting Critique

### The 50/30/20 Rule Analysis
Based on your **True Monthly Net regular income of ${formatCurrency(trueNet)}**, here is how your cash flow is divided:
- **🚨 Needs & Fixed Bills**: **${formatCurrency(data.activeFixedCosts)}** (${Math.round((data.activeFixedCosts / trueNet) * 100)}%) — *Status: ${data.activeFixedCosts / trueNet <= 0.5 ? '✅ Excellent control.' : '⚠️ High fixed burden. Focus on optimizing recurring contracts.'}*
- **🚀 Active Savings (Portfolio + Excluded Funds)**: **${formatCurrency(data.activeTotalMonthlySavings)}** (${Math.round((data.activeTotalMonthlySavings / trueNet) * 100)}%) — *Status: ${data.activeTotalMonthlySavings / trueNet >= 0.2 ? '🚀 Supercharged wealth builder.' : '👍 Good base savings rate.'}*
- **🎉 Flexible Wants**: **${formatCurrency(data.expenseMode === 'detailed' ? data.totalDetailedWants : (trueNet * data.wantsPercent / 100))}** (${data.wantsPercent}%) — *Status: Balanced lifestyle allocation.*

${investableSurplus > 0 ? `> [!WARNING]
> **Leakage Alert: €${investableSurplus}/month Unallocated Buffer**
> You have **${formatCurrency(investableSurplus)}/month** sitting idle in your cash flow! If left in a standard low-interest bank account, inflation will slowly erode its purchasing power. 
> Clicking the **"Invest It"** button under your Expenses tab will capture this surplus, adding it to your portfolio compounding curve.` : '> [!NOTE]\n> **Excellent Capital Allocation!** Your budget is fully optimized with zero cash leakage. Every Euro has a distinct purpose.'}

---

## 🇦🇹 2. Advanced Austrian Taxation Deep-Dive

### Capital Gains Tax (KeSt) Opt-In Review
Your personal marginal progressive income tax rate is currently **${(personalRate * 100).toFixed(0)}%**.
- **Rule Option Application (*Regelbesteuerungsoption*)**: Under Austrian tax law (§ 27a Abs. 4 EStG), if your personal marginal tax rate is lower than the flat **27.5% KeSt**, you can choose to tax your investment profits at your progressive rate.
- **Your Benefit**: ${capGainsTaxRate < 0.275 ? `Since your marginal tax rate (**${(personalRate * 100).toFixed(0)}%**) is lower than 27.5%, the system applied your personal rate to your gains projection! This saves you thousands in compounding tax drag.` : `Since your marginal income rate (**${(personalRate * 100).toFixed(0)}%**) is higher than 27.5%, the flat **27.5% KeSt** ceiling acts as a protective tax shield, capping your capital gains tax exposure at 27.5%.`}

At the end of Year **${years}**:
- **Gross Midpoint Value**: **${formatCurrency(grossFinalValue)}**
- **Net Liquidated Value (After Tax)**: **${formatCurrency(netFinalValue)}**
- **Accrued Capital Gains Tax Liability**: **${formatCurrency(taxDeducted)}**
- **Estimated Net Monthly Lifecycle Payout**: **${formatCurrency(data.projection.monthlyPayoutMidAfterTax)}/month**

---

## 📈 3. Immediate Action Recommendations

### 1️⃣ Capture the 13th & 14th Salary Bonus Advantage
Austrian holiday and christmas salaries (*Urlaubsgeld* and *Weihnachtsgeld*) are taxed at a heavily discounted flat rate of **6%** after a €620 tax-free allowance. Because these are "extra" payouts, they are perfect vectors for wealth building.
- **Strategy**: Commit at least **50% of your net 13th and 14th salaries** as June and December top-ups. This forms a semi-annual lump-sum turbocharge, compounding drastically quicker than small monthly additions.

### 2️⃣ Lock In Indexation (Step-Ups)
You currently have a contribution step-up rate of **${data.stepUpRate}%** configured.
- **Strategy**: Ensure your step-up is set to at least **2.5%** to hedge against euro inflation, or **5.0%** to match standard salary bracket progression. Increasing your savings rate year-over-year is virtually painless if aligned with annual salary increases.

### 3️⃣ Establish an Emergency Shield
Ensure you hold **3 to 6 months of your fixed costs** (${formatCurrency(data.activeFixedCosts * 3)} to ${formatCurrency(data.activeFixedCosts * 6)}) in an accessible, high-yield savings product (*Tagesgeld*) before fully committing capital to high-growth ETFs, shielding your portfolio from forced tax-disadvantageous liquidations during unforeseen life events.

---

> [!IMPORTANT]
> **Strict Privacy Guarantee:** This security audit was compiled locally inside your browser. No personal details, financial parameters, or inputs have been stored, uploaded to external databases, or shared. You have full local custody over your data.`;
}
