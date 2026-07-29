# Checklist — Recruitment Application Form System

## Phase 1 — Foundation

### [ ] Scaffold frontend project
- [ ] Create `application-form/` directory using `client-side-ts/` Vite + TypeScript template
- [ ] Install required dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `react-query`, tailwind, radix/shadcn components
- [ ] Configure `tsconfig.json`, `vite.config.ts`, and `.eslintrc` matching `client-side-ts/` conventions

### [ ] Auth infrastructure
- [ ] Implement `features/auth/auth.context.ts` with `AuthProvider`, `useAuth` hook, token store (module-level)
- [ ] Create auth interceptor in `api/client.ts` that attaches access token to Authorization header
- [ ] Add refresh token logic using existing PSITS refresh flow
- [ ] Build route guards (`guards.tsx`) for public/student/admin routes

### [ ] Types & API layer
- [ ] Define TypeScript types in `types/recruitment.ts` mirroring backend enums (HiringStatus, ApplicationStatus, InterviewStatus)
- [ ] Implement `api/recruitment.api.ts` with typed functions for all endpoints (POST/GET/PATCH/DELETE)
- [ ] Set up shared error/toast handling in Axios interceptor using existing `AppError` mapping pattern

### [ ] Backend schemas
- [ ] Create `enums/recruitment.enums.ts` with HiringStatus, ApplicationStatus enums
- [ ] Write `models/recruitmentPosition.model.ts` with title, description, responsibilities, requirements, hiringStatus, isActive, applicationDeadline, sortOrder, createdBy indexes
- [ ] Write `models/application.model.ts` with position ref, applicant ref/document metadata, status, interview object, statusHistory, reviewer metadata
- [ ] Add compound unique index on `(position, applicant)`

### [ ] Service & controller skeleton
- [ ] Implement `services/recruitment.service.ts` with stubbed functions: listPositions, getPosition, createPosition, updatePosition, submitApplication, getApplicationsByUser, getApplicants, updateInterview, updateStatus
- [ ] Create `controllers/recruitment.v2.controller.ts` that imports service, parses request, calls service, returns `{message, data}` or AppError
- [ ] Define routes in `routes/recruitment.route.ts` connecting to V2 controller with appropriate middleware
- [ ] Register recruitment route in main Express app under `/api/v2/recruitment`

---

## Phase 2 — Position Management & Public Discovery

### [ ] Admin position management
- [ ] Build admin position list page (`admin/positions.tsx`) with CRUD operations
- [ ] Build position form component (`position-form.tsx`) for create/edit with validation
- [ ] Implement hiring-status toggle endpoint and UI button
- [ ] Add soft-delete behavior (archive rather than hard-delete if applications exist)

### [ ] Public pages
- [ ] Build landing page (`public/index.tsx`) with position list search/filter component
- [   ] Add position details page (`public/details.tsx`) showing description, requirements, deadline, apply button
- [ ] Implement PositionCard and PositionStatusBadge reusable components
- [ ] Add redirect from public apply → login when unauthenticated, preserving target positionId in state/query

### [ ] Routing & layouts
- [ ] Configure routes in `routes/index.tsx`: public routes, student routes, admin routes with guard wrappers
- [ ] Implement `PublicLayout.tsx`, `StudentLayout.tsx`, `AdminLayout.tsx` with appropriate navigation and guards

---

## Phase 3 — Student Application Workflow

### [ ] Application form
- [ ] Build student apply page (`student/apply.tsx`) with position confirmation and file upload fields
- [ ] Implement `DocumentUploadField` component accepting PDF only with client-side type/size validation
- [ ] Build preview step (`student/preview.tsx`) showing selected documents and position details before submission

### [ ] Backend integration
- [ ] Validate position exists, is OPEN, and deadline not expired in submission endpoint
- [ ] Enforce duplicate prevention: check existing `(position, applicant)` unique constraint, reject if exists
- [ ] Process multipart upload via Multer, generate secure storage key, save document metadata to application
- [ ] Return success response with application ID and redirect to My Applications

