# 🇦🇹 Austrian Investment Calculator Wiki & Technical Reference

Welcome to the **Austrian Investment Calculator Wiki**. This document provides an in-depth breakdown of the current features, the underlying mathematical models, the architectural layout, and a premium product roadmap.

---

## 🧭 Table of Contents
1. [Core Features & Explanations](#-core-features--explanations)
2. [Mathematical & Tax Formulas](#-mathematical--tax-formulas)
3. [Architecture: Vertical Slice Pattern](#-architecture-vertical-slice-pattern)
4. [💡 Product Roadmap](#-product-roadmap)

---

## 🎯 Core Features & Explanations

### 1. Progressive Austrian Income Tax Engine
Austria has a progressive income tax system calculated on a yearly basis, coupled with a unique **13th and 14th salary** bonus system (Holiday Bonus *Urlaubsgeld* and Christmas Bonus *Weihnachtsgeld*). This engine handles:
*   **Social Security Deductions**: Automatically calculates employee social security contributions at a baseline rate of **18.12%**, respecting the maximum contribution ceiling (*Höchstbeitragsgrundlage*) of **€6,060/month** (2024–2026 standard scales).
*   **Progressive Tax Brackets**: Evaluates taxable regular income across Austria’s progressive brackets (0% up to 50% marginal rates).
*   **Bonus Tax Concessions**: Applies Austria's highly favorable tax rules for the 13th & 14th salaries:
    *   The first **€620** is entirely tax-free.
    *   The remaining amount is taxed at a flat, heavily discounted rate of **6%** under standard limits.
*   **True Monthly Net**: Converts 14 payouts into a normalized 12-month baseline, net monthly regular salary, and exact net bonus payouts, giving a realistic picture of disposable income.

### 2. Compounding Projection Engine with Indexed Step-Ups
Traditional compound interest calculators assume a static contribution rate. Our advanced compounding engine incorporates:
*   **Annual Step-Up growth**: Increases your regular monthly contributions and annual bonus top-ups dynamically year-over-year (e.g. 2% to match inflation, or 5% to model expected salary growth).
*   **Holiday & Christmas Top-ups**: Automatically schedules large, lump-sum investments in June and December to reflect the compounding power of saving your net 13th/14th salaries.
*   **Growth Bands**: Models three investment scenarios (Low growth, High growth, and Midpoint) to display realistic market fluctuations rather than a single static rate.

### 3. Detailed Real Expense Tracker & Budget Builder
Allows the user to shift from generic estimates to precise cash flow tracking:
*   **Dual Expense Modes**: Users can quickly toggle between a *Simple Entry* (gross fixed cost estimate) and a *Detailed Tracker* (itemized list).
*   **Need vs. Want Classification**: Every logged expense (e.g., rent, groceries, streaming, dining) is tagged as a **Need (Fixed)** or a **Want (Flexible)**.
*   **"Invest Surplus" Booster**: Automatically calculates the user's **Real Investable Surplus** ($$Net - Needs - Wants$$) and displays a pulsing alert with a one-click button to automatically set their portfolio contributions to capture all unallocated capital.

### 4. Interactive Timeline Budget Forecasting
A state-of-the-art forecasting system that answers: *"How will my financial health look in 10 years?"*
*   **Yearly Timeline Selectors**: Allows selecting any year in the projection timeline.
*   **Reactive 50/30/20 Health Bar**: The 50/30/20 financial rule breakdown (Needs/Wants/Savings/Buffer) dynamically recalculates and color-codes depending on which year is selected.
*   **Automated Progress Badges**: Displays reactive warning labels (e.g., `✅ Healthy`, `⚠️ High`, `🚨 Critical` for fixed costs; `🚀 Wealth Builder`, `👍 Good` for savings) for any selected year.

### 5. Interactive Future Milestones Builder
Enables users to model complex life events that alter cash flow:
*   **Future Triggers**: Add events like a loan payoff, buying a car, childcare expenses, or a planned salary jump at a specific future year.
*   **Auto-Reinvestment Engine**: If a milestone represents a cost reduction (e.g., payoff of a €400/month loan in Year 5), the user can toggle **"Auto-Reinvest"**. The engine will automatically absorb that freed €400/month directly into their regular investment contributions from Year 5 onwards, compounding their wealth exponentially!

### 6. Rich Interactive Visualizations
*   **Recharts Growth Curves**: Features high-fidelity charts outlining Paid In Capital vs. Midpoint Portfolio vs. Growth Bands.
*   **Context-Aware Tooltips**: Hovering over the chart displays active monthly contributions, active fixed costs, and an array of triggered milestones for that specific year.
*   **Badged Timeline Table**: A year-by-year table displaying contribution step-ups and custom colored badges (`🎉` for cost reductions, `⚠️` for cost increases) detailing each milestone's status.

### 7. Named Preset Scenario Manager
*   **LocalStorage Auto-Save**: Prevents loss of data by automatically caching baseline values.
*   **Preset Selector**: Allows saving, naming, loading, and deleting custom drafts (e.g., "Conservative Plan", "Aggressive FIRE", "Milestone Reinvest") to experiment with different life strategies.

---

## 📊 Mathematical & Tax Formulas

### Progressive Income Tax Formulas
Let $G_m$ be the monthly gross salary. The yearly gross salary is $G_y = 14 \times G_m$.

1.  **Social Security ($SS$)**:
    $$SS_m = \min(G_m, 6060) \times 18.12\%$$
    $$SS_y = 14 \times SS_m$$

2.  **Regular Taxable Base ($Base_{reg}$)**:
    $$Base_{reg} = (12 \times G_m) - (12 \times SS_m) - \text{Standard Deductions}$$

3.  **Progressive Bracket Calculation ($Tax_{reg}$)**:
    Applying Austria's progressive rates to $Base_{reg}$:
    *   $0 \le X \le 12,816$: $0\%$
    *   $12,816 < X \le 20,818$: $20\%$
    *   $20,818 < X \le 34,513$: $30\%$
    *   $34,513 < X \le 66,612$: $40\%$
    *   $66,612 < X \le 99,266$: $48\%$
    *   $99,266 < X$: $50\%$

4.  **Bonus Tax ($Tax_{bonus}$)**:
    For 13th & 14th salaries ($G_b = G_m$):
    $$Base_b = G_b - SS_m$$
    $$\text{Taxable Bonus} = \max(0, Base_b - 620)$$
    $$Tax_b = \text{Taxable Bonus} \times 6\%$$
    $$Tax_{bonus} = 2 \times Tax_b$$

### Compounding with Annual Step-Ups & Milestones
For year $t \in [1, N]$:
*   **Indexed Regular Contribution ($C_t$)**:
    $$C_t = C_0 \times (1 + r_{step})^{t-1} + \sum M_{reinvest, t}$$
    Where $M_{reinvest, t}$ is the sum of auto-reinvested cash flow from active reduction milestones.
*   **Indexed Bonus Top-ups ($B_{June, t}, B_{Dec, t}$)**:
    $$B_{June, t} = B_{June, 0} \times (1 + r_{step})^{t-1}$$
    $$B_{Dec, t} = B_{Dec, 0} \times (1 + r_{step})^{t-1}$$
*   **Compound Progression**:
    Let $P_t$ be the portfolio value at the end of year $t$, starting with capital $P_0$. Let $R$ be the monthly interest rate: $R = (1 + r_{growth})^{1/12} - 1$.
    For each month $m \in [1, 12]$ inside year $t$:
    $$P_{t, m} = P_{t, m-1} \times (1 + R) + C_t$$
    *   In month 6 (June), add $B_{June, t}$
    *   In month 12 (December), add $B_{Dec, t}$
    $$P_t = P_{t, 12}$$

---

## 🏗️ Architecture: Vertical Slice Pattern

The codebase is organized in a **Vertical Slice Architecture**, which encapsulates related domain files into single, self-contained feature slices:

1.  **Shared Foundation (`src/components/common/`)**: Reusable UI inputs (`NumberInput.tsx`, `SliderInput.tsx`) designed for accessibility and smooth state bindings.
2.  **State Centralization (`src/context/`)**: The `InvestmentPlannerContext.tsx` handles all base reactive state, auto-saving logic, and memoized math pipelines. Components consume this state through `useInvestmentPlanner()`.
3.  **Vertical Domain Slices (`src/features/`)**:
    *   `tax/`: Isolated tax formulas (`taxCalculator.ts`) and salary panel components (`TaxSection.tsx`).
    *   `expenses/`: Itemized expense logs and custom inputs (`ExpenseTracker.tsx`).
    *   `projection/`: Layout components (`InvestmentInputs.tsx`, `MilestoneBuilder.tsx`), graphic visuals (`ProjectionChart.tsx`), and data breakdowns (`ProjectionTable.tsx`) organized around the projection algorithm (`projectionEngine.ts`).
    *   `budget/`: Financial health advice panels (`BudgetRecommendations.tsx`).
    *   `scenarios/`: Draft saving utilities (`ScenarioManager.tsx`).

---

## 💡 Product Roadmap

### 🌐 Phase 1: Real-Time API Integrations (Data & Feeds)
*   **Austrian Tax Legislation API**:
    *   Integrate with official governmental APIs (or open-source tax feeds) to automatically fetch annual tax bracket updates, social security ceilings (*Höchstbeitragsgrundlage*), and standard deductions as Austrian law updates.
*   **ETF Live Feed Integration**:
    *   Connect to financial APIs (e.g. Yahoo Finance, Alpha Vantage) so users can search for standard tickers (e.g., `A2PKXG` - Vanguard FTSE All-World) and import actual historic rolling returns, standard deviations, and expense ratios (TER) directly into the growth projection.

### 📈 Phase 2: Advanced Wealth Tax & Capital Gains (KeSt) Modeling
*   **Austrian Capital Gains Tax (KeSt)**:
    *   Introduce compounding projections net of the **27.5% Austrian Capital Gains Tax (*Kapitalertragsteuer*)**.
*   **Meldefonds Accumulating Tax Drag**:
    *   Implement advanced tax-drag modeling for accumulating ETFs (*Thesaurierende Fonds*), modeling annual taxation on deemed distributions (*ausschüttungsgleiche Erträge*) according to official **OeKB (*Österreichische Kontrollbank*)** reports.
*   **Distributing ETFs vs. Accumulators**:
    *   Renders dynamic side-by-side charts showing the mathematical difference in total capital over 10-30 years when using accumulating vs. distributing funds under Austrian tax regulations.

### 👥 Phase 3: Side-by-Side Scenario Comparisons
*   **Visual Strategy Overlays**:
    *   Renders charts that overlay multiple named drafts simultaneously.
    *   Enables direct visual comparison of drastically different life paths (e.g. "Scenario A: High rent + aggressive investing" vs. "Scenario B: Buying a house + low investing + milestone loan payoffs").
*   **Comparative Financial Health Metrics**:
    *   Compare 50/30/20 rules and savings rates of different scenarios side-by-side in a comparative dashboard.

### 🔥 Phase 4: FIRE Reverse Planner & Goal Solver
*   **FIRE Engine**:
    *   Introduce a Financial Independence Retiring Early (FIRE) calculator.
    *   Calculates the exact year you can live off your portfolio based on a customized safe withdrawal rate (SWR, e.g., 3.5% or 4%) and Austrian tax obligations on withdrawals.
*   **Contribution Goal Solver**:
    *   Users enter a target net worth (e.g., €500,000) and year (e.g., Year 20), and the solver back-calculates the exact monthly contribution or gross monthly salary needed to achieve it.

### ☁️ Phase 5: Cloud Synchronization & Premium Exports
*   **Encrypted Sync & User Accounts**:
    *   Add a lightweight database tier (e.g. Supabase, Firebase) to let users log in, synchronize their scenarios across mobile/desktop, and safely back up their financial planners.
*   **Professional PDF Report Exporter**:
    *   Generates comprehensive, beautifully formatted PDF reports including custom charts, current tax breakdowns, year-by-year projections, milestone alerts, and custom financial advice logs suitable for sharing with family or financial advisers.
