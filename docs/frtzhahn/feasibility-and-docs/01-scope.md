# 01 - Scope Audit: KNOT (App Builders Hackathon)

> Inputs: `project-kickstart.md`, `00-context.md` (Section 6: 12 V1 features)
> Role: Principal Product Architect, strict triage
> Rule: No feature is deleted. Every feature gets a tier, a rationale, and, where deferred, a fallback that keeps the Tier 1 loop intact.

---

## 0. Triage Principles

1. **Loop Zero is the product's thesis, not a feature list.** KNOT claims three things: commitments are *social*, failure is *recoverable*, and progress is *verifiable*. Tier 1 contains the smallest set of features that proves all three claims end to end.
2. **Risk-weighted, not value-weighted.** A feature that is valuable but carries timeline risk (realtime sync, multi-party consensus, heavy storage) is deferred regardless of appeal.
3. **Schema is built for Tier 3 on day one. UI is built for Tier 1.** Deferred features must not force a database migration later (see Section 5).
4. **Cut-line gate.** Tier 2 work begins *only* after the 3-Minute Demo Script (Section 4) runs end to end, twice in a row, on the deployed production URL without errors.

---

## 1. Tier Summary

| Tier | Features | Count |
| --- | --- | --- |
| **Tier 1: Loop Zero** | Tied Knot; Knot Integrity, Fraying, and 24h Rescue Window; Action Snapshots; Silent Pass and Bluff Calls (duo mode) | 4 |
| **Tier 2: Hackathon Extensions** | Anchor Knot; Deadweight Clause (Sever & Save); Commitment Heatmap; In-app Focus Lockout; lockedIn Blueprints | 5 |
| **Tier 3: Post-Hackathon / Stretch** | Squad Knot; Live Pomodoro; Time Capsule | 3 |

### Enabling infrastructure (Tier 0, not among the 12 but required by Tier 1)

| Component | Scope |
| --- | --- |
| Auth and profile | Supabase Auth; unique `username`; display name; avatar optional |
| Invite link | Signed one-time knot invite URL. This is the *only* way to tie a knot in Tier 1, which matches the search-only discovery principle. |
| Dashboard | List of active knots with integrity meter, rescue countdown, pending reviews |
| PWA shell | Manifest and service worker for installability. Web Push is **out of scope** for the hackathon; use in-app banners instead. |
| Demo clock | `DEMO_MODE` environment flag that compresses time constants (Section 4.1), visibly disclosed in the UI |
| Seed script | Creates demo accounts and pre-staged knots in specific states |

---

## 2. Feature Triage with Rationale

### Tier 1: Loop Zero (Core MVP)

| # | Feature | Rationale |
| --- | --- | --- |
| 1 | **Tied Knot (1-on-1)** | *Product:* This is the "social" claim in its simplest form. Two people, one shared commitment. *Technical:* Two members is the minimum for peer verification, and it avoids every n-party edge case (quorum, partial check-ins, member churn). |
| 4 | **Knot Integrity, Fraying, and 24h Rescue Window** | *Product:* This is KNOT's core differentiator against binary streaks (the "what-the-hell effect" answer). Without it, KNOT is just another streak app. *Technical:* A ledger of integrity events and timestamp-based state (lazy evaluation) plus one scheduled sweep. It is cheap to build and fully deterministic. |
| 6 | **Action Snapshots (live camera only)** | *Product:* This is the "verifiable" claim, and it gives the loop its check-in action. *Technical:* `getUserMedia()` capture to a canvas, then upload a compressed JPEG to Supabase Storage. Images are small (~100-200 KB), so free-tier storage is not a risk. |
| 7 | **Silent Pass and Bluff Calls (duo mode)** | *Product:* Peer audit is the second half of verification. Without it, the camera alone is just a photo log. *Technical:* Silent Pass is a single `auto_approve_at` timestamp evaluated on read. Bluff Call in duo mode is a single partner flag with no voting, which avoids consensus logic entirely. Squad voting and abuse penalties ship with Squad Knot (Tier 3). |

### Tier 2: Hackathon Extensions (Should Have)

