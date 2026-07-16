# Kyrgyztest — Frontend

React 19 + TypeScript admin/examiner/candidate UI for the Kyrgyztest backend
(separate repo: `kyrgyztest-system`, ASP.NET Core 8).

## Stack

- React 19 + TypeScript + Vite
- Feature-Sliced Design (`app → pages → widgets → features → entities → shared`)
- React Router v7 (data router, per-route lazy loading)
- TanStack Query
- Orval — generates a typed client + React Query hooks from the backend's OpenAPI schema
- React Hook Form + Zod
- shadcn/ui (Base UI primitives) + Tailwind CSS v4
- ESLint (+ `eslint-plugin-boundaries` enforcing FSD import direction) + Prettier + Husky + lint-staged

## Getting started

```bash
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL to the running backend
npm run dev
```

Requires the backend running locally (see `../kyrgyztest-system`, `docker compose up --build -d`).

## Scripts

```bash
npm run dev        # start Vite dev server
npm run build      # tsc -b && vite build
npm run lint        # eslint .
npm run format      # prettier --write .
npm run codegen     # regenerate src/shared/api/generated from the backend's OpenAPI schema
```

Run `npm run codegen` whenever the backend's API contract changes — it reads
`orval.config.ts`, which points at `http://localhost:5080/swagger/v1/swagger.json`
by default (update that URL if the backend's `API_PORT` changes).

## Two independent auth flows

- `/admin/**`, `/examiner/**` — JWT (`entities/account`'s `useAuth`), gated by
  `shared/guards/AdminAuthGuard`.
- `/exam/**` — no backend auth at all (candidates authenticate via access code
  only). `shared/guards/ExamAttemptGuard` just checks that an attempt id from
  `/exam/start` is present client-side; it's a routing signal, not a token
  sent to the backend.

## FSD layering

Import direction is enforced by ESLint (`boundaries/dependencies`), not just
convention: `app` → `pages` → `widgets` → `features` → `entities` → `shared`,
and slices within `widgets`/`features`/`entities` cannot import from sibling
slices in the same layer.
