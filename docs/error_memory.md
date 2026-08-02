# Workspace Error Log & Debugging Memory

## 0. Last Synchronized Checkpoint

- **Last Error Check**: July 30, 2026, 11:59 AM PST

## 1. Active & Unresolved Errors

_List errors currently blocking development. Update this section immediately when a new error occurs during execution or user prompting._

---

## 2. Historical & Resolved Errors

_Move errors to this section once they are completely verified as fixed. This serves as historical memory to prevent the AI from re-introducing the same bugs._

### [RESOLVED] ObjectId → string mismatch in order.v2.controller.ts (ERR-018)

- **The Issue**: `order.v2.controller.ts:298` passed `userEmail._id` (ObjectId) to `orderReceipt()` which expects `string | null`. TypeScript compilation failed on startup, blocking the entire server including login.
- **The Resolution**: Changed `userEmail._id` to `userEmail._id.toString()`. Match type expected by `orderReceipt` signature. All `tsc --noEmit` errors resolved.
- **Prevention Strategy**: When passing Mongoose document `_id` to functions expecting `string`, always use `.toString()`.

### [RESOLVED] Bulk fix: REVIEW-001 through REVIEW-011 (email service + devtools) (ERR-017)

- **The Issue**: 11 code review findings across `email.service.ts`, `mail.template.ts`, `email.resend.service.ts`, and `devtools.service.ts` covering: unused imports, orphan ObjectIds, `any` types, dynamic imports, duplicated Resend clients, missing batch limits, missing sort orders, missing queue status updates, missing sent guards, `String` vs `string`, and swallowed errors.
- **The Resolution**: All 11 findings fixed. Key changes: removed dynamic `import("resend")`, consolidated all Resend calls through `sendWithResend()`, added batch limit of 50, added `.sort()` to queue fetch, added status guard + updateStatusById to `resendSingleEmail`, replaced `any` types, fixed `String`→`string`, set `studentId: null` instead of fake ObjectId. Verified: `npx tsc --noEmit` passes (no new errors).
- **Prevention Strategy**: Use top-level imports, share API clients via helpers, always set sort/batch limits on queue processors, validate entry state before processing, update status after processing.

### [RESOLVED] Missing multer error handler in merchandise routes (ERR-016)

- **The Issue**: `merchandise.v2.route.ts` POST and PUT routes lacked multer error handler. Upload failures returned HTML 500 instead of JSON, inconsistent with `eventsV2.route.ts`.
- **The Resolution**: Added error handler middleware to both routes returning JSON `{ error: "UPLOAD_ERROR", message }`. Matches existing eventsV2 pattern. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Add multer error handler to every upload route. Returns consistent JSON errors instead of HTML.

### [RESOLVED] Weak R2 object key extraction via string replace (ERR-015)

- **The Issue**: `merchandise.v2.controller.ts:281` extracted R2 object keys via `url.replace(`${r2Endpoint}/`, "")`. Format mismatch caused silent failure. No prefix validation.
- **The Resolution**: Replaced with `new URL(url).pathname` parsing + `startsWith("merchandise/")` validation. Invalid URLs filtered via `.filter()`. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Use URL parsing API over string replace for path extraction.

### [RESOLVED] `dotenv.config()` in merchandise controller (ERR-014)

- **The Issue**: `import dotenv` + `dotenv.config()` called in `merchandise.v2.controller.ts`. Entry point `index.ts` already calls it.
- **The Resolution**: Removed both lines. `index.ts` handles env loading. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Load dotenv only in app entry point, not in individual modules.

### [RESOLVED] Hard delete + 30-day auto cleanup for merchandise (ERR-013)

- **The Issue**: No way to permanently delete merchandise and its R2 images. Soft-deleted items accumulated indefinitely, costing storage.
- **The Resolution**: Added `hardDelete()` method to `merchandise.v2.controller.ts` with guard requiring prior soft-delete. Added `hardDeleteSoftDeletedMerch()` for 30-day auto cleanup. Added `DELETE /hard-delete` route. Added daily 2AM cron job. All paths delete R2 images + DB record. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Features with external resource storage (R2, S3) should have both manual and scheduled cleanup paths.

### [RESOLVED] Missing R2_BUCKET_NAME validation in merchandise controller (ERR-012)

- **The Issue**: `merchandise.v2.controller.ts:25` constructed `r2Endpoint` URL using `process.env.R2_BUCKET_NAME` without validation. Missing env var produced broken URL `https://undefined....r2.cloudflarestorage.com` at runtime.
- **The Resolution**: Added guard throw before URL construction: `if (!r2BucketName) throw new Error("R2_BUCKET_NAME is not configured")`. Clean fail at startup. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Validate required env vars at module level before constructing dependent values. Fail fast with descriptive error.

### [RESOLVED] Path traversal in multer S3 key generation (ERR-011)

- **The Issue**: S3 key pattern `merchandise/${Date.now()}_${file.originalname}` in `merchandise.v2.route.ts`, `merchandise.route.ts`, `eventsV2.route.ts` used raw user-supplied filename. Potential path traversal via `../` in filename.
- **The Resolution**: Replaced with `path.extname(file.originalname)` + random string. User input no longer used in storage paths. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Never embed user-supplied filenames in file storage paths. Strip to extension and generate safe name.

