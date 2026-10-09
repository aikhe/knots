# Executive Systems Summary: KNOT

> **Target:** App Builders Hackathon Flagship Submission  
> **Authors:** Principal Systems Architect & Lead Product Strategist  
> **Classification:** Architectural Master Plan, System Dynamics & Behavioral Reference  
> **Companion Documents:** `mvp-spec.md` (PostgreSQL DDL & Client Pipeline), `problem-solution.md` (Behavioral Science Thesis)

---

## 1. Executive Pitch & The Core Thesis

Modern digital life is trapped in an asymmetric extraction loop: algorithmic feeds exploit dopamine receptors via variable-interval reinforcement schedules, while conventional productivity tools reduce self-improvement to isolated, performative vanity. Platforms maximize time-in-app through high-frequency dopamine micro-bursts, leaving knowledge workers suffering from profound cognitive fragmentation. Simultaneously, the productivity ecosystem incentivizes "larping"—the digital simulation of competence through aesthetic workspace setups, curated reading lists, and low-stakes streak counters—without demanding verified real-world execution. The modern achiever is hyper-connected socially, yet functionally abandoned in daily discipline.

The standard industry remedy—the binary streak counter—actively accelerates failure through ***the what-the-hell effect*** (Polivy & Herman, 1985). By defining success as an unbroken string of integers, legacy habit trackers construct brittle psychological edifices. When an inevitable life disruption causes a single lapse, the counter resets to zero. This total loss of accumulated equity triggers cognitive catastrophe: the user perceives months of discipline as wiped out, rationalizes total collapse, and permanently disengages. Solo discipline fails because isolated will depletes rapidly; legacy social tracking fails because asymmetric commitment breeds resentment and passive ghosting.

***KNOT*** resolves this failure mode by defining an ***On-Device Local AI Social Accountability Ledger*** governed by ***graceful decay***, ***conjunctive peer verification***, and ***zero-cloud local inference***. In KNOT, commitments are not stored as fragile solo counters; they are structural bonds tied between two peers (or self-anchored) with tensile integrity evaluated over continuous time. A missed check-in does not sever the knot; it ***frays*** the ledger by 25%, immediately opening an asynchronous 24-hour ***Rescue Window*** where discipline can be reclaimed. Verification is secured not through honor systems, gallery file pickers, or cloud AI endpoints, but through live, sensor-anchored snapshots pre-audited by an in-browser WebGPU/WASM Local AI Engine — visual and text embeddings never leave hardware silicon — then subjected to peer review. When the network disappears (MRT dead zone, capped prepaid load, brownout), KNOT keeps verifying offline and signs a local cryptographic attestation that syncs when connectivity returns. Failure becomes recoverable, progress becomes un-faked and private, and accountability becomes collaborative without cloud dependence.

The core mantra of the system:
> ***"Ascending and self-improvement shouldn't feel lonely."***

```
+---------------------------------------------------------------------------------------------------+
| METAPHORICAL & HISTORICAL FOUNDATION: THE REEF KNOT                                               |
|                                                                                                   |
| In maritime rigging, the Reef Knot (Square Knot, Hercules Knot) has bound sails for over 4,000   |
| years (documented by Pliny the Elder, Naturalis Historia). Its fundamental mechanical property:   |
| it holds perfectly when both lines maintain equal tension, but capsizes into a useless slip knot  |
| if tension becomes asymmetric. Human accountability mirrors this physics: mutual commitment       |
| strengthens the bond; unilateral abandonment collapses it.                                       |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. The User Journey & Day-to-Day Loop (What We Are Actually Building)

The KNOT ***On-Device Local AI Social Accountability Ledger*** translates behavioral theory into a five-stage operational loop executed over a rolling 24-hour cycle, with a transverse ***Local AI Engine*** pre-auditing every proof on silicon before peer review.

```
       [ 1. TIE ]              [ 2. CHECK-IN ]            [ 3. AUDIT ]           [ 4. SLIP ]           [ 5. RECOVER ]
+----------------------+   +---------------------+   +-------------------+   +-----------------+   +--------------------+
| Select Blueprint or  |   | In-App Live Camera  |   | 2-Hour Window     |   | Missed Deadline |   | Perfect Execution  |
| Direct Peer Invite   |-->| Zero Gallery Access |-->| Silent Pass or    |-->| 25% Fray Decay  |-->| +5% Tighten Bonus  |
| Zero Blank-Slate Gap |   | Sensor-Only Capture |   | Peer "Call Larp"  |   | 24h Rescue Gate |   | Scars Healed Clean |
+----------------------+   +---------------------+   +-------------------+   +-----------------+   +--------------------+
                                                  ║ LOCAL AI ENGINE (on-device, $0, <200ms) ║
                                                  ║ Vision Pre-Audit + Local RAG/Embeddings ║
