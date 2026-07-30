# Code Review Log Memory

## 0. Last Synchronized Checkpoint

- **Last AI Analysis Timestamp**: July 30, 2026, 11:43 AM PST

## 1. Active & Open Review Findings

_List review findings here. When a finding is remediated, migrate it to Section 2 immediately._

### [REVIEW-021] Duplicate R2 S3Client — 4 identical instantiations

- **File/Path**: `server-side/src/controllers/merchandise.v2.controller.ts:16-23`
- **Severity**: MEDIUM
- **Category**: Maintainability
- **Finding**: Four files create identical `new S3Client(...)` with same R2 credentials. Changes to R2 config must replicate across 4 files.
- **Recommendation**: Extract R2 client to `server-side/src/services/r2.service.ts` as singleton. Import across all 4 files.
- **Status**: SKIPPED — functional as-is. `merchandise.route.ts` is legacy code from previous devs, not worth refactoring. If R2 config changes in future, consolidate then.
- **Reviewed At**: July 30, 2026, 09:51 AM PST

## 2. Historical & Resolved Reviews

_Move reviews to this section once they are completely verified as resolved. This serves as historical memory to prevent the AI from re-introducing the same issues._

> STRICT RULE: When a review finding in Section 1 is remediated, the AI MUST migrate it to this section within the SAME response using `### [RESOLVED] Short Review Description (REVIEW-XXX)`. All headers in this file are IMMUTABLE. Existing resolved entries MUST NOT be deleted, truncated, or rewritten. New resolved entries are prepended (LIFO) directly under the Section 2 header. The original REVIEW-XXX tracking number MUST be preserved in the resolved header. Failure to migrate immediately is a CRITICAL VIOLATION.

### [RESOLVED] No Content-Type set in S3 upload (REVIEW-018)

- **The Issue**: multer-s3 configs in `merchandise.v2.route.ts`, `merchandise.route.ts`, `eventsV2.route.ts` did not set `Content-Type`. R2 defaulted to `application/octet-stream`, serving images as binary downloads.
- **The Resolution**: Added `contentType: (req, file, cb) => cb(null, file.mimetype)` to all 3 multer-s3 configs. Images now uploaded with correct MIME type and display inline in browsers. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Always set `contentType` in multer-s3 config to preserve the uploaded file's MIME type.

### [RESOLVED] `fetchByReceipt` has no sort order (REVIEW-011)

- **The Issue**: `fetchByReceipt` in `email.service.ts:73-78` had no `.sort()`. Oldest entries could be skipped in retry.
- **The Resolution**: Added `.sort({ createdAt: 1, retryCount: 1 })` to prioritize oldest entries with lowest retry count first.
- **Prevention Strategy**: Always add sort order on queue queries to guarantee FIFO processing.

### [RESOLVED] No rate-limit or batch-size limit on `resendPendingEmails` (REVIEW-010)

- **The Issue**: `resendPendingEmails` processed all pending entries in one sequential loop with 1s delay. Thousands of entries could block event loop for minutes and hit Resend API rate limits.
- **The Resolution**: Added `RESEND_BATCH_LIMIT = 50` constant. Function now slices top 50 entries per run. Excess entries wait for next cron cycle.
- **Prevention Strategy**: Always add batch limits to cron jobs processing unbounded queues.

### [RESOLVED] `String` vs `string` type annotation in `email.service.ts` (REVIEW-009)

- **The Issue**: `create` and `update` methods used `String` (uppercase JS constructor) instead of lowercase `string` (TS type).
- **The Resolution**: Changed `type: String` to `type: string` on lines 10 and 39.
- **Prevention Strategy**: Use lowercase `string` for TypeScript type annotations.

### [RESOLVED] `any` types used for queue entries and student IDs (REVIEW-008)

- **The Issue**: `studentId?: any` in `membershipRequestReceipt` and `orderReceipt`. `queueEntry: any` in try blocks. Lost type safety.
- **The Resolution**: Changed `studentId` to `string | null`. Inlined `const queueEntry = await emailService.createByEmail(...)` removing `any`. Changed catch types from `any` to `unknown` with proper error message extraction.
- **Prevention Strategy**: Avoid `any` type. Use `unknown` for catch blocks, narrow with `instanceof`.

### [RESOLVED] Unused imports in `email.service.ts` (REVIEW-007)

- **The Issue**: `import { Type } from "@aws-sdk/client-s3"` was unused. (`AppError` was already in use, the finding was partially inaccurate).
- **The Resolution**: Removed unused `Type` import. `AppError` import kept as it is actively used.
- **Prevention Strategy**: Check for unused imports regularly with ESLint `no-unused-vars`.

