# Implementation Plans & Feature Flow Memory

## 0. Last Synchronized Checkpoint

- **Last AI Analysis Timestamp**: July 30, 2026, 11:16 AM PST

## 1. Documented Implementation Plans & Feature Flows

You are strictly commanded to use this section to log full architectural design maps, planned execution outlines, or documented system feature flows when requested. Every time a user plans a general task, complex logic, or big structural feature, you MUST log the implementation roadmap here so you never get stuck or lost. You must format the entry using strict bracket identifiers identical to the error memory system:

### [FLOW-002] Hard Delete + 30-Day Auto Cleanup for Merchandise

- **Context/Objective**: Add hard-delete capability for merchandise that permanently removes the DB record and R2 images. Add automatic daily cleanup of soft-deleted items older than 30 days. Hard delete only works ifit is soft deleted first.
- **Implementation**:
  1. Added `hardDelete()` method to `MerchandiseController` class — validates soft-deleted state, deletes R2 images via `DeleteObjectCommand`, removes DB record via `findByIdAndDelete`, logs action
  2. Added exported `hardDeleteSoftDeletedMerch()` function — queries `{ is_active: false, updatedAt: { $lt: 30_days_ago } }`, loops through each, deletes R2 images + DB record, returns `{ deletedCount }`
  3. Added `DELETE /hard-delete` route with admin auth middleware
  4. Added daily 2AM PH cron job calling `hardDeleteSoftDeletedMerch()` with cron execution logging
- **Files Changed**:
  - `server-side/src/controllers/merchandise.v2.controller.ts` — +70 lines (hardDelete method + hardDeleteSoftDeletedMerch export)
  - `server-side/src/routes/merchandise.v2.route.ts` — +9 lines (DELETE /hard-delete route)
  - `server-side/src/index.ts` — +42 lines (import + cron job)
- **Guard Logic**: Manual hard-delete checks `merch.is_active === false` — rejects with 400 if item is still active
- **Auto Cleanup**: Daily cron queries `updatedAt` (auto-set by Mongoose timestamps when softDelete updates the doc)
- **Status**: COMPLETED
- **Logged At**: July 30, 2026, 11:16 AM PST

### [FLOW-001] V2 Merchandise Backend — Legacy-Aligned with Cloudflare R2

- **Context/Objective**: Build v2 merchandise backend following the **exact same patterns as legacy v1** (`merchandise.controller.ts`). Exported functions with try/catch, inline R2 client in each file (no shared utility), routes with multer-s3 uploading directly to Cloudflare R2. Two files created, zero edits to existing code.
- **User Manual Step**: Sign up at https://www.cloudflare.com/products/r2/, create bucket, get API keys, add to `.env`.
- **Constraint**: Create 2 new files. Do NOT edit existing files.

---

### Legacy v1 Patterns We Must Match

| Aspect | v1 Legacy | Our v2 Must Do |
|--------|-----------|----------------|
| Controller style | `export const fn = async (req, res) => { try/catch }` | Same — NOT class-based, NOT catchAsync |
| Error handling | `res.status(x).json({ message: "..." })` inline | Same — NOT AppError |
| Image upload | Route: multer-s3 → S3. Controller reads `file.location` | Same — multer-s3 → R2. Controller reads `file.location` |
| S3/R2 client | Inline in BOTH route AND controller files (separate instances) | Same — inline R2 client in both files |
| Image delete | Controller: `s3Client.send(DeleteObjectCommand(...))` | Same — `r2Client.send(DeleteObjectCommand(...))` |
| Auth middleware | `requireAccessTokenWithDBCheck, roleAuthenticateV2, adminAccessAuthenticateV2` | Same middleware chain |
| Response format | Mixed: strings, arrays, objects depending on endpoint | Same — follow v1 inconsistency exactly |
| Shared utility | NO separate S3 utility file | NO `r2.ts` — inline only |
| Log admin identity | `req.admin.name`, `req.admin._id` (from v1 middleware) | Same — `req.admin` pattern |

---

### 2 Files We Create (NO r2.ts utility)

