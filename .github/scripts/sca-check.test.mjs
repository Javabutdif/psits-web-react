/**
 * Tests for the SCA gate's allowlist contract.
 *
 * Run with:  node --test .github/scripts/
 *
 * These cover the fail-closed properties that the gate depends on: a malformed
 * allowlist must not suppress anything, and an exception must stop applying
 * once it expires or once the advisory's severity changes.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  validateAllowlist,
  matchException,
  extractFindings,
  atOrAbove,
  isCalendarDate,
} from "./sca-check.mjs";

const TODAY = "2026-09-10";

/** A fully valid exception; individual tests override one field at a time. */
const baseException = () => ({
  ghsa: "GHSA-4r6h-8v6p-xvw6",
  package: "xlsx",
  modules: ["server-side"],
  severity: "high",
  reason:
    "No patched release exists on the npm registry for this advisory at review time.",
  owner: "psitsucmain2025@gmail.com",
  expires: "2026-12-31",
});

const baseFinding = () => ({
  module: "server-side",
  package: "xlsx",
  severity: "high",
  ghsa: "GHSA-4r6h-8v6p-xvw6",
  title: "Prototype Pollution in sheetJS",
  url: "https://github.com/advisories/GHSA-4r6h-8v6p-xvw6",
});

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

test("accepts a fully specified exception", () => {
  const { exceptions, errors } = validateAllowlist({
    exceptions: [baseException()],
  });
  assert.equal(errors.length, 0);
  assert.equal(exceptions.length, 1);
});

test("accepts an allowlist with no exceptions", () => {
  assert.deepEqual(validateAllowlist({}), { exceptions: [], errors: [] });
  assert.deepEqual(validateAllowlist({ exceptions: [] }), {
    exceptions: [],
    errors: [],
  });
});

for (const field of [
  "ghsa",
  "package",
  "modules",
  "severity",
  "reason",
  "owner",
  "expires",
]) {
  test(`rejects an exception missing "${field}"`, () => {
    const exception = baseException();
    delete exception[field];

    const { exceptions, errors } = validateAllowlist({ exceptions: [exception] });

    assert.equal(exceptions.length, 0, "must not be usable as a suppression");
    assert.equal(errors.length, 1);
    assert.match(errors[0], new RegExp(`"${field}"`));
  });
}

test("rejects a malformed GHSA id", () => {
  const { exceptions, errors } = validateAllowlist({
    exceptions: [{ ...baseException(), ghsa: "CVE-2024-1234" }],
  });
  assert.equal(exceptions.length, 0);
  assert.match(errors[0], /ghsa/);
});

test("rejects an expiry that is not a real calendar date", () => {
  for (const expires of ["2026-13-01", "2026-02-30", "31-12-2026", "soon", ""]) {
    const { exceptions, errors } = validateAllowlist({
      exceptions: [{ ...baseException(), expires }],
    });
    assert.equal(exceptions.length, 0, `"${expires}" must be rejected`);
    assert.match(errors[0], /expires/);
  }
});

test("rejects an unknown module", () => {
  const { exceptions, errors } = validateAllowlist({
    exceptions: [{ ...baseException(), modules: ["not-a-module"] }],
  });
  assert.equal(exceptions.length, 0);
  assert.match(errors[0], /modules/);
});

test("rejects an empty modules array", () => {
  const { exceptions } = validateAllowlist({
    exceptions: [{ ...baseException(), modules: [] }],
  });
  assert.equal(exceptions.length, 0);
});

test("rejects an unknown severity", () => {
  const { exceptions, errors } = validateAllowlist({
    exceptions: [{ ...baseException(), severity: "showstopper" }],
  });
  assert.equal(exceptions.length, 0);
  assert.match(errors[0], /severity/);
});

test("rejects a placeholder reason", () => {
  const { exceptions, errors } = validateAllowlist({
    exceptions: [{ ...baseException(), reason: "wontfix" }],
  });
  assert.equal(exceptions.length, 0);
  assert.match(errors[0], /reason/);
});

test("rejects duplicate entries for the same advisory and module", () => {
  const { exceptions, errors } = validateAllowlist({
    exceptions: [baseException(), baseException()],
  });
  assert.equal(exceptions.length, 1, "only the first entry survives");
  assert.match(errors[0], /duplicate/);
});

