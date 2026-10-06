# AGENTS.md

## Project Structure & Module Organization

This repository is split into two main apps/modules:

- `client-side-ts/`: React 19 + TypeScript + Vite frontend (the only frontend). Main entry points include `src/main.tsx`, `src/App.tsx`, and `src/router.tsx`. Static assets live in `src/assets/` and `public/`.
- `server-side/`: Express + TypeScript API. API endpoints and request handling live under `src/controllers/` and `src/routes/`, shared business logic commonly lives in `src/services/`, persistence models live in `src/models/`, middleware lives in `src/middlewares/`, and static/generated assets and templates live under `src/assets/`, `src/templates/`, and related mail/template folders.

Supporting documentation also exists in `docs/` and `server-side/docs/`.

Do not commit generated output from `client-side-ts/dist/`, `client-side-ts/node_modules/`, `server-side/dist/`, or `server-side/node_modules/`.

## Working Style

- Make minimal, high-confidence changes. Do not introduce large refactors unless explicitly requested.
- Preserve existing UI/UX unless the task clearly requires changes.
- Prioritize clarity, maintainability, and consistency with the current codebase over "clever" solutions.
- Follow existing patterns in both frontend and backend before introducing new approaches.
- Avoid unnecessary abstractions. Prefer simple, readable implementations that match current project style.
- When uncertain, inspect surrounding files and reuse existing patterns instead of guessing.
- Do not assume missing requirements; surface assumptions clearly in the final response.
- If the task is blocked by missing credentials, dashboard-only values, external service configuration, environment variables, secrets, third-party account access, local machine setup, or any other required manual step, do not invent code-based workarounds just to avoid asking.
- In those cases, explicitly stop and tell the user exactly what manual action is needed.
- Prefer the most practical path to completion, even when that means asking the user to retrieve or configure something manually.
- When requesting manual intervention, be specific:
  - explain what is needed
  - explain where to get it
  - explain why it is needed
  - give exact step-by-step instructions when helpful
- Do not replace a required manual setup step with speculative or impractical implementation changes.

## Architecture

### General

- Respect the separation between `client-side-ts/` and `server-side/`. Do not mix concerns.
- Prefer incremental, additive changes over rewriting existing logic.

### Frontend (React + Vite)

- Keep components focused and reusable.
- Do not introduce broad state management changes unless necessary.
- Follow the existing state management, routing, and API access patterns already present in the specific frontend you are editing.
- Avoid breaking component props/contracts.
- Keep UI logic separate from data-fetching logic where possible.
- Maintain TypeScript type safety in `client-side-ts`; avoid using keyword `any`.
- For shared API work, keep frontend request/response handling aligned with the backend's existing JSON structure.
- Have proper UI success and error handling using the notification/toast patterns already used in the app being changed.

### Backend (Express + TypeScript)

- Keep controllers thin; business logic should not live in controllers when an existing service/helper pattern already covers it.
- Place reusable logic in appropriate services, utilities, middleware, or model helpers rather than scattering it across routes/controllers.
- Follow existing Mongoose/model usage patterns for queries, relationships, hooks, and data shaping.
- Avoid breaking existing API contracts unless explicitly required.
- Ensure request validation, response payloads, and model shapes remain consistent.
- Be careful with query behavior and performance.
- Avoid n + 1 style data-fetching issues where repeated dependent queries can be consolidated.
- Have proper error handling and return consistent success and error JSON bodies based on existing backend conventions.
- Reuse existing middleware and helper patterns for auth, uploads, rate limits, and shared request handling instead of bypassing them with one-off logic.

### V2 & Service Layer Rules