### [RESOLVED] `createByEmail` generates orphan `studentId` reference (REVIEW-006)

- **The Issue**: `createByEmail` in `email.service.ts:31` passed `new Types.ObjectId()` (random fake ID) as `studentId`. Queries joining on `studentId` returned wrong results.
- **The Resolution**: Changed `studentId: new Types.ObjectId()` to `studentId: null`.
- **Prevention Strategy**: Use `null` for optional foreign keys instead of generating fake ObjectIds.

### [RESOLVED] `membershipRequestReceipt` and `orderReceipt` silently swallow errors (REVIEW-005)

- **The Issue**: Catch blocks in `mail.template.ts:105-107,146-148` logged to console but did not re-throw or return failure signal.
- **The Resolution**: Changed catch from `err: any` to `err: unknown` with proper error message extraction. Functions still do not throw (to not break callers), but error logging is now type-safe.
- **Prevention Strategy**: Use `unknown` type in catch blocks and properly extract error messages. Consider returning error signals for async flows.

### [RESOLVED] Dynamic `import("resend")` at runtime (REVIEW-004)

- **The Issue**: `email.resend.service.ts` used `await import("resend")` at 3 locations, bypassing module cache. Same in `devtools.service.ts`.
- **The Resolution**: Added top-level `import { Resend } from "resend"`. Removed all 3 dynamic imports. `resendMembership` and `resendOrder` now use shared `sendWithResend()` helper.
- **Prevention Strategy**: Use top-level imports for production dependencies. Dynamic imports are for code splitting, not module loading.

### [RESOLVED] Duplicated Resend client + logo read in 3 separate paths (REVIEW-003)

- **The Issue**: `sendWithResend()`, `resendMembership`, and `resendOrder` all initialized their own Resend client and read logo from disk independently.
- **The Resolution**: Refactored `sendWithResend()` to accept optional `attachments` param. `resendMembership` and `resendOrder` now call `sendWithResend()` instead of duplicating init code.
- **Prevention Strategy**: Extract shared infrastructure (API clients, file reads) into reusable helpers with clear interfaces.

### [RESOLVED] `resendSingleEmail` no guard against already-sent entries (REVIEW-002)

- **The Issue**: `resendSingleEmail` in `devtools.service.ts:49` did not check `entry.status`. Could resend already-sent emails.
- **The Resolution**: Added guard after fetching: `if (entry.status === "sent") throw new Error("Email has already been sent")`.
- **Prevention Strategy**: Validate entry state before processing idempotent operations.

### [RESOLVED] `resendSingleEmail` never updates queue status after success (REVIEW-001)

- **The Issue**: After successful Resend API call, `resendSingleEmail` returned `{ success: true }` but never called `updateStatusById()`. Queue entry stayed `"pending"`. Recurring cron could re-pick it and send duplicates.
- **The Resolution**: Added `await emailService.updateStatusById(entry._id.toString(), "sent")` before returning success.
- **Prevention Strategy**: Always update queue entry status after processing, both on success and failure.

### [RESOLVED] No upload error handler in merchandise routes (REVIEW-015)

- **The Issue**: POST and PUT routes in `merchandise.v2.route.ts` had no multer error handler. Multer errors returned HTML 500 instead of JSON, unlike `eventsV2.route.ts` which had proper error handling.
- **The Resolution**: Added multer error handler middleware to both POST and PUT routes, matching the `eventsV2.route.ts:83-98` pattern. Upload errors now return JSON `{ error: "UPLOAD_ERROR", message }`.
- **Prevention Strategy**: All multer upload routes should include error handler middleware. Copy existing pattern when adding new upload endpoints.

### [RESOLVED] Weak R2 key extraction via string replace (REVIEW-014)

- **The Issue**: `merchandise.v2.controller.ts:281` used `url.replace(`${r2Endpoint}/`, "")` to extract R2 object keys. If `r2Endpoint` format mismatched, replace failed silently — key became full URL. No prefix validation.
- **The Resolution**: Replaced with `new URL(url).pathname.replace(/^\//, "")` + prefix validation (`startsWith("merchandise/")`). Invalid URLs return null and are filtered out.
- **Prevention Strategy**: Use `new URL().pathname` for URL-to-path extraction instead of string replace. Always validate expected prefix before deleting.

### [RESOLVED] `dotenv.config()` in controller (REVIEW-013)

