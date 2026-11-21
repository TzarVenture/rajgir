# Rajgir Marathon Digital Platform

Unified enterprise repository for the Rajgir Marathon platform, featuring a decoupled **Next.js 16 (Frontend)** and **NestJS (Backend REST API)** architecture.

---

## Architecture Overview

```text
rajgir/
├── frontend/               # Next.js 16 (App Router, Tailwind, SSR, Coming Soon)
│   ├── app/                # Public pages, runner registration wizard, admin UI
│   ├── components/         # Shared UI components
│   ├── lib/api.ts          # Type-safe API client targeting the NestJS backend
│   ├── middleware.ts       # Coming Soon stealth mode & domain canonicalization
│   └── Dockerfile          # Production multi-stage Docker build
│
├── backend/                # NestJS 10 (Core REST API & Microservice Transport)
│   ├── src/                # Modules: runners, volunteers, influencers, admin, health
│   ├── prisma/             # PostgreSQL Schema & Migrations (Supabase Cloud)
│   └── Dockerfile          # Production multi-stage Docker build
│
└── docker-compose.yml      # Orchestration for local development & VPS Dokploy
```

---

## Getting Started Locally

### 1. Backend Service (NestJS API)
```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```
- **API Base:** `http://localhost:4000/api/v1`
- **Swagger Documentation:** `http://localhost:4000/api/docs`
- **Health Check:** `http://localhost:4000/api/v1/health`

### 2. Frontend Application (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- **Web App:** `http://localhost:3000`

### 3. Tests
```bash
cd backend  && npm test                       # auth API over HTTP (fake Supabase/Prisma), route exposure
cd frontend && npm test                       # auth library unit tests
cd frontend && npm run build && npm run test:e2e   # full login/refresh/logout journeys vs. a mock API
```
None of the tests touch Supabase or the database.

---

## Authentication Architecture

One system, one source of truth:

- **Identity & credentials:** Supabase Auth, used only by the NestJS API (`backend/src/modules/auth`).
  Accounts are created in exactly one place, `POST /auth/signup` (Supabase identity + `users` row),
  then email verification, then registrations through authenticated endpoints.
- **Authorization:** the API authenticates *every* route by default (global `SupabaseAuthGuard`);
  only routes marked `@Public()` skip it (the list is pinned by `backend/test/routes.spec.ts`).
  `@Roles(...)` adds role checks (global `RolesGuard`). Guard order: rate limit, authenticate, roles.
- **Session:** a single httpOnly cookie (`rajgir_session`) on the frontend holding the API's tokens
  (`frontend/src/lib/auth/cookie.ts`). The browser never sees tokens and never calls the API directly.
- **Frontend auth module:** `frontend/src/lib/auth/session.ts`. Pages use `getCurrentUser()` (display)
  or `requireUser()` (protected); server actions use `authContext()`. The middleware is the only
  place tokens are refreshed.
- **Failure rules:** only an API `401` ends a session (cookie cleared via `/auth/signout`). Outages,
  timeouts and rate limits show a retryable error and keep the user signed in.

---

## Dokploy Deployment Configuration (Hostinger VPS)

In your Dokploy Dashboard on the VPS, set up two independent applications from the `main` branch of this repository:

1. **Frontend Service (`rajgir-frontend`):**
   - **Base Directory:** `frontend`
   - **Port:** `3000`
   - **Domain:** `rajgirmarathon.com`, `www.rajgirmarathon.com`, `rajgir.org`
   - **Environment:** `COMING_SOON=true`, `NEXT_PUBLIC_API_URL=https://api.rajgirmarathon.com`,
     `API_URL` (internal address of the backend, e.g. `http://rajgir-backend:4000/api/v1`),
     `INTERNAL_API_SECRET` (same value as the backend)

2. **Backend Service (`rajgir-backend`):**
   - **Base Directory:** `backend`
   - **Port:** `4000`
   - **Domain:** `api.rajgirmarathon.com`
   - **Environment:** `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` (required: every
     sign-in and session check uses it), `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`, `CORS_ORIGIN`,
     `INTERNAL_API_SECRET` (same value as the frontend), optional `TRUST_PROXY` (see `backend/.env.example`)
