#!/usr/bin/env node
/**
 * Software Composition Analysis (SCA) gate for the PSITS UC Main monorepo.
 *
 * Runs `npm audit --json` against every module that ships a lockfile, filters
 * the results through a reviewed allowlist, and fails the build when an
 * un-reviewed advisory at or above the severity threshold is present.
 *
 * Outputs (written to the directory given by --out, default ".sca"):
 *   - report.md    human readable summary (job summary + notification email body)
 *   - report.json  machine readable summary
 *
 * Exit codes: 0 = gate passed, 1 = gate failed, 2 = the scan itself broke.
 */

import { exec } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Run through a shell so the npm .cmd shim resolves on Windows as well. The
// command is a fixed literal with no interpolated input, so there is no
// injection surface here.
const AUDIT_COMMAND = "npm audit --json --audit-level=info";

const SEVERITY_ORDER = ["info", "low", "moderate", "high", "critical"];
const MODULES = [".", "client-side", "client-side-ts", "server-side"];
const ALLOWLIST_PATH = ".github/security/sca-allowlist.json";
const CONTACT_EMAIL = "psitsucmain2025@gmail.com";

function parseArgs(argv) {
  const args = { threshold: "high", out: ".sca" };
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

function atOrAbove(severity, threshold) {
  return SEVERITY_ORDER.indexOf(severity) >= SEVERITY_ORDER.indexOf(threshold);
}

function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) return { exceptions: [] };
  return JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
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
function extractFindings(auditJson, moduleDir) {
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

function matchException(finding, allowlist, today) {
  return (allowlist.exceptions ?? []).find((exception) => {
    if (exception.ghsa !== finding.ghsa) return false;
    if (exception.package && exception.package !== finding.package) return false;
    if (
      Array.isArray(exception.modules) &&
      exception.modules.length > 0 &&
      !exception.modules.includes(finding.module)
    ) {
      return false;
    }
    // An expired exception stops suppressing the finding, which forces the
    // maintainers to re-review it instead of letting it sit forever.
    return !exception.expires || exception.expires >= today;
  });
}

function renderMarkdown({ blocking, allowed, expired, scanErrors, threshold, meta }) {
  const lines = [];
  const status = blocking.length > 0 || scanErrors.length > 0 ? "FAILED" : "PASSED";

  lines.push(`# SCA Dependency Scan: ${status}`);
  lines.push("");
  lines.push(`- Repository: \`${meta.repository}\``);
  lines.push(`- Ref: \`${meta.ref}\``);
  lines.push(`- Commit: \`${meta.sha}\``);
  lines.push(`- Triggered by: \`${meta.trigger}\``);
  lines.push(`- Scanned at: ${meta.timestamp}`);
  lines.push(`- Failure threshold: **${threshold}** and above`);
  if (meta.runUrl) lines.push(`- Workflow run: ${meta.runUrl}`);
  lines.push("");

  if (scanErrors.length > 0) {
    lines.push("## Scan errors");
    lines.push("");
    for (const error of scanErrors) lines.push(`- ${error}`);
    lines.push("");
  }

  if (blocking.length > 0) {
    lines.push(`## Blocking vulnerabilities (${blocking.length})`);
    lines.push("");
    lines.push("| Module | Package | Severity | Advisory | Fix |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const finding of blocking) {
      lines.push(
        `| \`${finding.module}\` | \`${finding.package}\` | **${finding.severity}** | [${finding.title}](${finding.url}) | ${describeFix(finding.fixAvailable)} |`,
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
      `4. If the advisory genuinely cannot be fixed, add a reviewed exception with an expiry date to \`${ALLOWLIST_PATH}\`.`,
    );
    lines.push("");
  } else if (scanErrors.length === 0) {
    lines.push(`No un-reviewed vulnerabilities at or above **${threshold}**.`);
    lines.push("");
  }

  if (expired.length > 0) {
    lines.push(`## Expired allowlist exceptions (${expired.length})`);
    lines.push("");
    lines.push(
      "These exceptions have passed their review date and no longer suppress anything.",
    );
    lines.push("");
    for (const exception of expired) {
      lines.push(
        `- \`${exception.ghsa}\` (${exception.package ?? "any package"}) expired on ${exception.expires}`,
      );
    }
    lines.push("");
  }

  if (allowed.length > 0) {
    lines.push(`## Accepted risks (${allowed.length})`);
    lines.push("");
    lines.push("| Module | Package | Severity | Advisory | Reason | Review by |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const { finding, exception } of allowed) {
      lines.push(
        `| \`${finding.module}\` | \`${finding.package}\` | ${finding.severity} | [${finding.ghsa}](${finding.url}) | ${exception.reason ?? "n/a"} | ${exception.expires ?? "no expiry"} |`,
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
  const allowlist = loadAllowlist();

  const scanErrors = [];
  const blocking = [];
  const allowed = [];
  const belowThreshold = [];

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
      const exception = matchException(finding, allowlist, today);
      if (exception) {
        allowed.push({ finding, exception });
      } else if (atOrAbove(finding.severity, args.threshold)) {
        blocking.push(finding);
      } else {
        belowThreshold.push(finding);
      }
    }
  }

  const expired = (allowlist.exceptions ?? []).filter(
    (exception) => exception.expires && exception.expires < today,
  );

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
    scanErrors,
    threshold: args.threshold,
    meta,
  });
  const failed = blocking.length > 0 || scanErrors.length > 0;

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

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