Build in the listed order. Each item is independently shippable, so the cut can happen anywhere in this list.

| Order | # | Feature | Rationale |
| --- | --- | --- | --- |
| 2.1 | 3 | **Anchor Knot (solo)** | *Product:* Serves solo self-improvers and is the *conversion target* for Sever & Save, so it must come before 2.2. *Technical:* The same `knots` table with one member and Silent Pass disabled. Almost no new code. The "global community milestone" link ships with Blueprints (2.5). |
| 2.2 | 5 | **Deadweight Clause (Sever & Save)** | *Product:* Solves partner ghosting, a top-three pain point in the problem statement, and is a memorable demo beat. *Technical:* A `last_active_at` comparison (72h) plus one transactional conversion (Tied to Anchor, preserving proof history). It depends on 2.1. |
| 2.3 | 10 | **Commitment Heatmap** | *Product:* High visual impact for judges and shows long-term consistency at a glance. *Technical:* A read-only `GROUP BY date` aggregate over existing `proofs` rows, rendered as a CSS grid. No new writes and no new tables. |
| 2.4 | 12 | **In-app Focus Lockout** | *Product:* Serves the chronic-doomscroller persona and previews Live Pomodoro. *Technical:* Client-only: Fullscreen API, Screen Wake Lock API, and a local countdown timer. No backend, no sync, and low risk, though it adds nothing to the core loop. |
| 2.5 | 9 | **lockedIn Blueprints (forkable templates)** | *Product:* Reduces setup friction and enables the protocol-registry discovery model. *Technical:* Needs a `blueprints` table, a fork action, and profile display. Tier 1 already covers the friction problem with hardcoded presets (Section 3), so this is a lower marginal gain than 2.1-2.4. |

### Tier 3: Post-Hackathon / Stretch (Defer)

| # | Feature | Rationale |
| --- | --- | --- |
| 2 | **Squad Knot (3-5 members)** | *Product:* High value for collectives, but the duo loop already proves the social thesis. *Technical:* Introduces multi-party consensus (bluff-call voting, quorum), conjunctive integrity, partial-check-in states, member leave and replace flows, and an unresolved fray formula. This is the largest edge-case surface of the 12. |
| 8 | **Live Pomodoro (synced co-working)** | *Product:* A strong body-doubling feature, but it lives outside the check-in loop. *Technical:* Requires realtime clock synchronization, presence, drift correction, reconnection handling, and multi-tab conflict resolution. Realtime bugs are hard to reproduce and are the most likely cause of a live-demo failure. |
| 11 | **Time Capsule** | *Product:* An emotional re-engagement hook that only triggers after 48h of total inactivity, so it cannot be shown naturally in a demo. *Technical:* Video upload, transcoding, and playback are bandwidth- and storage-heavy (a single 30-second clip is around 5-15 MB against a ~1 GB free tier). It also needs a reliable inactivity trigger and notification delivery. |

---

## 3. Dependency Breakage Check

For each deferred feature: which part of the user journey breaks, and the exact low-effort fallback that keeps Tier 1 seamless.

### Tier 2 deferrals