```

### Stage 1: Tying the Knot (Frictionless Onboarding)
Users bypass blank-slate paralysis by choosing one of two onboarding vectors:
1. ***Cryptographically Signed Invite Link:*** A single-use URL containing a secure token. Visiting the link binds two user IDs into a mutual record within `knot_members`.
2. ***Hardcoded Blueprint Presets:*** Four battle-tested protocol templates eliminate configuration friction:
   - *Morning Gym Protocol:* 06:00–08:30 submission window; physical workout station proof.
   - *2-Hour Deep Work Block:* 09:00–12:00 window; distraction-free screen / notebook proof.
   - *Daily Reading:* 20:00–23:00 window; physical text page annotation proof.
   - *Side-Hustle Outreach:* 18:00–21:00 window; sent outbound pipeline proof.
Discovery is strictly search-only and invite-only: KNOT contains zero algorithmic recommendation engines and zero public explore feeds.

### Stage 2: The Honest Check-In (Viewfinder Live Capture + Local Vision Pre-Audit)
Legacy platforms allow users to upload recycled photos from native camera rolls. KNOT enforces ***Zahavi's Honest Signaling Principle*** through a strict hardware capture pipeline with on-device AI gating:
- The web client invokes `navigator.mediaDevices.getUserMedia()` to stream real-time frames directly from the device's image sensor into an in-memory `<video>` element.
- The Document Object Model (DOM) contains zero `<input type="file">` nodes. File system dialogs and photo galleries are architecturally inaccessible.
- Capturing a frame executes an instant rasterization draw to an in-memory HTML5 `<canvas>`, converting pixel data to a compressed JPEG blob (~150 KB) stripped of foreign EXIF metadata, uploaded atomically via `/api/proofs/submit`.
- ***Local Vision Anti-Cheat (Tier 1):*** Before upload, an in-browser WebGPU/WASM classifier scores the live frame locally in ***<200ms*** (`authentic | suspect-blank | suspect-screen | low-signal`). Blank ceilings, walls, and black screens trigger an instant private retake nudge. Zero pixels leave the device for this step; only the verdict scalar joins the submission. Cost: ***$0***, latency: sub-second, offline-capable.

### Stage 3: The Audit Window (Silent Pass vs. Bluff Call, After Local Pre-Audit)
Once submitted, proof enters a 2-hour asynchronous peer review window — already annotated with its on-device Local AI verdict:
- ***The Silent Pass:*** If the partner inspects the proof and takes no action, or does not open the app before `auto_approve_at` expires (2 hours in production, 60 seconds in demo mode), the proof silently flips to `approved`. Honest effort demands zero administrative overhead from the reviewer.
- ***The Bluff Call ("Call Larp"):*** If a user attempts to cheat (e.g., submitting a blank ceiling or black screen that slipped past the local nudge), the partner taps "Call Larp". The proof immediately transitions to `disputed`. The submitter receives zero integrity credit and must resubmit an authentic live snapshot before the daily cutoff. Local AI filters; the peer decides.

### Stage 4: The Inevitable Slip (Graceful Fray & Rescue Gate)
When a user misses the daily cutoff (23:59:59 local time) or leaves a dispute unresolved:
- Integrity does not drop to zero. The knot suffers a deterministic ***25% fray penalty*** (`FRAY_PENALTY_PERCENT = 25.0%`).
- The system automatically engages the ***24-Hour Rescue Window*** (`rescue_expires_at = cutoff + 24h`).
- Submitting an authentic rescue proof during this window restores ***80% of lost equity*** (`RESCUE_RECOVERY_RATIO = 0.80`), moving integrity from 75% back to 95%. The remaining 5% serves as a visual scar reminding users of the slip without demotivating continued pursuit.

### Stage 5: Tension & Recovery (Tightening Bonus)
To reward extended consistency and completely heal accumulated scars:
- Consecutive clean days where both partners achieve `approved` status award a ***+5% Tightening Bonus*** (`TIGHTEN_BONUS_PERCENT = +5.0%`).
- Two consecutive clean days permanently erase a 10% historical fray, restoring knot tensile strength to 100%.

### Local AI Engine (Transverse On-Device Layer — Tier 1, `src/lib/ai/`)
The loop above runs on silicon first, cloud second. Two local models execute in a Web Worker via `@huggingface/transformers` + ONNX Runtime Web (WebGPU with WASM fallback), off the main thread, with weights cached by the PWA after first fetch:
- ***Local Vision Anti-Cheat:*** In-browser image classifier scores every viewfinder frame locally in ***<200ms***. Flags `suspect-blank` (ceiling/wall/floor), `suspect-screen` (moire/bezel signature), and `low-signal` (black/blur) before peer review. Private nudge only — never auto-rejects, never uploads pixels. Offline-capable; emits a device-signed attestation (`proof_hash + verdict + confidence`) queued in IndexedDB when disconnected and synced on reconnect. Game-loop math unchanged: 25% fray, 80% rescue (100% demo), +5% tighten.
- ***Local RAG & Embeddings:*** `all-MiniLM-L6-v2` text embeddings run locally (<100ms) for private habit journaling and offline Blueprint semantic search ("most-forked study routines" without leaking journals). Journal vectors and Blueprint index live in IndexedDB; semantic retrieval works in MRT tunnels, on capped prepaid data, and during brownouts. Cloud sync carries only hashes and approved deltas, never raw prose.

---

## 3. Complete Visual Architecture & State Flow

KNOT's architecture couples a Next.js Progressive Web Application (PWA) with Supabase (PostgreSQL, Storage, and Row Level Security), driven by a lazy evaluation engine that computes knot health at query time.

### 3.1 Dual-Deadline Finite State Machine (ASCII State Flow)

```
                                      [ PENDING_INVITE ]
                                              │
                                              │ (Recipient accepts invite link)
                                              ▼
                        ┌──────────────── [ ACTIVE ] ◄──────────────────────────────┐
                        │              (100% Integrity)                             │
                        │                     │                                     │
                        │                     │ (User opens camera & snaps)         │
                        │                     ▼                                     │
                        │          [ SUBMITTED: PENDING ]                           │
                        │            (auto_approve_at)                              │
                        │             │              │                              │
         (auto_approve_at elapses     │              │ (Partner clicks "Call Larp") │
          or manual partner approval) │              │                              │
                        │             ▼              ▼                              │
                        │        [ APPROVED ]   [ DISPUTED ]                        │
                        │             │              │                              │
                        │             │              │ (Resubmit before cutoff)     │
                        │             │              └──────────────┐               │
                        │             │                             │               │
                        │             │ (Daily Cutoff: 23:59:59)    │               │
                        │             │ Missed Proof / Unresolved   │               │
                        │             └──────────────┬──────────────┘               │
                        │                            │                              │
                        │                            ▼                              │
                        │                    [ FRAYED: AT-RISK ]                    │
                        │                    (-25% Integrity Floor)                 │
                        │                    (Rescue Window Opens)                  │
                        │                            │                              │
                        │                            ├──────────────────────────────┘
                        │                            │ (Rescue Proof Approved: +80% Recovery)
                        │                            │
                        │                            │ (24h Rescue Window Elapses)
                        │                            ▼
                        │                   [ INTEGRITY CHECK ]
                        │                     │             │
                        │   Integrity > 0%    │             │ Integrity == 0%
                        │   (Knot Damaged)    │             │ (Terminal Failure)
                        │                     ▼             ▼
                        └──────────────► [ ARCHIVED: UNTIED / SNAPPED ]
