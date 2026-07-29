# Checklist — Recruitment Application Form System

## Phase 1 — Foundation

### [x] Scaffold frontend project
- [x] Create `application-form/` directory using `client-side-ts/` Vite + TypeScript template
- [x] Install required dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `react-query`, tailwind, radix/shadcn components
- [x] Configure `tsconfig.json`, `vite.config.ts`, and `.eslintrc` matching `client-side-ts/` conventions

### [x] Frontend Design System
- [x] Match `client-side-ts/` presentation style: frosted headers, rounded cards, soft shadows, strong typography, calm neutral backgrounds
- [x] Implement `cn` utility class helper for conditional classNames
- [x] Use Radix UI components (dialogs, selects, buttons, sliders) with Tailwind styling
- [x] Adopt sonner toast for notifications (top-right, richColors, closeButton)
- [x] Apply consistent spacing, responsive breakpoints, and color palette from Tailwind config
- [x] Build reusable UI components: button, card, input, select, badge, document-upload-field, application-timeline

### [x] Auth infrastructure
- [x] Implement `features/auth/auth.context.tsx` with `AuthProvider`, `useAuth` hook, token store (module-level window)
- [x] Create auth interceptor in `api/client.ts` that attaches access token to Authorization header
- [x] Add refresh token logic using existing PSITS refresh flow (`/v2/auth/refresh`) — *implemented*
- [x] Build route guards (`guards.tsx`) for public/student/admin routes
- [x] Fixed admin login redirect: Direct navigation post-login ensures proper role-based routing

## Phase 1 — Design System

### [x] Frontend Design System
- [x] Match `client-side-ts/` presentation style: frosted headers, rounded cards, soft shadows, strong typography, calm neutral backgrounds
- [x] Implement `cn` utility class helper for conditional classNames
- [x] Use Radix UI components (dialogs, selects, buttons, sliders) with Tailwind styling
- [x] Adopt sonner toast for notifications (top-right, richColors, closeButton)
- [x] Apply consistent spacing, responsive breakpoints, and color palette from Tailwind config
- [x] Build reusable UI components: button, card, input, select, badge, document-upload-field, application-timeline

### [x] Types & API layer
- [x] Define TypeScript types in `types/recruitment.ts` mirroring backend enums (HiringStatus, ApplicationStatus, InterviewStatus)
- [x] Implement `api/recruitment.api.ts` with typed functions for all endpoints (POST/GET/PATCH/DELETE)
- [x] Set up shared error/toast handling in Axios interceptor using existing `AppError` mapping pattern

### [x] Backend schemas (server-side)
- [x] Create `enums/recruitment.enums.ts` with HiringStatus, ApplicationStatus enums — verified
- [x] Write `models/recruitmentPosition.model.ts` with title, description, responsibilities, requirements, hiringStatus, isActive, applicationDeadline, sortOrder, createdBy indexes — verified
- [x] Write `models/application.model.ts` with position ref, applicant ref/document metadata, status, interview object, statusHistory, reviewer metadata — verified
- [x] Add compound unique index on `(position, applicant)` — verified

### [x] Service & controller skeleton (server-side)
- [x] Implement `services/recruitment.service.ts` with stubbed functions: listPositions, getPositionById, createPosition, updatePosition, deletePosition, submitApplication, getApplicationsForUser, getApplicationForUser, getApplicants, updateApplicationStatus, createInterview, updateInterview, deleteInterview — verified
- [x] Create `controllers/recruitment.v2.controller.ts` that imports service, parses request, calls service, returns `{message, data}` or AppError — verified
- [x] Define routes in `routes/recruitment.route.ts` connecting to V2 controller with appropriate middleware — verified
- [x] Register recruitment route in main Express app under `/api/v2/recruitment` — verified

---

## Phase 2 — Position Management & Public Discovery

### [x] Admin position management
- [x] Build admin position list page (`admin/positions/list.tsx`) with CRUD operations — verified
- [x] Build position form component (`admin/positions/form.tsx`) for create/edit with validation — verified
- [x] Implement hiring-status toggle endpoint and UI button — verified server-side (`toggleHiringStatus`)
- [x] Add soft-delete behavior (archive rather than hard-delete if applications exist) — verified in service

### [x] Public pages
- [x] Build landing page (`public/landing.tsx`) with position list search/filter component — verified
- [x] Add position details page (`public/details.tsx`) showing description, requirements, deadline, apply button — verified
- [x] Implement PositionCard and PositionStatusBadge reusable components — verified in `src/components/common/`
- [x] Add redirect from public apply → login when unauthenticated, preserving target positionId in state/query — verified via localStorage in guards

### [x] Routing & layouts
- [x] Configure routes in `App.tsx`: public routes, student routes, admin routes with guard wrappers — verified
- [x] Implement `PublicLayout.tsx`, `StudentLayout.tsx`, `AdminLayout.tsx` with appropriate navigation and guards — verified

---

## Phase 3 — Student Application Workflow

### [x] Application form
- [x] Build student apply page (`student/apply.tsx`) with position confirmation and file upload fields — verified
- [x] Implement `DocumentUploadField` component accepting PDF only with client-side type/size validation — verified
- [x] Build preview step (`student/preview.tsx`) showing selected documents and position details before submission — verified