| File | Purpose |
|------|---------|
| `server-side/src/controllers/merchandise.v2.controller.ts` | 8 exported async functions, try/catch, inline R2 client |
| `server-side/src/routes/merchandise.v2.route.ts` | Routes + auth + multer-s3 with inline R2 client |

---

### File 1: `server-side/src/controllers/merchandise.v2.controller.ts` — Controller

**Exactly like v1**: Each function is `export const functionName = async (req: Request, res: Response) => { try { ... } catch (error) { console.error(error); res.status(500).send(error); } }`

**Inline R2 client** (same pattern as v1's inline S3 client):
```typescript
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});
```

**8 exported functions:**

| # | Function | What It Does (Legacy Pattern) | Returns |
|---|----------|-------------------------------|---------|
| 1 | `createMerchandiseV2Controller` | Read `req.files` → `file.location` (uploaded to R2 by route). Build Merch doc. If isEvent, create Event. Log via `new Log({...}).save()`. | `res.status(200).json("Merch Addition Successful")` |
| 2 | `retrieveAllMerchV2Controller` | `Merch.find().select(fields).lean()` | `res.status(200).json(merches)` |
| 3 | `retrieveActiveMerchV2Controller` | `Merch.find({ is_active: true }).select(fields).lean()` | `res.status(200).json(merches)` |
| 4 | `retrieveMerchByIdV2Controller` | `Merch.findById(id)`. If null → 404 | `res.status(200).json(merch)` |
| 5 | `updateMerchandiseV2Controller` | Read `req.files` for new URLs. Parse `removeImage` from body. Delete removed from R2 via `r2Client.send(DeleteObjectCommand)`. `Merch.updateOne({ $set })`. Sync Student carts + Orders totals. Log. | `res.status(200).send("Merch, carts, and orders updated successfully")` |
| 6 | `softDeleteMerchandiseV2Controller` | `Merch.findById` for log. `Merch.updateOne({ $set: { is_active: false } })`. Log. | `res.status(200).json({ message: "Merch deleted successfully" })` |
| 7 | `publishMerchandiseV2Controller` | `Merch.findById` for log. `Merch.updateOne({ $set: { is_active: true } })`. Log. | `res.status(200).json({ message: "Merch published successfully" })` |
| 8 | `getMerchReportsV2Controller` | `Merch.find().select(reportFields).lean().sort({ createdAt: -1 })` | `res.status(200).json(merches)` |

---

### File 2: `server-side/src/routes/merchandise.v2.route.ts` — Routes

**Exactly like v1 route file**: Inline R2 client + multer-s3 config + auth middleware chains.

```typescript
import { Router, Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import {
  createMerchandiseV2Controller,
  retrieveAllMerchV2Controller,
  retrieveActiveMerchV2Controller,
  retrieveMerchByIdV2Controller,
  updateMerchandiseV2Controller,
  softDeleteMerchandiseV2Controller,
  publishMerchandiseV2Controller,
  getMerchReportsV2Controller,
} from "../controllers/merchandise.v2.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";

const router = Router();

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const upload = multer({
  storage: multerS3({
    s3: r2Client,
    bucket: process.env.R2_BUCKET_NAME!,
    metadata: (req: Request, file: Express.Multer.File, cb: any) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req: Request, file: Express.Multer.File, cb: any) => {
      cb(null, `merchandise/${Date.now()}_${file.originalname}`);
    },
  }),
});

router.post("/", requireAccessTokenWithDBCheck, roleAuthenticateV2(["admin"]), adminAccessAuthenticateV2(["admin", "finance"]), upload.array("images", 3), createMerchandiseV2Controller);
router.get("/", requireAccessTokenV2, roleAuthenticateV2(["admin"]), retrieveAllMerchV2Controller);
router.get("/active", requireAccessTokenV2, roleAuthenticateV2(["admin", "student"]), retrieveActiveMerchV2Controller);
router.get("/:id", requireAccessTokenV2, roleAuthenticateV2(["admin", "student"]), retrieveMerchByIdV2Controller);
router.put("/update/:_id", requireAccessTokenWithDBCheck, roleAuthenticateV2(["admin"]), adminAccessAuthenticateV2(["admin", "finance"]), upload.array("images", 3), updateMerchandiseV2Controller);
router.put("/delete-soft", requireAccessTokenWithDBCheck, roleAuthenticateV2(["admin"]), adminAccessAuthenticateV2(["admin", "finance"]), softDeleteMerchandiseV2Controller);
router.put("/publish", requireAccessTokenWithDBCheck, roleAuthenticateV2(["admin"]), adminAccessAuthenticateV2(["admin", "finance"]), publishMerchandiseV2Controller);
router.get("/reports", requireAccessTokenV2, roleAuthenticateV2(["admin"]), getMerchReportsV2Controller);

export default router;
```

**Endpoint table**:

| Method | Path | Auth Middleware | Upload | Controller |
|--------|------|----------------|--------|------------|
| POST | `/` | accessToken + role(admin) + adminAccess(admin,finance) | `upload.array("images",3)` | createMerchandiseV2Controller |
| GET | `/` | accessToken + role(admin) | — | retrieveAllMerchV2Controller |
| GET | `/active` | accessToken + role(admin,student) | — | retrieveActiveMerchV2Controller |
| GET | `/:id` | accessToken + role(admin,student) | — | retrieveMerchByIdV2Controller |
| PUT | `/update/:_id` | accessToken + role(admin) + adminAccess(admin,finance) | `upload.array("images",3)` | updateMerchandiseV2Controller |
| PUT | `/delete-soft` | accessToken + role(admin) + adminAccess(admin,finance) | — | softDeleteMerchandiseV2Controller |
| PUT | `/publish` | accessToken + role(admin) + adminAccess(admin,finance) | — | publishMerchandiseV2Controller |
| GET | `/reports` | accessToken + role(admin) | — | getMerchReportsV2Controller |

---

### Audit Log Rules

Same action strings as v1, using `req.admin` (not `req.userV2`):

| Function | Action String |
|----------|---------------|
| createMerchandiseV2Controller | `"Merchandise Creation"` |
| updateMerchandiseV2Controller | `"Edited Merchandise"` |
| softDeleteMerchandiseV2Controller | `"Soft Deleted Merchandise"` |
| publishMerchandiseV2Controller | `"Re-published Soft Deleted Merchandise"` |

Log shape: `{ admin: req.admin?.name, admin_id: req.admin?._id, action, target: merch.name, target_id: merch._id, target_model: "Merchandise" }`

---

### Environment Variables

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

---

### Known Risks (Same as v1)

| Risk | Details |
|------|---------|
| **Dual R2 clients** | Route file has one (for multer-s3 upload). Controller has another (for DeleteObjectCommand). Matches v1's dual S3 client pattern — intentional. |
| **No catchAsync** | Raw try/catch in every function. If an error slips through try block, it crashes the request. Same as v1. |
| **Mixed response formats** | Strings, arrays, objects — matches v1 exactly. Not standardizing to preserve legacy alignment. |
| **Multi-write no transaction** | Update touches Merch + Student carts + Orders + Log. No session/transaction. Same risk as v1. |

---

- **Status**: PLAN-LEGACY-ALIGNED (matches v1 patterns exactly)
- **Logged At**: July 17, 2026, 03:41 PM PST

### [FLOW-001] Title of Implemented Flow

- **Context/Objective**: [What feature or process flow does this plan describe?]
- **Step-by-Step Logic Outline**:
  1. [Step 1 description]
  2. [Step 2 description]
- **Dependencies Involved**: [List files, databases, or modules impacted by this flow]
- **Status**: IN_PROGRESS | COMPLETED | ARCHIVED
- **Logged At**: [Month Day, Year, HH:MM AM/PM PST]

---

## 2. ARCHIVE STATUS

- **Archive File**: `.opencode/archives/implementation_archive.md`
- **Threshold**: 10 active entries per section
- **Total Archived**: 0
- **Last Archive Check**: `Not yet performed`

| Entries Archived | Archived At (PST) |
| ---------------- | ----------------- |
| 0                | —                 |

<!-- c: worrie -->