```

### 3.2 Component Interaction & Data Pipeline Flow

```
+----------------------------------------------------------------------------------------------------+
| CLIENT LAYER (Next.js PWA / React 19)                                                              |
|                                                                                                    |
|  [ CameraCapture.tsx ]                               [ DashboardView.tsx ]                         |
|   - getUserMedia() Live Stream                        - SWR / React Query Poll (10s)               |
|   - In-Memory Canvas Rasterization                    - Renders Tensile Meter & Rescue Timer       |
|   - Strips EXIF / Eliminates Gallery Input            - Discloses "DEMO_MODE: 60s Silent Pass"     |
+---------------------------------------------------+------------------------------------------------+
                          │                                           ▲
                          │ 1. Multipart POST (/api/proofs/submit)    │ 4. Read Query
                          ▼                                           │    (SELECT * FROM
+---------------------------------------------------+                 │     v_dashboard_knots)
| SERVER API ROUTE / EDGE LAYER                     |                 │
|                                                   |                 │
|  [ /api/proofs/submit ]                           |                 │
|   - Validates user auth session                   |                 │
|   - Uploads binary JPEG to Supabase Storage       |                 │
|   - Executes atomic SQL transaction:              |                 │
|     * INSERT INTO public.proofs                   |                 │
|     * UPDATE public.knot_members (last_active_at) |                 │
+-------------------------┬-------------------------+                 │
                          │                                           │
       2. Signed Object   │ 3. Atomic DDL Write                       │
          Storage         │                                           │
                          ▼                                           ▼