### [ ] My Applications
- [ ] Build student dashboard (`student/dashboard.tsx`) listing current user's applications with status badges
- [ ] Implement `ApplicationTimeline` component showing status history
- [ ] Build application detail page (`student/details.tsx`) with document download links (signed URLs), interview info if present
- [ ] Verify service enforces ownership: student can only retrieve their own applications

---

## Phase 4 — Admin Applicant Review & Interviews

### [ ] Applicant list
- [ ] Build admin applicant page (`admin/applicants.tsx`) with filter controls (positionId, status, search) and paginated table
- [ ] Implement `ApplicantTable` and `ApplicantFilters` reusable components
- [ ] Connect to GET `/applicants` endpoint with query param support

### [ ] Applicant detail
- [ ] Build admin applicant detail page (`admin/applicant-detail.tsx`) showing student snapshot, resume/letter signed links
- [ ] Add interview scheduling dialog with datetime picker, location field, notes textarea
- [ ] Add status change dropdown (SUBMITTED → INTERVIEW_SCHEDULED → INTERVIEWING → APPROVED/REJECTED) with note field

### [ ] Interview workflow
- [ ] Implement POST/PATCH/DELETE interview endpoints on application document
- [ ] Update service to record interviewer identity and timestamp on all changes
- [ ] Integrate email queue: send interview scheduled/cancelled notifications through existing templates

---

## Phase 5 — Decisions & Release Readiness

### [ ] Status transitions
- [ ] Implement PATCH `/applications/:id/status` endpoint enforcing allowed transition states in service
- [ ] Record reviewer identity and timestamp on every status change, append to statusHistory
- [ ] Build final-decision email templates (approval/rejection) triggered on status change

### [ ] Testing
- [ ] Write unit tests for recruitment service: duplicate prevention, expired position check, status transition validation
- [ ] Write integration tests for route authorization: non-admin blocked from admin endpoints, student blocked from other students' data
- [ ] Test validation paths: missing files, wrong file type, expired position, duplicate submission, malformed IDs
- [ ] Test upload failure path: clean up partial S3 upload if DB persistence fails

### [ ] Quality gate
- [ ] Run ESLint and TypeScript build without errors
- [ ] Run lint and build for `client-side-ts/` comparable checks (Vite build succeeds)
- [ ] Accessibility review: screen reader labels, color contrast, keyboard navigation on forms/tables
- [ ] Responsive design check on mobile/tablet breakpoints
- [ ] End-to-end flow test: public → apply → login → submit → see in My Applications → admin review → status change → email received
- [ ] Document retention/deletion policy confirmed; soft-delete behavior verified

---

## Security Checklist

- [ ] All protected routes use existing authentication middleware
- [ ] Admin role guard uses existing project role values (no new claims introduced)
- [ ] Ownership checks implemented in service for all student GET endpoints
- [ ] All ObjectId parameters validated with `mongoose.Types.ObjectId.isValid`
- [ ] File uploads: MIME type enforced as `application/pdf`, size limits observed, safe storage keys generated, no raw filenames used
- [ ] Document storage configured private; served via signed URLs only
- [ ] No logging of document URLs, PII, tokens, or application letter contents
- [ ] User-controlled text escaped/sanitized per existing conventions
- [ ] Applicant list pagination and search input bounds enforced
- [ ] All admin actions logged with reviewer identity and timestamps
- [ ] Rate-limiting, CORS, error middleware applied to recruitment routes per project standards

---

## Risk Mitigation Verification

- [ ] Confirm auth user ID maps correctly to student model reference in `application.model.ts`
- [ ] Confirm existing admin role/permission values match those used in recruitment route guards
- [ ] Confirm storage backend supports private/signed URLs for document assets
- [ ] Confirm intended recipients for each email trigger (applicant, admin, both) and update templates accordingly
- [ ] Standardize timezone handling for deadline comparisons; display consistently in UI
- [ ] Confirm soft-delete policy for positions with existing applications is implemented
- [ ] Document retention/archival procedure for applicant documents after hiring closes confirmed
- [ ] Scope verified: single application per student, single interview per application; multi-round deferred
