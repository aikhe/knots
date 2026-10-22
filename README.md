<img alt="knots banner v1" src="https://github.com/user-attachments/assets/aa4b32bd-c74d-4b2b-a45f-fb065f67b59d" />

# knots

Bun + Turborepo monorepo: a Vite + React app with per-user data on Convex.

## Stack

- Bun (runtime, package manager, workspaces) + Turborepo (task runner)
- React 19 + TypeScript + Vite 8, Tailwind CSS v4 (`apps/web`)
- Convex backend (`packages/backend`)
- Clerk auth (`VITE_CLERK_PUBLISHABLE_KEY` + a `convex` JWT template)
- Zustand (UI state), TanStack Query (non-Convex data), oxlint

## Structure

- `apps/web` (`@knots/web`) — Vite + React app
- `packages/backend` (`@knots/backend`) — Convex functions, schema, and generated API
- `packages/typescript-config` (`@knots/typescript-config`) — shared `base.json` and `react.json`
- `turbo.json`, `.oxlintrc.json` — task graph and the single oxlint config for all workspaces
- `docs/` — project notes

## Envs

- `apps/web/.env.local` (copy `apps/web/.env.example`):
  - `VITE_CONVEX_URL` — backend client URL for the deployment `convex dev` uses.
  - `VITE_CLERK_PUBLISHABLE_KEY` — Clerk key.
- `packages/backend/.env.local`:
  - `CONVEX_DEPLOYMENT` — which deployment `convex dev` syncs to. Written by `convex dev`.
- Convex deployment env var (not a file): `CLERK_JWT_ISSUER_DOMAIN`, set from `packages/backend` with `bunx convex env set CLERK_JWT_ISSUER_DOMAIN <url>`. Read by `packages/backend/convex/auth.config.ts`. Needs a `convex` JWT template in Clerk.

Only `VITE_*` vars reach the browser. Never put secrets behind `VITE_`.

## Dev

- `bun install` at the root
- First time only: `cd packages/backend && bunx convex dev` to pick or create a deployment
- `bun run dev` at the root runs Convex and Vite together via Turborepo
- `bun run check && bun run build` to verify (lint, type check, build)

## Prod

- `bun run build` emits the static bundle to `apps/web/dist`.
- Frontend: deploy `apps/web/dist` to any static host. Set `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY` in the host's env settings, then rebuild. Vite bakes `VITE_*` vars in at build time.
- Backend: from `packages/backend`, `bunx convex deploy` pushes `convex/` to the production deployment. Point the frontend's `VITE_CONVEX_URL` at that deployment.
