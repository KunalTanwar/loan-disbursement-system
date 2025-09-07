# Loan Disbursement System (Frontend)

A full-featured, frontend-only loan disbursement system built with React + TypeScript (Vite, pnpm), styled with Tailwind CSS v4, persisted in IndexedDB via Dexie, using TanStack Query for async state, and Chart.js for analytics. The app supports multi-currency origination, disbursement, repayments, and reporting with live FX conversion using a free exchange-rate API.

## Features

-   Loan lifecycle: borrowers, products, applications, approvals, disbursements, schedules, repayments, and audit log.
-   Multi-currency: application currency, payout currency, repayment currency, and reporting currency with historical/spot conversion.
-   Analytics: disbursement trends and KPIs rendered via Chart.js components; reporting currency selectable on the dashboard.

## Tech stack

-   React + TypeScript with Vite and pnpm for fast DX and builds.
-   Tailwind CSS v4 with single-file CSS import and Vite integration.
-   Dexie (IndexedDB) for local persistence with versioned schema.
-   TanStack Query for data fetching, caching, and async orchestration.
-   Chart.js via react-chartjs-2 for charts; Motion One optional for micro-interactions.

## Project structure

```
loan-disbursement/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ src/
│  ├─ index.css
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ types.ts
│  ├─ db.ts
│  ├─ lib/
│  │  ├─ money.ts
│  │  └─ schedule.ts
│  ├─ services/
│  │  ├─ fx.ts
│  │  ├─ borrowers.ts
│  │  ├─ products.ts
│  │  ├─ applications.ts
│  │  └─ repayments.ts
│  ├─ components/
│  │  ├─ ui.tsx
│  │  └─ charts/
│  │     └─ DisbursementsByMonth.tsx
│  └─ pages/
│     ├─ Dashboard.tsx
│     ├─ Borrowers.tsx
│     ├─ Products.tsx
│     ├─ Applications.tsx
│     ├─ ApplicationDetail.tsx
│     ├─ Transactions.tsx
│     └─ AuditLog.tsx
```

## Getting started

-   Prerequisites: Node 18+ and pnpm installed globally.
-   Install and run:

```bash
pnpm install
pnpm dev
```

-   Production build and preview:

```bash
pnpm build
pnpm preview
```

## Configuration

-   Tailwind v4: import it once in src/index.css with “@import "tailwindcss";” and use utilities directly.
-   No backend or secrets required; a free FX API is used over HTTPS from the browser.
-   Environment variables are not required; all configuration is in code for simplicity.

## Data model

-   Core types are defined in src/types.ts to keep domain definitions centralized and strongly typed.
-   Entities include:
    -   User: local role indicator (admin/officer/auditor).
    -   Borrower: identity and home currency with simple KYC status.
    -   LoanProduct: currency, interest type/rate, tenor, fee and penalty percentages.
    -   LoanApplication: ties borrower/product, principal, currency, status, and timestamps.
    -   RepaymentSchedule: array of installments with principal/interest breakdown.
    -   Repayment: receipts applied to installments with original payment currency.
    -   Transaction: ledger for disbursements/repayments/fees/penalties with currency and FX meta.
    -   AuditEvent: traceable “who did what, when, to which entity” events.

## Persistence (Dexie/IndexedDB)

-   Database defined in src/db.ts; schema version 2 introduces currency indexing and application.currency.
-   Stores: users, borrowers, products, applications, schedules, repayments, transactions, audits with relevant indexes.
-   Upgrades: bump db.version(...) when adding/changing stores or indexes; in development, deleting the DB once is acceptable if data can be recreated.

## Multi-currency design

-   Application currency: derived from selected product at application creation.
-   Disbursement currency: selectable at disbursement; principal is converted from application currency to payout currency, recording the rate and date in transaction.meta.fx.
-   Repayment currency: payer’s currency may differ; amounts are converted to application currency for schedule logic, with original currency retained in the transaction.
-   Reporting currency: user-selectable on the dashboard; aggregates convert source amounts using the latest rates to the base.

## FX conversion

-   A lightweight FX service in src/services/fx.ts wraps a free exchange-rate API with:
    -   convertAmount(amount, from, to, date?) for historical or spot conversion.
    -   latestRates(base) for dashboard reporting currency conversion.
-   All FX operations store rate, from/to, and date in transaction meta when conversions occur, maintaining auditability.

## Money formatting

-   src/lib/money.ts exposes formatMoney(value, currency, locale) and is used across pages to avoid hardcoding “\$”.
-   UI always surfaces the currency code and formats per the user’s locale (navigator.language by default).

## Interest and schedules

-   src/lib/schedule.ts implements a reducing-balance schedule using the annuity formula.
-   Disbursement generates the schedule for the approved application using product interest/tenor and application principal.
-   The schedule is saved as installments in the schedules store for display and repayment processing.

## Pages and flows

-   Borrowers: create and list; each input/select has accessible labels.
-   Products: define currency, rates, interest type, tenor, and fees; form fields have labels and validation hints.
-   Applications: create (borrower + product + principal), then submit and approve; list shows status and actions.
-   Application Detail: approve/disburse, view schedule, and record repayments; labels clarify amounts and currencies.
-   Transactions: ledger of disbursement and repayment events with formatted amounts and currency codes.
-   Audit Log: semantic table with caption and columns Event, Actor, When; When uses <time> with machine-readable datetime and human-friendly relative time.
-   Dashboard: reporting currency selector with totals and disbursements-by-month chart converted into the selected base currency.

## State and data fetching

-   TanStack Query wraps FX requests and any async reads that benefit from caching and refetching.
-   Local “backend” writes (Dexie) are orchestrated via functions in src/services and followed by invalidations or effect-driven refreshes.
-   Queries use small stale times for FX and one-time loads for local tables where appropriate.

## Charts

-   Chart.js is wired via react-chartjs-2 with explicit registration of scales/elements.
-   The DisbursementsByMonth component accepts labels and numeric data already converted to the reporting currency to keep presentation simple.

## Accessibility

-   Every input/select across pages includes a label with htmlFor/id association.
-   The Audit Log uses a caption, column headers, and <time> for machine-readable timestamps.
-   Buttons expose disabled states and simple aria-busy where relevant (e.g., submit actions).

## Commands

-   Development: pnpm dev (Vite dev server with HMR).
-   Build/Preview: pnpm build and pnpm preview for testing the production bundle.
-   Linting/testing: add preferred tooling as needed (e.g., ESLint, Vitest) following personal or team conventions.

## Common workflows

-   Create product → create borrower → create application (principal in product currency) → submit → approve → disburse (choose payout currency) → schedule generated → post repayments (in any currency) → dashboards and audit log update.
-   Switch reporting currency in Dashboard to view totals and charts converted with fresh rates.