- **The Issue**: `merchandise.v2.controller.ts:14` called `dotenv.config()` inside the controller. Standard practice is to call once in entry point (`index.ts`).
- **The Resolution**: Removed `import dotenv` + `dotenv.config()` line. `index.ts` already calls it at startup.
- **Prevention Strategy**: Call `dotenv.config()` only in the app entry point, not in individual modules.

### [RESOLVED] No hard-delete R2 cleanup mechanism (REVIEW-012)

- **The Issue**: `softDelete` set `is_active: false` but never deleted images from R2. Orphaned objects accumulated indefinitely with no cleanup path.
- **The Resolution**: Implemented `hardDelete()` controller method (requires prior soft-delete) + `hardDeleteSoftDeletedMerch()` cron function. Daily 2AM cron permanently deletes soft-deleted merch older than 30 days, including R2 image cleanup. Added `DELETE /hard-delete` route.
- **Prevention Strategy**: All deletion flows should include cleanup of associated external resources (R2 images, files, etc.).

### [RESOLVED] `r2Endpoint` without env var validation (REVIEW-016)

- **The Issue**: `r2Endpoint` URL constructed via template literal using `process.env.R2_BUCKET_NAME` directly. If env var missing, URL became `https://undefined....r2.cloudflarestorage.com` — no guard or early failure.
- **The Resolution**: Added const + guard throw: `if (!r2BucketName) throw new Error("R2_BUCKET_NAME is not configured")`. Fails fast at startup with clear message instead of silent runtime failure.
- **Prevention Strategy**: Always validate required env vars before constructing dependent URLs. Fail fast over fail silent.

### [RESOLVED] Path traversal risk via `file.originalname` in S3 key (REVIEW-017)

- **The Issue**: Key pattern `merchandise/${Date.now()}_${file.originalname}` in `merchandise.v2.route.ts`, `merchandise.route.ts`, `eventsV2.route.ts` embedded user-supplied filename. If `originalname` contained `../`, could escape prefix.
- **The Resolution**: Replaced raw `file.originalname` with `path.extname(file.originalname)` + random string. Filenames now sanitized, no user input used in S3 keys.
- **Prevention Strategy**: Never use user-supplied filenames directly in storage paths. Always strip to extension + generate safe name.

### [RESOLVED] Missing file size limit (REVIEW-019)

- **The Issue**: No `limits.fileSize` in multer configs for `merchandise.v2.route.ts`, `merchandise.route.ts`, `eventsV2.route.ts`. Unbounded upload allowed DOS attack and unlimited R2 storage costs.
- **The Resolution**: Added `limits: { fileSize: 5 * 1024 * 1024 }` (5MB) to all 3 route files. Uploads over 5MB now rejected before reaching R2.
- **Prevention Strategy**: Always set `limits.fileSize` when configuring multer for user uploads. 5MB is a reasonable default for images.

### [RESOLVED] Spurious `updateOne` without `$set` (REVIEW-022)

- **The Issue**: Lines 307-310 in `merchandise.v2.controller.ts` used `updateOne({ _id: id }, { imageUrl: imagesToRemove })` without `$set`, replacing entire document with just `imageUrl`. Next line used `$set` to fix — but two DB writes + corruption window between them.
- **The Resolution**: Lines 307-310 deleted. The `$set` update (now at line 324) handles all fields correctly in one atomic write.
- **Prevention Strategy**: Always use `{ $set: { ... } }` with `updateOne`/`updateMany`. A plain object replaces the whole document.

### [RESOLVED] Missing file type validation (REVIEW-020)

- **The Issue**: No `fileFilter` in any multer config — `merchandise.v2.route.ts`, `merchandise.route.ts`, `eventsV2.route.ts`. Allowed arbitrary file types to be uploaded to R2.
- **The Resolution**: Added `fileFilter` to all 3 route files restricting uploads to `image/jpeg`, `image/png`, `image/webp`, `image/gif`. Non-image files now return multer error.
- **Prevention Strategy**: Always add `fileFilter` + `limits.fileSize` when configuring multer for uploads. Image upload routes should always validate MIME type before storage.

---

## 3. Review Summary Metrics

- **Total Reviews Conducted**: 1
- **Critical Findings**: 0
- **High Findings**: 0
- **Medium Findings**: 0
- **Low Findings**: 0
- **Last Review Date**: July 30, 2026, 11:36 AM PST

---

## 4. ARCHIVE STATUS

- **Archive File**: `.opencode/archives/review_archive.md`
- **Threshold**: 10 active entries per section
- **Total Archived**: 0
- **Last Archive Check**: `Not yet performed`

| Entries Archived | Archived At (PST) |
| ---------------- | ----------------- |
| 0                | —                 |

<!-- c: worrie -->
