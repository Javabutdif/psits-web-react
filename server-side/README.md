# PSITS Web — Server Side

The backend API for the PSITS Web platform, built with **Node.js**, **Express**, **TypeScript**, and **MongoDB** (via Mongoose).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Architecture Notes](#architecture-notes)
- [Deployment](#deployment)
- [Docker](#docker)

---

## Overview

This service powers the backend for PSITS Web, handling:

- Student, admin, and event management
- Merchandise catalog, cart, and order processing
- Promotions, promo usage tracking, and refunds
- Memberships, certificates, and attendance
- Activity / API endpoint logging
- Email notifications (membership and order receipts)

The HTTP server boots from `src/index.ts`, mounts all routes under the `/api` prefix, and connects to MongoDB before listening on the configured port.

---

## Tech Stack

- **Runtime:** Node.js (target ES2020, CommonJS modules)
- **Framework:** Express 4
- **Language:** TypeScript 5
- **Database:** MongoDB via Mongoose 8
- **Auth:** JWT (`jsonwebtoken`) + cookies (`cookie-parser`)
- **Security:** `helmet`, `cors`, `express-rate-limit`
- **Uploads:** `multer` (local + `multer-s3`)
- **Object storage:** AWS S3 (`@aws-sdk/client-s3`) and Google Cloud Storage (`@google-cloud/storage`)
- **Image processing:** `sharp`
- **Email:** `nodemailer` with EJS templates
- **PDF generation:** `puppeteer`
- **Validation:** `zod`
- **Scheduling:** `node-cron` (daily promo check at midnight)
- **Misc:** `bcryptjs`, `axios`, `date-fns`

---

## Folder Structure

```
server-side/
├── .env                     # Local environment variables (not committed)
├── .gitignore
├── Dockerfile
├── nodemon.json             # Nodemon config (watches src/*.ts)
├── package.json
├── package-lock.json
├── tsconfig.json
├── vercel.json              # Vercel routing/build config
├── docs/                    # Backend-specific documentation
│   └── AUTH_V2_BACKEND.md
└── src/
    ├── index.ts             # App entry: bootstraps Express, Mongo, cron, routes
    ├── assets/              # Static assets (images, mail templates, EJS)
    ├── controllers/         # Request handlers (thin layer over services)
    ├── custom_function/     # Reusable helpers (promo checks, code generation, dates)
    ├── enums/               # Shared enums (campus, role, status, logs)
    ├── mail_template/       # Email templates, schemas, and mailer utilities
    ├── middlewares/         # Express middlewares (authV2, error handlers)
    ├── model_template/      # Shared model/data helpers
    ├── models/              # Mongoose models + their TypeScript interfaces
    ├── routes/              # Express routers mounted under /api
    ├── scripts/             # One-off scripts (e.g. enum migrations)
    ├── services/            # Business logic shared by controllers
    ├── templates/           # EJS templates for receipts / printable docs
    ├── types/               # Ambient TypeScript declarations (Express)
    ├── util/                # App-level utilities (JWT, cookies, errors, limiter)
    └── utils/               # Smaller helpers (HTML escape, base64, sort, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js 20+ (matches the Dockerfile base image)
- npm
- A running MongoDB instance (local or hosted)

### Install

```bash
cd server-side
npm install
```

### Configure environment

Create a `.env` file in `server-side/` (see [Environment Variables](#environment-variables) for the required keys). Do **not** commit it.

### Run in development

```bash
npm run dev
```

`nodemon` watches `src/` and re-runs the app via `ts-node` on every change.

### Build & run in production

```bash
npm run build      # tsc + copies src/assets -> dist/assets
npm start          # node dist/index.js
```

---

## Available Scripts

| Script                  | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm run dev`           | Start the server with Nodemon in watch mode                                 |
| `npm run build`         | Compile TypeScript and copy the `assets` folder into `dist/`                |
| `npm run start`         | Run the compiled server from `dist/index.js`                                |
| `npm run copy-assets`   | Copy `src/assets` into `dist/assets` (called automatically by `build`)     |
| `npm run migrate:old-enums` | Run the one-off enum migration script in `src/scripts/migrate-old-enums.ts` |

---

## Environment Variables

The following variables are read by the app. **Never commit real values** — keep them in a local `.env` or your platform's secret manager.

| Variable         | Required | Used For                                                              |
| ---------------- | -------- | --------------------------------------------------------------------- |
| `MONGODB_URI`    | Yes      | MongoDB connection string                                             |
| `DB_NAME`        | No       | Database name (defaults to `psits-test`)                              |
| `PORT`           | No       | HTTP port (defaults to `5000`)                                        |
| `CORS`           | No       | Allowed CORS origin (repeat as `CORS2`, `CORS3` for more origins)     |
| `JWT_SECRET`     | Yes (auth) | Signing/verifying JWT tokens                                        |
| AWS / GCS keys   | When using cloud uploads (S3 or GCS)                                  |
| SMTP / mail keys | When sending email via Nodemailer                                     |

> Exact keys for cloud storage, mail, and any third-party integrations are defined in their respective services and configs. Check `.env.example` (if present) or the relevant service file for the canonical list.

---

## API Routes

All routes are mounted under the `/api` prefix in `src/index.ts`.

| Path                                    | Router                        |
| --------------------------------------- | ----------------------------- |
| `/api`                                  | `index.v2.route`              |
| `/api`                                  | `students.route` (v1)         |
| `/api/v2/auth`                          | `authV2.route`                |
| `/api/v2/events`                        | `eventsV2.route`              |
| `/api/v2/students`                      | `studentsV2.route`            |
| `/api/admin`                            | `admin.route`                 |
| `/api/admin/eligible-certificates`      | `eligibleCertificate.route`   |
| `/api/merch`                            | `merchandise.route`           |
| `/api/orders`                           | `orders.route`                |
| `/api/cart`                             | `cart.route`                  |
| `/api/logs`                             | `logs.route`                  |
| `/api/events`                           | `events.route` (v1)           |
| `/api/promo`                            | `promo.route`                 |
| `/api`                                  | `private.route`               |
| `/api/docs`                             | `documentation.route`         |
| `/api/certificates`                     | `certificate.route`           |

> Some routes still have v1 / legacy counterparts (events, students). v2 routes are the preferred surface for new client integrations.

---

## Architecture Notes

- **Controllers stay thin.** Business logic lives in `src/services/` and reusable helpers live in `src/util/`, `src/utils/`, and `src/custom_function/`.
- **Models are paired with interfaces.** Each Mongoose model in `src/models/` has a matching `*.interface.ts` file that defines the typed shape used by services and controllers.
- **Validation** is done with `zod` at the request boundary; authentication uses the middlewares in `src/middlewares/` (notably `authV2.middleware.ts` and `custom_authenticate_token.ts`).
- **Centralized error handling.** Requests flow through `errorHandler` (`util/errors.util.ts`) and `globalErrorHandler` (`middlewares/global.error.middleware.ts`).
- **Scheduled jobs.** A daily `node-cron` task runs `checkPromos()` from `src/custom_function/check_promo.ts` to expire/clean up promotions.
- **Asset handling.** Static and template assets live in `src/assets/` and `src/templates/`. The `build` script mirrors `src/assets` into `dist/assets` so production deployments serve the same files.

---

## Deployment

- **Vercel:** A `vercel.json` is provided. Adjust the `builds`/`routes` to match the actual Express entrypoint when deploying (`@vercel/node` is the typical adapter for a Node API).
- **Node host / container:** Use the included `Dockerfile` (Node 20). The container runs `npm start` against the compiled `dist/`, so make sure `npm run build` is executed during your image build step.

---

## Docker

Build and run the API in a container:

```bash
docker build -t psits-server .
docker run --env-file .env -p 5000:5000 psits-server
```

The container exposes port `5000` (matching the default `PORT`). Provide your environment variables via `--env-file` or your orchestrator's secret store.

---

## Additional Documentation

- [`docs/AUTH_V2_BACKEND.md`](docs/AUTH_V2_BACKEND.md) — details on the v2 authentication flow.
