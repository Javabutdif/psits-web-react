# 🧭 FLOW-001: V2 Merchandise Controller — Visual Guide

> **For**: Developers (PSITS Web Team)\
**Files**: controller + route (2 files, NO utility file)\
**Storage**: Cloudflare R2 via multer-s3 (same pattern as v1 S3)\
**Pattern**: Legacy v1 style — exported functions, try/catch, inline R2 client\
**Auth**: `req.admin` (same as v1, NOT req.userV2)\
**Last Updated**: July 17, 2026, 03:41 PM PST

---

## 📋 Table of Contents

1. [What Are We Building?](#what-are-we-building)
2. [Legacy v1 Pattern Summary](#legacy-v1-pattern-summary)
3. [Project Map — Files We Create](#project-map--files-we-create)
4. [8 Controller Functions](#8-controller-functions)
5. [File 1: Controller Details](#file-1-controller-details)
6. [File 2: Route Details](#file-2-route-details)
7. [Data Model — The `IMerch` Shape](#data-model--the-imersh-shape)
8. [Audit Log Rules](#audit-log-rules)
9. [Environment Variables](#environment-variables)
10. [Known Risks](#known-risks)

---

## 🎯 What Are We Building?

A v2 merchandise backend that follows the **exact same patterns** as the legacy v1 `merchandise.controller.ts` and `merchandise.route.ts`, but with **Cloudflare R2** replacing AWS S3 for image storage.

**Key rule**: Match the legacy exactly — exported functions, try/catch, inline R2 clients, mixed response formats, `req.admin` auth context.

---

## 📜 Legacy v1 Pattern Summary

| Pattern | v1 Legacy | Our v2 |
|---------|-----------|--------|
| Controller style | `export const fn = async (req, res) => { try/catch }` | Same |
| Error handling | `res.status(x).json({ message: "..." })` inline | Same |
| Image upload | Route: multer-s3 → S3. Controller reads `file.location` | Same, but → R2 |
| S3/R2 client | Inline in BOTH route AND controller files | Same — inline R2 client in both |
| Image delete | Controller: `s3Client.send(DeleteObjectCommand)` | Same — `r2Client.send(DeleteObjectCommand)` |
| Auth middleware | `requireAccessTokenWithDBCheck, roleAuthenticateV2, adminAccessAuthenticateV2` | Same chain |
| Response format | Mixed: strings, arrays, objects | Same — match v1 |
| Shared utility | NO separate S3 file | NO `r2.ts` — inline only |
| Admin identity | `req.admin.name`, `req.admin._id` | Same |
| Image URL source | `req.files` → `file.location` (from multer-s3) | Same |

---

## 🗺 Project Map — Files We Create

2 new files, 0 edits to existing files:

```
server-side/src/
│
├── controllers/
│   ├── merchandise.controller.ts          (v1 legacy — reference only)
│   ├── merchandise.v2.controller.ts       ← NEW: we CREATE this
│
├── routes/
│   ├── merchandise.route.ts               (v1 legacy — reference only)
│   └── merchandise.v2.route.ts            ← NEW: we CREATE this
│
├── util/
│   ├── catch.async.util.ts                (NOT used — v1 doesn't use it)
│   └── app.error.util.ts                  (NOT used — v1 doesn't use it)
│
├── middlewares/
│   └── authV2.middleware.ts               (reused from existing)
│
└── models/  (unchanged — read only)
```

**NO `r2.ts` utility file.** The R2 client is created inline in both the route file (for multer-s3 upload) and the controller file (for DeleteObjectCommand), matching the v1 pattern where the S3 client is duplicated.

---

## 🧩 8 Controller Functions

All exported as `const functionName = async (req: Request, res: Response) => { try { ... } catch (error) { console.error(error); res.status(500).send(error); } }`

| # | Function | Reads | Writes | R2 Action | Response Format |
|---|----------|-------|--------|-----------|-----------------|
| 1 | `createMerchandiseV2Controller` | — | Merch, Event?, Log | Upload via multer-s3 (route does it) | String: `"Merch Addition Successful"` |
| 2 | `retrieveAllMerchV2Controller` | Merch.find() | — | None | Array: `[...merches]` |
| 3 | `retrieveActiveMerchV2Controller` | Merch.find({is_active:true}) | — | None | Array: `[...merches]` |
| 4 | `retrieveMerchByIdV2Controller` | Merch.findById() | — | None | Object: `{...merch}` |
| 5 | `updateMerchandiseV2Controller` | Merch, Student, Orders | Merch, Student, Orders, Log | Delete via `DeleteObjectCommand` | String: `"Merch, carts, and orders updated successfully"` |
| 6 | `softDeleteMerchandiseV2Controller` | Merch | Merch, Log | None | Object: `{ message: "Merch deleted successfully" }` |
| 7 | `publishMerchandiseV2Controller` | Merch | Merch, Log | None | Object: `{ message: "Merch published successfully" }` |
| 8 | `getMerchReportsV2Controller` | Merch.find().select().sort() | — | None | Array: `[...merches]` |

---

## 📄 File 1: Controller Details

### `server-side/src/controllers/merchandise.v2.controller.ts`

**Structure** — exactly mirrors v1:

```typescript
import { Merch } from "../models/merch.model";
import { Student } from "../models/student.model";
import { Orders } from "../models/orders.model";
import { Admin } from "../models/admin.model";
import { Log } from "../models/log.model";
import { Event } from "../models/event.model";
import mongoose, { Types } from "mongoose";
import { IMerch } from "../models/merch.interface";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { expiryStatus } from "../custom_function/conditional_dates";

// Inline R2 client (same pattern as v1's inline S3 client)
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

// ── 1. CREATE ──────────────────────────────────────────────────────────
export const createMerchandiseV2Controller = async (
  req: Request, res: Response
) => {
  // Extract body fields (same as v1)
  // Parse JSON strings for selectedSizes, sessionConfig
  // Read image URLs from req.files → file.location (uploaded by route's multer-s3)
  // Build new Merch document
  // Save to DB
  // If isEvent, create Event document
  // Log action via new Log({...}).save()
  // Return 200 with string message
};

// ── 2. RETRIEVE ALL (admin) ────────────────────────────────────────────
export const retrieveAllMerchV2Controller = async (
  req: Request, res: Response
) => {
  // Merch.find().select(fields).lean()
  // Return 200 with array
};

// ── 3. RETRIEVE ACTIVE (public/student) ────────────────────────────────
export const retrieveActiveMerchV2Controller = async (
  req: Request, res: Response
) => {
  // Merch.find({ is_active: true }).select(fields).lean()
  // Return 200 with array
};

// ── 4. RETRIEVE BY ID ──────────────────────────────────────────────────
export const retrieveMerchByIdV2Controller = async (
  req: Request, res: Response
) => {
  // Merch.findById(req.params.id)
  // If null → 404
  // Return 200 with merch object
};

// ── 5. UPDATE ──────────────────────────────────────────────────────────
export const updateMerchandiseV2Controller = async (
  req: Request, res: Response
) => {
  // Read body fields + req.files for new image URLs
  // Parse removeImage from body
  // Delete removed images from R2 via r2Client.send(DeleteObjectCommand)
  // Update Merch document
  // Sync Student carts (update name, price, image)
  // Sync Orders items (update name, price, image, recalculate totals)
  // Log action
  // Return 200 with string message
};

// ── 6. SOFT DELETE ─────────────────────────────────────────────────────
export const softDeleteMerchandiseV2Controller = async (
  req: Request, res: Response
) => {
  // Merch.findById for logging
  // Merch.updateOne({ $set: { is_active: false } })
  // Log action
  // Return 200 with { message }
};

// ── 7. PUBLISH ─────────────────────────────────────────────────────────
export const publishMerchandiseV2Controller = async (
  req: Request, res: Response
) => {
  // Merch.findById for logging
  // Merch.updateOne({ $set: { is_active: true } })
  // Log action
  // Return 200 with { message }
};

// ── 8. REPORTS ─────────────────────────────────────────────────────────
export const getMerchReportsV2Controller = async (
  req: Request, res: Response
) => {
  // Merch.find().select(salesFields).lean().sort({ createdAt: -1 })
  // Return 200 with array
};
```

---

## 📄 File 2: Route Details

### `server-side/src/routes/merchandise.v2.route.ts`

**Structure** — exactly mirrors v1 `merchandise.route.ts`:

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

// Inline R2 client for multer-s3 upload (separate from controller's R2 client — matches v1)
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

// ── Routes ─────────────────────────────────────────────────────────────

router.post("/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  upload.array("images", 3),
  createMerchandiseV2Controller
);

router.get("/",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  retrieveAllMerchV2Controller
);

router.get("/active",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  retrieveActiveMerchV2Controller
);

router.get("/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  retrieveMerchByIdV2Controller
);

router.put("/update/:_id",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  upload.array("images", 3),
  updateMerchandiseV2Controller
);

router.put("/delete-soft",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  softDeleteMerchandiseV2Controller
);

router.put("/publish",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  publishMerchandiseV2Controller
);

router.get("/reports",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getMerchReportsV2Controller
);

export default router;
```

### Endpoint Table

| Method | Path | Auth Chain | Upload | Controller |
|--------|------|-----------|--------|------------|
| POST | `/` | accessToken + role(admin) + adminAccess(admin,finance) | `upload.array("images",3)` | create |
| GET | `/` | accessToken + role(admin) | — | retrieveAll |
| GET | `/active` | accessToken + role(admin,student) | — | retrieveActive |
| GET | `/:id` | accessToken + role(admin,student) | — | retrieveById |
| PUT | `/update/:_id` | accessToken + role(admin) + adminAccess(admin,finance) | `upload.array("images",3)` | update |
| PUT | `/delete-soft` | accessToken + role(admin) + adminAccess(admin,finance) | — | softDelete |
| PUT | `/publish` | accessToken + role(admin) + adminAccess(admin,finance) | — | publish |
| GET | `/reports` | accessToken + role(admin) | — | reports |

---

## 📦 Data Model — The `IMerch` Shape

Same as v1. Key fields used in controller code:

| Field | Type | Required | Used In |
|-------|------|----------|---------|
| `name` | String | ✅ | All CRUD |
| `price` | Number | ✅ | Create, Update, Reports |
| `stocks` | Number | ✅ | Create, Update |
| `category` | String | ✅ | Create, Update |
| `type` | String | ✅ | Create, Update |
| `control` | String | ✅ | Create, Update |
| `created_by` | String | ✅ | Create |
| `start_date` | Date | ✅ | Create, Update |
| `end_date` | Date | ❌ | Create, Update |
| `is_active` | Boolean | Auto | SoftDelete, Publish |
| `imageUrl` | String[] | ❌ | Create, Update |
| `sales_data` | Object | Auto | Reports |
| `order_details` | Array | Auto | Reports |

---

## 📋 Audit Log Rules

Using `req.admin` (same as v1, NOT req.userV2):

| Function | Action String | target_model |
|----------|---------------|--------------|
| createMerchandiseV2Controller | `"Merchandise Creation"` | `"Merchandise"` |
| updateMerchandiseV2Controller | `"Edited Merchandise"` | `"Merchandise"` |
| softDeleteMerchandiseV2Controller | `"Soft Deleted Merchandise"` | `"Merchandise"` |
| publishMerchandiseV2Controller | `"Re-published Soft Deleted Merchandise"` | `"Merchandise"` |

Log shape: `{ admin: req.admin.name, admin_id: req.admin._id, action, target: merch.name, target_id: merch._id, target_model: "Merchandise" }`

---

## 🔐 Environment Variables

```env
# Cloudflare R2 (replaces AWS S3)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

Old AWS variables (`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `bucketUrl`) remain in `.env` for v1 compatibility.

---

## ⚠️ Known Risks

| Risk | Details |
|------|---------|
| **Dual R2 clients** | Route file has one R2 client (for multer-s3 upload). Controller has another (for DeleteObjectCommand). Matches v1's dual S3 client pattern — intentional, not a bug. |
| **No catchAsync** | Raw try/catch in every function. If an async error escapes the try block, it crashes the request. Same as v1. |
| **Mixed response formats** | Strings, arrays, objects — matches v1 exactly. Not standardizing. |
| **Multi-write without transaction** | Update touches Merch + Student carts + Orders + Log. No session/transaction. Same risk as v1. |

<!-- c: worrie -->