| Feature | Journey affected | Fallback (Tier 1 implementation) |
| --- | --- | --- |
| **Anchor Knot** | (a) Solo users with no partner hit a dead end at knot creation. (b) Judges testing alone cannot complete the loop. (c) Sever & Save has no conversion target. | Seed a system account **`@knot-demo`**. A database trigger auto-accepts any invite sent to it and auto-submits a daily proof. Onboarding copy: *"No partner yet? Tie a knot with @knot-demo."* The knot type picker shows only **Tied**. (c) is resolved by deferring Sever & Save together with Anchor. |
| **Deadweight Clause** | An active user whose partner ghosts keeps fraying with no exit. This is the exact pain point the product promises to solve. | (1) Show a **"Partner inactive: Xd"** badge from `last_active_at` on the knot card. (2) Add an **"Untie"** action that sets `knots.status = 'archived'`, stops fraying, and keeps all proofs readable. History is preserved; only the conversion to Anchor is missing. |
| **Commitment Heatmap** | The profile has no long-term consistency view. | The profile shows a **"Verified proofs: N"** counter and a reverse-chronological proof list per knot. The `proofs` table already stores `created_at` and `status`, so the heatmap later is a pure read-layer addition. |
| **In-app Focus Lockout** | The doomscroller persona has no focus tool. The check-in loop is **not** affected. | No functional fallback is required. Represent it as a **roadmap card** on the dashboard ("Focus Lockout, coming soon") and in the pitch, with no dead clicks. |
| **lockedIn Blueprints** | Knot creation requires defining a title, check-in window, and proof criteria from scratch, which is the setup-friction problem in the kickstart. | A hardcoded **`PRESETS`** constant (TypeScript array) of 4 templates: *Morning Gym Protocol*, *2-Hour Deep Work Block*, *Daily Reading*, *Side-Hustle Outreach*. Each pre-fills `title`, `checkin_window`, and `proof_hint`. Persist the choice as `knots.blueprint_slug` (nullable text) so migrating to a real `blueprints` table later is a backfill, not a schema change. |

### Tier 3 deferrals

| Feature | Journey affected | Fallback (Tier 1 implementation) |
| --- | --- | --- |
| **Squad Knot** | (a) Groups of 3-5 cannot form a single knot. (b) The knot type picker in onboarding. (c) Bluff-call voting and abuse penalty have no jury. | (a) Groups can form pairwise Tied Knots as an interim workaround. (b) The picker shows Squad as a **disabled card labeled "Coming soon"**. It is not hidden, so judges see the roadmap, but it is not clickable. (c) In duo mode, one partner flag sets the proof to `disputed`: no integrity credit, and the owner may resubmit within the active window or Rescue Window. No caller penalty in Tier 1; flags are counted per user for later abuse detection. **Schema guard:** use a `knot_members` join table from day one, never `partner_a` / `partner_b` columns. |
| **Live Pomodoro** | The synchronous deep-work use case is unserved. | If 2.4 ships, Focus Lockout provides a **solo** timed session. If not, there is no fallback and the feature appears as a roadmap card. No realtime channel code is written in Tier 1. Supabase Realtime remains available in the stack for later. |
| **Time Capsule** | No re-engagement mechanism after 48h of total inactivity. | A **text-only "Note to future me"** field (`knots.motivation_note`, max 280 chars) set at knot creation. Dashboard load checks lazily whether the last approved proof is more than 48h old; if so, it displays the note as a full-width banner. No storage cost, no cron job, no video pipeline. |

---

## 4. The 3-Minute Hackathon Demo Script

### 4.1 Pre-demo setup (not shown to judges)

| Item | Configuration |
| --- | --- |
| Environment | Production URL with `DEMO_MODE=true`. A banner reads *"Demo clock: 1 minute = 2 hours"*, so time compression is disclosed, not hidden. |
| Time constants (demo) | Silent Pass: 2h → **60s**. Rescue Window: 24h → **12 min**. Daily window close: manually triggered via a hidden seed endpoint. |
| Accounts | Two browsers side by side: **Window A = @maya** (presenter), **Window B = @jon** (partner). Both logged in, camera permission pre-granted in Window A. |
| Seeded state | Maya already has knot **"Morning Gym w/ @jon"** at **75% integrity, frayed**, with the Rescue Window open. |
| Safety net | A screen recording of a clean run, ready to play if the network fails. |

### 4.2 Script

