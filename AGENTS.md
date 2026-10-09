# Knots

Vite + React + Tailwind base with per-user data. Stack: Bun, React 19 + TypeScript + Vite 8, Tailwind CSS v4, Convex, Clerk, Zustand (UI state, `src/store.ts`), TanStack Query (non-Convex data, `src/lib/utils/queryClient.ts`), ArkType (validation, `src/lib/utils/validators.ts`).

## Structure

- `convex/` — backend: `schema.ts` (users, knots, members, posts,
  messages, checkins, tugs, likes, comments, friend requests,
  notifications), `users.ts`, `knots.ts`, `posts.ts`, `messages.ts`,
  `checkins.ts`, `tugs.ts`, `friends.ts`, `comments.ts`,
  `notifications.ts`, `reminders.ts`, `crons.ts`, `knotScore.ts`
  (rope math), `auth.config.ts` (`_generated/` is produced by
  `convex dev`, committed).
- `src/` — `main.tsx` (entry), `router.tsx`
  (MobileScreen layout, `/home`, `/knots`, `/info`, `/profile`,
  `/user/:username`, `/post/:postId`, `/post/:postId/edit`,
  `/knot/:knotId`, `/profile/edit`, `/join/:token`,
  `/signin`, catch-all), `store.ts`,
  `lib/components/` (feature folders: `Posts/`, `TopBar/`, `BottomNav/`,
  `SideDrawer/`, `Composer/`, `Knots/`),
  `lib/layouts/` (`Backend.tsx`, Convex/Clerk providers, `MobileScreen/`
  phone-width frame), `lib/pages/` (`SignInPage.tsx`, lazy-loaded),
  `lib/utils/` (`queryClient.ts`, `validators.ts`),
  `lib/assets/` (images), `styles/` (`main.css` Tailwind entry, `tokens.css` dark base).
- `public/` — static assets.

## Rules

- Root-cause fixes, KISS. Remove dead code on sight. Lowercase comments.
- No `any`. Inferred types over casts. Resolve all diagnostics before committing.
- Logic/state in hooks, stores, or utils, not components.
- Convex: every function resolves the caller via `ctx.auth.getUserIdentity()` and scopes by subject. Never trust client-supplied ownership.
- Clerk: JWT template must be named `convex` (matches `convex/auth.config.ts`). `CLERK_JWT_ISSUER_DOMAIN` is backend-only; `VITE_*` vars reach the browser, never put secrets behind `VITE_`.
- Validate: `bun run lint && bun run build`.
- Tests: focused only. Colocated `*.test.ts(x)` next to the unit under test.
- Git (PowerShell only): commit only when explicitly instructed. Single-line conventional messages, max 120 chars. Never stage `.env.local`.

## UI — when styling

- Dark only: true black (`#000`) background, white primary text. Information-dense, no decorative card/pill chrome, no light-gray subtitle lines above sections. Minimal copy. No em dashes.
- Tailwind utilities first; shared values go in `src/styles/tokens.css` as CSS vars.
- Avoid continuously repainting CSS animations (pulse, shimmer, blur, spinners).

## Skills (`.agents/skills/`)

| Skill      | Use when                         |
| ---------- | -------------------------------- |
| `style`    | Styling components, Tailwind      |
| `webp`     | Image assets                      |
| `commit`   | Staging + committing             |
| `pr`       | PRs with structured descriptions |
| `grill-me` | Stress-testing a plan or design  |
