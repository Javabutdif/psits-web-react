# PSITS Web — Frontend (TypeScript)

Active React 19 + TypeScript + Vite frontend for the PSITS (Philippine Society of Information Technology Students) web platform.

## Stack

- **Framework:** React 19 + TypeScript + Vite 7
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix UI primitives)
- **State:** TanStack Query (server state), React Context (auth)
- **Routing:** React Router v7 (`createBrowserRouter`)
- **Forms:** React Hook Form + Zod validation
- **Notifications:** Sonner (toast)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts
- **QR Scanning:** `@yudiel/react-qr-scanner`

## Getting Started

```bash
cd client-side-ts
npm install
npm run dev
```

Open http://localhost:5173. API calls go to the backend at `http://localhost:5000` (configure `VITE_API_BASE_URL` if needed).

## Build & Preview

```bash
npm run build        # tsc type-check + Vite production build → dist/
npm run preview      # local preview of the production build
npm run lint         # ESLint check
npm run format       # Prettier format all source files
npm run format:check # Prettier check (CI-friendly)
```

## Project Structure

```
src/
├── api/               # Axios client, queryClient config, auth interceptors
├── assets/            # Static assets (logos, images)
├── components/        # Shared UI (ui/ from shadcn, common/, layout/, sections/)
├── constants/         # Route and query key constants
├── contexts/          # Global React contexts (auth, theme)
├── features/          # Feature modules by business domain
│   ├── auth/          # Login, signup, OTP, password reset, token management
│   ├── events/        # Event browsing, details, registration
│   ├── orders/        # Cart, shop, product details, order history, printable receipts
│   ├── student/       # Student portal, membership, certificates download
│   ├── certificate/   # Certificate template management, eligibility
│   └── admin/         # Admin dashboard modules
│       ├── agent-chat/        # PSITS Chatbot (Noetix AI) + onboarding tour
│       ├── contributions/     # GitHub contribution sync
│       ├── dashboard/         # Admin dashboard with charts
│       ├── devtools/          # Email queue, automation job scheduler
│       ├── event-management/  # Event CRUD, attendance, raffle
│       ├── merchandise/       # Merch catalog management
│       ├── organization/      # Admin accounts, members, roles
│       ├── recruitment-management/  # Positions, applications, interviews
│       ├── reports/           # Sales and analytics reports
│       └── settings/          # Platform settings
├── hooks/             # Global custom hooks
├── layouts/           # Page layouts (MainLayout, AdminLayout, StudentLayout)
├── lib/               # Core utilities (cn() tailwind merge)
├── pages/             # Route pages
│   ├── admin/         # /admin/* pages
│   ├── auth/          # /auth/* pages (login, signup, OTP, forgot/reset)
│   └── student/       # /student/* pages
├── types/             # Global TypeScript types
├── utils/             # Global utility functions
├── router.tsx         # React Router definition
└── App.tsx            # Root component
```

## Feature Modules

| Feature | Description |
|---------|-------------|
| **Auth** | V2 JWT auth with httpOnly refresh cookies, silent token refresh, 401 auto-retry |
| **Events** | Event listing, details, registration; QR/RFID attendance scanning (student view) |
| **Orders** | Cart, shop with product variants, order history, printable PDF receipts |
| **Certificates** | Admin template management and eligibility; student certificate download |
| **Recruitment** | Position/applicant management with interview scheduling; student application form |
| **Merchandise** | Admin catalog management with image uploads; campus-specific pricing and limits |
| **Admin Dashboard** | Charts (recharts), pending orders, membership counts |
| **Devtools** | Email queue panel, automation job scheduler (20 preset functions), cron execution logs |
| **PSITS Chatbot** | Noetix AI-powered chat for operational data queries; tool-loop agent with onboarding tour |

## Design System

- **Primary color:** `#1c9dde` blue scale
- **Semantic colors:** success `#0bd444`, danger `#f43f5e`, warning `#f59e0b`
- **Typography:** Switzer / Inter (headings, body); JetBrains Mono (code)
- **Don't modify** `src/components/ui/` unless necessary; compose new UI in `src/components/common/`
- **Don't introduce colors** outside CSS variables defined in `src/index.css`

## Routing

| Route | Layout | Guard |
|-------|--------|-------|
| `/` | MainLayout | Public (redirects admin to dashboard) |
| `/events` | MainLayout | Public |
| `/shop`, `/shop/:id` | MainLayout | Campus guard |
| `/cart` | MainLayout | Student membership guard |
| `/student/*` | StudentLayout | Student route guard |
| `/auth/*` | — | Public |
| `/admin/*` | AdminLayout | Admin route guard |
| `/admin/events/:eventId/raffle` | AdminLayout | UC_MAIN campus guard |

## Known Issues (v1.0)

See [Decisions.md](../../docs/ADMIN_FRONTEND_TS_MIGRATION_PLAN.md) in the repo root for the full migration debt log.

- **Legacy token dependency:** Some admin pages read `sessionStorage.Token` instead of V2 context; V2-restored sessions may show empty data.
- **Route guard gaps:** A few admin routes lack `AdminCampusRouteGuard`; sidebar navigation blocks direct links but deep URLs bypass.
- **Swallowed API errors:** Several admin helpers catch errors → return `[]`, hiding backend failures as "no records".
- **Bulk action partial failure:** `Promise.all` without partial-success handling.
- **Stale tab responses:** Tab switches without request cancellation can serve stale data.

## Related

- [Backend README](../server-side/README.md)
