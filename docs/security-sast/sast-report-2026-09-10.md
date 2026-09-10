# SAST Report: PSITS UC Main Web Platform

| | |
| --- | --- |
| **Report date** | 2026-09-10 |
| **Scope** | `server-side/`, `client-side-ts/`, `client-side/` (static source analysis) |
| **Commit reviewed** | `e425ba0f` (branch `master`) |
| **Standards** | OWASP Top 10 2021, OWASP API Security Top 10 2023, OWASP ASVS 4.0 |
| **Status** | **Findings are NOT fixed.** This document is a remediation backlog for maintainers. |
| **Contact** | psitsucmain2025@gmail.com |

> This report deliberately contains no code changes. Every finding below was
> confirmed by reading the source at the commit above. Each entry states the
> exact location, why it is exploitable, and the concrete fix to apply.

---

## How to use this document

1. Work top to bottom. Findings are ordered by severity, and severity here means
   "how much student data or admin control does this expose".
2. Each finding has a **Fix** section with the change to make. Apply it on a
   `security/<short-name>` branch and open a PR to `staging`, per
   [CONTRIBUTING.md](../../CONTRIBUTING.md).
3. Do not close a finding without a test or a manual reproduction proving the
   old behaviour is gone.
4. This platform handles student PII, payment records, and attendance data, so
   treat CRITICAL and HIGH items as production incidents rather than backlog.

### Summary