| Time | Act | Window | Judge sees | Claim proven |
| --- | --- | --- | --- | --- |
| 0:00-0:20 | **1. The Problem** | A | Dashboard. Presenter: *"Streaks reset to zero when you slip once, so people quit. Accountability partners ghost. People fake progress with old photos. KNOT fixes all three."* Point at the frayed 75% "Morning Gym" knot. | Context |
| 0:20-0:55 | **2. Tie a Knot** | A → B | Maya taps **New Knot**, picks the *2-Hour Deep Work Block* preset (fields auto-fill), and taps **Create**. An invite link appears. Paste it into Window B; Jon taps **Accept**. The knot appears in both windows at **100%**. Mention: *"No explore feed. You can only find people by exact username, QR code, or invite link."* | Social, low friction |
| 0:55-1:35 | **3. Live Proof + Silent Pass** | A → B | Maya taps **Check In**. The live camera opens with *no gallery option*; point this out. She captures her laptop screen and adds the caption *"Chapter 3 done."* The proof shows **"Pending, Silent Pass in 60s."** Jon's window shows it in **Pending Reviews**. Jon takes no action, the countdown expires, and the proof flips to **Approved**. The integrity event registers. | Verifiable, no friction for honest users |
| 1:35-2:10 | **4. Bluff Call** | A → B | Maya checks in again with a low-effort snapshot (camera pointed at the ceiling). In Window B, Jon taps **Call Larp**. The proof flips to **Disputed** in both windows, and no integrity credit is given. Presenter: *"Cheating costs you. Your partner is the referee."* | Anti-cheat |
| 2:10-2:45 | **5. Rescue** | A | Open the seeded **"Morning Gym"** knot: **75%**, Rescue Window countdown visible. Maya submits a snapshot. After the Silent Pass, integrity animates **75% → 100%**. Presenter: *"Missing a day frays your knot. It doesn't kill it, and you get a window to repair it."* | Recoverable failure |
| 2:45-3:00 | **6. Close** | A | Dashboard with both knots healthy. Presenter: *"Tie knots that don't fray."* Show the roadmap cards: Squad Knots, Live Pomodoro, Time Capsule. | Vision |

### 4.3 Tier 2 insertions (only if shipped; trim Act 1 to compensate)

| Feature | Insert after | Beat (~10-15s) |
| --- | --- | --- |
| Commitment Heatmap | Act 5 | Open Maya's profile and show the populated 365-day grid (seeded history). |
| Sever & Save | Act 5 | Open a seeded knot with *"Partner inactive: 3d"*, tap **Sever & Save**, and it converts to an Anchor Knot with history intact. |
| Focus Lockout | Act 6 | Tap **Lock In** and the screen goes fullscreen with a minimal timer. Exit. |

---

## 5. Schema Guards (Prevent Future Migrations)

These decisions cost minutes in Tier 1 and save days in Tier 2/3.

| Guard | Implementation | Unblocks |
| --- | --- | --- |
| Membership as a join table | `knot_members(knot_id, user_id, role, joined_at, last_active_at)` | Squad Knot, Sever & Save |
| Knot type enum includes all types | `knot_type: 'tied' \| 'squad' \| 'anchor'`; Tier 1 UI only creates `'tied'` | Anchor, Squad |
| Proof status enum | `proof_status: 'pending' \| 'approved' \| 'disputed' \| 'rejected'`; `'rejected'` is reserved for squad voting | Squad bluff voting |
| Integrity as an event ledger | `integrity_events(knot_id, delta, reason, created_at)`; current integrity = clamped sum | Heatmap integrity rates, audit trail, Sever & Save history |
| Timestamp-driven state | `auto_approve_at`, `rescue_expires_at`, `last_active_at`; state is computed on read | Demo clock, all timed mechanics |
| Template reference | `knots.blueprint_slug` (nullable) | Blueprints |
| Motivation note | `knots.motivation_note` (nullable, 280 chars) | Time Capsule (video later attaches alongside the text) |

---

## 6. Resolved Open Items (from `00-context.md` Section 7)

| Open item | Tier 1 decision |
| --- | --- |
| Fray formula | Adopt the squad-scaled formula `(100% / members) x 0.5` now. For a Tied Knot it evaluates to **25%**, which matches the kickstart's flat value, so no Tier 3 rework is needed. Randomized fray is deferred. |
| Bluff-call abuse penalty | Deferred to Squad Knot (requires a jury). Flags are counted per user in Tier 1. |
| Desktop camera anti-cheat | `getUserMedia()` webcam capture works on desktop. No `<input type="file">` element is rendered anywhere in the proof flow. |
| Time Capsule storage | Resolved by the text-only fallback. Video is deferred to Tier 3. |
| Branding | Unchanged. To be decided in `mvp-spec.md`. |