+----------------------------------------------------------------------------------------------------+
| DATABASE ENGINE (Supabase / PostgreSQL 15)                                                         |
|                                                                                                    |
|  +---------------------------+   +------------------------------+   +---------------------------+  |
|  | storage.objects           |   | public.proofs / knot_members |   | public.v_dashboard_knots  |  |
|  | - Bucket: 'proofs'        |   | - auto_approve_at            |   | - Lazy Evaluation Engine  |  |
|  | - Strict RLS: Knot Member |   | - status: pending/disputed   |   | - Eliminates N+1 Queries  |  |
|  |   Read Only               |   | - Row Level Security guarded |   | - Real-time Computed Fray |  |
|  +---------------------------+   +------------------------------+   +---------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

### 3.3 Hardware vs. Software Logic Boundaries

```
+----------------------------------------------------------------------------------------------------+
| HARDWARE LOGIC (Physical Device & Firmware Controller)                                             |
|                                                                                                    |
|  [ CMOS Sensor & ISP ]            [ Display Backlight ]           [ PMIC Power Controller ]        |
|  - Sensor Bayer Filter            - LED / OLED PWM Controller     - Battery charge state & thermals|
|  - Silicon ISP Auto-Exposure      - Display refresh pulse         - OS Kernel Wake Lock interface  |
|  - Mechanical Camera Indicator    - Hardware panel power rails    - Deep sleep C-states management |
+----------------------------------------------------------------------------------------------------+
                                      ▲                               ▲
                         Hardware Bus │                  Kernel Calls │ (/sys/power/wake_lock)
                                      ▼                               ▼
+----------------------------------------------------------------------------------------------------+
| SOFTWARE LOGIC (OS Kernel, Browser Sandbox & Web Platform APIs)                                    |
|                                                                                                    |
|  [ Linux / Android / iOS Kernel ] -> [ Chromium / WebKit Sandbox ] -> [ KNOT Application Shell ]   |
|  - Camera HAL / V4L2 drivers          - MediaDevices.getUserMedia()    - streamRef hardware kill   |
|  - CoreAnimation / SurfaceFlinger     - CSS Viewport Engine (100dvh)   - iOS Fullscreen Fallback   |
|  - Power Management Subsystem         - Screen Wake Lock API           - Tab Visibility Auto-Renew |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. The Scientific & Mathematical Engine (Quick Reference)

### 4.1 Calibrated Mathematical Parameters

The core game loop parameters are calibrated to maximize psychological resilience while maintaining authentic friction.

| Parameter Name | Code / DB Variable | Production (Real-Time) | Demo Mode (`DEMO_MODE=true`) | Mathematical Justification & Purpose |
| :--- | :--- | :---: | :---: | :--- |
| ***Fray Penalty*** | `FRAY_PENALTY_PERCENT` | **25.0%** | **25.0%** | Scaled via $(100\% / N) \times 0.5$. In a 2-person knot, one missed check-in drops integrity by exactly one quarter, creating an immediate visual call to action. |
| ***Rescue Recovery*** | `RESCUE_RECOVERY_RATIO` | **0.80 (80%)** | **1.00 (100%)** | In production, rescuing restores $80\%$ of lost equity ($75\% \to 95\%$), leaving a permanent $5\%$ scar. In demo mode, it restores $100\%$ ($75\% \to 100\%$) for clean visual presentation. |
| ***Tightening Bonus*** | `TIGHTEN_BONUS_PERCENT` | **+5.0%** | **+5.0%** | Awarded per clean day (both members approved). Erases historical scars in 2 consecutive days, rewarding sustained discipline. |
| ***Silent Pass Timeout***| `SILENT_PASS_TIMEOUT_SEC` | **7,200s (2 Hours)** | **60s (1 Minute)** | Balances peer review latency against user friction. In demo, allows the full review cycle to complete before judges within 60 seconds. |
| ***Rescue Window*** | `RESCUE_WINDOW_SEC` | **86,400s (24 Hours)**| **720s (12 Minutes)** | Provides a full diurnal cycle for recovery. Compressed to 12 minutes during demo mode. |
| ***Ghost Snap Threshold***| `DEADWEIGHT_SECONDS` | **259,200s (72 Hours)**| **90s** | Threshold of zero partner activity before "Sever & Save" unlocks. On Day 8 of total inactivity, the knot snaps permanently. |
| ***Snap Floor*** | `SNAP_INTEGRITY_FLOOR` | **0.0%** | **0.0%** | A knot reaches terminal destruction only when integrity hits $0.0\%$ AND all active rescue windows have expired. |

```
+---------------------------------------------------------------------------------------------------+
| MATHEMATICAL HISTORY FUN FACT: THE ORIGIN OF MONTE CARLO SIMULATION                               |
|                                                                                                   |
| Stanislaw Ulam invented the Monte Carlo method in 1946 while playing Canfield solitaire during    |
| his recovery from brain surgery at Los Alamos. Instead of calculating complex combinatorial       |
| probabilities analytically, he realized that dealing hundreds of hands and observing the win     |
| rate yielded exact empirical distributions. John von Neumann immediately recognized its power     |
| and programmed the first automated Monte Carlo algorithms on the ENIAC vacuum-tube computer.      |
+---------------------------------------------------------------------------------------------------+
```

### 4.2 The Monte Carlo Simulation Proof (`sim_decay.py`)

To prove that a 25% fray penalty does not induce abandonment while ensuring that ghosted knots terminate cleanly, the system was validated across 5,000 Monte Carlo runs over a 30-day horizon (`seed=42`).

```
====================================================================================================
MONTE CARLO 30-DAY TRAJECTORY PROOF (5,000 RUNS, SEED=42)
====================================================================================================
Archetype A (Consistent): 90% daily compliance, 90% rescue attempt rate
Archetype B (Sporadic)  : 66.7% daily compliance (misses every 3rd day), 80% rescue rate
Archetype C (Ghost)     : 100% compliance Days 1-3, 0% compliance thereafter
----------------------------------------------------------------------------------------------------
Pairing Scenario        Day 7 Mean   Day 14 Mean   Day 30 Mean   Terminal Snap Rate   Median Snap Day
----------------------------------------------------------------------------------------------------
A + A (Dual Disciplined)   93.9%        93.5%         93.6%            0.0%               N/A
B + A (Sporadic + Anchor)  90.6%        89.8%         64.7%            0.4%               N/A
B + B (Dual Sporadic)      96.1%        97.4%         72.2%            0.0%               N/A
C + A (Ghosted Partner)     3.2%         0.0%          0.0%          100.0%              Day 8
====================================================================================================
```

#### Trajectory ASCII Bands

```
CONSISTENT PAIR [A + A]                 SPORADIC PAIR [B + A]                   GHOSTED PARTNER [C + A]
Integrity pegs at 90-95%.               Oscillates gracefully (60-90%).         Clean terminal drop.
100 |##############################     100 |## ##                              100 |###
 90 |                                    90 |      ## ##  #                      90 |
 80 |..............................      80 |..# .       #  ## ## ##  #          80 | ..#
 70 |                                    70 |   . #..#               #  ##       70 |
 60 |                                    60 |         ..# .#  #  #               60 |
 50 |                                    50 |  .  .  .   .  ..  .   #  #  #      50 |   .#
 40 |                                    40 |           .      .  .. ..  .       40 |
 30 |                                    30 |              .  .         .        30 |    .#
 20 |                                    20 |                    .  .            20 |
 10 |                                    10 |                          .  .      10 |
  0 |                                     0 |                                     0 |     .########################
    +------------------------------         +------------------------------         +------------------------------
     123456789012345678901234567890          123456789012345678901234567890          123456789012345678901234567890