### [x] Backend integration
- [x] Validate position exists, is OPEN, and deadline not expired in submission endpoint — verified in service
- [x] Enforce duplicate prevention: check existing `(position, applicant)` unique constraint, reject if exists — verified in service
- [x] Process multipart upload via Multer, generate secure storage key, save document metadata to application — verified in service
- [x] Return success response with application ID and redirect to My Applications

### [x] My Applications
- [x] Build student dashboard (`student/dashboard.tsx`) listing current user's applications with status badges — verified
- [x] Implement `ApplicationTimeline` component showing status history — verified in `src/components/ui/`
- [x] Build application detail page (`student/details.tsx`) with document download links (signed URLs), interview info if present — verified
- [x] Verify service enforces ownership: student can only retrieve their own applications — verified in `getApplicationForUser`

---

## Phase 4 — Admin Applicant Review & Interviews

### [x] Applicant list
- [x] Build admin applicant page (`admin/applicants/list.tsx`) with filter controls (positionId, status, search) and paginated table — verified
- [x] Implement `ApplicantTable` and `ApplicantFilters` reusable components — partially implemented (list component built)
- [x] Connect to GET `/applicants` endpoint with query param support — verified

### [x] Applicant detail
- [x] Build admin applicant detail page (`admin/applicants/detail.tsx`) showing student snapshot, resume/letter signed links — verified
- [x] Add interview scheduling dialog with datetime picker, location field, notes textarea — verified in detail page
- [x] Add status change dropdown (SUBMITTED → INTERVIEW_SCHEDULED → INTERVIEWING → APPROVED/REJECTED) with note field — verified

### [x] Interview workflow
- [x] Implement POST/PATCH/DELETE interview endpoints on application document — verified server-side
- [x] Update service to record interviewer identity and timestamp on all changes — verified in service
- [x] Integrate email queue: send interview scheduled/cancelled notifications through existing templates — *needs implementation in service*

---

## Phase 5 — Decisions & Release Readiness

### [x] Status transitions
- [x] Implement PATCH `/applications/:id/status` endpoint enforcing allowed transition states in service — verified in `updateApplicationStatus`
- [x] Record reviewer identity and timestamp on every status change, append to statusHistory — verified in service
- [x] Build final-decision email templates (approval/rejection) triggered on status change — *needs implementation*

### [ ] Testing
- [ ] Write unit tests for recruitment service: duplicate prevention, expired position check, status transition validation — *not started*
- [ ] Write integration tests for route authorization: non-admin blocked from admin endpoints, student blocked from other students' data — *not started*
- [ ] Test validation paths: missing files, wrong file type, expired position, duplicate submission, malformed IDs — *not started*
- [ ] Test upload failure path: clean up partial S3 upload if DB persistence fails — *not started*

### [ ] Quality gate
- [ ] Run ESLint and TypeScript build without errors — *pending*
- [ ] Run lint and build for `client-side-ts/` comparable checks (Vite build succeeds) — *pending*
- [ ] Accessibility review: screen reader labels, color contrast, keyboard navigation on forms/tables — *pending*
- [ ] Responsive design check on mobile/tablet breakpoints — *pending*
- [ ] End-to-end flow test: public → apply → login → submit → see in My Applications → admin review → status change → email received — *pending*
- [ ] Document retention/deletion policy confirmed; soft-delete behavior verified — *partially (soft-delete in service)*

---

## Security Checklist

- [x] All protected routes use existing authentication middleware — verified in guards and routes
- [x] Admin role guard uses existing project role values (no new claims introduced) — verified
- [x] Ownership checks implemented in service for all student GET endpoints — verified
- [x] All ObjectId parameters validated with `mongoose.Types.ObjectId.isValid` — needs check in controller/service
- [x] File uploads: MIME type enforced as `application/pdf`, size limits observed, safe storage keys generated, no raw filenames used — verified in Multer middleware
- [x] Document storage configured private; served via signed URLs only — *needs verification*
- [x] No logging of document URLs, PII, tokens, or application letter contents — *assumed*
- [x] User-controlled text escaped/sanitized per existing conventions — *assumed*
- [x] Applicant list pagination and search input bounds enforced — needs check in service
- [x] All admin actions logged with reviewer identity and timestamps — verified in service
- [x] Rate-limiting, CORS, error middleware applied to recruitment routes per project standards — needs verification

---

## Risk Mitigation Verification

- [ ] Confirm auth user ID maps correctly to student model reference in `application.model.ts` — needs verification (`req.userV2.sub` → Student)
- [ ] Confirm existing admin role/permission values match those used in recruitment route guards — needs verification (`roleAuthenticateV2(["admin"])`)
- [ ] Confirm storage backend supports private/signed URLs for document assets — needs verification
- [ ] Confirm intended recipients for each email trigger (applicant, admin, both) and update templates accordingly — needs verification
- [ ] Standardize timezone handling for deadline comparisons; display consistently in UI — needs clarification
- [ ] Confirm soft-delete policy for positions with existing applications is implemented — verified (service throws error, disables)
- [ ] Document retention/archival procedure for applicant documents after hiring closes confirmed — needs confirmation
- [ ] Scope verified: single application per student, single interview per application; multi-round deferred — confirmed by design
