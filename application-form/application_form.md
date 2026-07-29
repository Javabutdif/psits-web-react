# Recruitment / Application Form System — Implementation Proposal

## Executive Summary

Build the Recruitment / Application Form System as a standalone React + TypeScript application in `application-form/`, using the existing `server-side/` API, authentication, upload, email, and Mongoose conventions. Its UI should follow `client-side-ts/` so it remains visually and architecturally consistent with the PSITS ecosystem.

The system has two audiences:

- Public visitors can discover positions and view their details.
- Authenticated students can submit and track one application per position.
- Administrators can manage positions, review applicants, schedule interviews, and issue decisions.

The implementation should be additive. Use the active V2 controller convention, a shared recruitment service, existing authentication middleware, existing upload infrastructure, and the existing email service/queue.

---

## 1. Existing Architecture Analysis

### `client-side-ts` — frontend reference

- React 19, TypeScript, Vite, Tailwind CSS, and reusable Radix/shadcn-style components establish the preferred UI stack.
- Routing is centralized and page-oriented, with layouts and route guards separating public, student, and administrative experiences.
- Authentication is context-based: `AuthContext` is consumed through `useAuth`, while the access token is held in a module-level `tokenStore` rather than browser storage.
- API concerns are separated from page components; retain that separation in the standalone application.
- Reuse UI conventions such as the `cn` utility, shared feedback/toast handling, form layout, responsive spacing, and existing PSITS branding patterns.

### `server-side` — shared API

- Express and TypeScript use routes, thin controllers, services, Mongoose models, middleware, and utilities.
- Active/new controller logic uses `*.v2.controller.ts`; routes remain flat and select V2 behavior through imports and mounting.
- Domain logic belongs in `src/services/`; services do not receive V2 variants.
- `AppError` supplies consistent operational errors and should remain the standard validation/not-found/authorization error mechanism.
- Existing authentication, role authorization, Multer/S3 upload support, email infrastructure, templates, and queue behavior should be reused rather than recreated.

### Reuse opportunities

- Authentication context, token refresh/interceptors, and route guard approach from `client-side-ts`.
- Existing API client configuration and error/toast conventions.
- Backend authentication and admin authorization middleware.
- Existing upload middleware and cloud-storage configuration.
- Existing email service and mail-template organization for interview and status notifications.

---

## 2. Recommended Project Structure

### `application-form/`

```text
application-form/
  src/
    api/
      client.ts
      recruitment.api.ts
    components/
      common/
      recruitment/
      ui/
    features/
      auth/
      recruitment/
      applications/
      admin/
    layouts/
      PublicLayout.tsx
      StudentLayout.tsx
      AdminLayout.tsx
    pages/
      public/
      student/
      admin/
      auth/
    routes/
      index.tsx
      guards.tsx
    types/
      recruitment.ts
      api.ts
    lib/
      utils.ts
    App.tsx
    main.tsx
```

Keep feature-specific components, hooks, types, and API adapters together. Put only genuinely reusable UI in `components/common` or `components/ui`.

### `server-side/`

```text
server-side/src/
  controllers/
    recruitment.v2.controller.ts
  routes/
    recruitment.route.ts
  services/
    recruitment.service.ts
  models/
    recruitmentPosition.model.ts
    application.model.ts
  enums/
    recruitment.enums.ts
  mail_template/
    recruitment.template.ts
```

Use existing shared middleware, utilities, user/student models, email service, and upload helpers. Add a dedicated repository only if the current backend already uses repositories for comparable domains; otherwise keep Mongoose query logic in the recruitment service.

---

## 3. Frontend Architecture

### Public pages

- Recruitment landing page: open positions, search/filter, and clear calls to action.
- Position details page: description, responsibilities, requirements, deadline, and hiring status.
- Login redirect/return flow: preserve the selected position and continue to the application after authentication.

### Student pages

- Application form page for a selected open position.
- Review/preview step before submission.
- My Applications dashboard with status, submitted date, documents, position, and interview details.
- Application details page with decision/status history where available.

### Admin pages