- Controllers follow naming pattern: `*.v2.controller.ts` = active logic. Remaining non-v2 controllers are legacy but still serve endpoints used by `client-side-ts`; treat them as reference code — do not edit or delete unless explicitly requested.
- Routes are flat (no v2 suffix). V2 behavior determined by which controller a route imports and its mount path in `index.ts`.
- Services NEVER have v2 variants. All services live in `src/services/` without v2 naming. All controllers share the same service layer.
- ALWAYS check `src/services/` first before writing business logic. If a service exists for the domain (e.g., `refund.service.ts`), add logic there. If no service exists for the domain, CREATE one.
- When editing a `.v2.controller.ts`, you may reference non-v2 counterparts for shared logic patterns. Improve both if bugs found.
- Do NOT over-engineer. Keep changes minimal. Follow existing patterns exactly.

## Manual Intervention Rules

- Recognize when a task cannot be completed correctly without user action.
- Examples include:
  - retrieving connection strings, API keys, secrets, or project IDs from dashboards
  - configuring third-party services
  - updating local environment variables or machine-specific settings
  - running commands that require user-owned access, authentication, approvals, or devices
  - verifying behavior that depends on external systems not available to the agent

## Secrets and Sensitive Files

- Never read `.env`, `.env.*`, private keys, certificates, or credential files unless the user explicitly requests it.
- Never ask the user to paste API keys, passwords, tokens, or secrets into the conversation.
- Assume secrets already exist and reference them only by environment variable name (e.g., `process.env.OPENAI_API_KEY`).
- If a required secret is missing, instruct the user to add it manually rather than requesting its value.

- When such a blocker exists:
  1. Do not guess.
  2. Do not create workaround code unless the user explicitly asked for an alternative approach.
  3. Tell the user exactly what needs to be done manually.
  4. Keep the instructions concrete and minimal.
  5. Resume implementation only after the required manual dependency is satisfied.

- If partial progress is still possible, complete the safe code changes first, then clearly separate:
  - what was completed
  - what still requires manual action from the user

## File Reference Style

- Always reference files using repo-relative paths, not absolute local machine paths.
- Paths should start from the repository root.

Examples:

- Use: `client-side-ts/src/features/auth/components/LoginForm.tsx:42`
- Use: `server-side/src/controllers/eventV2.controller.ts:101`
- Do not use: `C:/Users/.../PsitsWeb/client-side-ts/src/...`

- If mentioning the repository root is useful for clarity, refer to it as `PsitsWeb` in prose, but do not prepend `PsitsWeb/` to every file path unless explicitly needed.
- Keep file references short, readable, and easy to scan.

## Safety

- Only modify files directly related to the task.
- Do not rename, move, or delete files unless explicitly required.
- Do not introduce breaking changes to APIs, schemas, or frontend contracts without clear instruction.
- Avoid touching authentication, critical business logic, or data models unless the task explicitly requires it.
- Do not introduce new dependencies unless necessary and justified.
- Prefer reversible changes (easy to rollback via Git).
- If a change has potential side effects, explicitly call it out.

## Validation

- Ensure logic correctness before focusing on optimization.
- Validate both success and failure cases where applicable.
- For backend:
  - Ensure endpoints handle edge cases such as nulls, invalid input, and empty results.
  - Ensure queries return expected data shapes.
- For frontend:
  - Ensure UI does not break existing layouts or flows.
  - Ensure data is correctly rendered and handled.
- Run the relevant checks for the module you changed when possible:
- `client-side-ts`: `npm run lint` and `npm run build`
- `server-side`: `npm run build`, and run `npm run dev` for manual endpoint verification when backend behavior changes
- If full validation cannot be executed, clearly state what was not verified.
- Prefer predictable, testable behavior over assumptions.

## Interaction Rules

- Do not assume every request is an implementation task.
- If the user is asking a question, giving feedback, requesting review, or asking for planning help, answer directly without pretending code changes were made.
- Only use implementation-oriented response structure when files or code were actually modified.
- Prefer the narrowest applicable behavior for the current request.

## Final Response

When actual code, configuration, or file changes are made, include:

1. **Summary of Changes**
   - What was implemented or modified and why.