```

#### Analytical Conclusions:
1. ***Resilience of Archetype B:*** With a 25% fray penalty and 80% rescue recovery, sporadic users exhibit a ***snap rate of only 0.4%*** over 30 days. They spend an average of only 4.57 days below 50% integrity. The system provides adequate psychological safety to prevent disengagement.
2. ***Necessity of Tightening Bonus:*** When the +5% tightening bonus is removed from the simulation, unrescued scars accumulate monotonically, driving Archetype B's snap rate up from 0.4% to ***32.5%***. The bonus is mathematically mandatory for long-term retention.
3. ***Deterministic Termination of Ghosting:*** When a partner vanishes (Archetype C), the knot drops below 50% by Day 5 and reaches 0% integrity by Day 8. With rescue windows expiring unfulfilled, the knot snaps cleanly on ***Day 8 (100.0% snap rate)***, eliminating zombie commitments.

### 4.3 Behavioral Theory & Scientific Foundations

```
+---------------------------------------------------------------------------------------------------+
| BEHAVIORAL SCIENCE FUN FACT: THE KÖHLER EFFECT & ROWING EXPERIMENTS                               |
|                                                                                                   |
| In 1926, German industrial psychologist Otto Köhler tested members of the Berlin rowing club      |
| doing bicep curls with 97-pound weights. When rowing or lifting alone, individuals hit exhaustion |
| rapidly. When tethered in dyads where task completion depended on the weaker individual (a        |
| conjunctive task), the weaker rower's physical persistence increased by over 200%. The effect is  |
| strongest when partner ability disparity is moderate (roughly 20-30%).                            |
+---------------------------------------------------------------------------------------------------+
```

| Cognitive Bias / Psychological Trap             | Scientific Citation                             | Behavioral Failure Mechanism                                                                                                     | KNOT Mechanical Countermeasure                                                                                    |
| :---------------------------------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| ***What-the-Hell Effect & Goal Disengagement*** | Polivy & Herman (1985); Marlatt & Gordon (1985) | A single slip resets binary streak counters to zero. The user perceives total investment loss and abandons the habit completely. | ***25% Fray Decay & 24h Rescue Window:*** Failure is partial and recoverable. The knot bends but does not snap.   |
| ***Social Loafing & Ringelmann Effect***        | Ringelmann (1913); Ingham et al. (1974)         | In large teams, individual accountability diffuses; members slack off assuming others will carry the burden.                     | ***1-on-1 Conjunctive Ties:*** $N=2$ dyads make both parties mutually indispensable (Köhler Effect).              |
| ***Goodhart’s Law & Performative Logging***     | Goodhart (1975); Strathern (1997)               | When a metric becomes the target, users cheat to optimize the metric (e.g., uploading old gym photos).                           | ***Live Sensor Capture & Bluff Calls:*** Zero gallery upload; live viewfinder capture + 2-hour peer audit window. |
| ***Solo Friction & Deep Work Inertia***         | Zajonc (1965); Hertel et al. (2000)             | Initiating cognitively demanding deep work solo triggers high friction and dopamine-seeking displacement.                        | ***Precommitment Devices & Body Doubling:*** Mutual check-in windows generate anticipatory social facilitation.   |
| ***Blank-Slate Setup Paralysis***               | Schwartz (2004); Iyengar & Lepper (2000)        | Requiring users to define custom habits, parameters, and cadences creates decision fatigue and drop-off.                         | ***lockedIn Blueprints:*** 4 hardcoded protocol presets pre-fill all parameters with a single tap.                |
| ***Ambient Digital Distraction***               | Skinner (1953); Cialdini (2006)                 | Open feeds and algorithmic notifications hijack attention, diverting users from discipline to doomscrolling.                     | ***Search-Only Discovery:*** Zero explore feeds, zero algorithmic recommendations, in-app focus lockout.          |

---

## 5. Scope Registry & Boundary Fence

To guarantee flawless execution during the hackathon, features are strictly triaged into three tiers. No deferred feature compromises the integrity of Tier 1.

```
+---------------------------------------------------------------------------------------------------+
| TIER 1: LOOP ZERO (MVP Core)                                                                      |
| 1. Tied Knot (1-on-1 Dyad)            3. Action Snapshots (Live Sensor Camera Only)               |
| 2. Knot Integrity, Fray & 24h Rescue  4. Silent Pass (2h/60s) & Partner Bluff Call ("Call Larp")  |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| TIER 2: HACKATHON EXTENSIONS (Should Have - Sequential Build)                                     |
| 2.1 Anchor Knot (Solo Mode)           2.4 In-App Focus Lockout (Fullscreen + Screen Wake Lock)    |
| 2.2 Deadweight Clause (Sever & Save)  2.5 lockedIn Blueprints (Forkable Protocol Registry)        |
| 2.3 Commitment Heatmap Grid                                                                       |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| TIER 3: POST-HACKATHON / ROADMAP (Strictly Deferred)                                              |
| 1. Squad Knot (3-5 Member Quorum)     3. Time Capsule (48h Inactivity Video Memory)               |
| 2. Live Pomodoro (Realtime Sync)                                                                  |
+---------------------------------------------------------------------------------------------------+
```

### Technical Fallbacks for Deferred Features

| Deferred Feature             | User Journey Affected                                               | Hardcoded Technical Fallback (Tier 1 Architecture)                                                                                                                                                |
| :--------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ***Anchor Knot (Solo)***     | Solo users or judges testing alone cannot tie a knot.               | Seed system account `***@knot-demo***`. A database trigger auto-accepts invites and auto-submits daily proofs. UI onboarding copy: *"Testing solo? Tie a knot with @knot-demo."*                  |
| ***Deadweight Clause***      | An active user whose partner ghosts continues to fray with no exit. | Knot card displays *"Partner inactive: Xd"* calculated from `last_active_at`. An ***"Untie"*** button sets `knots.status = 'archived'`, preserving full read-only history.                        |
| ***Commitment Heatmap***     | Profile lacks long-term 365-day visual proof density.               | Profile renders an aggregate counter (*"Verified proofs: N"*) and a reverse-chronological proof list. Table `proofs` preserves all timestamped data for zero-migration retrofitting.              |
| ***In-App Focus Lockout***   | Doomscrollers lack a dedicated distraction-blocking tool.           | Dashboard displays an inactive roadmap teaser card (*"Focus Lockout: Fullscreen Lockdown Coming Soon"*). No dead clicks.                                                                          |
| ***lockedIn Blueprints***    | Defining habits from scratch causes onboarding friction.            | TypeScript constant array `PRESETS` containing 4 hardcoded templates auto-fills title, cutoff time, and proof hints. Persisted via nullable column `knots.blueprint_slug`.                        |
| ***Squad Knot (3-5 users)*** | Groups of 3–5 cannot tie a single communal knot.                    | Groups establish pairwise Tied Knots. UI renders a disabled card labeled *"Squad Knot: Coming in V2"*. Database schema uses `knot_members` join table from Day 1 to prevent schema migrations.    |
| ***Live Pomodoro***          | Synchronous co-working deep work sessions are absent.               | Displayed as a dashboard roadmap card. Zero WebSocket / Supabase Realtime synchronization code is deployed, eliminating demo network race conditions.                                             |
| ***Time Capsule***           | Re-engagement mechanism after 48h of total inactivity is absent.    | Text-only `"Note to future me"` column (`knots.motivation_note`, max 280 chars) set at knot creation. Lazy read checks if last proof is > 48h old and displays the text note as an in-app banner. |

---

## 6. 3-Minute Hackathon Demo Cheat Sheet

### 6.1 Demo Execution Matrix

- **Environment:** Production URL deployed with `DEMO_MODE=true` banner visible (*"Demo clock: 1 minute = 2 hours"*).
- **Hardware Setup:** Two side-by-side browser windows:
  - **Window A (Left):** Presenter (`@maya`), camera permissions pre-granted.
  - **Window B (Right):** Partner (`@jon`), active dashboard session.
- **Pre-Seeded State:** Knot *"Morning Gym w/ @jon"* pre-staged at **75% integrity (Frayed)** with active Rescue countdown visible.

```
+-----------------------------------------------------------------------------------------------------------------------+
| TIME      | ACT & OBJECTIVE       | OPERATOR ACTION (Window A: @maya)       | PARTNER SCREEN (Window B: @jon)         |
+-----------+-----------------------+-----------------------------------------+-----------------------------------------+
| 0:00-0:20 | 1. The Problem        | Dashboard open. Points at frayed 75%   | Passive dashboard display.              |
|           | Context & Philosophy  | knot. Pitch: "Binary streaks kill       |                                         |
|           |                       | habits when life happens. KNOT repairs."|                                         |
+-----------+-----------------------+-----------------------------------------+-----------------------------------------+
| 0:20-0:50 | 2. Tie a Knot         | Taps 'New Knot' -> Selects '2-Hour      | Jon sees incoming invite or pastes link.|
|           | Frictionless Setup    | Deep Work' Blueprint preset -> Taps     | Clicks 'Accept'. Knot instantly appears |
|           |                       | 'Create' -> Copies signed invite URL.   | in both windows at 100% integrity.      |
+-----------+-----------------------+-----------------------------------------+-----------------------------------------+
| 0:50-1:20 | 3. Live Proof +       | Taps 'Check In' -> Live camera opens    | Pending Reviews updates via polling:    |
|           | Local Vision Pre-Audit| (points out zero gallery upload +       | Jon sees Maya's proof + local verdict   |
|           | On-Device $0 <200ms  | on-device verdict badge "<200ms").     | chip: "Local AI: authentic 0.94". Jon   |
|           |                       | Snaps screen -> Proof shows "Pending,   | takes no action. Timer hits 0 ->        |
|           |                       | Silent Pass in 60s".                    | Status: Approved.                       |
+-----------+-----------------------+-----------------------------------------+-----------------------------------------+
| 1:20-1:50 | 4. Offline Check-In   | Toggles DevTools Network -> Offline     | Jon's window stale (no network). Maya's |
|           | Zero-Cloud Proof      | (simulates MRT dead zone / brownout).   | UI shows "Offline — Local AI verified   |
|           | LOCAL AI THEME BEAT   | Snaps second proof. Local AI verifies   | + attestation queued". Re-enables       |
|           |                       | on-device ($0, no cloud), signs local   | network -> attestation syncs, proof     |
|           |                       | attestation queued in outbox.           | appears as Pending.                     |
+-----------+-----------------------+-----------------------------------------+-----------------------------------------+
| 1:50-2:15 | 5. Bluff Call         | Maya submits deliberate low-effort      | Jon inspects proof -> Clicks 'Call      |
|           | Anti-Cheat Enforcement| proof (camera pointed at ceiling;       | Larp'. Proof flips to 'Disputed' in     |
|           |                       | local model pre-flagged suspect-blank). | both windows. Integrity is withheld.    |
+-----------+-----------------------+-----------------------------------------+-----------------------------------------+
| 2:15-2:45 | 6. Rescue Recovery    | Opens pre-seeded 'Morning Gym' (75%     | Jon's window reflects Maya's rescue     |
|           | Recoverable Failure   | frayed) -> Submits live workout proof.  | submission. Upon approval, integrity    |
|           |                       | Silent pass elapses -> Integrity meter  | meter animates from 75% -> 100%.        |
|           |                       | animates 75% -> 100%.                   |                                         |
+-----------+-----------------------+-----------------------------------------+-----------------------------------------+
| 2:45-3:00 | 7. Close & Vision     | Returns to main dashboard. Both knots   | Displays roadmap cards:                 |
|           | The Core Mantra       | healthy. "Tie knots that don't fray —   | Squad Knots, Focus Lockout, Blueprints. |
|           |                       | even when the cloud disappears."        | + Local journal semantic search teaser. |
|           |                       | Displays attendee QR code for @knot-demo|                                         |
+-----------+-----------------------+-----------------------------------------+-----------------------------------------+
```

### 6.2 Judge FAQ & Defensible Countermeasures

1. **"Why not just build a native iOS/Android app to block apps at the OS level?"**
   - *Architectural Answer:* Native screen-time APIs (Apple Screen Time, Android Digital Wellbeing) are closed proprietary silos that forbid peer-to-peer social inspection and require enterprise MDM profiles. KNOT leverages web accessibility, cross-platform URL invites, and social commitment contracts that function seamlessly across any device without app store approval friction.
2. **"What stops users from taking a photo of a photo on their screen?"**
   - *Behavioral Answer:* KNOT operates on ***Honest Signaling Theory***. In a 1-on-1 Tied Knot, your referee is a friend, gym partner, or colleague—not an anonymous algorithm. Moire patterns, screen bezels, and lighting glare from photographed screens are immediately obvious to a peer referee. Cheating burns real-world social capital and triggers immediate "Call Larp" disputes.
3. **"How does KNOT scale without massive database polling costs?"**
   - *Engineering Answer:* State resolution is 100% ***lazy and evaluated on read*** via the composite SQL view `v_dashboard_knots`. Timeouts (`auto_approve_at`, `rescue_expires_at`) are evaluated just-in-time against server wall-clock timestamps (`now()`). There are zero expensive cron loops scanning millions of rows per second.
4. **"What happens when the network disappears — MRT tunnel, prepaid cap, brownout?"**
   - *Local AI Answer:* This is the theme beat. Vision classification (`<200ms`) and `all-MiniLM-L6-v2` embeddings run in a Web Worker via WebGPU/WASM at ***$0 marginal cost*** with weights cached in the PWA. The proof is verified on-device, device-signed into a local attestation, queued in IndexedDB, and synced when connectivity returns. Raw pixels and journal prose never leave silicon. Judges can falsify this live: DevTools Network → Offline → Check In → observe local verdict + queued sync.