- Recruitment dashboard summarizing open positions, application counts, and pending actions.
- Position management list and create/edit form.
- Applicant list grouped or filterable by position and status.
- Applicant details page with student information, secure document links, status controls, and interview controls.
- Interview scheduling dialog/form.

### Routing and state

- Reuse the existing authentication-context pattern and token lifecycle; do not introduce a second login system.
- Use public routes for browsing, authenticated student routes for applications, and admin-only routes for management.
- Keep server state in feature hooks/API calls. Use local component state for forms, filters, and dialogs; do not introduce broad global state unless an existing application pattern requires it.
- Use URL query parameters for admin list filters where practical so views are shareable and reload-safe.

### Core reusable components

- `PositionCard`, `PositionStatusBadge`, `PositionDetails`.
- `DocumentUploadField`, `ApplicationReview`, `ApplicationStatusBadge`.
- `ApplicationTimeline` or status history display.
- `ApplicantTable`, `ApplicantFilters`, `ApplicantDetailPanel`.
- `InterviewScheduleForm` and `InterviewDetails`.

---

## 4. Backend Architecture

### Routes

Mount recruitment routes under the existing V2 API mount convention. Separate public read endpoints from authenticated student endpoints and admin-only endpoints.

### Controller responsibilities

- Parse request input and files.
- Obtain authenticated user identity from existing middleware.
- Delegate all domain work to `recruitment.service.ts`.
- Return the established JSON envelope and map `AppError` to its status code.

### Service responsibilities

- Query and manage positions.
- Validate eligibility and prevent duplicate applications.
- Persist application data and document metadata/URLs.
- Return the current user’s applications without exposing other applicants.
- Provide grouped/paginated applicant queries for administrators.
- Schedule, reschedule, and cancel interviews.
- Update application status and record review metadata.
- Trigger recruitment email notifications through the existing email service.

### Middleware and validation

- Apply existing authentication middleware to all student/admin routes.
- Apply the project’s admin/role middleware to management endpoints.
- Apply targeted Multer upload middleware only to application submission.
- Validate route IDs, pagination, dates, enum values, required fields, and file presence before service work.

---

## 5. Database Design Recommendations

### Recruitment position

Fields should include:

- `title`, `description`, `responsibilities`, `requirements`.
- `hiringStatus` (`DRAFT`, `OPEN`, `CLOSED`), `isActive`, optional `applicationDeadline`.
- `sortOrder`, `createdBy`, timestamps.

Indexes should support public filtering and admin ordering, such as `hiringStatus`, `isActive`, `applicationDeadline`, and `sortOrder`.

### Application

Fields should include:

- `position` reference and `applicant` reference/identifier aligned with existing student identity.
- Applicant snapshot fields only when necessary for historical display.
- `resume` and `applicationLetter` document metadata: storage key/URL, original filename, MIME type, size, and upload timestamp.
- `status`, optional `statusHistory`, reviewer metadata, and internal review notes.
- Optional embedded `interview` object containing scheduled date/time, location, notes, status, and scheduling metadata.
- Timestamps.

Create a unique compound index on `(position, applicant)` to enforce one active application per position at the database layer. Decide explicitly whether a rejected/withdrawn application can be resubmitted; default to no resubmission unless the business rules require it.

### Interview representation

Start with an embedded interview object on `Application` because each application currently has one interview workflow. Create a separate `InterviewSchedule` model only if requirements expand to multiple rounds, panels, availability coordination, or audit-heavy scheduling.

---

## 6. API Design

Follow existing response conventions, e.g. `{ message, data }`, with pagination where applicable.

### Public

```text
GET    /api/v2/recruitment/positions
GET    /api/v2/recruitment/positions/:positionId
```

The list endpoint accepts `search`, `page`, and `limit`; public results should expose only active/open positions unless a safe status filter is intended.

### Student/authenticated user

```text
POST   /api/v2/recruitment/positions/:positionId/applications
GET    /api/v2/recruitment/applications/me
GET    /api/v2/recruitment/applications/me/:applicationId
```

The submit endpoint accepts multipart form-data with `resume` and `applicationLetter` fields.

### Administrator

