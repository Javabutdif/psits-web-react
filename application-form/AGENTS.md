# Application Form Agent Guide

This standalone app lives in `application-form/` and follows the same React + TypeScript + Vite conventions as `client-side-ts/`, but it is a separate codebase.

## Read This First

- Inspect `application-form/src/` before changing files.
- Use `client-side-ts/` only as a visual and architectural reference.
- Do not modify `client-side-ts/` when working in this app.
- Keep changes minimal and aligned with the existing recruitment flow.

## File Organization

- Pages live in `application-form/src/pages/`
- Shared layout code lives in `application-form/src/layouts/`
- Reusable UI lives in `application-form/src/components/`
- Auth helpers live in `application-form/src/features/auth/`
- Shared API code lives in `application-form/src/api/`

## Design Direction

- Match the cleaner `client-side-ts` presentation style: frosted headers, rounded cards, soft shadows, strong typography, and calm neutral backgrounds.
- Prefer polished but simple layouts over plain gray admin screens.
- Reuse the local shared UI components when possible.

## Fix-First Rules

- Check the auth flow before assuming login works.
- Verify the current backend route contract before wiring API calls.
- Avoid introducing `any` unless there is no reasonable alternative.
- Prefer fixing shared components and layouts over restyling pages one by one.

## Agent Behavior

- Read this file before making changes in `application-form/`.
- Keep file placement local to this app.
- If the structure is unclear, inspect nearby files instead of guessing.
