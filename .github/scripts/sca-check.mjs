#!/usr/bin/env node
/**
 * Software Composition Analysis (SCA) gate for the PSITS UC Main monorepo.
 *
 * Runs `npm audit --json` against every module that ships a lockfile, filters
 * the results through a reviewed allowlist, and fails the build when an
 * un-reviewed advisory at or above the severity threshold is present.
 *
 * The allowlist is fail-closed: a malformed entry fails the scan rather than
 * silently suppressing nothing (or, worse, suppressing more than intended).
 * See validateAllowlist() for the enforced schema.
 *
 * Outputs (written to the directory given by --out, default "sca-report"):
 *   - report.md    human readable summary (job summary + failure notification)
 *   - report.json  machine readable summary
 *
 * Exit codes: 0 = gate passed, 1 = gate failed, 2 = the scan itself broke.
 */

import { exec } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);

// Run through a shell so the npm .cmd shim resolves on Windows as well. The
// command is a fixed literal with no interpolated input, so there is no
// injection surface here.
const AUDIT_COMMAND = "npm audit --json --audit-level=info";

export const SEVERITY_ORDER = ["info", "low", "moderate", "high", "critical"];
export const MODULES = [".", "client-side", "client-side-ts", "server-side"];
const ALLOWLIST_PATH = ".github/security/sca-allowlist.json";
const CONTACT_EMAIL = "psitsucmain2025@gmail.com";

const GHSA_PATTERN = /^GHSA-[23456789cfghjmpqrvwx]{4}-[23456789cfghjmpqrvwx]{4}-[23456789cfghjmpqrvwx]{4}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// A reason short enough to be a placeholder is not a review.
const MIN_REASON_LENGTH = 30;

function parseArgs(argv) {
  const args = { threshold: "high", out: "sca-report" };
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split("=");
    const value = inline ?? argv[i + 1];
    if (flag === "--threshold") {
      args.threshold = value;
      if (inline === undefined) i += 1;
    } else if (flag === "--out") {
      args.out = value;
      if (inline === undefined) i += 1;
    }
  }
  if (!SEVERITY_ORDER.includes(args.threshold)) {
    throw new Error(
      `Unknown --threshold "${args.threshold}". Expected one of: ${SEVERITY_ORDER.join(", ")}`,
    );
  }
  return args;
}

export function atOrAbove(severity, threshold) {
  return SEVERITY_ORDER.indexOf(severity) >= SEVERITY_ORDER.indexOf(threshold);
}

/**
 * True only for a real calendar date in YYYY-MM-DD form. The round-trip check
 * rejects values the Date constructor silently rolls over, such as 2026-02-30.
 */
export function isCalendarDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Enforces the allowlist contract. Every accepted risk must name the advisory,
 * the package, the modules it applies to, the severity it was reviewed at, a
 * reason, an owner, and an expiry date.
 *
 * Returns { exceptions, errors }. A non-empty `errors` must fail the scan:
 * an allowlist we cannot trust is not an allowlist.
 */