test("rejects a non-array exceptions field", () => {
  const { errors } = validateAllowlist({ exceptions: "none" });
  assert.equal(errors.length, 1);
});

test("rejects a non-object allowlist", () => {
  assert.equal(validateAllowlist(null).errors.length, 1);
  assert.equal(validateAllowlist("[]").errors.length, 1);
});

test("one bad entry does not invalidate a good one, but is still reported", () => {
  const good = baseException();
  const bad = { ...baseException(), ghsa: "GHSA-5pgg-2g8v-p4x9" };
  delete bad.owner;

  const { exceptions, errors } = validateAllowlist({ exceptions: [good, bad] });

  assert.equal(exceptions.length, 1);
  assert.equal(errors.length, 1, "the scan must fail on the reported error");
});

// ---------------------------------------------------------------------------
// Suppression behaviour
// ---------------------------------------------------------------------------

test("suppresses a matching, unexpired finding", () => {
  const { exception } = matchException(
    baseFinding(),
    [baseException()],
    TODAY,
  );
  assert.ok(exception);
});

test("stops suppressing once the exception has expired", () => {
  const { exception, rejected } = matchException(
    baseFinding(),
    [{ ...baseException(), expires: "2026-09-09" }],
    TODAY,
  );
  assert.equal(exception, undefined, "an expired exception must not suppress");
  assert.match(rejected.why, /expired/);
});

test("still suppresses on the expiry date itself", () => {
  const { exception } = matchException(
    baseFinding(),
    [{ ...baseException(), expires: TODAY }],
    TODAY,
  );
  assert.ok(exception, "expiry is inclusive of the review date");
});

test("stops suppressing when the advisory severity escalates", () => {
  const { exception, rejected } = matchException(
    { ...baseFinding(), severity: "critical" },
    [baseException()], // reviewed at "high"
    TODAY,
  );
  assert.equal(exception, undefined);
  assert.match(rejected.why, /severity changed/);
});

test("does not suppress a different package with the same advisory", () => {
  const { exception } = matchException(
    { ...baseFinding(), package: "other-pkg" },
    [baseException()],
    TODAY,
  );
  assert.equal(exception, undefined);
});

test("does not suppress the same advisory in an unlisted module", () => {
  const { exception } = matchException(
    { ...baseFinding(), module: "client-side" },
    [baseException()],
    TODAY,
  );
  assert.equal(exception, undefined);
});

test("an empty exception list suppresses nothing", () => {
  const { exception } = matchException(baseFinding(), [], TODAY);
  assert.equal(exception, undefined);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

test("isCalendarDate round-trips real dates only", () => {
  assert.ok(isCalendarDate("2026-12-31"));
  assert.ok(isCalendarDate("2028-02-29"), "leap day is valid");
  assert.ok(!isCalendarDate("2027-02-29"), "not a leap year");
  assert.ok(!isCalendarDate("2026-00-10"));
  assert.ok(!isCalendarDate(20261231));
});

test("atOrAbove compares severities in order", () => {
  assert.ok(atOrAbove("critical", "high"));
  assert.ok(atOrAbove("high", "high"));
  assert.ok(!atOrAbove("moderate", "high"));
});

test("extractFindings reads one row per advisory and ignores string via entries", () => {
  const findings = extractFindings(
    {
      vulnerabilities: {
        xlsx: {
          severity: "high",
          range: "*",
          fixAvailable: false,
          effects: [],
          via: [
            {
              severity: "high",
              title: "Prototype Pollution in sheetJS",
              url: "https://github.com/advisories/GHSA-4r6h-8v6p-xvw6",
              range: "*",
            },
          ],
        },
        // Vulnerable only because of a dependency; reported on that dependency.
        express: { severity: "moderate", via: ["qs"], effects: [] },
      },
    },
    "server-side",
  );

  assert.equal(findings.length, 1);
  assert.equal(findings[0].ghsa, "GHSA-4r6h-8v6p-xvw6");
  assert.equal(findings[0].module, "server-side");
});

test("extractFindings tolerates an empty audit result", () => {
  assert.deepEqual(extractFindings({}, "."), []);
  assert.deepEqual(extractFindings({ vulnerabilities: {} }, "."), []);
});
