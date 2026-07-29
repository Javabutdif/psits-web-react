# Implementation Plan — Recruitment Application Form System

## 1. Overview
Build a standalone React + TypeScript frontend in `application-form/` that reuses the existing PSITS server-side API, authentication, upload infrastructure, and email conventions. UI follows `client-side-ts/` patterns (Radix/shadcn components, Tailwind, Vite). Two audiences: public (browse positions), students (apply, track applications), administrators (manage positions, review applicants, schedule interviews).

---

## 2. Frontend Structure (`application-form/`)

| Path | Purpose |
|------|---------|
| `src/api/client.ts` | Axios instance with auth interceptor, toast error handling |
| `src/api/recruitment.api.ts` | Typed CRUD methods matching backend endpoints |
| `src/components/common/` | Reusable UI: `PositionCard`, `PositionStatusBadge`, `DocumentUploadField` |
| `src/components/recruitment/` | Feature-specific: `ApplicationReview`, `ApplicationTimeline`, `ApplicantTable`, `InterviewScheduleForm` |
| `src/components/ui/` | Thin wrappers over project-native Radix/shadcn buttons, dialogs, tables |
| `src/features/auth/` | Auth context hook, token store, login redirect persistence |
| `src/features/recruitment/` | Public position search/filters, position detail hooks |
| `src/features/applications/` | Student app submit, preview, dashboard hooks; admin applicant queries |
| `src/features/admin/` | Position management, applicant review, interview scheduling |
| `src/layouts/` | `PublicLayout.tsx`, `StudentLayout.tsx`, `AdminLayout.tsx` with route guards |
| `src/pages/public/` | Landing page (`index.tsx`), position details (`details.tsx`), login-redirect wrapper |
| `src/pages/student/` | Application form (`apply.tsx`), review (`preview.tsx`), my-apps (`dashboard.tsx`), app details (`details.tsx`) |
| `src/pages/admin/` | Dashboard (`dashboard.tsx`), position list (`positions.tsx`), position form (`position-form.tsx`), applicants (`applicants.tsx`), applicant details (`applicant-detail.tsx`) |
| `src/pages/auth/` | Login callback, error pages |
| `src/routes/` | Route config (`index.tsx`), guards (`guards.tsx`) |
| `src/types/` | Position, application, interview enums and API response types aligned to backend |
| `src/lib/utils.ts` | Form helpers, date formatting, validation utilities |
| `src/App.tsx` | Root route provider |
| `src/main.tsx` | Entry point, root render |

---

## 3. Backend Structure (`server-side/`)

| Path | Purpose |
|------|---------|
| `src/controllers/recruitment.v2.controller.ts` | Thin request parsing → service call → JSON response |
| `src/routes/recruitment.route.ts` | Flat route definitions, middleware integration, V2 controller import mount |
| `src/services/recruitment.service.ts` | All business logic: position CRUD, application submission/validation, applicant querying, interview scheduling, status transitions, email triggers |
| `src/models/recruitmentPosition.model.ts` | Mongoose model: title, description, responsibilities, requirements, hiringStatus (DRAFT/OPEN/CLOSED), isActive, applicationDeadline, sortOrder, createdBy |
| `src/models/application.model.ts` | Mongoose model: position ref, applicant ref/snapshot, resume/document metadata, status, optional interview object, statusHistory, reviewer metadata |
| `src/enums/recruitment.enums.ts` | HiringStatus enum, application Status enum (SUBMITTED, INTERVIEW_SCHEDULED, INTERVIEWING, APPROVED, REJECTED), optional WITHDRAWN |
| `src/mail_template/recruitment.template.ts` | Email templates: application received, interview scheduled/cancelled, final decision approved/rejected |

Middleware reuse: existing auth role guard, Multer multipart upload, rate limit, CORS, AppError.

---

## 4. Database Design

### Positions Indexes
- `{ hiringStatus: 1 }`, `{ isActive: 1 }`, `{ applicationDeadline: 1 }`, `{ sortOrder: 1 }`

### Applications Indexes
- Compound unique: `{ position: 1, applicant: 1 }` (one active per student per position)
- `{ status: 1 }`, `{ position: 1, status: 1 }` for admin filtering

### Interview Representation
Embedded inside `application` document (single interview per application). Separate model only if multi-round workflows emerge later.

---

## 5. API Endpoints

