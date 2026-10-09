# 00 - Project Context: KNOT (MVP Planning Phase)

> Source documents: `project-kickstart.md`, `knot-idea-board.md`
> Phase: Architecture and planning. No application code is in scope yet.
> Downstream artifact: `mvp-spec.md`

---

## 1. Document Intent

| Field        | Value                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Context      | App Builders Hackathon submission (originally scoped for Shipathon, per `knot-idea-board.md`)     |
| Spec purpose | A solid, buildable MVP draft. Team composition and task ownership are intentionally out of scope. |
| Priority     | Maximize signal per section. Keep it concise and decision-oriented, with no filler.               |

---

## 2. Product Summary (Inferred)

**KNOT** is a social accountability PWA. Users "tie knots" (shared commitments) with peers, a small squad, or a global milestone. Binary streaks are replaced by a **0-100% integrity meter** that frays on missed check-ins and can be rescued. Progress is verified with **live camera snapshots** and **peer bluff calls**.

- **Platform:** Progressive Web App (desktop and mobile browsers)
- **Core constraint:** Browsers cannot lock other OS apps. Enforcement comes from *psychological commitment devices* (social stakes, verification friction), not OS-level control.
- **Design principle:** Anti-doomscroll. No algorithmic feed. Users are found only through exact-username search, QR code, or invite link. The only stream is a friends-only knot stream.
- **Target audience:** Peer duos, small squads (3-5), solo self-improvers, and chronic doomscrollers.

---

## 3. Tech Stack Decision

### Selected: Next.js + Supabase on Vercel

| Layer          | Technology                                            | KNOT feature it serves                                                                                               |
| -------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Frontend / PWA | Next.js (App Router) + service worker (e.g., Serwist) | Installable PWA, Web Push, Badging API, Fullscreen and Wake Lock for Focus Lockout                                   |
| Database       | Supabase Postgres                                     | Relational data model: users, knots, memberships, proofs, votes, blueprints, heatmap aggregates                      |
| Auth           | Supabase Auth                                         | Email / OAuth sign-in with no custom auth code                                                                       |
| Access control | Postgres Row Level Security (RLS)                     | Privacy tiers (Public / Mutual Knots Only / Private) enforced at the database layer                                  |
| Realtime       | Supabase Realtime (Broadcast + Presence)              | Live Pomodoro sync, "who is locked in" presence, live bluff-call updates                                             |
| File storage   | Supabase Storage (signed URLs)                        | Action Snapshots, Time Capsule videos                                                                                |
| Scheduled jobs | `pg_cron` + Edge Functions                            | Fray decay, 24h Rescue Window expiry, 2h Silent Pass auto-approval, 72h Deadweight trigger, 48h Time Capsule trigger |
| Hosting        | Vercel                                                | Zero-config Next.js deploys with preview URLs per branch                                                             |

### Why it is the recommended option

1. **The domain is relational.** Knots have members, members submit proofs, proofs receive votes, and knots fork from blueprints. These are joins and aggregates (for example, heatmap rollups), which SQL handles natively. A document store forces denormalization and duplicated writes.
2. **Privacy is a database concern, not a UI concern.** RLS lets one policy like *"a proof is readable only if the viewer shares an active knot with the owner"* protect every query path. If the UI forgets a check, the data still does not leak.
3. **Every time-based mechanic has a home.** Fraying, rescue windows, silent passes, deadweight detection, and time capsules are all *state changes triggered by elapsed time*. `pg_cron` runs these sweeps inside the database, so no separate worker server is needed.
4. **Realtime is included.** Live Pomodoro needs a shared clock and presence. Supabase Realtime provides both without running a WebSocket server. This matters because Vercel's serverless functions *cannot* hold long-lived WebSocket connections.
5. **One vendor covers five concerns.** DB, auth, storage, realtime, and cron come from one dashboard and one SDK. That keeps integration overhead lowest, which is the main risk in a hackathon timeline.

### Known limitations (plan around these)

- **Free-tier limits:** Supabase Free provides roughly *500 MB DB and 1 GB storage*, and pauses projects after about *one week of inactivity*. Time Capsule **video** is the feature most likely to exhaust storage. Cap clip length and size in the spec.
- **`pg_cron` granularity:** The smallest interval is about one minute, which is acceptable for all KNOT timers.
- **iOS Web Push:** This works *only* when the PWA is installed to the Home Screen (iOS 16.4+). In-browser Safari users will not receive push notifications.
- **Vendor coupling:** Realtime and Storage APIs are Supabase-specific. Postgres itself is portable.

