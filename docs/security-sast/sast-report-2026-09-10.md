# SAST Status Report: PSITS UC Main Web Platform

| | |
| --- | --- |
| **Report date** | 2026-09-10 |
| **Scope** | `server-side/`, `client-side-ts/`, `client-side/` (static source analysis) |
| **Standards** | OWASP Top 10 2021, OWASP API Security Top 10 2023, OWASP ASVS 4.0 |
| **Detailed findings** | **Held privately.** See [Getting the full report](#getting-the-full-report). |
| **Contact** | psitsucmain2025@gmail.com |

> **This is a status summary, not the findings themselves.**
>
> This repository is publicly viewable and the findings below are not yet
> remediated. Publishing exploitable detail for unfixed issues would hand an
> attacker a map of where to look. [CONTRIBUTING.md](../../CONTRIBUTING.md)
> requires that suspected security issues be reported privately to project
> leads, so the locations, code, reasoning, and remediation steps are delivered
> through a private channel instead.
>
> This page tracks *that work exists and where it stands*. It is safe to read in
> public and safe to link from a PR.

---

## Why the detail is not here

A static analysis pass was run against the codebase on 2026-09-10. It produced
19 findings. Several are exploitable today and none are fixed yet.

For an unfixed finding, the useful detail and the dangerous detail are the same
detail: the file, the line, the reachable route, and why the guard does not
hold. A public backlog of that shape lowers the effort to attack the platform,
which handles student personal information, payment records, and attendance
data.

Once a finding is remediated and deployed, its detail can be published here
safely, and doing so is genuinely useful as a record for future contributors.
The table below is the placeholder for that.

## Current status

| Severity | Count | Fixed | Open |
| --- | --- | --- | --- |
| Critical | 1 | 0 | 1 |
| High | 3 | 0 | 3 |
| Medium | 10 | 0 | 10 |
| Low | 5 | 0 | 5 |
| **Total** | **19** | **0** | **19** |

**Categories represented** (OWASP Top 10 2021): A01 Broken Access Control,
A02 Cryptographic Failures, A03 Injection, A04 Insecure Design,
A05 Security Misconfiguration, A07 Identification and Authentication Failures,
A08 Software and Data Integrity Failures, A09 Security Logging and Monitoring
Failures.

**Also mapped** (OWASP API Security Top 10 2023): API1 Broken Object Level
Authorization, API4 Unrestricted Resource Consumption.

**Affected areas**, named only at the level a public reader already sees from
the repository layout: the authentication and password recovery flows, the
object storage access path, the certificate generation feature, and the legacy
`client-side` frontend.

## Priority guidance for maintainers

Without restating the findings, the sequencing that the private report
recommends:

1. One CRITICAL item in the authentication configuration. It requires a code
   change **and** a credential rotation across every environment. Treat it as a
   production incident, not backlog.
2. Two HIGH items expose student personal information to callers who should not
   reach it. One is reachable without authentication.
3. One HIGH item allows a lower-privileged account to reach data belonging to
   another account.
4. The MEDIUM cluster is mostly authentication hardening and information
   disclosure. Several are one-line changes with real value.
5. The LOW items are hardening and cleanup, suitable for normal backlog.

Because this pull request and its review discussion were public before the
report was moved, assume the disclosed material may already have been read.
Prioritise remediation and rotation over relying on the removal itself.

## Getting the full report

The unredacted report contains, for each of the 19 findings: exact file and line
references, the reachable entry point, why the existing control does not hold,
the OWASP and CWE mapping, concrete remediation code, and a verification step.

It is generated to `docs/security-sast/private/sast-report-2026-09-10.FULL.md`,
which is **gitignored and must never be committed**. To obtain it:

1. Ask the project leads at psitsucmain2025@gmail.com, or
2. Open it from a maintainer's local checkout, or
3. Preferably, have a maintainer paste it into a **private GitHub Security
   Advisory** on this repository
   (`Security` tab, `Advisories`, `New draft security advisory`). That gives a
   maintainer-only workspace with a private fork for the fixes, and it can be
   published as a CVE-style disclosure after remediation ships.

Option 3 is the recommended home for this work. It keeps the detail private
while the fixes land, and it produces the public record afterwards.

## Re-running the analysis

The findings came from manual static review rather than a single tool
invocation, so there is no one command to reproduce them. Dependency scanning is
separate and **is** automated: see
[.github/workflows/sca.yml](../../.github/workflows/sca.yml), which gates every
build and deployment.

To refresh this report after remediation:

1. Re-review the areas listed in the private report's remediation order.
2. Regenerate the private full report.
3. Update the status table above.
4. Move any finding that is fixed **and deployed** into a public "Resolved
   findings" section here, with its detail, so the fix is on the record.

## Scope limits

Stated so the gaps are not mistaken for clean results:

- Static analysis only. Nothing was executed against a running environment, and
  no payload was tested. Severities assume the code paths are reachable in
  production as configured.
- No infrastructure review. Database network rules, object storage bucket
  policies, hosting configuration, and secret storage were not examined. At
  least one finding makes the storage bucket policy worth reviewing on its own.
- No dynamic testing. Authorization matrices, session behaviour under
  concurrency, and business logic flaws such as order or payment manipulation
  need DAST or manual penetration testing.
- Partial coverage of the largest controllers, which were reviewed at their
  security-relevant entry points rather than exhaustively.
- The AI chat and automation integration was not reviewed in depth. Tool-calling
  with database write access warrants its own assessment against the OWASP Top
  10 for LLM Applications.
- No git history secret scan. Given the nature of the CRITICAL finding, running
  `gitleaks` or `trufflehog` over the full history is recommended.

## Dependency scanning (SCA)

Unlike the findings above, dependency vulnerabilities **were** remediated in the
same pull request that added this document.

| Module | Before | After |
| --- | --- | --- |
| `.` (root) | 3 moderate | 0 |
| `server-side` | 2 high, 3 moderate | 2 high (accepted, time-boxed) |
| `client-side-ts` | 2 high | 0 |
| `client-side` | 1 critical, 12 high, 6 moderate, 2 low | 2 moderate (accepted, time-boxed) |

The four remaining advisories are recorded in
[.github/security/sca-allowlist.json](../../.github/security/sca-allowlist.json)
with a reason, an owner, an honest statement of current exposure, what must
happen before the exception is renewed, and a 2026-12-31 review date. The gate
enforces that schema and fails the scan if any entry is malformed, so an
exception cannot silently become permanent.

---

*Status as of 2026-09-10. No application code was modified in producing this
analysis. Questions: psitsucmain2025@gmail.com*