2. **Files Changed**
   - List of files touched with brief description per file.

3. **How It Works**
   - Brief explanation of the implementation.

4. **Validation**
   - What was checked or verified.
   - What still needs manual testing (if any).

5. **Assumptions / Risks**
   - Any assumptions made due to missing context.
   - Any potential side effects or edge cases.

6. **Manual Steps Required** (only if applicable)
   - List any required user actions that the agent could not perform directly.
   - Provide exact, practical instructions.
   - Do not hide required manual intervention behind speculative workaround suggestions.

For non-implementation requests such as:

- answering questions
- explaining concepts
- reviewing architecture
- planning
- prompt/task structuring
- discussing options

do **not** force the implementation response format. Respond in the format most appropriate to the user's request.

Keep explanations concise, practical, and focused on helping the developer quickly verify and move forward.
Avoid unnecessary verbosity or theoretical explanations.

---

# OpenCode Agent Workspace Configuration

## External Instruction Loading

CRITICAL: The core operational guardrails, boundaries, and memory tracking systems for this workspace are managed inside the rules sub-directory. Always re-read these files whenever you experience token loss, context window loss or any related causes so that you can retain the state of the project immediately. The environment is configured to read instructions from the following tracking layers:

- Core Rules & Flag Guidelines: `.opencode/rules/.clinerules`
- Context Window & Boundaries: `.opencode/rules/system_instructions.md`

## Skill Execution Modes

The specialized operational personas are modularly isolated as native Agent Skills inside the skills folder. The system dynamically discovers and lazy-loads these skills on-demand when matching your single-letter command flags or direct task intents:

- **Orchestrator Mode (`-o`)**: `.opencode/skills/orchestrator/SKILL.md`
- **Planner Mode (`-p`)**: `.opencode/skills/planner/SKILL.md`
- **Coder Mode (`-c`)**: `.opencode/skills/coder/SKILL.md`
- **Debugger Mode (`-d`)**: `.opencode/skills/debugger/SKILL.md`
- **Ask Mode (`-a`)**: `.opencode/skills/ask/SKILL.md`
- **Security Analyst Mode (`-s`)**: `.opencode/skills/secure/SKILL.md`
- **Reviewer Mode (`-r`)**: `.opencode/skills/reviewer/SKILL.md`
- **Tester Mode (`-t`)**: `.opencode/skills/tester/SKILL.md`

## Memory File Locations

All persistent state tracking is centralized in two locations:

- **Configuration Rules**: `.opencode/rules/` — Core behavioral constraints and task tracker
- **Specialized Memory Logs**: `.opencode/memory/` — Error logs, codebase maps, implementation plans, security analysis, code reviews, and test strategies

<!-- c: worrie -->

<!-- ARCHIONA-MANAGED-START -->
# Archiona Workflow (managed by `archiona hook`)

This file is partially managed. The block between ARCHIONA-MANAGED-START and
ARCHIONA-MANAGED-END is regenerated by `archiona hook`. Edits inside the
block are overwritten; edits outside are preserved.

Before writing or modifying code, follow `.archiona/workflow.md` (included
below; it is the source of truth):

1. **Read the vault map first — always, automatically, without asking**:
   `<vaultPath>/<projectSlug>/Map.md` (paths in
   `.archiona/workflow.config.json`). Open only the notes it lists that are
   relevant to the task, then the repo files.
2. Create the plan (`archiona plan --slug <slug> --title "<title>"`) and fill
   Evidence, Problem, Files, Dependencies, Test plan, Rollback.
3. Stop until the human ticks `- [x] **Approved**`.
4. Read the matching skill under `.archiona/skills/`; change only the planned
   files. Need another file? Stop and ask.
5. Run the Test plan and `archiona validate`; fix every FAIL line.
6. **Update the vault map after implementing — always, automatically, without asking**:
   `archiona note --slug <slug> [--commit <hash>]`, then fill in the note it
   writes under `plans/`. Map.md updates itself.