### Alternatives considered

| Stack                                             | Strength for KNOT                                                                                                                                                        | Trade-off                                                                                                                                                                 | Choose it if...                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Next.js + Convex**                              | Reactive queries update the UI automatically. `ctx.scheduler.runAfter()` gives *per-record timers* (for example, auto-approve this exact proof in 2h). Fully TypeScript. | Proprietary database. Smaller ecosystem. Privacy rules live in function code, not the DB.                                                                                 | You want the cleanest timer and realtime developer experience and accept lock-in. |
| **React (Vite) + Firebase**                       | Mature realtime (Firestore listeners). FCM is the strongest web-push pipeline.                                                                                           | NoSQL makes squad and heatmap queries awkward. Security rules for three privacy tiers are error-prone. Cloud Functions (needed for timers) require the paid *Blaze* plan. | Your team already knows Firebase well.                                            |
| **SvelteKit + PocketBase**                        | One self-hosted binary with auth, SQLite, file storage, and realtime subscriptions. Smallest client bundles.                                                             | You must host it on a VPS or Fly.io. SQLite is single-node. Fewer integrations.                                                                                           | You want full ownership and minimal cost, and you are comfortable with ops.       |
| **Next.js + Node/Express + Postgres + Socket.IO** | Full control over every mechanic. No vendor lock-in.                                                                                                                     | Highest build cost: auth, storage, realtime, and job runners are all hand-built.                                                                                          | Post-hackathon, if the product scales beyond managed-tier limits.                 |

### Architectural note: lazy evaluation for timers

Do not rely on cron alone to keep state accurate. Store deadlines as timestamps (`rescue_expires_at`, `auto_approve_at`, `last_active_at`) and **compute state on read**. For example, a proof is "approved" if `now() > auto_approve_at` and it has no open flag. Cron then becomes a *cleanup and notification* sweep, not the source of truth. This removes race conditions and keeps the UI correct even if a job runs late.

---

## 4. Timeline

Not specified by the user. `mvp-spec.md` will assume **hackathon-sprint scope** and order features by build priority so the cut line can move without rewriting the spec.

---

## 5. Test Users

Not specified by the user. Excluded from `mvp-spec.md` scope.

---

## 6. V1 Non-Negotiable Features (Test Scope)

The user designated all of the following as V1 test scope. The upcoming scope audit will assess feasibility and build order but **will not remove** any item from this list without explicit user approval.

| #   | Feature                                        | Category             |
| --- | ---------------------------------------------- | -------------------- |
| 1   | Tied Knot (1-on-1)                             | Knot Framework       |
| 2   | Squad Knot (3-5 members)                       | Knot Framework       |
| 3   | Anchor Knot (solo)                             | Knot Framework       |
| 4   | Knot Integrity, Fraying, and 24h Rescue Window | Integrity & Recovery |
| 5   | Deadweight Clause (Sever & Save)               | Integrity & Recovery |
| 6   | Action Snapshots (live camera only)            | Verification         |
| 7   | Silent Pass and Bluff Calls (larp flags)       | Verification         |
| 8   | Live Pomodoro (synced co-working)              | Productivity         |
| 9   | lockedIn Blueprints (forkable templates)       | Productivity         |
| 10  | Commitment Heatmap                             | Profile & Metrics    |
| 11  | Time Capsule                                   | Productivity         |
| 12  | In-app Focus Lockout                           | Productivity         |

> Scope risk flag: twelve features is a heavy load for a hackathon window. The scope audit should rank these into **Core / Should / Stretch** tiers rather than cut them.

---

## 7. Open Items Carried into `mvp-spec.md`

- Fray formula: flat 25%, randomized 0-25%, or squad-scaled `(100% / members) x 0.5`
- Bluff-call abuse penalty (failed larp call frays the caller)
- Branding: `KNOT` vs. `lockedIn` vs. hybrid (`lockedIn: Tie Knots that Don't Fray`)
- Camera anti-cheat on desktop (`getUserMedia` only; desktop has no `capture` attribute equivalent)
- Time Capsule storage limits on the free tier