export function validateAllowlist(allowlist) {
  const errors = [];

  if (allowlist === null || typeof allowlist !== "object") {
    return { exceptions: [], errors: ["Allowlist must be a JSON object"] };
  }

  const raw = allowlist.exceptions;
  if (raw === undefined) return { exceptions: [], errors };
  if (!Array.isArray(raw)) {
    return { exceptions: [], errors: ['Allowlist "exceptions" must be an array'] };
  }

  const exceptions = [];
  const seen = new Set();

  raw.forEach((exception, index) => {
    const where = `exceptions[${index}]`;
    const problems = [];

    if (exception === null || typeof exception !== "object") {
      errors.push(`${where}: must be an object`);
      return;
    }

    if (!isNonEmptyString(exception.ghsa) || !GHSA_PATTERN.test(exception.ghsa)) {
      problems.push('"ghsa" must be a GHSA id, e.g. GHSA-xxxx-xxxx-xxxx');
    }
    if (!isNonEmptyString(exception.package)) {
      problems.push('"package" is required');
    }
    if (
      !Array.isArray(exception.modules) ||
      exception.modules.length === 0 ||
      !exception.modules.every((m) => MODULES.includes(m))
    ) {
      problems.push(
        `"modules" must be a non-empty array of known modules (${MODULES.join(", ")})`,
      );
    }
    if (!SEVERITY_ORDER.includes(exception.severity)) {
      problems.push(`"severity" must be one of: ${SEVERITY_ORDER.join(", ")}`);
    }
    if (
      !isNonEmptyString(exception.reason) ||
      exception.reason.trim().length < MIN_REASON_LENGTH
    ) {
      problems.push(
        `"reason" is required and must be at least ${MIN_REASON_LENGTH} characters`,
      );
    }
    if (!isNonEmptyString(exception.owner)) {
      problems.push('"owner" is required');
    }
    if (!isCalendarDate(exception.expires)) {
      problems.push('"expires" must be a real date in YYYY-MM-DD form');
    }

    // Two entries for the same advisory in the same module would make it
    // ambiguous which review is authoritative.
    const identity = `${exception.ghsa}|${exception.package}|${
      Array.isArray(exception.modules) ? [...exception.modules].sort().join(",") : ""
    }`;
    if (seen.has(identity)) {
      problems.push("duplicate entry for the same advisory, package and modules");
    }
    seen.add(identity);

    if (problems.length > 0) {
      errors.push(`${where} (${exception.ghsa ?? "unknown"}): ${problems.join("; ")}`);
      return;
    }

    exceptions.push(exception);
  });

  return { exceptions, errors };
}

function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) return { exceptions: [] };
  try {
    return JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
  } catch (error) {
    throw new Error(`Could not parse ${ALLOWLIST_PATH}: ${error.message}`);
  }
}

/**
 * `npm audit --json` exits non-zero whenever it finds anything, so a rejected
 * promise is only a real error when no JSON came back on stdout.
 */
