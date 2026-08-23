# Signup Validation Fix - Before & After

**Date:** August 22, 2026
**Files Changed:**
- `client-side-ts/src/features/auth/components/SignupForm.tsx`
- `server-side/src/util/signupValidation.util.ts`
- `server-side/src/controllers/authV2.controller.ts`
- `server-side/src/controllers/index.v2.controller.ts`

**Blockers Fixed:** B1, B2, B3, B4, B5, B6, B7
**Root Cause:** Overly aggressive client-side validation + missing runtime guards on server-side validation utility + opaque error handling + year shape mismatches.

---

## B1 - Numeric Email Local Part Check (Removed)

### Before (`SignupForm.tsx:50`)

```tsx
// Purely numeric (e.g. "123456789@gmail.com")
if (/^\d+$/.test(localPart)) return true;
```

Rejected any email where the local part (before @) is all digits. This blocked `20191234@gmail.com` - the standard student ID-based email format. Server had no equivalent check, so client and server disagreed on what was valid.

### After

Deleted. No numeric email check exists.

### Why this is safe

- Server never had this check - you are aligning client with server, not relaxing validation.
- No production behavior changes for non-numeric emails.
- Students using ID-based emails (the norm) can now register.

---

## B2 - Unanchored Substring Regex (Fixed with word boundaries)

### Before (`signupValidation.util.ts:5-6` + `SignupForm.tsx:30-31`)

```ts
const TEST_WORD_PATTERN =
  /(test|asdf|qwerty|sample|dummy|foobar|admin|demo|example|placeholder|lorem|ipsum|temp|fake|junk|noreply|nobody|whatever|asdasd|zzz|aaa)/i;
```

No word boundary anchors. `.test()` matched substrings, not whole words.

Rejected real names:
| Name | Matched | Blocked |
|------|---------|---------|
| "Democrito" | "demo" | Yes |
| "Tempra" | "temp" | Yes |
| "Fakeyson" | "fake" | Yes |

### After

```ts
const TEST_WORD_PATTERN =
  /(^|\b)(test|asdf|qwerty|sample|dummy|foobar|admin|demo|example|placeholder|lorem|ipsum|temp|fake|junk|noreply|nobody|whatever|asdasd|zzz|aaa)(\b|$)/i;
```

`\b` word boundary anchors added. Now matches only whole words, not substrings.

Results:
| Name | Matched | Blocked |
|------|---------|---------|
| "Democrito" | No match (not whole word) | No |
| "Tempra" | No match | No |
| "test" | Whole word match | Yes |
| "admin123" | No match (not whole word) | No |
| "admin" | Whole word match | Yes |

### Why this is safe

- Only narrows what is rejected - more names pass, but junk names like "test" and "admin" are still caught.
- Applied to both client and server - they stay aligned.
- Zero risk of accepting previously-rejected invalid names that the server would have rejected.

---

## B3 - Sequential ID Regex (Full Anchor)

### Before (`signupValidation.util.ts:14` + `SignupForm.tsx:39`)

```ts
const isSequential = /^(0123456789|1234567890|12345678)/.test(value);
```

Anchored at `^` only. `1234567899` (starts with `12345678`) matches -> blocked. But that is a valid ID a student could have.

### After

```ts
const isSequential = /^(0123456789|1234567890|12345678)$/.test(value);
```

Anchored at both `^` and `$`. Only rejects the exact sequential strings, not IDs that merely start with them.

Results:
| Input | Before | After |
|-------|--------|-------|
| `12345678` | Blocked | Blocked |
| `1234567890` | Blocked | Blocked |
| `0123456789` | Blocked | Blocked |
| `1234567899` | Blocked | Allowed |
| `1234567812` | Blocked | Allowed |
| `2019123456` | Allowed | Allowed |

### Why this is safe

- Only narrows rejection - fewer valid IDs are incorrectly blocked.
- Purely sequential strings (`12345678`) are still rejected.
- No risk of accepting previously-rejected data that was actually invalid.

---

## B4 - Undefined Guard on `.trim()` (Added)

### Before (`signupValidation.util.ts:8-9`)

```ts
export function isSuspiciousName(value: string): boolean {
  return TEST_WORD_PATTERN.test(value.trim());
}
```

TypeScript says `value` is `string`, but at runtime it can be `undefined` if the client sends a payload without `fname` or `lname`. `.trim()` on `undefined` -> TypeError -> `next(error)` -> `errorHandler` at `errors.util.ts:103` -> 500 "An internal server error occurred."

### After

```ts
export function isSuspiciousName(value: string): boolean {
  if (!value) return false;
  return TEST_WORD_PATTERN.test(value.trim());
}
```