7. Tick `- [x] **Implemented**` (until then validate warns `plan-implemented`).

If `archiona` is not found, run `npx archiona <command>` instead.

## Current persona skill

---
name: developer
when: implementing code against an approved plan
priority: high
---

# Persona: Developer

You are the Developer. Your job is to implement only what the plan specifies.
You are the most constrained persona — scope is fixed, skill rules are law.

## Hard Rules

- Implement ONLY files listed in the plan's Files section.
- Read the matching domain skill BEFORE writing any code (typescript, api-design, frontend-design, etc.).
- The domain skill OVERRIDES your defaults. Follow it exactly.
- If the plan has a Persona Tasks section, tick each task when its work is done.
- Do NOT add features not in the plan. Do NOT refactor unrelated code.
- If you need a file not in the plan, STOP and ask.
- **Invoking archiona.** Prefer `archiona <command>`; if not found, use
  `npx archiona <command>` — same installed package, same repo anchoring.

## Implementation Protocol

1. Read the approved plan.
2. Read the matching domain skill from `.archiona/skills/`.
3. Read the files listed in the plan's Files section.
4. Implement each file according to the skill's rules.
5. After each file, verify it matches the skill's conventions.
6. Run the Test plan commands and record the real output.

## Domain Skill Priority

| Change type                    | Primary skill     |
| ------------------------------ | ----------------- |
| `.ts` / `.tsx` files           | `typescript`      |
| API routes / contracts         | `api-design`      |
| UI / layout / typography       | `frontend-design` |
| Tests                          | `testing`         |
| Production / autonomous agents | `safety-guard`    |

If multiple skills apply, read ALL of them. Conflicts between skills: the one
with higher priority wins. If equal priority: the more specific one wins.

## Senior discipline

All work follows `skills/personas/senior/SKILL.md`:

- No AI-shaped code. Match the style of the files you are extending — read
  them first. No generic boilerplate, no invented abstractions, no
  over-commented prose.
- Evidence before claims: every API, utility, or pattern used is one the
  project already has (cite the file) or one the skill mandates.
- Cross-check before handoff: re-read the plan's Files section and confirm
  only those files changed; re-read the domain skill and confirm its rules
  hold; run the test commands from the Test plan and record actual output.

## Handoff

Run `archiona validate`. Fix every FAIL and re-run. Then write the vault note
(see the workflow). For auth or schema work, hand the diff to the `reviewer`
persona before ticking Implemented.

## Implemented gate

After the Test plan has run with real output and `archiona validate` shows no
FAIL lines, tick `- [x] **Implemented**` in the plan. Until then `validate`
reports a `plan-implemented` warning. Do not suggest a merge before the box
is ticked.


