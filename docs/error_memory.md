# Workspace Error Log & Debugging Memory

## 0. Last Synchronized Checkpoint

- **Last Error Check**: July 16, 2026, 09:20 PM PST

## 1. Active & Unresolved Errors

_List errors currently blocking development. Update this section immediately when a new error occurs during execution or user prompting._

### [ERR-004] Console.log/debug Statements in Production Code

- **Symptom**: 15+ instances of `console.log` and `console.debug` found across both frontend and backend:
  - **Frontend (client-side-ts)**: `auth.api.ts:41,63`, `promo.ts:87,110` — logging auth responses and promo data (ESLint flagged as warnings)
  - **Backend (server-side)**: `index.ts:92,95,100,104` (server startup logs), `order.controller.ts:98,112,148,162,824` (debug order fetches), `authV2.controller.ts:86,328` (login attempt logging), `admin.controller.ts:331` (admin access level), `mail.template.ts:51,90,178` (email sent confirmations), `generate-pdf-from-ejs.ts:27,30` (browser launch logs), `index.v2.controller.ts:94` (response logging)
- **Context/Trigger**: `-setup` cleanup scan on July 16, 2026
- **Suspected Root Cause**: Leftover debug logging during development. Backend server startup logs (index.ts) are intentional, but controller-level console.logs should be removed or replaced with a proper logger.

### [ERR-003] TODO/FIXME Comments in Production Code

- **Symptom**: 3 TODO comments found in client-side-ts:
  1. `router.tsx:127` — `// TODO: Remove this sample` (route definition)
  2. `router.tsx:132` — `// TODO: Remove this sample` (route definition)
  3. `data/sections-data.ts:470` — `// TODO: Add photo for Secretary before uncommenting`
- **Context/Trigger**: `-setup` code comment scan on July 16, 2026
- **Suspected Root Cause**: Leftover sample routes that were never cleaned up, and a missing officer photo that hasn't been added yet.

### [ERR-002] ESLint: 43 Errors + 19 Warnings in client-side-ts

- **Symptom**: Running `npx eslint .` in `client-side-ts/` reports 43 errors and 19 warnings. TypeScript compilation (`tsc --noEmit`) passes clean — these are lint/code quality issues, not blocking compilation.
- **Context/Trigger**: `-setup` error scan on July 16, 2026 (confirmed: same counts as July 14)
- **Suspected Root Cause**: 
  - 19x `@typescript-eslint/no-explicit-any` — widespread use of `any` type (heaviest in `student.ts` with 11 instances, `orders.ts`, `ProductDetails.tsx`, `MyOrders.tsx`, `OrganizationSection.tsx`, `ResourcesSection.tsx`, `cart.tsx`)
  - 6x `@typescript-eslint/no-unused-vars` — unused variables in `CartArea.tsx` (3 empty catch blocks), `lib/cart.tsx` (3 unused catch params), `MyOrders.tsx` (1 empty catch block)
  - 2x `react-hooks/refs` — ref access during render in `RaffleBackground.tsx`
  - 2x `@typescript-eslint/no-empty-object-type` — empty interface in `documentation.ts:135,137`
  - 11x `react-refresh/only-export-components` warnings in barrel export files (`cart.tsx`, `transactions.tsx`, `events/index.tsx`)
  - 4x `react-hooks/exhaustive-deps` warnings — missing dependencies in effect arrays (`cart.tsx:119`, `raffle.tsx:253`, `MyOrders.tsx:209`)
  - 2x `no-console` warnings — console.log statements in `auth.api.ts`, `promo.ts`
  - 4x `no-empty` errors — empty catch/if blocks

### [ERR-001] Widespread `any` Type Usage in client-side-ts

- **Symptom**: 19 ESLint errors for `@typescript-eslint/no-explicit-any` across the TypeScript frontend. Primary offenders: `src/features/student/api/student.ts` (11 instances), `src/features/orders/api/orders.ts` (2), `src/lib/cart.tsx` (1), `src/features/orders/components/ProductDetails.tsx` (1), `src/pages/student/MyOrders.tsx` (2), `src/pages/organizations/sections/OrganizationSection.tsx` (1), `src/pages/resources/sections/ResourcesSection.tsx` (1).
- **Context/Trigger**: ESLint scan during `-setup` initialization (July 16, 2026)
- **Suspected Root Cause**: Incomplete migration from JavaScript to TypeScript — many API response types were not properly defined, leading to fallback to `any`. The `student.ts` API file is particularly heavy with untyped Promise returns (11 instances).

---

## 2. Historical & Resolved Errors

_Move errors to this section once they are completely verified as fixed. This serves as historical memory to prevent the AI from re-introducing the same bugs._

### [RESOLVED] Backend TS Compilation: Missing Properties on IOrdersItems (ERR-005)

- **The Issue**: `npx tsc --noEmit` in server-side reported 2 compilation errors — `imageUrl1` and `category` properties missing on `IOrdersItems` type in `merchandise.controller.ts`.
- **The Resolution**: Verified resolved on July 16, 2026, 09:20 PM PST. `npx tsc --noEmit` now passes clean (exit code 0, zero output). The interface or controller was corrected in a prior change.
- **Prevention Strategy**: Run `npx tsc --noEmit` before commits touching server-side models or controllers to catch type mismatches early.

### [RESOLVED] Error Identifier / Short Description

- **The Issue**: _Brief summary of what went wrong._
- **The Resolution**: _How it was fixed (e.g., code changes, configuration adjustments, dependency updates)._
- **Prevention Strategy**: _What architectural rule or guideline should be followed to avoid a regression?_

---

## 3. Persistent Debugging Rules

- **Lookback Before Guessing**: Before attempting to fix any code, cross-reference this file to see if a similar failure has happened before.
- **Immediate Documentation**: Every time a debugger action fails or reveals a new error, log it under section 1 before writing any fixes.
- **Clean Transitions**: When an error is resolved, update its status, document the solution, and shift it to section 2.

---

## 4. ARCHIVE STATUS

- **Archive File**: `.opencode/archives/error_archive.md`
- **Threshold**: 10 active entries per section
- **Total Archived**: 0
- **Last Archive Check**: `Not yet performed`

| Entries Archived | Archived At (PST) |
| ---------------- | ----------------- |
| 0                | —                 |

<!-- c: worrie -->