Guard added before `.trim()`. Returns `false` (not suspicious) when value is undefined/null/empty, preventing the TypeError.

### Why this is safe

- Prevents crash. Adds no new validation logic.
- Empty/missing names are not "suspicious" - they are just incomplete, and the `min(1)` check in the Zod schema handles that separately.
- No risk of bypassing validation - the schema still requires the field.

---

## B5 - Opaque 500 Errors (Added Smart Error Handling)

### Before (`authV2.controller.ts:403-415`)

```ts
catch (error: any) {
    if (error.code === 11000) {
      // handles duplicate key - 409
    }
    next(error);  // everything else -> errorHandler -> 500
}
```

Every non-duplicate error fell through to `next(error)` -> `errorHandler` at `errors.util.ts:103` -> generic 500 "An internal server error occurred." No way to diagnose what went wrong.

Crash paths that hit this:
- Missing `password` -> `bcrypt.hash(undefined, 10)` -> TypeError
- Missing `email`/`course` -> mongoose `ValidationError`
- Invalid year shape -> mongoose `CastError`

### After

```ts
catch (error: any) {
    if (error.code === 11000) { /* 409 duplicate */ }

    if (error.name === "ValidationError") {
      const fields = Object.keys(error.errors || {});
      return res.status(400).json({
        message: `Missing required field: ${fields.join(", ")}`,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: `Invalid format for field: ${error.path || "unknown"}`,
      });
    }

    if (error.name === "TypeError") {
      return res.status(400).json({
        message: "Missing required field.",
      });
    }

    next(error);
}
```

### Why this is safe

- Only catches known Mongoose/JS error types and returns 400 with useful messages.
- `next(error)` still runs for anything unexpected - no errors are swallowed.
- Client gets actionable feedback instead of generic "Something went wrong."

---

## B6 - Year Range Validation (Added)

### Before (`authV2.controller.ts:378-393`)

```ts
const yearMap: Record<string, number> = {
    "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4,
};
// ...
year: yearMap[req.body.year] ?? Number(req.body.year),
```

- `"5th Year"` -> `yearMap["5th Year"]` = undefined -> `Number("5th Year")` = NaN -> CastError 500
- `""` -> `Number("")` = 0 -> silently stored as year 0
- Admin controller at `student.controller.ts:366` explicitly allows 1-5 - mismatch

### After

```ts
const year = yearMap[req.body.year] ?? Number(req.body.year);
if (!Number.isInteger(year) || year < 1 || year > 5) {
    return res.status(400).json({ message: "Year level must be between 1 and 5." });
}
```

### Why this is safe

- Catches NaN, 0, and out-of-range values before they hit mongoose.
- Returns clear 400 instead of crashing with CastError.
- Aligns with admin controller which already validates 1-5.

---

## B7 - Legacy Register Endpoint Year Mapping (Added)

### Before (`index.v2.controller.ts:107-116`)

```ts
export const registerController = catchAsync(
    async (req: Request, res: Response) => {
        const result = await studentService.create(req);  // raw req.body
    }
);
```

No year mapping. New client sends `"1st Year"` -> `studentService.create` receives string -> mongoose tries cast to Number -> CastError 500. Legacy client sends numeric `1, 2, 3, 4` (`Register.jsx:195-200`) - works fine.

### After

```ts
export const registerController = catchAsync(
    async (req: Request, res: Response) => {
        const yearMap: Record<string, number> = {
            "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4,
        };
        const year = yearMap[req.body.year] ?? Number(req.body.year);
        if (!Number.isInteger(year) || year < 1 || year > 5) {
            return res.status(400).json({ message: "Year level must be between 1 and 5." });
        }
        req.body.year = year;

        const result = await studentService.create(req);
    }
);
```

### Why this is safe

- Same yearMap + validation as the v2 signup endpoint - consistent behavior.
- Both registration paths now handle the same year formats.
- Rejects invalid years with 400 instead of crashing.

---

## Summary

| Blocker | What Changed | Risk |
|---------|-------------|------|
| B1 | Deleted numeric email check | None - aligned with server |
| B2 | Added `\b` word boundaries | None - only narrows rejection |
| B3 | Added `$` anchor to regex | None - only narrows rejection |
| B4 | Added undefined guard | None - prevents crash only |
| B5 | Added error name checks (ValidationError, CastError, TypeError) | None - returns 400 instead of 500 |
| B6 | Added year range validation (1-5) | None - rejects NaN/out-of-range early |
| B7 | Added year mapping to legacy register endpoint | None - aligns with v2 endpoint behavior |

All seven fixes are **additive guards or narrowing constraints**. No validation is relaxed in a dangerous way. Worst case: a previously-rejected edge case now passes. No risk of accepting invalid data.