| # | Severity | Finding | OWASP |
| --- | --- | --- | --- |
| [1](#1-critical-hardcoded-fallback-jwt-signing-secret) | CRITICAL | Hardcoded fallback JWT signing secret `"Default_Token"` | A02 / A07 |
| [2](#2-high-unauthenticated-arbitrary-object-read-from-the-r2-bucket) | HIGH | Unauthenticated arbitrary object read from the R2 bucket | A01 / API1 |
| [3](#3-high-path-traversal-into-ejs-template-rendering) | HIGH | Path traversal into EJS template rendering (file read, potential RCE) | A03 |
| [4](#4-high-any-student-can-download-any-other-students-certificate) | HIGH | Any student can download any other student's certificate (IDOR) | A01 / API1 |
| [5](#5-medium-password-reset-tokens-are-replayable-and-unconstrained) | MEDIUM | Password reset tokens are replayable, with no password policy | A07 |
| [6](#6-medium-unbounded-in-memory-upload-into-a-vulnerable-parser) | MEDIUM | Unbounded in-memory upload feeding a vulnerable XLSX parser | A05 |
| [7](#7-medium-mass-assignment-on-certificate-templates) | MEDIUM | Mass assignment on certificate templates | A08 |
| [8](#8-medium-predictable-object-storage-keys) | MEDIUM | Predictable object storage keys (`Math.random`) | A02 |
| [9](#9-medium-missing-rate-limits-on-unauthenticated-endpoints) | MEDIUM | Missing rate limits on unauthenticated endpoints | A04 / API4 |
| [10](#10-medium-account-enumeration-on-password-reset) | MEDIUM | Account enumeration on password reset | A07 |
| [11](#11-medium-authentication-outcome-written-to-application-logs) | MEDIUM | Authentication outcome written to application logs | A09 |
| [12](#12-medium-internal-error-messages-returned-to-clients) | MEDIUM | Internal error messages returned to clients | A05 / A09 |
| [13](#13-medium-password-hashes-and-refresh-tokens-are-selectable-by-default) | MEDIUM | Password hashes and refresh tokens selectable by default | A02 |
| [14](#14-medium-stored-xss-in-the-legacy-client-post-feed) | MEDIUM | Stored XSS in the legacy client post feed | A03 |
| [15](#15-low-jwt-verification-without-an-algorithm-allowlist) | LOW | JWT verification without an algorithm allowlist | A02 |
| [16](#16-low-chromium-sandbox-disabled-for-pdf-rendering) | LOW | Chromium sandbox disabled for PDF rendering | A05 |
| [17](#17-low-response-header-injection-via-certificate-filename) | LOW | Response header injection via certificate filename | A03 |
| [18](#18-low-request-hangs-on-database-error-in-legacy-auth-middleware) | LOW | Request hangs on database error in legacy auth middleware | A04 |
| [19](#19-low-transport-and-browser-hardening-gaps) | LOW | Transport and browser hardening gaps | A05 |

---

## 1. CRITICAL: Hardcoded fallback JWT signing secret

**OWASP:** A02:2021 Cryptographic Failures, A07:2021 Identification and Authentication Failures
**CWE:** CWE-798 Use of Hard-coded Credentials, CWE-1188 Insecure Default Initialization

**Location**
- [server-side/src/controllers/index.v2.controller.ts:15](../../server-side/src/controllers/index.v2.controller.ts#L15)
- [server-side/src/controllers/index.controller.ts:13](../../server-side/src/controllers/index.controller.ts#L13)

```ts
const token_key = process.env.JWT_SECRET ?? "Default_Token";
```

**Why this is critical**

If `JWT_SECRET` is ever missing from the environment, the application silently
falls back to the string `Default_Token`. That value is committed to a
**publicly viewable repository**. It is used at
[index.v2.controller.ts:172](../../server-side/src/controllers/index.v2.controller.ts#L172)
to sign password reset tokens:

```ts
const token = jwt.sign({ userId: user._id }, token_key, { expiresIn: "10m" });
```

and at [index.v2.controller.ts:191](../../server-side/src/controllers/index.v2.controller.ts#L191)
to verify them. `POST /api/student/reset-password/:token` is mounted at
[index.v2.route.ts:20](../../server-side/src/routes/index.v2.route.ts#L20) and is
unauthenticated.

An attacker who knows the fallback is in effect can forge a token for any
`userId`, including an admin, and set that account's password. That is full
account takeover of the whole platform with no credentials.

This is a latent failure, not a guaranteed one: it only activates when the env
var is absent. That is exactly what makes it dangerous. A misconfigured redeploy,
a new staging environment, or a container started without its env file silently
turns full authentication into a publicly known constant. Note that
[jwt.util.ts:12-17](../../server-side/src/util/jwt.util.ts#L12-L17) already gets
this right with a `requireEnv` helper that throws on startup.

**Fix**

Never provide a fallback for a signing secret. Fail at startup instead. Reuse the
existing helper rather than writing a second one.

```ts
// server-side/src/controllers/index.v2.controller.ts
import { requireEnv } from "../util/jwt.util"; // export it from jwt.util.ts

const token_key = requireEnv("JWT_SECRET");
```

Then:

1. Export `requireEnv` from [jwt.util.ts](../../server-side/src/util/jwt.util.ts)
   so there is exactly one implementation.
2. Apply the same change to
   [index.controller.ts:13](../../server-side/src/controllers/index.controller.ts#L13).
3. Change [custom_authenticate_token.ts:5](../../server-side/src/middlewares/custom_authenticate_token.ts#L5)
   from `?? ""` to `requireEnv("JWT_SECRET")`. The empty-string fallback fails
   closed today, but only by accident, and it hides a misconfiguration.
4. **Rotate `JWT_SECRET` in every environment** once the code is deployed. Assume
   any token minted before rotation is untrusted. Rotation invalidates
   outstanding password reset links, which is the desired outcome.
5. Add a startup assertion that every required secret is present, so the
   container refuses to boot rather than serving traffic in a degraded state.

**Verification:** start the server with `JWT_SECRET` unset. It must exit
non-zero, not listen on a port.

---

## 2. HIGH: Unauthenticated arbitrary object read from the R2 bucket

**OWASP:** A01:2021 Broken Access Control, API1:2023 Broken Object Level Authorization
**CWE:** CWE-284 Improper Access Control, CWE-639 Authorization Bypass Through User-Controlled Key

**Location**
- Route: [server-side/src/routes/eventsV2.route.ts:143](../../server-side/src/routes/eventsV2.route.ts#L143)
- Handler: [server-side/src/controllers/eventV2.controller.ts:3079-3091](../../server-side/src/controllers/eventV2.controller.ts#L3079-L3091)

```ts
router.get("/image/*", getEventImageController);   // no auth middleware
...
const key = req.params[0];
const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
const object = await r2Client.send(command);
```

**Why this is exploitable**

The wildcard segment is passed straight through as the S3/R2 object key with no
prefix restriction and no authentication. The endpoint is named "event image",
but nothing confines it to event images.

The same bucket (`R2_BUCKET_NAME`) also stores **recruitment resumes**. See
[recruitment.route.ts:58](../../server-side/src/routes/recruitment.route.ts#L58)
writing to `recruitment/{positionId}/resume/...` and
[recruitment.service.ts:647](../../server-side/src/services/recruitment.service.ts#L647)
persisting that key. Resumes are student PII: full names, addresses, phone
numbers, academic history.

So `GET /api/v2/events/image/recruitment/<positionId>/resume/<file>` returns a
student's resume to an anonymous caller. Position IDs are public via the
unauthenticated `GET /api/v2/recruitment/positions`
([recruitment.route.ts:92](../../server-side/src/routes/recruitment.route.ts#L92)),
and the remaining key entropy is weak, see [finding 8](#8-medium-predictable-object-storage-keys).

The handler also echoes the stored `ContentType` back to the browser
([eventV2.controller.ts:3097-3100](../../server-side/src/controllers/eventV2.controller.ts#L3097-L3100)),
and the upload path stores the client-supplied MIME type verbatim. An uploaded
`text/html` object would render as HTML on the API origin.

**Fix**

Constrain the key to the prefixes this endpoint is meant to serve, and reject
everything else before touching storage.

```ts
const PUBLIC_IMAGE_PREFIXES = ["events/", "merchandise/"] as const;

export const getEventImageController = async (req: Request, res: Response) => {
  const key = req.params[0];
  if (!key) {
    return res.status(400).json({ message: "Image key is required" });
  }

  // Reject traversal and any key outside the publicly servable prefixes.
  if (
    key.includes("..") ||
    !PUBLIC_IMAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
  ) {
    return res.status(404).json({ message: "Image not found" });
  }
  ...
};
```

Additionally:

1. Serve a fixed, safe `Content-Type` derived from the key's extension rather
   than echoing the stored value. Anything that is not a known image type should
   be a 404.
2. Add `res.setHeader("Content-Disposition", "inline")` and keep helmet's
   `X-Content-Type-Options: nosniff`.
3. **Move private documents out of the public bucket.** Resumes, receipts, and
   any other PII should live in a separate bucket that has no unauthenticated
   read path at all. Serve them exclusively through the authenticated,
   ownership-checked download route in
   [recruitment.service.ts:964-990](../../server-side/src/services/recruitment.service.ts#L964-L990),
   using short-lived presigned URLs.
4. Audit R2 access logs for reads under `recruitment/` that did not originate
   from the authenticated download route.

**Verification:** `curl` the endpoint with a `recruitment/...` key while logged
out. It must return 404.

---

## 3. HIGH: Path traversal into EJS template rendering

**OWASP:** A03:2021 Injection
**CWE:** CWE-22 Path Traversal, CWE-94 Code Injection

**Location**
- [server-side/src/mail_template/utils/generate-pdf-from-ejs.ts:82-86](../../server-side/src/mail_template/utils/generate-pdf-from-ejs.ts#L82-L86)
- [server-side/src/services/certificateV2.service.ts:104-121](../../server-side/src/services/certificateV2.service.ts#L104-L121)

```ts
const ejsTemplate = (await ejs.renderFile(
  path.join(ASSETS_BASE_DIR, templatePath),   // templatePath is NOT validated
  data,
  { cache: true }
)) as string;
```

**Why this is exploitable**

The same file already has the correct pattern. Images and fonts are routed
through `validateAndFinalizeFilePath`
([generate-pdf-from-ejs.ts:37-49](../../server-side/src/mail_template/utils/generate-pdf-from-ejs.ts#L37-L49)),
which calls `normalizeFinalPath` and enforces containment with
`fullPath.startsWith(basePath + path.sep)`
([path-normalizer.ts:41-56](../../server-side/src/utils/path-normalizer.ts#L41-L56)).

`templatePath` skips that check entirely and goes straight into `path.join`,
which happily resolves `../../../..`.

The value comes from `template.ejsRelativePath`, read at
[certificateV2.service.ts:197](../../server-side/src/services/certificateV2.service.ts#L197).
It is written by `createCertificateTemplate` / `updateCertificateTemplate`, which
spread the raw request body into the model with no validation:

```ts
const template = new CertificateTemplate({ ...data, isActive: true });
```

Two impacts:

- **Arbitrary file read.** EJS renders any file it is given. A file with no EJS
  tags is emitted verbatim into the generated PDF. `../../../../etc/passwd`, a
  `.env` file, or source code all become readable.
- **Remote code execution.** EJS templates execute JavaScript inside `<% %>`
  tags. If the attacker can place any file with EJS syntax on disk (an uploaded
  asset, a log line they control), pointing `ejsRelativePath` at it executes
  code as the Node process.

This requires an admin account, so it is privilege escalation rather than a
pre-auth hole. In a student organisation with many admin accounts of varying
seniority, admin-to-RCE is still a serious boundary to leave open.

**Fix**

Apply the validation that already exists, and add `.ejs` to the allowed
extensions.

```ts
// server-side/src/utils/path-normalizer.ts
export const enum Extensions {
  png = ".png",
  jpg = ".jpg",
  gif = ".gif",
  ttf = ".ttf",
  ejs = ".ejs",
}
```

```ts
// server-side/src/mail_template/utils/generate-pdf-from-ejs.ts
const resolvedTemplatePath = validateAndFinalizeFilePath(
  ASSETS_BASE_DIR,
  templatePath,
  [Extensions.ejs]
);

const ejsTemplate = (await ejs.renderFile(resolvedTemplatePath, data, {
  cache: true,
})) as string;
```

Also, defence in depth at the write side:

1. Validate `ejsRelativePath` with a zod schema on create and update. `zod` is
   already a dependency. Reject anything containing `..`, a leading `/`, a drive
   letter, or a null byte.
2. Better still, do not accept a path from the client at all. Keep a server-side
   registry of known template names and let the API accept only a key from that
   registry.
3. Audit `CertificateTemplate` documents currently in the database for any
   `ejsRelativePath` that escapes `src/assets`.

**Verification:** create a template with `ejsRelativePath` of
`"../../../package.json"` and generate a certificate. It must fail with
"Invalid file path", not render.

---

## 4. HIGH: Any student can download any other student's certificate

**OWASP:** A01:2021 Broken Access Control, API1:2023 Broken Object Level Authorization
**CWE:** CWE-639 Authorization Bypass Through User-Controlled Key

**Location**
- Route: [server-side/src/routes/certificateV2.route.ts:117-122](../../server-side/src/routes/certificateV2.route.ts#L117-L122)
- Service: [server-side/src/services/certificateV2.service.ts:183-194](../../server-side/src/services/certificateV2.service.ts#L183-L194)

```ts
router.get(
  "/:eventId/generate/:studentId",
  requireAccessTokenV2,
  roleAuthenticateV2(["student", "admin"]),
  generateStudentCertificate
);
```

**Why this is exploitable**

`roleAuthenticateV2` checks *what role* the caller has. It never checks *which
student* the caller is. The handler reads `studentId` straight from the URL
([certificateV2.controller.ts:261](../../server-side/src/controllers/certificateV2.controller.ts#L261))
and the service validates only that the target student is eligible for the
event, never that the target is the caller:

```ts
if (!event.eligibleStudentsForCertificate?.includes(studentId)) {
  throw new Error("Student is not eligible for this certificate");
}
const student = await Student.findOne({ id_number: studentId });
```

Any authenticated student can iterate student ID numbers (which follow a
predictable `YYYY-NNNNN` format) and download every eligible classmate's
certificate PDF, each containing that student's full legal name.

Note the correct pattern is used one route above, at
[certificateV2.controller.ts:310](../../server-side/src/controllers/certificateV2.controller.ts#L310),
where `getStudentCertificateEvents` derives the identity from the token:

```ts
const studentId = (req as any).userV2?.idNumber;
```

**Fix**

Enforce ownership for the student role. Admins keep the ability to generate on
behalf of a student.

```ts
export const generateStudentCertificate = async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const studentId = req.params.studentId as string;

  // A student may only generate their own certificate; admins may generate any.
  if (req.userV2.role !== "admin" && req.userV2.idNumber !== studentId) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden" });
  }
  ...
};
```

Systemic follow-up: every route with a resource identifier in the path and a
`roleAuthenticateV2(["student", ...])` guard needs the same ownership check.
Sweep the route files for `:studentId`, `:orderId`, `:applicationId`, and
`:attendeeId` and confirm each handler compares the resource owner against
`req.userV2.sub` or `req.userV2.idNumber`. Consider a small
`requireSelfOrAdmin("studentId")` middleware so the check cannot be forgotten.

**Verification:** log in as student A, request student B's certificate for an
event both are eligible for. Expect 403.

---

## 5. MEDIUM: Password reset tokens are replayable and unconstrained

**OWASP:** A07:2021 Identification and Authentication Failures
**CWE:** CWE-640 Weak Password Recovery Mechanism, CWE-521 Weak Password Requirements

**Location:** [server-side/src/controllers/index.v2.controller.ts:189-226](../../server-side/src/controllers/index.v2.controller.ts#L189-L226)

**Why this matters**

Three separate weaknesses in one handler:

1. **The token is not single-use.** After a successful reset, nothing
   invalidates it. The same link works repeatedly for its full 10-minute
   lifetime. Anyone who later obtains the link (browser history, a forwarded
   email, a shared inbox, a proxy log) can re-take the account.
2. **Resetting the password does not invalidate existing sessions.** An attacker
   who already holds a refresh token keeps access after the victim resets.
   Compare the v2 flow, which does track `currentRefreshToken`.
3. **No password policy.** `req.body.newPassword` is hashed with no length,
   complexity, or presence check:

   ```ts
   req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);
   getStudent.password = req.body.newPassword;
   ```

   A one-character password is accepted. A missing field throws inside bcrypt
   and surfaces as a 500.

**Fix**

```ts
import { z } from "zod";

const ResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128),
});

export const resetPasswordController = async (req: Request, res: Response) => {
  const parsed = ResetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  ...
};
```

Then make the token single-use. The cleanest approach with the current schema is
to bind the token to the password it is replacing:

1. Add a `passwordResetTokenJti` field (or reuse `pwdChangedAt`, already present
   in the v2 claims at [jwt.util.ts:40](../../server-side/src/util/jwt.util.ts#L40)).
2. Include a `jti` in the reset token and store its hash on the user document
   when the email is sent.
3. On reset, require the presented `jti` to match, then clear the stored value
   inside the same update so a replay finds nothing to match.
4. In the same operation, clear `currentRefreshToken` so every existing session
   is revoked.

Align the minimum length with whatever the signup flow enforces so the two
cannot diverge. ASVS 4.0 section 2.1 recommends a 12-character minimum with no
composition rules.

**Verification:** complete a reset, then replay the same link. The second attempt
must fail.

---

## 6. MEDIUM: Unbounded in-memory upload into a vulnerable parser

**OWASP:** A05:2021 Security Misconfiguration, API4:2023 Unrestricted Resource Consumption
**CWE:** CWE-400 Uncontrolled Resource Consumption, CWE-434 Unrestricted Upload of File with Dangerous Type

**Location:** [server-side/src/routes/certificateV2.route.ts:22](../../server-side/src/routes/certificateV2.route.ts#L22)

```ts
const upload = multer({ storage: multer.memoryStorage() });
```

**Why this matters**

No `limits`, no `fileFilter`. The entire upload is buffered into process memory
and then handed to `XLSX.read`
([certificateV2.controller.ts:189](../../server-side/src/controllers/certificateV2.controller.ts#L189)).

Two compounding problems:

- A large upload exhausts the Node heap and takes the API down for everyone.
- The `xlsx` package has two unpatched advisories with **no fix available on the
  npm registry**: prototype pollution (GHSA-4r6h-8v6p-xvw6) and ReDoS
  (GHSA-5pgg-2g8v-p4x9). Feeding it unbounded, unfiltered input is the worst
  case for both.

Every other upload route in the codebase already does this correctly, with
`limits: { fileSize: 5 * 1024 * 1024 }` and a MIME allowlist. See
[recruitment.route.ts:64-76](../../server-side/src/routes/recruitment.route.ts#L64-L76)
and [merchandise.v2.route.ts:61-73](../../server-side/src/routes/merchandise.v2.route.ts#L61-L73).
This route is the outlier.

**Fix**

```ts
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV or Excel files are allowed"));
    }
  },
});
```

Then reduce exposure to the unpatched parser itself:

1. **Prefer CSV.** The CSV branch at
   [certificateV2.controller.ts:203-210](../../server-side/src/controllers/certificateV2.controller.ts#L203-L210)
   needs no third-party parser. Consider accepting CSV only and asking admins to
   export from Excel.
2. If XLSX must stay, migrate to the vendor-published build. SheetJS no longer
   publishes patched releases to npm; 0.20.x is distributed from
   `https://cdn.sheetjs.com`. This changes the install source, so it is a
   deliberate maintainer decision, which is why it is not applied here.
3. Cap the row count after parsing before iterating.

**Tracking:** these two advisories are recorded as time-boxed accepted risks in
[.github/security/sca-allowlist.json](../../.github/security/sca-allowlist.json)
with a review date of 2026-12-31. The SCA pipeline will start failing again on
that date if they are still unresolved.

---

## 7. MEDIUM: Mass assignment on certificate templates

**OWASP:** A08:2021 Software and Data Integrity Failures, API6:2023
**CWE:** CWE-915 Improperly Controlled Modification of Dynamically-Determined Object Attributes

**Location:** [server-side/src/services/certificateV2.service.ts:104-121](../../server-side/src/services/certificateV2.service.ts#L104-L121)

```ts
static async createCertificateTemplate(data: ICertificateTemplate) {
  const template = new CertificateTemplate({ ...data, isActive: true });
  return await template.save();
}

static async updateCertificateTemplate(templateId: string, data: Partial<ICertificateTemplate>) {
  const template = await CertificateTemplate.findByIdAndUpdate(
    templateId,
    { $set: data },     // raw req.body
    { new: true, runValidators: true }
  );
}
```

**Why this matters**

`data` is `req.body`, passed through from
[certificateV2.controller.ts:120](../../server-side/src/controllers/certificateV2.controller.ts#L120)
and [:136](../../server-side/src/controllers/certificateV2.controller.ts#L136)
with no field selection. The caller controls every schema field, including
`ejsRelativePath`, which is the input to [finding 3](#3-high-path-traversal-into-ejs-template-rendering).
`$set` with an unfiltered object also lets a caller write fields the UI never
exposes.

The `TypeScript` parameter type gives no protection here: it is erased at
runtime, and the value is whatever JSON arrived on the wire.

**Fix**

Validate and narrow at the boundary with zod, which is already a dependency and
already used elsewhere in this codebase
([certificateV2.service.ts:229](../../server-side/src/services/certificateV2.service.ts#L229)
calls `CertificateDataSchema.parse`).

```ts
const CertificateTemplateInput = z.object({
  name: z.string().min(1).max(120),
  ejsRelativePath: z
    .string()
    .regex(/^[\w\-./]+\.ejs$/, "Invalid template path")
    .refine((p) => !p.includes(".."), "Invalid template path"),
  defaultSignees: z.array(SigneeSchema).optional(),
  defaultImages: z.record(z.string()).optional(),
  defaultFonts: z.record(z.string()).optional(),
});

static async createCertificateTemplate(raw: unknown) {
  const data = CertificateTemplateInput.parse(raw);
  return await new CertificateTemplate({ ...data, isActive: true }).save();
}
```

Use `CertificateTemplateInput.partial()` for the update path. Apply the same
treatment anywhere else `req.body` is spread into a model or a `$set`.

---

## 8. MEDIUM: Predictable object storage keys

**OWASP:** A02:2021 Cryptographic Failures
**CWE:** CWE-330 Use of Insufficiently Random Values, CWE-340 Generation of Predictable Identifiers

**Location**
- [server-side/src/routes/recruitment.route.ts:58-60](../../server-side/src/routes/recruitment.route.ts#L58-L60)
- [server-side/src/routes/eventsV2.route.ts:70](../../server-side/src/routes/eventsV2.route.ts#L70)
- [server-side/src/routes/merchandise.v2.route.ts:58](../../server-side/src/routes/merchandise.v2.route.ts#L58)

```ts
`recruitment/${positionId}/resume/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`
```

**Why this matters**

`Math.random()` is not a cryptographic PRNG. V8 uses xorshift128+, whose internal
state can be recovered from a modest number of observed outputs, after which all
past and future values in that batch are computable. `Date.now()` is
approximately known because the applicant sees the submission time. `positionId`
is public.

On its own this is a weak identifier. Combined with
[finding 2](#2-high-unauthenticated-arbitrary-object-read-from-the-r2-bucket),
which allows anonymous reads by key, it becomes the difference between "PII is
theoretically exposed" and "PII is enumerable".

**Fix**

```ts
import { randomUUID } from "node:crypto";

key: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const positionId = req.params.id ?? "unknown";
  cb(null, `recruitment/${positionId}/resume/${randomUUID()}${ext}`);
},
```

Apply the same change to the event and merchandise key generators. Note that
unguessable keys are a defence-in-depth measure, not an access control. Fix
[finding 2](#2-high-unauthenticated-arbitrary-object-read-from-the-r2-bucket)
regardless.

Also sanitise `path.extname(file.originalname)` rather than trusting it, since
the original filename is attacker-controlled.

---

## 9. MEDIUM: Missing rate limits on unauthenticated endpoints

**OWASP:** A04:2021 Insecure Design, API4:2023 Unrestricted Resource Consumption
**CWE:** CWE-307 Improper Restriction of Excessive Authentication Attempts

**Location:** [server-side/src/routes/index.v2.route.ts:14-20](../../server-side/src/routes/index.v2.route.ts#L14-L20)

```ts
router.post("/login", loginLimiter, loginV2Controller);        // limited
router.post("/register", registerController);                  // NOT limited
router.post("/student/forgot-password", forgotPasswordController);   // NOT limited
router.post("/student/reset-password/:token", resetPasswordController); // NOT limited
```

**Why this matters**

`signupLimiter` exists in
[limiter.util.ts:25](../../server-side/src/util/limiter.util.ts#L25) but is only
applied on `/api/v2/auth/signup`. The routes above are all unauthenticated and
all unthrottled:

- `/register`: unlimited account creation, database and email quota abuse.
- `/student/forgot-password`: unlimited password reset emails. There is a
  per-email daily cap of 2 at
  [index.v2.controller.ts:165-170](../../server-side/src/controllers/index.v2.controller.ts#L165-L170),
  but it runs *after* the user lookup, so the enumeration oracle in
  [finding 10](#10-medium-account-enumeration-on-password-reset) is unthrottled,
  and an attacker can still cycle through many different addresses.
- `/student/reset-password/:token`: unlimited token guessing.

There is also no application-wide limiter in
[index.ts](../../server-side/src/index.ts). Every non-auth endpoint is unbounded.

**Fix**

Apply the existing limiters, and add a global backstop:

```ts
// server-side/src/routes/index.v2.route.ts
import loginLimiter, { signupLimiter, passwordResetLimiter } from "../util/limiter.util";

router.post("/register", signupLimiter, registerController);
router.post("/student/forgot-password", passwordResetLimiter, forgotPasswordController);
router.post("/student/reset-password/:token", passwordResetLimiter, resetPasswordController);
```

```ts
// server-side/src/index.ts, after app.set("trust proxy", 1)
import rateLimit from "express-rate-limit";

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
```

Two operational notes:

- `app.set("trust proxy", 1)` is already set at
  [index.ts:69](../../server-side/src/index.ts#L69), which is required for
  `req.ip` to be correct behind the hosting proxy. Confirm the value matches the
  actual number of proxies, otherwise clients can spoof `X-Forwarded-For` and
  evade every IP-based limit.
- The limiters use in-memory state, so each instance counts separately. If the
  API is ever scaled beyond one instance, move to a shared store such as
  `rate-limit-redis`.

Also remove the unused `indexRoutes` import at
[index.ts:23](../../server-side/src/index.ts#L23). The module is imported but
never mounted, and it contains an unthrottled `/login`
([index.route.ts:15](../../server-side/src/routes/index.route.ts#L15)) that
would become live the moment someone adds an `app.use` for it.

---

## 10. MEDIUM: Account enumeration on password reset

**OWASP:** A07:2021 Identification and Authentication Failures
**CWE:** CWE-204 Observable Response Discrepancy

**Location:** [server-side/src/controllers/index.v2.controller.ts:127-183](../../server-side/src/controllers/index.v2.controller.ts#L127-L183)

**Why this matters**

The handler returns HTTP 404 when no matching user is found and HTTP 200 when
one is. That difference alone confirms whether a given `(email, id_number)` pair
exists. The response body reinforces it:

```
"The id number you entered is found but appears to be the email is incorrect."
```

This lets an attacker confirm which students are enrolled and map ID numbers to
email addresses, which feeds targeted phishing. The lookup also runs before the
daily cap, so it can be probed repeatedly.

Note the branches at lines 146-163 are partly unreachable: `else if (!getUser)`
already covers the case that `else if (!userAdmin)` was meant to handle, so the
admin-specific branch never executes. Worth cleaning up while fixing this.

**Fix**

Return an identical response for every outcome, and do the work asynchronously.

```ts
export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const genericResponse = {
      message:
        "If that account exists, a password reset email has been sent. Please check your inbox.",
    };

    const user =
      (await Admin.findOne({ email: req.body.email, id_number: req.body.id_number })) ??
      (await Student.findOne({ email: req.body.email, id_number: req.body.id_number }));

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetCount = await emailService.countBySubtypeToday(
      req.body.email,
      "password_reset"
    );
    if (resetCount >= 2) {
      return res.status(200).json(genericResponse);   // same shape, no oracle
    }

    const token = jwt.sign({ userId: user._id }, token_key, { expiresIn: "10m" });
    await forgotPasswordMail(req.body.email, url, token);

    return res.status(200).json(genericResponse);
  }
);
```

Pair this with the rate limit from
[finding 9](#9-medium-missing-rate-limits-on-unauthenticated-endpoints).
Response timing still differs slightly because the "user exists" path sends an
email; if that matters, queue the send rather than awaiting it.

Apply the same principle to login: the v2 login already uses a single
`AuthErrorCodes.InvalidCredentials` for both unknown user and bad password
([authV2.controller.ts:114,120](../../server-side/src/controllers/authV2.controller.ts#L114-L120)),
which is correct. Keep it that way.

---

## 11. MEDIUM: Authentication outcome written to application logs

**OWASP:** A09:2021 Security Logging and Monitoring Failures
**CWE:** CWE-532 Insertion of Sensitive Information into Log File

**Location:** [server-side/src/controllers/authV2.controller.ts:120](../../server-side/src/controllers/authV2.controller.ts#L120)

```ts
const passwordMatch = await bcrypt.compare(password, admin.password);
console.log("Password match:", passwordMatch); // Debugging line
```

**Why this matters**

Debug instrumentation left in the admin login path. It writes the result of every
admin credential check to stdout, which the hosting platform captures and
retains. Anyone with log access, including third-party log aggregation, can
observe admin authentication activity and correlate successful logins.

CONTRIBUTING.md states: "Do not log or expose sensitive data." This is a direct
violation and the comment shows it was never meant to ship.

**Fix**

Delete the line.

Then prevent recurrence:

1. Add `no-console` to the server-side ESLint config, with an allowance for
   `console.error` and `console.warn` if the codebase relies on them, or route
   everything through a logger.
2. Introduce a structured logger with levels and an explicit redaction list
   covering `password`, `token`, `authorization`, `cookie`, and
   `currentRefreshToken`.
3. Grep for other debug leftovers before release:
   `grep -rn "Debugging line\|console.log" server-side/src`.

---

## 12. MEDIUM: Internal error messages returned to clients

**OWASP:** A05:2021 Security Misconfiguration, A09:2021
**CWE:** CWE-209 Generation of Error Message Containing Sensitive Information

**Location**
- [server-side/src/middlewares/global.error.middleware.ts:17-24](../../server-side/src/middlewares/global.error.middleware.ts#L17-L24)
- Repeated throughout [certificateV2.controller.ts](../../server-side/src/controllers/certificateV2.controller.ts) (lines 129, 145, 166, 226, 251, 281, 294, 303, 318)

```ts
const response: any = {
  status: err.statusCode || 500,
  message: err.message || "Internal Server Error",
  ...
};
res.status(response.status).json(response);
```

**Why this matters**

Any unexpected error, including Mongoose validation errors, MongoDB driver
errors, and filesystem errors, has its raw `message` serialised to the client.
These messages routinely disclose collection names, field names, absolute
filesystem paths, and query structure. Combined with
[finding 3](#3-high-path-traversal-into-ejs-template-rendering), error text
becomes the read channel for the traversal.

The per-controller `catch (error: any) { res.status(500).json({ message: error.message }) }`
pattern has the same effect and additionally flattens real HTTP status codes
into 500.

**Fix**

Distinguish errors you raised deliberately from errors that escaped.

```ts
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isExpectedRefreshMiss =
    err?.code === "AUTH_005" && req.path?.includes("/auth/refresh");
  if (!isExpectedRefreshMiss) {
    logServerError(err, req);   // full detail stays server-side
  }

  const status = err.statusCode || 500;

  // Only messages from errors we raised on purpose are safe to echo back.
  const isOperational = err.isOperational === true || status < 500;

  res.status(status).json({
    status,
    message: isOperational ? err.message : "Internal Server Error",
    ...(err.data !== undefined && isOperational && { data: err.data }),
  });
};
```

Set `isOperational = true` on `AppError` and `AuthError`. Then replace the
per-controller catch blocks with `next(error)` so everything funnels through the
one handler. `express-async-errors` is already installed
([index.ts:11](../../server-side/src/index.ts#L10)), so async handlers can simply
throw.

---

## 13. MEDIUM: Password hashes and refresh tokens are selectable by default

**OWASP:** A02:2021 Cryptographic Failures
**CWE:** CWE-200 Exposure of Sensitive Information

**Location**
- [server-side/src/models/student.model.ts:15-18](../../server-side/src/models/student.model.ts#L15-L18)
- [server-side/src/models/admin.model.ts:8](../../server-side/src/models/admin.model.ts#L8) and [:20](../../server-side/src/models/admin.model.ts#L20)

```ts
password: { type: String, required: true },
currentRefreshToken: { type: String, default: null },
```

**Why this matters**

Neither field is marked `select: false`, and no query in the codebase projects
them out. Every `find`, `findOne`, and `findById` on these models returns the
bcrypt hash and the live refresh token. Today the login path is safe because
`toUserResponse`
([authV2.controller.ts:45-72](../../server-side/src/controllers/authV2.controller.ts#L45-L72))
builds an explicit DTO, which is the right pattern. But that safety depends on
every current and future handler remembering to do the same. Any handler that
returns a raw document leaks credentials.

`currentRefreshToken` is stored in plaintext
([authV2.controller.ts:195-203](../../server-side/src/controllers/authV2.controller.ts#L195-L203)).
Read access to the database, a backup, or a log dump yields directly usable
long-lived session tokens.

**Fix**

Make the secure default structural rather than a convention:

```ts
password: { type: String, required: true, select: false },
currentRefreshToken: { type: String, default: null, select: false },
```

Then explicitly opt in where the value is genuinely needed:

```ts
const admin = await Admin.findOne({ id_number }).select("+password");
```

The call sites to update are the bcrypt comparisons at
[authV2.controller.ts:119](../../server-side/src/controllers/authV2.controller.ts#L119)
and [:153](../../server-side/src/controllers/authV2.controller.ts#L153),
[index.controller.ts:39](../../server-side/src/controllers/index.controller.ts#L39)
and [:54](../../server-side/src/controllers/index.controller.ts#L54), and
[eventV2.controller.ts:2207](../../server-side/src/controllers/eventV2.controller.ts#L2207)
and [:2830](../../server-side/src/controllers/eventV2.controller.ts#L2830), plus
the refresh-token comparison in the refresh flow.

Separately, store a SHA-256 hash of the refresh token instead of the token
itself. Rotation comparison works identically against the hash, and a database
disclosure no longer yields usable sessions.

Add a `toJSON` transform on both schemas that deletes `password` and
`currentRefreshToken` as a second layer, so an accidental `res.json(doc)` cannot
leak them.

---

## 14. MEDIUM: Stored XSS in the legacy client post feed

**OWASP:** A03:2021 Injection
**CWE:** CWE-79 Improper Neutralization of Input During Web Page Generation

**Location:** [client-side/src/pages/students/dashboard/PostCard.jsx:85](../../client-side/src/pages/students/dashboard/PostCard.jsx#L85)

```jsx
const getDescription = () => {
  switch (type) {
    ...
    default:
      return description.replace(/\n/g, "<br />");
  }
};
...
<p dangerouslySetInnerHTML={{ __html: getDescription() }} />
```

**Why this matters**

`description` comes from the social feed payload and is injected as raw HTML.
The only transformation is newline to `<br />`; no escaping, no sanitisation. Any
markup in the upstream post body executes in the student's browser. An
`<img src=x onerror=...>` in a feed item is enough.

Scope note: this file lives in `client-side/`, the legacy JavaScript frontend,
which no deployment workflow builds. `client-side-ts/` is the deployed frontend
and handles this correctly. The finding is real but currently unreachable in
production. It becomes live the moment the legacy app is deployed or the
component is ported.

The other `dangerouslySetInnerHTML` usage, at
[client-side-ts/src/components/ui/chart.tsx:83](../../client-side-ts/src/components/ui/chart.tsx#L83),
injects generated CSS from a typed local config rather than remote content and is
not exploitable as written.

**Fix**

Preferred, no dependency:

```jsx
// Render text as text; let CSS handle newlines.
<p className="... whitespace-pre-line">{getDescription()}</p>
```

with `getDescription` returning the raw string and no `<br />` substitution.

If HTML really must be rendered, sanitise first:

```jsx
import DOMPurify from "dompurify";

<p
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(getDescription(), {
      ALLOWED_TAGS: ["br", "b", "i", "em", "strong", "a"],
      ALLOWED_ATTR: ["href", "target", "rel"],
    }),
  }}
/>
```

Given the legacy app is not deployed, the maintainers should also decide whether
to keep `client-side/` in the repository at all. It carries its own dependency
tree and its own vulnerabilities while shipping to no one.

---

## 15. LOW: JWT verification without an algorithm allowlist

**OWASP:** A02:2021 Cryptographic Failures
**CWE:** CWE-757 Selection of Less-Secure Algorithm During Negotiation

**Location**
- [server-side/src/util/jwt.util.ts:112](../../server-side/src/util/jwt.util.ts#L112)
- [server-side/src/util/jwt.util.ts:138](../../server-side/src/util/jwt.util.ts#L138)

```ts
const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
```

**Why this matters**

No `algorithms` option is supplied, so the library accepts whatever the token's
header declares among the algorithms valid for the key type. `jsonwebtoken` v9
already refuses `alg: none` when a secret is provided, so this is not currently
exploitable. It is a hardening gap: the protection depends on library defaults
rather than on an explicit application decision, and it would silently weaken if
the project ever moved to asymmetric keys.

**Fix**

```ts
const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
  algorithms: ["HS256"],
  issuer: "psits-ucmain",
  audience: "psits-web",
});
```

Set the matching `issuer` and `audience` in `signAccessToken` and
`signRefreshToken`. Binding both makes an access token unusable where a refresh
token is expected even if the secrets were ever misconfigured to match, which
complements the existing `tokenType` check.

Apply the same options in
[custom_authenticate_token.ts](../../server-side/src/middlewares/custom_authenticate_token.ts)
and in the password-reset verification at
[index.v2.controller.ts:191](../../server-side/src/controllers/index.v2.controller.ts#L191).

---

## 16. LOW: Chromium sandbox disabled for PDF rendering

**OWASP:** A05:2021 Security Misconfiguration
**CWE:** CWE-250 Execution with Unnecessary Privileges

**Location:** [server-side/src/mail_template/utils/generate-pdf-from-ejs.ts:28-33](../../server-side/src/mail_template/utils/generate-pdf-from-ejs.ts#L28-L33)

```ts
browserInstance = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
```

**Why this matters**

`--no-sandbox` removes Chromium's process isolation. The sandbox is the primary
containment for renderer compromises. With it off, a renderer exploit runs
directly with the Node process's privileges.

The rendered content is not fully static: it includes `student_name`, event
fields, and a template path influenced by
[finding 3](#3-high-path-traversal-into-ejs-template-rendering). The flag is
usually added to work around running as root in a container, which is itself the
thing worth fixing.

**Fix**

Run the container as a non-root user and drop the flags:

```dockerfile
RUN groupadd -r psits && useradd -r -g psits -G audio,video psits \
    && mkdir -p /home/psits/Downloads \
    && chown -R psits:psits /home/psits
USER psits
```

```ts
browserInstance = await puppeteer.launch({ headless: true });
```

If the sandbox genuinely cannot be enabled in the hosting environment, prefer the
`BROWSERLESS_URL` path already supported at
[generate-pdf-from-ejs.ts:26-27](../../server-side/src/mail_template/utils/generate-pdf-from-ejs.ts#L26-L27),
which moves rendering into an isolated service. Document the decision either way.

Note also that `browserInstance` is a module-level singleton that is never closed
on shutdown. Not a security issue, but worth handling alongside this change.

---

## 17. LOW: Response header injection via certificate filename

**OWASP:** A03:2021 Injection
**CWE:** CWE-113 Improper Neutralization of CRLF Sequences in HTTP Headers

**Location**
- [server-side/src/controllers/certificateV2.controller.ts:276](../../server-side/src/controllers/certificateV2.controller.ts#L276)
- [server-side/src/controllers/certificateV2.controller.ts:291](../../server-side/src/controllers/certificateV2.controller.ts#L291)
- Filename constructed at [certificateV2.service.ts:237](../../server-side/src/services/certificateV2.service.ts#L237)

```ts
res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
// fileName = `${parsedData.student_name}-CERT.pdf`.toUpperCase()
```

**Why this matters**

`student_name` is built from `first_name` and `last_name` in the database and
interpolated into a quoted header value with no escaping. A name containing a
double quote breaks out of the quoting and can append header parameters. Node
rejects raw CR/LF in header values, so full response splitting is blocked, but
the filename is still attacker-influenced and non-ASCII names will be mangled.

**Fix**

Use the framework helper, which handles quoting and RFC 5987 encoding:

```ts
res.setHeader("Content-Type", "application/pdf");
return res.status(200).attachment(fileName).send(buffer);
```

Or sanitise explicitly before interpolating:

```ts
const safeName = fileName.replace(/[^\w.\-]/g, "_");
res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
```

---

## 18. LOW: Request hangs on database error in legacy auth middleware

**OWASP:** A04:2021 Insecure Design
**CWE:** CWE-703 Improper Check or Handling of Exceptional Conditions

**Location:** [server-side/src/middlewares/custom_authenticate_token.ts:44-47](../../server-side/src/middlewares/custom_authenticate_token.ts#L44-L47), and the same shape at lines 87-90 and 139-142 and 153-156

```ts
} catch (error) {
  console.error(error);
}
```

**Why this matters**

If the user lookup throws, the catch block logs and returns. It never calls
`next()`, never calls `next(error)`, and never sends a response. The request
hangs until the client or proxy times out, holding a connection and a socket. A
condition that makes these lookups fail turns into connection exhaustion.

**Fix**

```ts
} catch (error) {
  return next(error);
}
```

`express-async-errors` is already loaded, so the global handler will produce a
proper 500.

Longer term, these three middlewares duplicate the same token-extraction logic
found in [authV2.middleware.ts](../../server-side/src/middlewares/authV2.middleware.ts).
Once the v1 routes are retired, delete this file rather than maintaining two
authentication paths.

---

## 19. LOW: Transport and browser hardening gaps

**OWASP:** A05:2021 Security Misconfiguration

**Location:** [server-side/src/index.ts:54-58](../../server-side/src/index.ts#L54-L58), [server-side/src/util/cookie.util.ts:46-51](../../server-side/src/util/cookie.util.ts#L46-L51)

Three smaller items, grouped:

**a. `crossOriginResourcePolicy` disabled**

```ts
app.use(helmet({ crossOriginResourcePolicy: false }));
```

This was presumably needed so the frontend origin could load images from the API.
Rather than switching the protection off entirely, scope it:

```ts
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
```

That still sets the header, with an explicit value, instead of omitting it.

**b. No Content Security Policy for served content**

Helmet's default CSP is active, but the API serves static assets from
[index.ts:71](../../server-side/src/index.ts#L72) and streams stored objects with
attacker-influenced content types (see
[finding 2](#2-high-unauthenticated-arbitrary-object-read-from-the-r2-bucket)).
Confirm the default CSP is not being weakened and that stored objects are served
with a restrictive `Content-Security-Policy: default-src 'none'`.

**c. `SameSite=Lax` refresh cookie with a cross-origin frontend**

```ts
res.cookie(REFRESH_COOKIE_NAME, token, {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax",
  path: "/api/v2/auth",
  maxAge,
});
```

The cookie flags are otherwise good: `httpOnly`, `secure` in production, and a
narrow `path`. But CORS is configured with `credentials: true` against separate
frontend origins ([index.ts:60-67](../../server-side/src/index.ts#L60-L67)),
which means the frontend is cross-site relative to the API. A `SameSite=Lax`
cookie is not sent on cross-site XHR, so either the deployment is same-site in
practice, or refresh is silently relying on something else.

Confirm which. If the frontend really is cross-site, this must become
`sameSite: "none"`, which **requires** `secure: true` unconditionally and
reintroduces CSRF exposure that the narrow `path` only partly mitigates. In that
case add a CSRF defence on the refresh endpoint, such as requiring the existing
`X-Refresh-Request` header (already in the CORS allowlist) and rejecting requests
without it, since custom headers cannot be set cross-origin without a preflight.

---

## Appendix A: Dependency scanning (SCA)

SCA is handled separately from this report by the pipeline added in
[.github/workflows/sca.yml](../../.github/workflows/sca.yml). Unlike the findings
above, dependency issues **were** remediated. Recorded here for completeness.

| Module | Before | After | Notes |
| --- | --- | --- | --- |
| `.` (root) | 3 moderate | 0 | `qs` pinned via `overrides` |
| `server-side` | 2 high, 3 moderate | 2 high (accepted) | `multer` upgraded, `qs` pinned |
| `client-side-ts` | 2 high | 0 | `npm audit fix` |
| `client-side` | 1 critical, 12 high, 6 moderate, 2 low | 2 moderate (accepted) | `swiper` 11 to 12.2.0 |

Four advisories remain as time-boxed accepted risks in
[.github/security/sca-allowlist.json](../../.github/security/sca-allowlist.json),
each with a reason, an owner, and a 2026-12-31 review date:

- `xlsx` GHSA-4r6h-8v6p-xvw6 and GHSA-5pgg-2g8v-p4x9. No patched release exists
  on the npm registry. See [finding 6](#6-medium-unbounded-in-memory-upload-into-a-vulnerable-parser)
  for the migration path and the compensating controls to apply first.
- `react-router` GHSA-wrjc-x8rr-h8h6 and GHSA-337j-9hxr-rhxg in `client-side`
  only. The fix requires react-router-dom 7, a breaking major, in a legacy app
  that no workflow deploys.

The gate fails on **high and above**, so these expiries are enforced: the
pipeline turns red on 2026-12-31 if they have not been resolved or re-reviewed.

## Appendix B: What this review did not cover

Stated plainly so the gaps are not mistaken for clean results.

- **Static analysis only.** No application was run, no payload was executed, and
  nothing was tested against a live environment. Findings are reasoned from
  source. Severity ratings assume the code paths are reachable in production as
  configured.
- **No infrastructure review.** MongoDB Atlas network rules, R2 bucket policies
  and public access settings, Vercel project configuration, and secret storage
  were not examined. Given
  [finding 2](#2-high-unauthenticated-arbitrary-object-read-from-the-r2-bucket),
  the R2 bucket policy deserves review on its own.
- **No dynamic testing.** Authorization matrices, session handling under
  concurrency, and business logic flaws such as order or payment manipulation
  need DAST or manual penetration testing.
- **Partial coverage of large controllers.**
  [eventV2.controller.ts](../../server-side/src/controllers/eventV2.controller.ts)
  exceeds 3,000 lines and was reviewed at its security-relevant entry points
  rather than exhaustively.
- **The Noetix AI integration** (`/api/v2/chat`, `automation.service.ts`, the
  tool registry in `chat-tool.types.ts`) was not reviewed in depth. LLM tool-
  calling with database write access warrants its own assessment against the
  OWASP Top 10 for LLM Applications, particularly prompt injection reaching
  privileged tools.
- **No secret scanning history review.** Given
  [finding 1](#1-critical-hardcoded-fallback-jwt-signing-secret), run a git
  history scan (`gitleaks`, `trufflehog`) to confirm no real secrets were
  committed previously. The repository is public.

---

## Recommended remediation order

1. **[Finding 1](#1-critical-hardcoded-fallback-jwt-signing-secret)** now, plus rotate `JWT_SECRET` everywhere. It is a one-line change guarding total account takeover.
2. **[Finding 2](#2-high-unauthenticated-arbitrary-object-read-from-the-r2-bucket)** next. Student PII is exposed with no authentication.
3. **[Findings 3](#3-high-path-traversal-into-ejs-template-rendering)** and **[4](#4-high-any-student-can-download-any-other-students-certificate)**, both in the certificate feature. Fix together with [7](#7-medium-mass-assignment-on-certificate-templates).
4. **[Findings 5](#5-medium-password-reset-tokens-are-replayable-and-unconstrained), [9](#9-medium-missing-rate-limits-on-unauthenticated-endpoints), [10](#10-medium-account-enumeration-on-password-reset)**, the authentication cluster. One PR.
5. **[Findings 11](#11-medium-authentication-outcome-written-to-application-logs), [12](#12-medium-internal-error-messages-returned-to-clients), [13](#13-medium-password-hashes-and-refresh-tokens-are-selectable-by-default)**, information disclosure. Cheap, high value.
6. **[Findings 6](#6-medium-unbounded-in-memory-upload-into-a-vulnerable-parser), [8](#8-medium-predictable-object-storage-keys), [14](#14-medium-stored-xss-in-the-legacy-client-post-feed)** and the LOW items as normal backlog.

---

*Generated 2026-09-10 against commit `e425ba0f`. No code was modified in the
production applications as part of producing this report. Questions:
psitsucmain2025@gmail.com*