async function runAudit(moduleDir) {
  try {
    const { stdout } = await execAsync(AUDIT_COMMAND, {
      cwd: moduleDir,
      maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(stdout);
  } catch (error) {
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch {
        /* fall through to the throw below */
      }
    }
    throw new Error(`npm audit failed in "${moduleDir}": ${error.message}`);
  }
}

/**
 * Flattens the `vulnerabilities` map from npm audit v2/v3 into one row per
 * advisory, resolving the GHSA identifier out of the `via` chain.
 */
export function extractFindings(auditJson, moduleDir) {
  const findings = [];
  const vulnerabilities = auditJson?.vulnerabilities ?? {};

  for (const [packageName, entry] of Object.entries(vulnerabilities)) {
    // A package can appear only because one of its own dependencies is
    // vulnerable; in that case `via` holds plain strings and the advisory is
    // already reported on the dependency itself, so there is nothing to add.
    const advisories = (entry.via ?? []).filter(
      (via) => typeof via === "object" && via !== null,
    );

    for (const advisory of advisories) {
      const url = advisory.url ?? "";
      const ghsa =
        url.split("/").pop() || `${packageName}:${advisory.title ?? "unknown"}`;
      findings.push({
        module: moduleDir,
        package: packageName,
        severity: advisory.severity ?? entry.severity ?? "info",
        ghsa,
        title: advisory.title ?? "Unknown advisory",
        url,
        vulnerableRange: advisory.range ?? entry.range ?? "",
        isDirect: Boolean(entry.isDirect),
        fixAvailable: entry.fixAvailable ?? false,
        dependents: (entry.effects ?? []).slice(0, 8),
      });
    }
  }

  return findings;
}

function describeFix(fixAvailable) {
  if (fixAvailable === true) return "`npm audit fix`";
  if (!fixAvailable) return "No automated fix";
  const { name, version, isSemVerMajor } = fixAvailable;
  return `${name}@${version}${isSemVerMajor ? " (breaking major)" : ""}`;
}

/**
 * Finds the reviewed exception covering a finding, if any.
 *
 * Returns { exception } on a match, or { rejected } explaining why an entry
 * that names the same advisory does not apply, so the report can say
 * "this was reviewed, but the review no longer holds" instead of going quiet.
 */
export function matchException(finding, exceptions, today) {
  let rejected = null;

  for (const exception of exceptions) {
    if (exception.ghsa !== finding.ghsa) continue;
    if (exception.package !== finding.package) continue;
    if (!exception.modules.includes(finding.module)) continue;

    // An advisory whose severity was raised after the review was written is a
    // different risk than the one that was accepted.
    if (exception.severity !== finding.severity) {
      rejected = {
        exception,
        why: `severity changed from "${exception.severity}" at review time to "${finding.severity}" now`,
      };
      continue;
    }

    // An expired exception stops suppressing, which forces a re-review rather
    // than letting an accepted risk sit forever.
    if (exception.expires < today) {
      rejected = {
        exception,
        why: `exception expired on ${exception.expires}`,
      };
      continue;
    }

    return { exception };
  }

  return { rejected };
}

function renderMarkdown({
  blocking,
  allowed,
  expired,
  allowlistErrors,
  scanErrors,
  threshold,
  meta,
}) {
  const lines = [];
  const failed =
    blocking.length > 0 || scanErrors.length > 0 || allowlistErrors.length > 0;

  lines.push(`# SCA Dependency Scan: ${failed ? "FAILED" : "PASSED"}`);
  lines.push("");
  lines.push(`- Repository: \`${meta.repository}\``);
  lines.push(`- Ref: \`${meta.ref}\``);
  lines.push(`- Commit: \`${meta.sha}\``);
  lines.push(`- Triggered by: \`${meta.trigger}\``);
  lines.push(`- Scanned at: ${meta.timestamp}`);
  lines.push(`- Failure threshold: **${threshold}** and above`);
  if (meta.runUrl) lines.push(`- Workflow run: ${meta.runUrl}`);
  lines.push("");

  if (allowlistErrors.length > 0) {
    lines.push(`## Invalid allowlist (${allowlistErrors.length})`);
    lines.push("");
    lines.push(
      `\`${ALLOWLIST_PATH}\` does not satisfy the required schema, so **no exception was applied**. Every entry needs \`ghsa\`, \`package\`, \`modules\`, \`severity\`, \`reason\`, \`owner\` and a \`YYYY-MM-DD\` \`expires\`.`,
    );
    lines.push("");
    for (const error of allowlistErrors) lines.push(`- ${error}`);
    lines.push("");
  }

  if (scanErrors.length > 0) {
    lines.push("## Scan errors");
    lines.push("");
    for (const error of scanErrors) lines.push(`- ${error}`);
    lines.push("");
  }

  if (blocking.length > 0) {
    lines.push(`## Blocking vulnerabilities (${blocking.length})`);
    lines.push("");
    lines.push("| Module | Package | Severity | Advisory | Fix | Note |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const finding of blocking) {
      lines.push(
        `| \`${finding.module}\` | \`${finding.package}\` | **${finding.severity}** | [${finding.title}](${finding.url}) | ${describeFix(finding.fixAvailable)} | ${finding.rejectedReason ?? ""} |`,
      );
    }
    lines.push("");
    lines.push("### How to remediate");
    lines.push("");
    lines.push("1. `cd <module>` then run `npm audit fix` for non-breaking upgrades.");
    lines.push(
      "2. For a transitive dependency pinned by a parent, add an `overrides` entry in that module's `package.json`.",
    );
    lines.push(
      "3. For a breaking major, upgrade deliberately and re-run that module's build before merging.",
    );
    lines.push(
      `4. If the advisory genuinely cannot be fixed, add a reviewed exception to \`${ALLOWLIST_PATH}\` with all seven required fields.`,
    );
    lines.push("");
  } else if (scanErrors.length === 0 && allowlistErrors.length === 0) {
    lines.push(`No un-reviewed vulnerabilities at or above **${threshold}**.`);
    lines.push("");
  }

  if (expired.length > 0) {
    lines.push(`## Exceptions needing re-review (${expired.length})`);
    lines.push("");
    lines.push(
      "These entries have passed their review date and no longer suppress anything.",
    );
    lines.push("");
    for (const exception of expired) {
      lines.push(
        `- \`${exception.ghsa}\` (\`${exception.package}\`) expired on ${exception.expires}, owner ${exception.owner}`,
      );
    }
    lines.push("");
  }

  if (allowed.length > 0) {
    lines.push(`## Accepted risks (${allowed.length})`);
    lines.push("");
    lines.push("| Module | Package | Severity | Advisory | Owner | Review by |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const { finding, exception } of allowed) {
      lines.push(
        `| \`${finding.module}\` | \`${finding.package}\` | ${finding.severity} | [${finding.ghsa}](${finding.url}) | ${exception.owner} | ${exception.expires} |`,
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    `Generated by \`.github/scripts/sca-check.mjs\`. Questions: ${CONTACT_EMAIL}`,
  );
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const today = new Date().toISOString().slice(0, 10);

  const scanErrors = [];
  const blocking = [];
  const allowed = [];
  const belowThreshold = [];

  let exceptions = [];
  let allowlistErrors = [];
  try {
    const validated = validateAllowlist(loadAllowlist());
    exceptions = validated.exceptions;
    allowlistErrors = validated.errors;
  } catch (error) {
    allowlistErrors = [error.message];
  }

  // A malformed allowlist suppresses nothing. Findings it meant to cover
  // surface as blocking, which is the fail-closed behaviour we want.
  for (const moduleDir of MODULES) {
    if (!existsSync(join(moduleDir, "package-lock.json"))) continue;

    let auditJson;
    try {
      auditJson = await runAudit(moduleDir);
    } catch (error) {
      scanErrors.push(error.message);
      continue;
    }

    for (const finding of extractFindings(auditJson, moduleDir)) {
      const { exception, rejected } = matchException(finding, exceptions, today);
      if (exception) {
        allowed.push({ finding, exception });
      } else if (atOrAbove(finding.severity, args.threshold)) {
        blocking.push({ ...finding, rejectedReason: rejected?.why });
      } else {
        belowThreshold.push(finding);
      }
    }
  }

  const expired = exceptions.filter((exception) => exception.expires < today);

  const meta = {
    repository: process.env.GITHUB_REPOSITORY ?? "local",
    ref: process.env.GITHUB_REF_NAME ?? "local",
    sha: (process.env.GITHUB_SHA ?? "local").slice(0, 12),
    trigger: process.env.GITHUB_EVENT_NAME ?? "manual",
    timestamp: new Date().toISOString(),
    runUrl:
      process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : "",
  };

  blocking.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(b.severity) - SEVERITY_ORDER.indexOf(a.severity) ||
      a.module.localeCompare(b.module) ||
      a.package.localeCompare(b.package),
  );

  const markdown = renderMarkdown({
    blocking,
    allowed,
    expired,
    allowlistErrors,
    scanErrors,
    threshold: args.threshold,
    meta,
  });
  const failed =
    blocking.length > 0 || scanErrors.length > 0 || allowlistErrors.length > 0;

  mkdirSync(args.out, { recursive: true });
  writeFileSync(join(args.out, "report.md"), `${markdown}\n`, "utf8");
  writeFileSync(
    join(args.out, "report.json"),
    `${JSON.stringify(
      {
        failed,
        threshold: args.threshold,
        meta,
        blocking,
        allowed,
        belowThreshold,
        expired,
        allowlistErrors,
        scanErrors,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(markdown);

  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(
      process.env.GITHUB_OUTPUT,
      `failed=${failed}\nblocking_count=${blocking.length}\n`,
      { flag: "a" },
    );
  }

  process.exit(failed ? 1 : 0);
}

// Only scan when run directly, so the test suite can import the helpers above.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exit(2);
  });
}