| Method | Path | Scope | Description |
|--------|------|-------|-------------|
| GET | `/api/v2/recruitment/positions` | Public | List positions, support `search`, `page`, `limit`; default filter to OPEN |
| GET | `/api/v2/recruitment/positions/:positionId` | Public | Single position details |
| POST | `/api/v2/recruitment/positions` | Admin | Create new position |
| PATCH | `/api/v2/recruitment/positions/:positionId` | Admin | Update position fields |
| DELETE | `/api/v2/recruitment/positions/:positionId` | Admin | Soft-delete/archive position |
| PATCH | `/api/v2/recruitment/positions/:positionId/hiring-status` | Admin | Toggle DRAFT/OPEN/CLOSED |
| POST | `/api/v2/recruitment/positions/:positionId/applications` | Student | Submit application (multipart: resume, applicationLetter) |
| GET | `/api/v2/recruitment/applications/me` | Student | List current user’s applications |
| GET | `/api/v2/recruitment/applications/me/:applicationId` | Student | Get single application by owner |
| GET | `/api/v2/recruitment/applicants` | Admin | Paginated applicant list, filters: `positionId`, `status`, `search` |
| GET | `/api/v2/recruitment/applications/:applicationId` | Admin | Retrieve full applicant details |
| PATCH | `/api/v2/recruitment/applications/:applicationId/status` | Admin | Change application status, record reviewer/timestamp |
| POST | `/api/v2/recruitment/applications/:applicationId/interview` | Admin | Schedule interview (date, time, location, notes) |
| PATCH | `/api/v2/recruitment/applications/:applicationId/interview` | Admin | Reschedule/update interview |
| DELETE | `/api/v2/recruitment/applications/:applicationId/interview` | Admin | Cancel/remove interview |

Response envelope: `{ message, data }`. Errors use `AppError` mapped to HTTP status.

---

## 6. Authentication & Authorization

- **Reuse** existing PSITS token store, auth context, refresh interceptor, and module-level `useAuth` hook. No duplicate login system.
- On public-to-login transition, store target `positionId` in transient storage (e.g., React context/session state) to return post-auth.
- Student routes guard: authenticated + non-admin role (or any authenticated identity that is not restricted). Access only own `applications/me` data.
- Admin routes guard: authenticated user with admin role per existing project authorization middleware.
- Never trust client-provided user IDs or roles; derive from decoded JWT attached by shared auth middleware.
- Enforce ownership checks in service layer for all student-access endpoints.

---

## 7. File Upload Strategy

- Backend: reuse Multer+S3 storage pipeline. Restrict to `application/pdf`, validate filename extension `.pdf`, enforce existing per-file size limits.
- Generate secure storage keys from application/position identifiers; never use raw user filenames.
- Store document metadata (storage key, original filename, MIME type, size, upload timestamp) inside the application document.
- Serve documents via existing signed/private URL mechanism; do not expose public S3 URLs.
- On multipart submission, require both `resume` and `applicationLetter`. Reject missing required files.
- Clean up partial uploads on database persistence failure where supported.
- Apply rate limiting and auth to upload endpoints.

---

## 8. Email Notifications (Existing Service Queue)

Templates / triggers:
1. Application received — sent to applicant (and optionally admin) after successful submission.
2. Interview scheduled/cancelled/rescheduled — sent to applicant with date/time/location/notes.
3. Final decision (APPROVED/REJECTED) — sent to applicant upon status change.

Implementation: service layer calls existing email queue API after successful DB update. Do not fail the primary action if email delivery fails. Record reviewer identity and timestamps for audit.

---

## 9. UI/UX Flows

### Public Visitor
1. Open recruitment landing page → see list of open positions with search/filter.
2. Click position → view details, apply deadline, requirements.
3. Click “Apply” → if unauthenticated, redirect to login with `positionId` query param stored; after login, resume at apply form.

### Student
1. Position eligibility check (OPEN, not past deadline).
2. Upload PDF resume + PDF application letter via component with type/size validation.
3. Preview step: show position info, selected documents, submit button.
4. Submit → success toast, navigation to My Applications.
5. View My Applications table: position title, status, submitted date, document links (private), interview details if present.
6. Application details page: status history timeline, internal notes visible only to admin.

### Administrator
1. Dashboard: summary cards (open positions, total applications, pending interviews, recent status changes).
2. Position management: list, create/edit form, toggle hiring status, set deadline, sort order.
3. Applicant list: filter by position/status/search; column: name, position, status, submitted date, interview scheduled?
4. Applicant detail view: student snapshot, resume/letter download links (signed), status control dropdown, interview schedule dialog.
5. Interview scheduling: form with datetime picker, location field, optional notes; on save, send interview email.
6. Status transitions: dropdown with allowed next states based on current state (enforced in service), record reviewer and note.

---

## 10. Validation Rules

### Position
- Required: title, description, responsibilities, requirements.
- Validated against `HiringStatus` enum.
- If `applicationDeadline` provided, must be future date; prevent opening when deadline expired.
- Trim strings, enforce sensible max lengths.

### Application
- Position must exist, be OPEN, and deadline not passed.
- Authenticated user is the applicant (use existing student identity reference).
- Unique compound index prevents duplicate active applications.
- Both PDF files required; validate type/size on upload via Multer.

