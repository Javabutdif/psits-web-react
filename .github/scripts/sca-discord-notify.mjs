#!/usr/bin/env node
/**
 * Posts an SCA gate failure to the maintainers' Discord channel.
 *
 * Reads the machine-readable report written by sca-check.mjs and sends a
 * Discord embed to the webhook in DISCORD_WEBHOOK_URL. Reuses the same secret
 * as the PR reviewer workflow (.github/workflows/pr-notifications.yml).
 *
 * Usage: node .github/scripts/sca-discord-notify.mjs sca-report/report.json
 *
 * A notification failure never fails the build: the SCA gate itself is what
 * blocks the pipeline, and losing an alert should not mask that.
 */

import { readFileSync } from "node:fs";

// Discord's documented embed limits. Exceeding any of them is a 400.
const LIMITS = {
  fieldValue: 1024,
  fieldCount: 25,
  description: 4096,
};

const COLORS = {
  critical: 0x99000a,
  high: 0xd7263d,
  moderate: 0xf39c12,
  low: 0x3498db,
};

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 20)}\n... (truncated)`;
}

function highestSeverity(findings) {
  const order = ["low", "moderate", "high", "critical"];
  return findings.reduce((worst, finding) => {
    return order.indexOf(finding.severity) > order.indexOf(worst)
      ? finding.severity
      : worst;
  }, "low");
}

function buildEmbed(report) {
  const { meta, blocking = [], allowlistErrors = [], scanErrors = [], threshold } =
    report;

  const fields = [];

  fields.push({
    name: "Repository",
    value: `\`${meta.repository}\` @ \`${meta.ref}\``,
    inline: true,
  });
  fields.push({
    name: "Commit",
    value: `\`${meta.sha}\``,
    inline: true,
  });
  fields.push({
    name: "Threshold",
    value: `${threshold} and above`,
    inline: true,
  });

  if (allowlistErrors.length > 0) {
    fields.push({
      name: `Invalid allowlist (${allowlistErrors.length})`,
      value: truncate(
        allowlistErrors.map((e) => `- ${e}`).join("\n"),
        LIMITS.fieldValue,
      ),
      inline: false,
    });
  }

  if (scanErrors.length > 0) {
    fields.push({
      name: `Scan errors (${scanErrors.length})`,
      value: truncate(
        scanErrors.map((e) => `- ${e}`).join("\n"),
        LIMITS.fieldValue,
      ),
      inline: false,
    });
  }

  if (blocking.length > 0) {
    const rows = blocking.map((finding) => {
      const fix =
        finding.fixAvailable === true
          ? "npm audit fix"
          : finding.fixAvailable
            ? `${finding.fixAvailable.name}@${finding.fixAvailable.version}`
            : "no automated fix";
      return `**${finding.severity}** \`${finding.package}\` in \`${finding.module}\`\n${finding.title}\nFix: ${fix}`;
    });

    fields.push({
      name: `Blocking vulnerabilities (${blocking.length})`,
      value: truncate(rows.join("\n\n"), LIMITS.fieldValue),
      inline: false,
    });
  }

  fields.push({
    name: "What to do",
    value:
      "Download the `sca-report` artifact from the run for the full report, or open the run summary. Remediation steps are in the report.",
    inline: false,
  });

  const severity = blocking.length > 0 ? highestSeverity(blocking) : "high";

  return {
    title: "SCA gate failed",
    description: truncate(
      allowlistErrors.length > 0
        ? "The dependency allowlist is invalid, so no accepted risks were applied. All findings are blocking until it is corrected."
        : `${blocking.length} un-reviewed vulnerability finding(s) at or above **${threshold}** are blocking the pipeline.`,
      LIMITS.description,
    ),
    url: meta.runUrl || undefined,
    color: COLORS[severity] ?? COLORS.high,
    fields: fields.slice(0, LIMITS.fieldCount),
    footer: { text: "PSITS Security - SCA Gate" },
    timestamp: meta.timestamp,
  };
}

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    console.log("DISCORD_WEBHOOK_URL is not set; skipping Discord notification.");
    return;
  }

  const reportPath = process.argv[2] ?? "sca-report/report.json";
  const report = JSON.parse(readFileSync(reportPath, "utf8"));

  const payload = {
    username: "PSITS Security",
    embeds: [buildEmbed(report)],
  };

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    console.log(`Discord notification sent (HTTP ${response.status}).`);
  } else {
    // Surface the problem without failing the job; the gate already failed.
    const body = await response.text().catch(() => "");
    console.log(
      `::warning::Discord webhook returned HTTP ${response.status}. ${body.slice(0, 300)}`,
    );
  }
}

main().catch((error) => {
  console.log(`::warning::Discord notification failed: ${error.message}`);
});