### [RESOLVED] Missing fileSize limit on multer upload routes (ERR-010)

- **The Issue**: All 3 multer configurations (`merchandise.v2.route.ts`, `merchandise.route.ts`, `eventsV2.route.ts`) lacked `limits.fileSize`. Unbounded uploads allowed denial-of-service via massive files and unbilled R2 storage costs.
- **The Resolution**: Added `limits: { fileSize: 5 * 1024 * 1024 }` (5MB) to all 3 route files. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Always set `limits.fileSize` on any multer config handling user uploads. 5MB is safe for product/event images.

### [RESOLVED] Spurious `updateOne` without `$set` in merchandise.v2.controller.ts (ERR-009)

- **The Issue**: Lines 307-310 in `merchandise.v2.controller.ts` issued `Merch.updateOne({ _id: id }, { imageUrl: imagesToRemove })` without `$set`. This replaced the entire document with only `{ imageUrl }`, wiping name, price, stock, etc. Next line 329 used `$set` to fix it, but window existed where document was corrupted.
- **The Resolution**: Lines 307-310 deleted. The proper `$set` update at line 324 (previously 329) already handles all fields correctly in one safe atomic write.
- **Prevention Strategy**: Always wrap update fields in `{ $set: { ... } }` with MongoDB `updateOne`/`updateMany`. Plain object without operator replaces the whole document.

### [RESOLVED] Missing fileFilter on multer upload routes — CRITICAL (ERR-008)

- **The Issue**: All 3 multer configurations (`merchandise.v2.route.ts`, `merchandise.route.ts`, `eventsV2.route.ts`) lacked `fileFilter` — accepted arbitrary file types (`.exe`, `.html`, `.svg`). Attacker could upload malicious files to R2 and serve via public URLs.
- **The Resolution**: Added `fileFilter` to all 3 routes restricting to `image/jpeg`, `image/png`, `image/webp`, `image/gif`. Non-image files now rejected with multer error. Verified: `npx tsc --noEmit` passes.
- **Prevention Strategy**: Always add `fileFilter` + `limits.fileSize` to any multer config handling user uploads. Image endpoints should validate MIME type at the middleware level before storage.

### [RESOLVED] Console.log/debug Statements in Production Code (ERR-004)

- **The Issue**: 15+ `console.log`/`console.debug` instances across frontend (`auth.api.ts`, `promo.ts`) and backend (`order.controller.ts`, `authV2.controller.ts`, `admin.controller.ts`, `mail.template.ts`, `generate-pdf-from-ejs.ts`, `index.v2.controller.ts`).
- **The Resolution**: Verified resolved on July 30, 2026. All instances confirmed removed via grep scan — frontend `console.log`/`console.debug` count is 0, backend controller-level `console.log` statements are gone. Only intentional server startup logs in `index.ts` remain.
- **Prevention Strategy**: Use a proper logger (e.g., `pino`, `winston`) instead of `console.log` for future debug logging. Add ESLint `no-console` rule to prevent regressions.

### [RESOLVED] Mass TS2345: `req.params` Type Mismatch Across 10+ Controller Files (ERR-007)

- **The Issue**: 50+ TypeScript compilation errors across 10+ controller files (`event.controller.ts`, `eventV2.controller.ts`, `admin.controller.ts`, `eligibleCertificate.controller.ts`, `order.controller.ts`, `promo.controller.ts`, `promo.v2.controller.ts`, `recruitment.v2.controller.ts`, `studentV2.controller.ts`, `index.controller.ts`, `index.v2.controller.ts`) — `req.params` properties typed as `string | string[]` passed to functions expecting `string`.
- **Root Cause**: Express types define `req.params` values as `string | string[]`. Destructuring `const { id } = req.params` infers `id: string | string[]`. Every function call or `.trim()` that expects `string` breaks.
- **The Resolution**: Fixed all locations: changed `const { X } = req.params` → `const X = req.params.X as string` across all affected files. Also fixed 1 business-logic bug in `admin.controller.ts:158` (`Student.updateMany` missing update argument).
- **Prevention Strategy**: Use `as string` on every `req.params` destructuring. Alternatively, create Express type augmentation to narrow `req.params` values to `string`.

### [RESOLVED] TS2345: `req.params.id` Type Mismatch in devtools.v2.controller.ts (ERR-006) ---from HERE to UP is my docs of fixes.

- **The Issue**: Server crashed on startup with `TSError: TS2345` — `req.params.id` typed as `string | string[]` passed to `resendSingleEmail()` and `emailService.updateStatusById()` which expect `string`. Located at `devtools.v2.controller.ts:79-80`.
- **Root Cause**: Express types define `req.params.id` as `string | string[]`, but downstream functions expect `string`. This surfaced after `npm i` with `PUPPETEER_SKIP_DOWNLOAD=true` fixed missing packages, revealing pre-existing type error.
- **The Resolution**: Added `as string` casts on both calls. Changed `resendSingleEmail(id)` → `resendSingleEmail(id as string)` and `emailService.updateStatusById(id, "sent")` → `emailService.updateStatusById(id as string, "sent")`.
- **Prevention Strategy**: Use `as string` on Express `req.params` destructuring whenever the param is a route path parameter. Consider a shared utility type for typed params to avoid manual casts in each controller.

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