### Interview / Status
- Interview date must be future; location required.
- Status transitions enforced by service: SUBMITTED → INTERVIEW_SCHEDULED → INTERVIEWING → APPROVED/REJECT (add intermediate guards as needed).
- Internal notes never exposed through student endpoints.

---

## 11. Security Checklist

- [ ] Auth middleware applied to every protected route.
- [ ] Role-based guards for admin-only endpoints using existing project roles.
- [ ] Ownership checks returned on all student fetches (`me` prefix enforcement).
- [ ] All request IDs validated with `mongoose.Types.ObjectId.isValid`.
- [ ] Uploaded files: type restricted to PDF, size limited, safe key generation, private storage, signed URLs only.
- [ ] No logging of document URLs, PII, tokens, or application-letter content.
- [ ] Input sanitization for displayed text following existing frontend/backend conventions.
- [ ] Applicant list paginated; search inputs bounded.
- [ ] All admin actions recorded with reviewer ID and timestamp.
- [ ] Rate-limit, CORS, error middleware applied per project standards.

---

## 12. Development Phases

### Phase 1 — Foundation (Week 1-2)
- [ ] Scaffold `application-form/` Vite+TS project using `client-side-ts/` template.
- [ ] Install shared UI dependencies (Radix/shadcn, Tailwind, axios, react-router-dom, react-query).
- [ ] Implement `src/api/client.ts` with auth interceptor and toast error handler.
- [ ] Create shared auth context (`features/auth`) mirroring `client-side-ts/` pattern.
- [ ] Define backend enums and TypeScript types (`src/types/recruitment.ts`).
- [ ] Build `server-side` enums (`recruitment.enums.ts`), models (`recruitmentPosition.model.ts`, `application.model.ts`), service skeleton (`recruitment.service.ts`).
- [ ] Create V2 controller (`recruitment.v2.controller.ts`) and route (`recruitment.route.ts`).
- [ ] Wire route registration in main Express app.

### Phase 2 — Position Management & Public Discovery (Week 3-4)
- [ ] Admin: create/edit/delete/soft-delete position forms; CRUD read-list page.
- [ ] Admin: position hiring-status toggle endpoint and UI.
- [ ] Public: landing page listing open positions with search/pagination.
- [ ] Public: position details page showing description, requirements, deadline, status badge.
- [ ] Implement public-to-login redirect continuity (store `positionId`).
- [ ] Add route guards: `PublicLayout`, `StudentLayout`, `AdminLayout`.

### Phase 3 — Student Application Workflow (Week 5-6)
- [ ] Student application form page: select position, file upload fields (PDF-only), client-side validation.
- [ ] Backend POST `/applications` with multipart parsing, storage, document metadata persistence, duplicate check.
- [ ] Preview/confirmation step before final submission.
- [ ] Success notification and navigation to My Applications.
- [ ] Student GET `/applications/me` list page with status badges, document links (signed), interview info.
- [ ] Student application detail page with status history timeline.

### Phase 4 — Admin Applicant Review & Interviews (Week 7-8)
- [ ] Admin GET `/applicants` filtered paginated list; integrate filters into UI.
- [ ] Admin applicant detail page: student info, resume/letter download links, interview controls, status change panel.
- [ ] Interview scheduling dialog: datetime picker, location, notes; POST interview endpoint.
- [ ] Reschedule and cancel interview endpoints and UI interactions.
- [ ] Integrate email queue for interview scheduled/cancelled notifications.

### Phase 5 — Decisions & Release (Week 9-10)
- [ ] Status transition endpoint PATCH `/applications/:id/status`; enforce allowed transitions in service.
- [ ] Final approval/rejection email template triggering on status change to APPROVED/REJECTED.
- [ ] Add unit/integration tests for service logic, route authorization, duplicate prevention, expired position handling.
- [ ] Test upload failure paths, authorization failures, validation errors.
- [ ] Accessibility review, responsive checks, end-to-end scenario testing.
- [ ] Documentation update, deployment configuration.

---

## 13. Risk Mitigation

- [ ] Confirm identity mapping: whether auth user ID ↔ student model reference is the canonical identifier. Model alignment must match existing student/profile domain.
- [ ] Confirm exact admin role/permission values used by project; reuse without introducing new auth claims.
- [ ] Verify existing storage can provide private/signed URLs for resumes/letters; do not serve public S3 links.
- [ ] Clarify intended recipients for each email trigger (applicant only, CC admin, etc.) before enabling templates.
- [ ] Standardize timezone for deadline comparisons (UTC or site timezone); display consistently in UI.
- [ ] Define deletion policy: soft delete/archive positions with existing applications to retain historical integrity.
- [ ] Document retention policies for applicant documents; plan admin workflow for archival/export after hiring closes.
- [ ] Keep scope tight: one application per student, one interview per application; defer multi-round scoring/rubrics until core stable.