```text
POST   /api/v2/recruitment/positions
PATCH  /api/v2/recruitment/positions/:positionId
DELETE /api/v2/recruitment/positions/:positionId
PATCH  /api/v2/recruitment/positions/:positionId/hiring-status
GET    /api/v2/recruitment/applicants
GET    /api/v2/recruitment/applications/:applicationId
PATCH  /api/v2/recruitment/applications/:applicationId/status
POST   /api/v2/recruitment/applications/:applicationId/interview
PATCH  /api/v2/recruitment/applications/:applicationId/interview
DELETE /api/v2/recruitment/applications/:applicationId/interview
```

The applicant-list endpoint supports `positionId`, `status`, `search`, `page`, and `limit`. Populate applicant and position data in a bounded query to avoid N+1 access patterns.

---

## 7. Authentication Integration

- The recruitment app consumes the existing PSITS login and refresh-token flow.
- Preserve the intended destination, including position ID, when redirecting an unauthenticated user to login.
- After login succeeds, return to the application form rather than a generic dashboard.
- Fetch current-user data through the existing authenticated API pattern and use it to identify the student and role.
- Do not place access tokens in `localStorage` or create a recruitment-specific account table.

---

## 8. Authorization Strategy

### Student/user

- May browse positions publicly.
- May create an application only for their own account and an open, non-expired position.
- May read only their own applications and their own uploaded documents.
- May not modify application status, interview information, or position data.

### Administrator

- May create, update, archive/delete, and open/close positions.
- May view applicants and documents for recruitment purposes.
- May schedule/cancel interviews and update application status.
- All admin actions should be protected by existing role middleware and retain reviewer/scheduler metadata for accountability.

Do not trust client-provided student IDs or roles; derive them from the authenticated request.

---

## 9. File Upload Strategy

- Reuse the backend’s existing Multer/storage approach and email no document attachments unless required.
- Accept PDF documents only, checking both the MIME type and a safe filename extension.
- Require exactly one resume and one application letter on initial submission.
- Set a conservative per-file size limit consistent with current server upload limits; document the final limit in the UI.
- Generate storage keys server-side using application/position/user-safe identifiers; never use raw user filenames as paths.
- Store document metadata with the application record.
- Keep buckets/objects private where supported and return authorized/signed URLs instead of public object URLs.
- Reject unexpected multipart fields, clean up partial uploads after persistence failure where supported, and protect upload endpoints with authentication and rate limiting.

---

## 10. Email Notification Strategy

Use the existing email service and queue/template conventions. Recruitment mail templates should cover:

- Application received confirmation (recommended).
- Interview scheduled or rescheduled, including date, time, location, and notes.
- Interview cancelled (recommended).
- Final approval or rejection decision (recommended).

Status changes that do not require action, such as `INTERVIEWING`, can remain in-app only unless stakeholders request email notifications. Queue emails after a successful database update, and do not fail an otherwise valid admin action solely because asynchronous email delivery fails.

---

## 11. UI/UX Flow

### Public visitor

1. Open the recruitment landing page.
2. Browse/search positions and open a details page.
3. Select **Apply**.
4. If unauthenticated, see a clear login prompt and authenticate.
5. Return to the selected position’s application flow.

### Student

1. Review the selected position and eligibility/deadline.
2. Upload a PDF resume and PDF application letter.
3. Review position, profile, and selected documents.
4. Submit and receive a success notification.
5. View the application in **My Applications**.
6. Receive interview and final-decision updates through the dashboard and applicable email notifications.

### Administrator

1. Open the recruitment administration dashboard.
2. Create a position in draft or open it immediately.
3. Manage details, deadline, visibility, and hiring state.
4. Filter applicants by position and status.
5. Review applicant information and documents.
6. Schedule/reschedule/cancel an interview as needed.
7. Move the application through status changes and record the final decision.

### Status model

Recommended statuses:

```text
SUBMITTED -> INTERVIEW_SCHEDULED -> INTERVIEWING -> APPROVED | REJECTED
```

Optionally add `WITHDRAWN` later if students need to cancel applications. Keep status transitions in the service layer so invalid transitions are rejected consistently.

