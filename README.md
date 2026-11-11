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

---

## Dokploy Deployment Configuration (Hostinger VPS)

In your Dokploy Dashboard on the VPS, set up two independent applications from the `main` branch of this repository:

1. **Frontend Service (`rajgir-frontend`):**
   - **Base Directory:** `frontend`
   - **Port:** `3000`
   - **Domain:** `rajgirmarathon.com`, `www.rajgirmarathon.com`, `rajgir.org`
   - **Environment:** `COMING_SOON=true`, `NEXT_PUBLIC_API_URL=https://api.rajgirmarathon.com`

2. **Backend Service (`rajgir-backend`):**
   - **Base Directory:** `backend`
   - **Port:** `4000`
   - **Domain:** `api.rajgirmarathon.com`
   - **Environment:** `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
