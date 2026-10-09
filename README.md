# test-stack

Vite + React + Tailwind + Convex starter on Bun.

## Stack

- Bun (runtime + package manager)
- React 19 + TypeScript + Vite 8
- Tailwind CSS v4
- Convex backend (local-first dev via `bunx convex dev`)
- Clerk auth (`VITE_CLERK_PUBLISHABLE_KEY` + a `convex` JWT template)
- Zustand (UI state, `src/store.ts`), TanStack Query (non-Convex data,
  `src/lib/queryClient.ts`), ArkType (validation, `src/lib/validators.ts`)

## Structure

- `convex/` — backend: `schema.ts`, `tasks.ts`, `auth.config.ts`
  (`_generated/` is produced by `convex dev`, committed)
- `src/` — `main.tsx` (entry), `Backend.tsx` (Convex/Clerk providers),
  `App.tsx`, `store.ts`, `lib/` (`queryClient.ts`, `validators.ts`),
  `index.css` (Tailwind, true-black dark base)
- `public/` — static assets

## Envs

Copy `.env.example` to `.env.local` (gitignored). `bunx convex dev`
writes the Convex rows for you.

- `VITE_CONVEX_URL` — backend client URL. Required for data; app renders a
  setup hint without it.
- `VITE_CONVEX_SITE_URL` — HTTP actions URL. Written by `convex dev`,
  unused by the app so far.
- `CONVEX_DEPLOYMENT` — which deployment `convex dev` syncs to. Backend-only,
  never shipped to the browser.
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk key. Auth UI stays off without it.
- `CLERK_JWT_ISSUER_DOMAIN` — backend-side; must be visible to the
  `bunx convex dev` process for Clerk JWTs to verify (see
  `convex/auth.config.ts`). Needs a `convex` JWT template in Clerk.

Only `VITE_*` vars reach the browser.

## Dev

- `bun install`
- `bunx convex dev` (terminal 1, keeps backend in sync, writes
  `VITE_CONVEX_URL` to `.env.local`)
- `bun run dev` (terminal 2, opens the Vite dev server with HMR)
- `bun run lint`, `bun run build` to verify

## Prod

- `bun run build` — typechecks and emits the static bundle to `dist/`.
- `bun run preview` — serves `dist/` locally to sanity-check the prod build.
- Frontend: deploy `dist/` to any static host. Set `VITE_CONVEX_URL` (and
  `VITE_CLERK_PUBLISHABLE_KEY` if using auth) in the host's env settings,
  then rebuild — Vite bakes `VITE_*` vars in at build time.
- Backend: `bunx convex deploy` pushes `convex/` to the production
  deployment. Point the frontend's `VITE_CONVEX_URL` at that deployment.

Repo: `github.com/aikhe/test-stack`, branch `main`.