---

## 12. Validation Strategy

### Position validation

- Require title, description, responsibilities, and requirements.
- Validate status against a single recruitment enum.
- Require a future deadline when supplied; prevent opening a position with an expired deadline.
- Enforce sensible text lengths and server-side trimming.

### Application validation

- Require a valid open position and a non-expired deadline.
- Use authenticated identity to determine the applicant.
- Reject duplicate applications.
- Require both PDF documents and validate type/size through upload middleware.

### Interview/status validation

- Require a valid future interview date/time, location, and application ID.
- Validate status against the recruitment enum.
- Enforce allowed status transitions in the service layer.
- Limit internal notes to administrators; never expose them through student endpoints.

Return field-level validation messages in the response shape already used by the application where available.

---

## 13. Security Considerations

- Use existing authentication and server-side role authorization on every protected route.
- Enforce ownership checks for all student application/detail/document access.
- Validate ObjectIds and query parameters to avoid malformed database queries.
- Treat uploaded files as untrusted: restrict type, size, and fields; use private storage and authorized access URLs.
- Avoid logging document URLs, personally identifiable data, tokens, or application-letter contents.
- Escape/sanitize displayed user-controlled text according to existing frontend/backend conventions.
- Paginate applicant lists and constrain search/filter inputs to protect performance.
- Record reviewer/scheduler identity and timestamps for administrative changes.
- Apply the project’s existing rate-limit/cors/error middleware patterns to recruitment routes.

---

## 14. Suggested Development Phases

### Phase 1 — Foundation

- Scaffold the standalone `application-form` Vite/TypeScript app using the `client-side-ts` conventions.
- Add shared styling, route structure, API client, authentication integration, layouts, and route guards.
- Add backend enums, models, service skeleton, V2 controller, and routes.

### Phase 2 — Position management and public discovery

- Implement admin position CRUD and open/close/deadline controls.
- Implement public position listing, filters, and details.
- Add public-to-login-to-application redirect continuity.

### Phase 3 — Student application workflow

- Implement document upload validation/storage integration.
- Add application submission, preview/confirmation, and duplicate prevention.
- Implement My Applications and student-safe detail views.

### Phase 4 — Applicant management and interview scheduling

- Implement admin applicant list/detail views, filters, and document access.
- Implement scheduling/rescheduling/cancellation and interview UI.
- Send interview notifications through existing email infrastructure.

### Phase 5 — Decisions, quality, and release readiness

- Implement status transitions and final-decision notifications.
- Add focused unit/integration tests for service and route authorization behavior.
- Test success, validation failure, ownership failure, expired position, duplicate submission, and upload failure paths.
- Complete accessibility, responsive, and manual end-to-end checks.

---

## 15. Risks and Recommendations

- **Identity mapping:** confirm whether the authenticated user ID, student ID number, and student model references are the canonical identifiers before finalizing the application schema.
- **Role mapping:** confirm the exact existing admin role/permission values and reuse them instead of adding recruitment-specific authentication.
- **Document privacy:** verify that existing storage can provide private or signed access. Public document URLs are inappropriate for resumes and letters.
- **Email semantics:** confirm the intended recipient behavior for submission, interview changes, and final decisions before enabling every notification.
- **Deadline timezone:** standardize deadline comparisons in the application’s intended timezone and communicate the timezone in the UI.
- **Deletion policy:** prefer soft deletion/archive for positions with applications so historical applicant data remains consistent; do not hard-delete a position with submitted applications unless retention policy permits it.
- **Data retention:** confirm retention and access policies for applicant documents, especially after hiring closes.
- **Scope control:** begin with one application per student per position and one interview record per application. Add multi-round interviews, scoring rubrics, exports, or committee workflows only after the core flow is stable.

## Final Recommendation

Implement the system incrementally around the existing PSITS architecture: a standalone frontend that mirrors `client-side-ts` conventions, plus a small recruitment domain in the shared backend using V2 controllers and a shared service. This provides a consistent user experience, minimizes duplicated infrastructure, and preserves secure ownership, administrative control, private document handling, and reliable notifications.