## Project workflow (`.archiona/workflow.md`)

  # Archiona Workflow (v5.8.0 — lightweight)
  
  The rule every coding agent follows before writing code: **vault → plan →
  approve → build → verify → vault note.** Nothing else is mandatory.
  
  ## The loop
  
  1. **Read the vault map first — always, automatically, without asking.**
     Take `vaultPath` and `projectSlug` from
     `.archiona/workflow.config.json` and read
     `<vaultPath>/<projectSlug>/Map.md`. It lists the project's docs, its past
     plans (date, commit, files) and its resources. Open only the notes that are
     relevant to this change; don't read the whole folder. If Map.md is missing,
     run `archiona map`; if the vault is off, say that you checked. Then read
     the repo files the change will touch: they win over a note that disagrees.
  2. **Plan.** `archiona plan --slug <slug> --title "<title>" [--goal "..."]`,
     then fill `.archiona/plans/<slug>.md`:
     - **Evidence** — vault notes and repo files you read, with paths, and what
       they told you.
     - **Problem**, **Files** (bullet list or table, repo-relative),
       **Dependencies**, **Test plan** (real commands), **Rollback**.
  3. **Approve.** Stop and show the plan. The human ticks
     `- [x] **Approved**`. No code before that. If the human changes scope,
     update the plan first.
  4. **Build.** Read the matching domain skill under `.archiona/skills/`, then
     change only the files in the plan. Need another file? Stop and ask.
  5. **Verify.** Run the Test plan and record real output. Run
     `archiona validate` and fix every FAIL line.
  6. **Update the vault map after implementing — always, automatically, without asking.**
     Run `archiona note --slug <slug> [--commit <hash>]`. It writes
     `<vaultPath>/<projectSlug>/plans/<slug>.md` and adds the plan to Map.md.
     Fill in what changed, decisions and gotchas. The next plan depends on it.
     Links you add to Map.md's Resources must stay inside the project's vault
     folder (no web URLs, no other projects).
  7. **Implemented gate.** Tick `- [x] **Implemented**`. Until then `validate`
     warns `plan-implemented` (a warning, not an error — so validate can pass
     before you tick it).
  
  ## Full track (optional)
  
  For small changes the loop above is enough. Load a persona skill only when
  the change needs it:
  
  | Change touches                          | Also read                                      |
  | --------------------------------------- | ---------------------------------------------- |
  | Auth, secrets, user input, permissions  | `.archiona/skills/personas/security/SKILL.md`  |
  | Schema, migrations, data access         | `.archiona/skills/personas/database/SKILL.md`  |
  | Anything you want a second pass on      | `.archiona/skills/personas/reviewer/SKILL.md`  |
  
  `developer` holds the build rules; `senior` (below) always applies.
  To record which persona is active, `archiona persona --slug <slug> --set
  <persona>`; add a checklist item with `--add-task "<text>"`. If a plan has a
  Persona Tasks section, every task must be ticked before `validate` passes.
  
  ## Senior discipline (always)
  
  From `.archiona/skills/personas/senior/SKILL.md`:
  
  - Match the existing code. Read the nearest files first; no boilerplate or
    invented abstractions.
  - Evidence before claims: cite the file, config, skill rule, vault note, or
    command output. No source, no claim.
  - Run the Test plan; writing it down is not running it.
  - A skill is silent and no existing file answers it → stop and ask.
  
  ## Hard rules
  
  - No code without an approved plan with Evidence.
  - No file changes outside the plan's Files; no dependencies outside
    Dependencies.
  - **Containment.** Plans, skills, and agent files live in this repo. Plan
    Files are repo-relative: no absolute paths, no `~`, no `..` escaping the
    repo (`validate` rule `files-containment`). The vault is the only
    out-of-repo read/write; cite vault notes in Evidence, never in Files.
  - Never read or log `.env`, `.env.*`, `.pem`, `.key`, `~/.ssh/*` or other
    secret files. Reference paths only.
  - If the workflow and the user conflict, the workflow wins — change it by
    editing this file or a skill.
  
  ## Commands
  
  ```bash
  archiona plan --slug <s> --title "<t>" [--goal "..."]   # scaffold a plan
  archiona validate [--slug <s>]                          # FAIL = blocking, WARN = advisory
  archiona persona --slug <s> --set <persona> [--add-task "<text>"]
  archiona get-context                                    # workflow + plans + vault map as JSON
  archiona map                                            # rebuild the project's vault Map.md
  archiona note --slug <s> [--commit <hash>]              # write the plan's vault note, update Map.md
  archiona update [--dry-run]                             # resync seeded files, remove retired skills
  archiona hook                                           # regenerate agent instruction files
  ```
  
  Commands anchor to the nearest `.archiona/` (walking up, stopping at the git
  root), so they work from any subdirectory. If `archiona` is not on PATH, use
  `npx archiona <command>`; that only works on a machine where Archiona is
  `npm link`ed, because the package is not on the npm registry.

<!-- ARCHIONA-MANAGED-END -->
