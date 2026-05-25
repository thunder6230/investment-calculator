import type { TaxResult } from '../features/tax/taxCalculator';
import type { ProjectionResult, YearDataPoint } from '../features/projection/projectionEngine';
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
  expenseItems: any[];
  taxResult: TaxResult;
  projection: ProjectionResult;
  lastPoint: YearDataPoint;
  investableSurplus: number;
  activeFixedCosts: number;
  totalDetailedNeeds: number;
  totalDetailedWants: number;
  wantsPercent: number;
  activeTotalMonthlySavings: number;
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
  } = data;

  const personalRate = taxResult.marginalTaxRate;
  const capGainsTaxRate = Math.min(0.275, personalRate);
  
  // Format detailed expenses
  const detailedExpensesList = expenseItems.map(item => `- ${item.name}: €${item.amount}/mo (${item.category === 'need' ? 'Need' : 'Want'})`).join('\n');

  return `You are FinanzAT Pro AI Copilot, a senior financial adviser specialized in Austrian wealth building, personal budgeting, and progressive taxation. 

Please perform a comprehensive, actionable, and visually beautiful Financial Security Audit based on the user's detailed data below:

### 💼 Income & Austrian Taxation (14x Payouts)
- **Gross Monthly Salary**: €${grossMonthly} (Paid 14 times per year, equivalent to Gross Yearly of €${taxResult.grossYearly})
- **Monthly Net Equivalent (avg. over 12 payouts)**: €${Math.round(taxResult.netMonthly)}/month
- **True Monthly Net Regular Payout**: €${Math.round(taxResult.netRegularMonthly)}/month (Normalized base)
- **Holiday Bonus (13th Net - Urlaubsgeld)**: €${Math.round(taxResult.net13th)} (Taxed at heavily discounted rate of 6% after deductions)
- **Christmas Bonus (14th Net - Weihnachtsgeld)**: €${Math.round(taxResult.net14th)} (Taxed at discounted rate of 6% after deductions)
- **Social Security Contribution Share**: €${Math.round(taxResult.socialSecurity)}/year (Employee rate ~18.12% up to ceiling limit)
- **Austrian Income Tax Paid**: €${Math.round(taxResult.incomeTax)}/year
- **Personal Marginal Tax Rate**: ${ (personalRate * 100).toFixed(0) }%
- **Effective personal tax rate (including social security)**: ${ (taxResult.effectiveTaxRate * 100).toFixed(1) }%

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

### 📈 Projections & Capital Gains (KeSt)
- **Timeline Range**: ${years} years
- **Expected Final Gross Value (Before Tax Midpoint)**: €${Math.round(lastPoint.midpoint)}
- **Expected Final Net Value (After Capital Gains KeSt)**: €${Math.round(lastPoint.midpointAfterTax)}
- **Estimated gains tax rate applied (Rule option applied if progressive rate < 27.5%)**: ${(capGainsTaxRate * 100).toFixed(1)}%
- **Net average monthly payout equivalent over remaining lifecycle**: €${projection.monthlyPayoutMidAfterTax}/month

---

### Output Requirements:
1. Provide a professional, encouraging and highly specific audit formatted using elegant markdown (use header hierarchies, bullet lists, and **bold key figures**).
2. **Cash Flow Critique**: Analyze their budgeting ratios. Address if they satisfy the 50/30/20 rule (Needs ≤ 50%, Savings ≥ 20%, Wants ~ 30%). Comment explicitly on their unallocated investable surplus of €${investableSurplus}/mo if detailed mode is active.
3. **Austrian Tax Savings Strategy**: Comment on their holiday/christmas payouts. Are they utilizing bonus top-ups effectively? How does their progressive tax bracket affect capital gains? Explain how the Regelbesteuerungsoption works in their favor if their marginal rate is low, or why flat 27.5% KeSt protects them.
4. **Actionable wealth recommendations**: Outline exactly 3 immediate steps they can take to secure their wealth, reduce tax leakages, or supercharge compounding. Include calculations of their step-up projections where appropriate.
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
            { role: 'system', content: 'You are FinanzAT Pro Copilot, an Austrian financial planning assistant.' },
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
          model: 'google/gemini-2.5-flash',
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
  } catch (e: any) {
    console.error('AI Copilot request failed', e);
    throw new Error(`Audit failed: ${e.message}`);
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
