# 🇦🇹 Austrian Investment Calculator

A premium, interactive web application engineered to calculate wealth compounding and compound growth timelines dynamically tailored to the unique **Austrian income tax, bonus system, and living costs context**.

Built from the ground up using **React**, **TypeScript**, **Vite**, and **Recharts**, and structured using a scalable **Vertical Slice Architecture (VSA)**.

---

## 🚀 Live Demo & Screenshots

> [!TIP]
> Experience the application's clean dark-themed dashboard, featuring responsive inputs, real-time custom charts, and progressive tax calculation summaries in action!

---

## ✨ Features Spotlight

*   **🇦🇹 Austrian Tax Engine**: Handles social security contributions (respecting the Höchstbeitragsgrundlage maximum ceiling), progressive tax brackets, and highly favorable tax rates on 13th & 14th salary bonuses (*Urlaubsgeld* & *Weihnachtsgeld*).
*   **📈 Compounding Projection Charts**: Tracks Paid In Capital vs. Midpoint Growth Portfolio vs. Min/Max Bands over customizable year spans.
*   **📊 Timeline Budget Forecasting**: Select any future year (e.g. Year 10) to forecast your future 50/30/20 financial health and recommendations as loans finish or salary changes.
*   **⏳ Future Milestone Builder**: Plan future financial events (loan payoffs, childcare, salary increments) with an optional **Auto-Reinvest Engine** that absorbs cost savings back into your compounding portfolio automatically!
*   **💸 Real Expense Tracker & Surplus Glow-Box**: List monthly costs categorized as **Needs (Fixed)** or **Wants (Flexible)**. Computes your exact **Real Investable Surplus** with a one-click button to redirect all idle money into investments.
*   **📁 Preset Scenario Manager**: Save, load, and manage named drafts (local scenarios) safely cached via `localStorage` sync.

---

## 🏗️ Technical Architecture & Roadmap

We adhere to a highly decoupled **Vertical Slice Architecture (VSA)** under a centralized state context provider. To learn more about the inner workings, progressive formulas, and our future plans, read our dedicated wiki:

*   **📘 [Full Technical Wiki & References (WIKI.md)](file:///Users/thunder6230/projects/investment-calculator/WIKI.md)**
*   **💡 [Feature Roadmap Details](file:///Users/thunder6230/projects/investment-calculator/WIKI.md#-product-roadmap)**

---

## 🛠️ Local Development & Installation

### Prerequisites
Make sure you have **Node.js (v18+)** and **npm** installed on your system.

### Steps
1.  **Clone or Open the workspace**:
    ```bash
    cd /Users/thunder6230/projects/investment-calculator
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Launch the development server**:
    ```bash
    npm run dev
    ```
    This opens the local server (typically at `http://localhost:5173`).
4.  **Run a production build**:
    ```bash
    npm run build
    ```
    Compiles an optimized bundle to the `dist/` directory.
