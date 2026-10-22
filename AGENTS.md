# Knots

Bun + Turborepo monorepo: a Vite + React + Tailwind app with per-user data. Stack: Bun, React 19 + TypeScript + Vite 8, Tailwind CSS v4, Convex, Clerk, Zustand (UI state, `apps/web/src/store.ts`), TanStack Query (non-Convex data, `apps/web/src/lib/utils/queryClient.ts`), oxlint.

## Structure

- `apps/web` (`@knots/web`) — Vite + React app. `src/` = `main.tsx`, `router.tsx`, `store.ts`, `vite-env.d.ts` (typed `ImportMetaEnv`), `lib/ai/` (on-device embeddings: worker, hook, attest outbox), `lib/components/` (feature folders: `BottomNav/`, `Bubs/`, `Composer/`, `Dev/`, `Knots/`, `Onboarding/`, `Posts/`, `SideDrawer/`, `TopBar/`), `lib/hooks/` (shared hooks), `lib/layouts/` (`Backend.tsx` providers, `RequireAuth.tsx`, `EnsureUser.tsx`, `MobileScreen/` phone-width frame), `lib/pages/` (route pages; `SystemPage.tsx` is a dev-only lazy route), `lib/utils/` (`env.ts` public env flags, `queryClient.ts`, `knotBackgrounds.ts`, `redirect.ts`, `time.ts`), `styles/` (`main.css` Tailwind entry, `tokens.css` dark base). `public/` static assets.
- `packages/backend` (`@knots/backend`) — Convex backend in `convex/`: `schema.ts`, `users.ts`, `knots.ts`, `posts.ts`, `messages.ts`, `checkins.ts`, `tugs.ts`, `friends.ts`, `comments.ts`, `notifications.ts`, `reminders.ts`, `crons.ts`, `knotScore.ts` (rope math), `auth.config.ts`, `dev.ts`, `seed.ts`. `_generated/` is produced by `convex dev`, committed. Import it from the web app as `@knots/backend/api` and `@knots/backend/dataModel`, never relative `convex/_generated` paths.
- `packages/typescript-config` (`@knots/typescript-config`) — shared `base.json` and `react.json`. Changes in `packages/` affect the monorepo.
- Root: `turbo.json`, `.oxlintrc.json` (single oxlint config shared by all workspaces), `docs/`, `opencode.json`.

No new top-level dirs; changes live under `apps/` + `packages/`.

## Rules

- Root-cause fixes, KISS. Remove dead code on sight. Lowercase comments.
- No `any`. Inferred types over casts. Resolve all diagnostics before committing.
- Logic/state in hooks, stores, or utils, not components.
- Convex: every function resolves the caller via `ctx.auth.getUserIdentity()` and scopes by subject. Never trust client-supplied ownership.
- Clerk: JWT template must be named `convex` (matches `packages/backend/convex/auth.config.ts`). `CLERK_JWT_ISSUER_DOMAIN` is a Convex deployment env var, backend-only; `VITE_*` vars reach the browser, never put secrets behind `VITE_`.
- Validate: `bun run check && bun run build`.
- Tests: focused only. Colocated `*.test.ts(x)` next to the unit under test.
- Git (PowerShell only): commit only when explicitly instructed. Single-line conventional messages, max 120 chars. Never stage `.env.local`.

## UI — when styling

- Dark only: true black (`#000`) background, white primary text. Information-dense, no decorative card/pill chrome, no light-gray subtitle lines above sections. Minimal copy. No em dashes.
- Tailwind utilities first; shared values go in `apps/web/src/styles/tokens.css` as CSS vars.
- Avoid continuously repainting CSS animations (pulse, shimmer, blur, spinners).

## Skills (`.agents/skills/`)

| Skill      | Use when                         |
| ---------- | -------------------------------- |
| `style`    | Styling components, Tailwind      |
| `webp`     | Image assets                      |
| `commit`   | Staging + committing             |
| `pr`       | PRs with structured descriptions |
| `grill-me` | Stress-testing a plan or design  |

Design engineering pack (upstream: `emilkowalski/skill`, verbatim copies):

| Skill                                              | Use when                                     |
| -------------------------------------------------- | -------------------------------------------- |
| `emil-design-eng`                                  | UI polish, component design, motion judgment |
| `animate`                                          | Building motion from scratch                 |
| `review-animations` / `animation-performance`       | Strict motion critique, frame-budget bugs    |
| `improve-animations` / `find-animation-opportunities` | Codebase motion audit, where motion belongs  |
| `mobile-native`                                    | Phone-feel fixes: taps, 100vh, safe areas    |
| `break-ui`                                         | Worst-case data stress tests                 |
| `ask-sonner` / `pick-ui-library` / `prototype`     | Toasts, library choice, comparing variants   |
| `apple-design` / `animation-vocabulary`            | Gesture/spring theory, naming an effect      |

`review-animations`, `prototype`, and `pick-ui-library` set `disable-model-invocation`, so ask for them by name.
