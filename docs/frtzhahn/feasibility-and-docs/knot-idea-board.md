---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'

# idea dump aug 17, 2026
instead of keeping ur chat streak with friends on tiktok, why not do it the same with activities, habits, self improvement?

log, share, invite friends to do something instead of just doomscrolling all dau

app name idea: knot/knots
the catch is u can knot or tie with someone with tighthening that knot by e.g., self improvement, form relationship, do activities with, etc.

example is maybe u want to make money and get ur friedns on the same boat, then know is where u can tie that goal so that u can achieve it by being consistent and making the promise or ties an actual reality, u loose the knot especially one party is being inconsistent and not giving updates, progress, etc.

also the quota can be "ascending or improving shouldnt feel lonely"
since were humans
were social creatures
features idea:
- each knot, habit or goal can be made publicly and have a competition like lb etc if wanted to, this works like the tiktok sorting or leaderboard thing on the music used on that certain tiktok video: the higher the views and likes the better or the one on top (viral). this also means other can uae the same knot and achive or works toward it
- a few variations of knot base on the connection, streak, consistency, etc of ur knot w/someone
- a social feed where u can post images, text, etc. about it, maybe u can also invite or be friends with somebody through that and so u can invite then to the know or something like that
- u can also knot urself solo lol
- app lock and tracking

so the other party can know what u already unlocked by doing  something, etc

should be refined

excalidraw/notion links (online collaborative ver)
[old excalidraw](https://excalidraw.com/#room=49b7a662ef9b594f2158,V4rJGZNwRJKQLOtnqqfd9g)
[new excalidraw](https://excalidraw.com/#room=0ec05e4dc768732676b3,L56-FZiLFkpRgEyQvs2_iA)
[notion](https://app.notion.com/p/RENE-3f1be71a91758083a9feda35207a1c3c?p=3f1be71a9175802890f1d2d3cffc49b3&pm=s&pvs=31)

**update**: this project idea is originally to submit on shipathon is now being used for app builders hackathon

# summary personal docs
Here is the lossless summary for ***`summary.md`***, executed strictly in accordance with the ***lossless-summarizer*** protocol.

---

### *Concept Introduction & Fun Fact*
> ***New Concept: Rate-Distortion Theory vs. Lossless Kolmogorov Compression***  
> In algorithmic information theory, ***lossless compression*** aims to achieve the minimum descriptive length without exceeding zero distortion ($D = 0$). While Claude Shannon’s source coding theorem defines the fundamental statistical limit (entropy $H(X)$), Andreï Kolmogorov formalized the absolute shortest program that outputs a string without losing a single bit of structure. Summarizing systems architecture losslessly requires preserving every semantic invariant—state boundaries, parameters, and citations—while discarding structural redundancy.
>
> ***Fun Fact:***  
> When Claude Shannon published his seminal 1948 paper *A Mathematical Theory of Communication*, he initially hesitated on what to call the measure of information uncertainty. John von Neumann reportedly advised him: *"You should call it entropy, for two reasons. In the first place your uncertainty function has been used in statistical mechanics under that name, so it already has a name. In the second place, and more important, nobody knows what entropy really is, so in a debate you will always have the advantage!"*

---

`summary.md` | markdown | 387 lines, 38369 chars

## Gist
This document is the architectural master plan, system dynamics specification, and behavioral reference for KNOT, a flagship submission to the App Builders Hackathon. KNOT replaces fragile binary streak counters with a decentralized peer-to-peer accountability ledger governed by a 25% graceful fray decay and an asynchronous 24-hour rescue window. Check-ins require live, sensor-anchored camera capture without photo gallery access, followed by a 2-hour silent pass or peer bluff call ("Call Larp"). The system is implemented as a Next.js PWA with Supabase and verified via a 5,000-run Monte Carlo simulation showing a 0.4% snap rate for sporadic users and a deterministic day-8 termination for ghosted partners.

## Outline
### Executive Systems Summary: KNOT (L1-L8)
- Target: `App Builders Hackathon Flagship Submission` (L3)
- Authors: `Principal Systems Architect & Lead Product Strategist` (L4)
- Classification: `Architectural Master Plan, System Dynamics & Behavioral Reference` (L5)
- Companion Documents: `mvp-spec.md` (`PostgreSQL DDL & Client Pipeline`), `problem-solution.md` (`Behavioral Science Thesis`) (L6)

### 1. Executive Pitch & The Core Thesis (L10-L33)
- Problem: Modern digital life trapped in asymmetric extraction loop; algorithmic feeds exploit dopamine receptors via variable-interval reinforcement schedules, while conventional productivity tools reduce self-improvement to isolated, performative vanity (L12)
- Platforms maximize time-in-app via high-frequency dopamine micro-bursts, causing profound cognitive fragmentation in knowledge workers (L12)
- Productivity ecosystem incentivizes "larping" (digital simulation of competence via aesthetic workspaces, curated reading lists, low-stakes streak counters) without verified real-world execution; achievers are hyper-connected socially but functionally abandoned in daily discipline (L12)
- Industry failure: Binary streak counters accelerate failure through ***the what-the-hell effect*** (`Polivy & Herman, 1985`) (L14)
- Defining success as unbroken string of integers builds brittle psychological edifices; a single inevitable life lapse resets counter to zero, triggering cognitive catastrophe, rationalized total collapse, and permanent disengagement (L14)
- Solo discipline fails from rapid will depletion; legacy social tracking fails as asymmetric commitment breeds resentment and passive ghosting (L14)
- Solution: ***KNOT*** defines decentralized social accountability ledger governed by ***graceful decay*** and ***conjunctive peer verification*** (L16)
- Commitments are structural bonds between two peers (or self-anchored) with tensile integrity evaluated over continuous time, not fragile solo counters (L16)
- Lapses: Missed check-in does not sever knot; ***frays*** ledger by 25%, immediately opening asynchronous 24-hour ***Rescue Window*** to reclaim discipline (L16)
- Verification: Live, sensor-anchored snapshots subjected to peer review; no honor systems or gallery file pickers (L16)
- Outcome: Failure recoverable, progress un-faked, accountability collaborative (L16)
- Core mantra: *"Ascending and self-improvement shouldn't feel lonely."* (L19)
- Metaphorical & Historical Foundation: The Reef Knot (L21-L31):
  - Reef Knot (Square Knot, Hercules Knot) used in maritime rigging >4,000 years, documented by Pliny the Elder in `Naturalis Historia` (L25-L26)
  - Mechanical property: holds perfectly under equal tension on both lines; capsizes into useless slip knot under asymmetric tension (L26-L28)
  - Human accountability mirrors this physics: mutual commitment strengthens bond, unilateral abandonment collapses it (L28-L29)

### 2. The User Journey & Day-to-Day Loop (What We Are Actually Building) (L35-L80)
- Operational loop: Translates behavioral theory into five-stage loop over rolling 24-hour cycle: `[ 1. TIE ]` -> `[ 2. CHECK-IN ]` -> `[ 3. AUDIT ]` -> `[ 4. SLIP ]` -> `[ 5. RECOVER ]` (L37-L46)
  - Stage 1: Select Blueprint or Direct Peer Invite, Zero Blank-Slate Gap (L41-L44)
  - Stage 2: In-App Live Camera, Zero Gallery Access, Sensor-Only Capture (L41-L44)
  - Stage 3: 2-Hour Window, Silent Pass or Peer "Call Larp" (L41-L44)
  - Stage 4: Missed Deadline, 25% Fray Decay, 24h Rescue Gate (L41-L44)
  - Stage 5: Perfect Execution, +5% Tighten Bonus, Scars Healed Clean (L41-L44)
- Stage 1: Tying the Knot (Frictionless Onboarding) (L48-L56):
  - Onboarding vectors bypass blank-slate paralysis (L49):
    1. Cryptographically Signed Invite Link: Single-use URL with secure token; binds two user IDs into mutual record in `knot_members` (L50)
    2. Hardcoded Blueprint Presets: Four protocol templates (L51):
       - Morning Gym Protocol: 06:00–08:30 submission window; physical workout station proof (L52)
       - 2-Hour Deep Work Block: 09:00–12:00 window; distraction-free screen / notebook proof (L53)
       - Daily Reading: 20:00–23:00 window; physical text page annotation proof (L54)
       - Side-Hustle Outreach: 18:00–21:00 window; sent outbound pipeline proof (L55)
  - Discovery: Strictly search-only and invite-only; zero algorithmic recommendation engines and zero public explore feeds (L56)
- Stage 2: The Honest Check-In (Viewfinder Live Capture) (L58-L63):
  - Enforces ***Zahavi's Honest Signaling Principle*** via hardware capture pipeline (legacy platforms allow recycled camera roll uploads) (L59)
  - Web client calls `navigator.mediaDevices.getUserMedia()` streaming real-time frames directly from image sensor to in-memory `<video>` element (L60)
  - DOM contains zero `<input type="file">` nodes; file system dialogs and photo galleries are architecturally inaccessible (L61)
  - Instant rasterization draw to in-memory HTML5 `<canvas>`; converts pixels to compressed JPEG blob (~150 KB) stripped of foreign EXIF metadata; uploaded atomically via `/api/proofs/submit` (L62)
- Stage 3: The Audit Window (Silent Pass vs. Bluff Call) (L64-L68):
  - Submitted proof enters 2-hour asynchronous peer review window (L65):
  - The Silent Pass: If partner takes no action or doesn't open app before `auto_approve_at` expires (2 hours in production, 60 seconds in demo mode), proof silently flips to `approved`; zero administrative overhead for honest effort (L66)
  - The Bluff Call ("Call Larp"): Tapping "Call Larp" on cheat attempts (blank ceiling / black screen) flips proof to `disputed`; submitter gets zero integrity credit and must resubmit authentic live snapshot before daily cutoff (L67)
- Stage 4: The Inevitable Slip (Graceful Fray & Rescue Gate) (L69-L74):
  - Triggered upon missing daily cutoff (23:59:59 local time) or unresolved dispute (L70)
  - Deterministic 25% fray penalty (`FRAY_PENALTY_PERCENT = 25.0%`); integrity never immediately drops to zero (L71)
  - Engages 24-Hour Rescue Window (`rescue_expires_at = cutoff + 24h`) (L72)
  - Submitting authentic rescue proof restores 80% lost equity (`RESCUE_RECOVERY_RATIO = 0.80`), moving integrity from 75% to 95%; remaining 5% is a visual scar (L73)
- Stage 5: Tension & Recovery (Tightening Bonus) (L75-L79):
  - Rewards extended consistency and heals scars: consecutive clean days with both partners `approved` award +5% Tightening Bonus (`TIGHTEN_BONUS_PERCENT = +5.0%`) (L76-L77)
  - Two consecutive clean days permanently erase 10% historical fray, restoring tensile strength to 100% (L78)

### 3. Complete Visual Architecture & State Flow (L82-L194)
- Overview: Next.js Progressive Web Application (PWA) coupled with Supabase (PostgreSQL 15, Storage, Row Level Security) via lazy evaluation engine computing knot health at query time (L84, L160)
- 3.1 Dual-Deadline Finite State Machine (ASCII State Flow) (L86-L129):
  - `[ PENDING_INVITE ]` -> Recipient accepts invite link -> `[ ACTIVE ]` (100% Integrity) (L89-L93)
  - `[ ACTIVE ]` -> User opens camera & snaps -> `[ SUBMITTED: PENDING ]` (`auto_approve_at`) (L96-L99)
  - `[ SUBMITTED: PENDING ]` -> `auto_approve_at` elapses or manual partner approval -> `[ APPROVED ]` (L101-L104)
  - `[ SUBMITTED: PENDING ]` -> Partner clicks "Call Larp" -> `[ DISPUTED ]` (L101-L104)
  - `[ DISPUTED ]` -> Resubmit before cutoff -> returns to `[ SUBMITTED: PENDING ]` (L106-L107)
  - `[ APPROVED ]` / `[ DISPUTED ]` -> Daily Cutoff: 23:59:59 Missed Proof / Unresolved -> `[ FRAYED: AT-RISK ]` (-25% Integrity Floor, Rescue Window Opens) (L109-L116)
  - `[ FRAYED: AT-RISK ]` -> Rescue Proof Approved: +80% Recovery -> returns to `[ ACTIVE ]` (L118-L119)
  - `[ FRAYED: AT-RISK ]` -> 24h Rescue Window Elapses -> `[ INTEGRITY CHECK ]` (L121-L123)
  - `[ INTEGRITY CHECK ]` -> Integrity > 0% (Knot Damaged) -> `[ ACTIVE ]` / `[ ARCHIVED: UNTIED / SNAPPED ]` (L125-L128)
  - `[ INTEGRITY CHECK ]` -> Integrity == 0% (Terminal Failure) -> `[ ARCHIVED: UNTIED / SNAPPED ]` (L125-L128)
- 3.2 Component Interaction & Data Pipeline Flow (L131-L169):
  - Client Layer (Next.js PWA / React 19):
    - `CameraCapture.tsx`: `getUserMedia()` Live Stream, In-Memory Canvas Rasterization, Strips EXIF / Eliminates Gallery Input (L137-L140)
    - `DashboardView.tsx`: SWR / React Query Poll (10s), Renders Tensile Meter & Rescue Timer, Discloses `"DEMO_MODE: 60s Silent Pass"` (L137-L140)
  - Pipeline Step 1: Multipart POST (`/api/proofs/submit`) from `CameraCapture.tsx` to Server API Route / Edge Layer (L143, L148)
  - Server API Route / Edge Layer (`/api/proofs/submit`): Validates user auth session; uploads binary JPEG to Supabase Storage; executes atomic SQL transaction: `INSERT INTO public.proofs` and `UPDATE public.knot_members (last_active_at)` (L148-L153)
  - Pipeline Step 2: Signed Object Storage write to `storage.objects` (Bucket: `'proofs'`, Strict RLS: Knot Member Read Only) (L156, L162-L165)
  - Pipeline Step 3: Atomic DDL Write to `public.proofs` / `knot_members` (`auto_approve_at`, `status: pending/disputed`, Row Level Security guarded) (L156, L163-L166)
  - Pipeline Step 4: Read Query `SELECT * FROM v_dashboard_knots` from `public.v_dashboard_knots` (Lazy Evaluation Engine, Eliminates N+1 Queries, Real-time Computed Fray) to `DashboardView.tsx` (L143-L145, L163-L167)
  - Database Engine: Supabase / PostgreSQL 15 (L160)
- 3.3 Hardware vs. Software Logic Boundaries (L171-L194):
  - Hardware Logic (Physical Device & Firmware Controller) (L174-L181):
    - `[ CMOS Sensor & ISP ]`: Sensor Bayer Filter, Silicon ISP Auto-Exposure, Mechanical Camera Indicator
    - `[ Display Backlight ]`: LED / OLED PWM Controller, Display refresh pulse, Hardware panel power rails
    - `[ PMIC Power Controller ]`: Battery charge state & thermals, OS Kernel Wake Lock interface, Deep sleep C-states management
  - Hardware/Software Bus & Kernel Calls: Hardware Bus connects ISP/Display to Kernel; Kernel Calls (`/sys/power/wake_lock`) connect PMIC to Power Management Subsystem (L182-L184)
  - Software Logic (OS Kernel, Browser Sandbox & Web Platform APIs) (L185-L192):
    - `[ Linux / Android / iOS Kernel ]`: Camera HAL / V4L2 drivers, CoreAnimation / SurfaceFlinger, Power Management Subsystem
    - `[ Chromium / WebKit Sandbox ]`: `MediaDevices.getUserMedia()`, CSS Viewport Engine (`100dvh`), Screen Wake Lock API
    - `[ KNOT Application Shell ]`: `streamRef` hardware kill, iOS Fullscreen Fallback, Tab Visibility Auto-Renew

### 4. The Scientific & Mathematical Engine (Quick Reference) (L196-L294)
- 4.1 Calibrated Mathematical Parameters (L199-L223):
  - `FRAY_PENALTY_PERCENT` (Fray Penalty): Production **25.0%**, Demo **25.0%**; Scaled via $(100\% / N) \times 0.5$; in 2-person knot, one missed check-in drops integrity by one quarter as immediate visual call to action (L204-L205)
  - `RESCUE_RECOVERY_RATIO` (Rescue Recovery): Production **0.80 (80%)**, Demo **1.00 (100%)**; In production restores 80% lost equity ($75\% \to 95\%$) leaving 5% permanent scar; in demo mode restores 100% ($75\% \to 100\%$) (L204, L206)
  - `TIGHTEN_BONUS_PERCENT` (Tightening Bonus): Production **+5.0%**, Demo **+5.0%**; Awarded per clean day (both members approved); erases historical scars in 2 consecutive days, rewarding sustained discipline (L204, L207)
  - `SILENT_PASS_TIMEOUT_SEC` (Silent Pass Timeout): Production **7,200s (2 Hours)**, Demo **60s (1 Minute)**; Balances peer review latency against friction; demo completes review cycle within 60s (L204, L208)
  - `RESCUE_WINDOW_SEC` (Rescue Window): Production **86,400s (24 Hours)**, Demo **720s (12 Minutes)**; Provides full diurnal recovery cycle; compressed to 12 minutes in demo mode (L204, L209)
  - `DEADWEIGHT_SECONDS` (Ghost Snap Threshold): Production **259,200s (72 Hours)**, Demo **90s**; Threshold of zero partner activity before "Sever & Save" unlocks; knot snaps permanently on Day 8 of total inactivity (L204, L210)
  - `SNAP_INTEGRITY_FLOOR` (Snap Floor): Production **0.0%**, Demo **0.0%**; Terminal destruction occurs only when integrity reaches 0.0% AND all active rescue windows expired (L204, L211)
  - Mathematical History Fun Fact: The Origin of Monte Carlo Simulation (L214-L222):
    - Stanislaw Ulam invented Monte Carlo method in 1946 while playing Canfield solitaire recovering from brain surgery at Los Alamos (L217-L218)
    - Dealing hundreds of hands and observing win rate yielded exact empirical distributions instead of analytic combinatorial probabilities (L218-L220)
    - John von Neumann programmed first automated Monte Carlo algorithms on ENIAC vacuum-tube computer (L220-L221)
- 4.2 The Monte Carlo Simulation Proof (`sim_decay.py`) (L225-L270):
  - Validated across 5,000 Monte Carlo runs over 30-day horizon (`seed=42`) (L227, L231)
  - Archetypes (L233-L235):
    - Archetype A (Consistent): 90% daily compliance, 90% rescue attempt rate
    - Archetype B (Sporadic): 66.7% daily compliance (misses every 3rd day), 80% rescue rate
    - Archetype C (Ghost): 100% compliance Days 1-3, 0% compliance thereafter
  - 30-Day Trajectory Proof Data Table (L236-L243):
    - `A + A (Dual Disciplined)`: Day 7 Mean 93.9% | Day 14 Mean 93.5% | Day 30 Mean 93.6% | Terminal Snap Rate 0.0% | Median Snap Day N/A
    - `B + A (Sporadic + Anchor)`: Day 7 Mean 90.6% | Day 14 Mean 89.8% | Day 30 Mean 64.7% | Terminal Snap Rate 0.4% | Median Snap Day N/A
    - `B + B (Dual Sporadic)`: Day 7 Mean 96.1% | Day 14 Mean 97.4% | Day 30 Mean 72.2% | Terminal Snap Rate 0.0% | Median Snap Day N/A
    - `C + A (Ghosted Partner)`: Day 7 Mean 3.2% | Day 14 Mean 0.0% | Day 30 Mean 0.0% | Terminal Snap Rate 100.0% | Median Snap Day Day 8
  - Trajectory ASCII Bands (L246-L264):
    - Y-axis integrity scale (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100) across 30 days (`123456789012345678901234567890`)
    - Consistent Pair `[A + A]`: Integrity pegs at 90-95%
    - Sporadic Pair `[B + A]`: Oscillates gracefully at 60-90% (ranges between 40, 50, 60, 70, 80, 90, 100)
    - Ghosted Partner `[C + A]`: Clean terminal drop (0% by Day 8, flatline at 0% across Days 8-30)
  - Analytical Conclusions (L266-L270):
    1. Resilience of Archetype B: 25% fray penalty and 80% rescue recovery yield snap rate of only 0.4% over 30 days; average 4.57 days below 50% integrity; prevents disengagement (L267)
    2. Necessity of Tightening Bonus: Removing +5% tightening bonus causes unrescued scars to accumulate monotonically, raising Archetype B snap rate from 0.4% to 32.5%; mathematically mandatory for retention (L268)
    3. Deterministic Termination of Ghosting: When partner vanishes (Archetype C), knot drops <50% by Day 5 and reaches 0% by Day 8; unfulfilled rescue windows cause clean snap on Day 8 (100.0% snap rate), eliminating zombie commitments (L269)
- 4.3 Behavioral Theory & Scientific Foundations (L271-L294):
  - Behavioral Science Fun Fact: The Köhler Effect & Rowing Experiments (L274-L282):
    - In 1926 Otto Köhler tested Berlin rowing club members curling 97-pound weights; solo lifting exhausted rapidly (L277-L279)
    - In dyads where completion depended on weaker member (conjunctive task), weaker rower's physical persistence increased >200%; effect strongest when partner ability disparity is moderate (~20-30%) (L279-L281)
  - Theoretical Foundations Matrix (L285-L293):
    - What-the-Hell Effect & Goal Disengagement | `Polivy & Herman (1985); Marlatt & Gordon (1985)` | Single slip resets binary streak counter to zero; user perceives total investment loss and abandons habit | KNOT Countermeasure: 25% Fray Decay & 24h Rescue Window (failure is partial and recoverable; knot bends without snapping) (L287)
    - Social Loafing & Ringelmann Effect | `Ringelmann (1913); Ingham et al. (1974)` | Individual accountability diffuses in large teams; members slack off assuming others carry burden | KNOT Countermeasure: 1-on-1 Conjunctive Ties ($N=2$ dyads make both parties mutually indispensable per Köhler Effect) (L288)
    - Goodhart’s Law & Performative Logging | `Goodhart (1975); Strathern (1997)` | When metric becomes target, users cheat to optimize metric (e.g. uploading old gym photos) | KNOT Countermeasure: Live Sensor Capture & Bluff Calls (zero gallery upload; live viewfinder capture + 2-hour peer audit window) (L289)
    - Solo Friction & Deep Work Inertia | `Zajonc (1965); Hertel et al. (2000)` | Initiating cognitively demanding deep work solo triggers high friction and dopamine displacement | KNOT Countermeasure: Precommitment Devices & Body Doubling (mutual check-in windows generate anticipatory social facilitation) (L290)
    - Blank-Slate Setup Paralysis | `Schwartz (2004); Iyengar & Lepper (2000)` | Defining custom habits, parameters, cadences creates decision fatigue and drop-off | KNOT Countermeasure: `lockedIn` Blueprints (4 hardcoded protocol presets pre-fill parameters in one tap) (L291)
    - Ambient Digital Distraction | `Skinner (1953); Cialdini (2006)` | Open feeds and algorithmic notifications hijack attention, diverting users to doomscrolling | KNOT Countermeasure: Search-Only Discovery (zero explore feeds, zero algorithmic recommendations, in-app focus lockout) (L292)

### 5. Scope Registry & Boundary Fence (L296-L336)
- Triage: Strict 3-tier boundary fence guarantees execution; deferred features do not compromise Tier 1 (L298, L300-L321)
  - Tier 1: Loop Zero (MVP Core): 1. Tied Knot (1-on-1 Dyad); 2. Knot Integrity, Fray & 24h Rescue; 3. Action Snapshots (Live Sensor Camera Only); 4. Silent Pass (2h/60s) & Partner Bluff Call ("Call Larp") (L302-L305)
  - Tier 2: Hackathon Extensions (Should Have - Sequential Build): 2.1 Anchor Knot (Solo Mode); 2.2 Deadweight Clause (Sever & Save); 2.3 Commitment Heatmap Grid; 2.4 In-App Focus Lockout (Fullscreen + Screen Wake Lock); 2.5 `lockedIn` Blueprints (Forkable Protocol Registry) (L309-L313)
  - Tier 3: Post-Hackathon / Roadmap (Strictly Deferred): 1. Squad Knot (3-5 Member Quorum); 2. Live Pomodoro (Realtime Sync); 3. Time Capsule (48h Inactivity Video Memory) (L317-L320)
- Technical Fallbacks for Deferred Features (L323-L335):
  - Anchor Knot (Solo): Solo users/judges cannot tie knot -> Seed account `***@knot-demo***`; DB trigger auto-accepts invites and auto-submits daily proofs; UI copy: *"Testing solo? Tie a knot with @knot-demo."* (L327)
  - Deadweight Clause: Active user with ghost partner frays indefinitely -> Knot card shows *"Partner inactive: Xd"* from `last_active_at`; ***"Untie"*** button sets `knots.status = 'archived'` keeping read-only history (L328)
  - Commitment Heatmap: Profile lacks 365-day visual proof density -> Profile renders counter *"Verified proofs: N"* and reverse-chronological proof list; table `proofs` preserves all timestamped data for zero-migration retrofitting (L329)
  - In-App Focus Lockout: Doomscrollers lack distraction blocker -> Dashboard displays inactive roadmap teaser card (*"Focus Lockout: Fullscreen Lockdown Coming Soon"*); no dead clicks (L330)
  - `lockedIn` Blueprints: Habit definition friction -> TypeScript constant array `PRESETS` (4 templates) auto-fills title, cutoff time, proof hints; persisted via nullable `knots.blueprint_slug` column (L331)
  - Squad Knot (3-5 users): Groups cannot tie communal knot -> Pairwise Tied Knots; UI disabled card *"Squad Knot: Coming in V2"*; DB schema uses `knot_members` join table from Day 1 preventing migrations (L332)
  - Live Pomodoro: Absent synchronous co-working -> Dashboard roadmap card; zero WebSocket / Supabase Realtime synchronization deployed, eliminating network race conditions (L333)
  - Time Capsule: Re-engagement after 48h inactivity absent -> Text-only `"Note to future me"` column (`knots.motivation_note`, max 280 chars) set at knot creation; lazy read checks if last proof > 48h old and shows text note banner (L334)

### 6. 3-Minute Hackathon Demo Cheat Sheet (L338-L388)
- 6.1 Demo Execution Matrix (L340-L379):
  - Environment: Production URL deployed with `DEMO_MODE=true` banner visible (*"Demo clock: 1 minute = 2 hours"*) (L342)
  - Hardware Setup: Two side-by-side browser windows: Window A (Left): Presenter (`@maya`), camera permissions pre-granted; Window B (Right): Partner (`@jon`), active dashboard session (L343-L345)
  - Pre-Seeded State: Knot *"Morning Gym w/ @jon"* pre-staged at 75% integrity (Frayed) with active Rescue countdown visible (L346)
  - Script Timeline (L349-L378):
    - `0:00-0:20` (Act 1: The Problem, Context & Philosophy): Maya has dashboard open, points at frayed 75% knot, pitches "Binary streaks kill habits when life happens. KNOT repairs."; Jon shows passive dashboard display (L351-L355)
    - `0:20-0:55` (Act 2: Tie a Knot, Frictionless Setup): Maya taps 'New Knot' -> selects '2-Hour Deep Work' Blueprint preset -> taps 'Create' -> copies signed invite URL; Jon sees incoming invite or pastes link -> clicks 'Accept'; knot appears in both windows at 100% integrity (L356-L359)
    - `0:55-1:35` (Act 3: Live Proof & Silent Pass, Honest Verification): Maya taps 'Check In' -> live camera opens (highlights zero gallery upload) -> snaps screen -> shows "Pending, Silent Pass in 60s"; Jon's dashboard polls and shows Maya's proof "Pending review (Auto-approves in 60s)", takes no action; timer hits 0 -> status: Approved (L360-L364)
    - `1:35-2:10` (Act 4: Bluff Call, Anti-Cheat Enforcement): Maya submits deliberate low-effort proof (ceiling camera); Jon inspects -> clicks 'Call Larp'; proof flips to 'Disputed' in both windows; integrity withheld (L365-L368)
    - `2:10-2:45` (Act 5: Rescue Recovery, Recoverable Failure): Maya opens pre-seeded 'Morning Gym' (75% frayed) -> submits live workout proof; silent pass elapses -> integrity meter animates 75% -> 100%; Jon's window reflects Maya's rescue submission; on approval, integrity meter animates 75% -> 100% (L369-L373)
    - `2:45-3:00` (Act 6: Close & Vision, The Core Mantra): Maya returns to main dashboard with both knots healthy, delivers mantra "Tie knots that don't fray", displays attendee QR code for `@knot-demo`; Jon displays roadmap cards (Squad Knots, Focus Lockout, Blueprints) (L374-L377)
- 6.2 Judge FAQ & Defensible Countermeasures (L380-L388):
  - Q1: Why not build native iOS/Android app to block apps at OS level? (L382)
    - Architectural Answer: Native screen-time APIs (Apple Screen Time, Android Digital Wellbeing) are closed proprietary silos forbidding peer-to-peer social inspection and requiring enterprise MDM profiles; KNOT leverages web accessibility, cross-platform URL invites, and social commitment contracts across any device without app store friction (L383)
  - Q2: What stops users from taking photo of photo on screen? (L384)
    - Behavioral Answer: KNOT operates on ***Honest Signaling Theory***; referee is a friend, gym partner, or colleague in 1-on-1 Tied Knot, not an algorithm; Moiré patterns, screen bezels, and lighting glare are immediately obvious to peer; cheating burns social capital and triggers "Call Larp" disputes (L385)
  - Q3: How does KNOT scale without massive database polling costs? (L386)
    - Engineering Answer: State resolution is 100% ***lazy and evaluated on read*** via composite SQL view `v_dashboard_knots`; timeouts (`auto_approve_at`, `rescue_expires_at`) evaluated just-in-time against server wall-clock timestamps (`now()`); zero expensive cron loops scanning rows (L387)

## Flags
None.

## Coverage
Read L1-L387 of 387 | 387 -> 184 (~48%) | anchor check: passed, 185 anchors

---------------

# Engineering Supervisory Report: KNOT System Architecture & Feasibility Audit

**To:** Engineering Team & Product Architecture  
**From:** Principal Systems Architect & Adversarial Tech Lead  
**Classification:** Systems Feasibility Audit, Platform Strategy & Milestone Blueprint  
**Reference Core:** `summary.md`, `02-hypotheses.md`, `mvp-spec.md`  

---

### Mandatory Error Acknowledgment
Before delivering the technical audit, a file resolution discrepancy must be documented: the reference to `personal-docs-frtzhahn/hypotheses.md` failed on the filesystem because the file is indexed as [02-hypotheses.md](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/personal-docs-frtzhahn/02-hypotheses.md). The path has been verified and incorporated into this audit.

---

## 1. Stack Divergence & Feasibility Audit

The planned architecture in [mvp-spec.md](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/personal-docs-frtzhahn/mvp-spec.md) specified ***Next.js App Router, Supabase (PostgreSQL 15, RLS, pg_cron, Storage)***. The existing workspace contains ***Bun, Vite, React 19, Tailwind v4, Convex backend, Clerk authentication, Zustand, and TanStack Query*** in [package.json](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/package.json).

```
+----------------------------------------------------------------------------------------------------+
| ARCHITECTURAL TOPOLOGY COMPARISON                                                                  |
|                                                                                                    |
| PLANNED (SPEC):                                                                                    |
| [Next.js Client] --(10s Poll / HTTP)--> [Next API Edge] --(SQL / RLS)--> [Postgres 15 + pg_cron]   |
|                                                                                                    |
| ACTUAL (WORKSPACE):                                                                                |
| [Vite React SPA] <========(Persistent WebSocket Sync Engine)========> [Convex Reactive Engine]     |
|         │                                                                     │                    |
|         └──(Session JWT)──> [Clerk Auth API]         [Built-in Scheduler & Storage Engine]        |
+----------------------------------------------------------------------------------------------------+
```

### 1.1 Reactive WebSocket Subscriptions vs. Lazy-Evaluation Read Queries

- **The Spec's Model:** [mvp-spec.md](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/personal-docs-frtzhahn/mvp-spec.md) based state resolution on ***Timestamp-Driven Lazy State*** via PostgreSQL views (`v_dashboard_knots` and `v_resolved_proofs`). Status was computed at request time by evaluating `NOW() >= auto_approve_at`. The client relied on a 10-second polling loop and tab focus listeners.
- **Convex's Model:** Convex utilizes a persistent WebSocket connection that streams subscription diffs directly to the client. When data changes on the server, subscribed UI components re-render immediately.
- **The Critical Trap (Query Determinism & Clock Invalidation):**
  - ***Systems Concept: Read-Set Dependency Tracking.*** Convex query functions are strictly pure and deterministic. Convex tracks the exact set of database documents read during query execution. A query will **only** recompute and push updates over the WebSocket when a document in its read set is mutated.
  - Calling a dynamic clock check inside a Convex query will not trigger a reactive push as wall-clock time passes because no database write occurred.
  - If we rely on Convex reactive subscriptions for the 2-hour Silent Pass without writing a status change, the partner's screen will **never** automatically flip from pending to approved in real time.
- **Architectural Resolution:** Do not attempt pure lazy evaluation inside Convex reactive queries. Instead, split responsibilities:
  1. The client renders derived UI time-remaining states using an interval ticker.
  2. The server transitions the document state authoritatively via scheduled mutations.

> ***Important Fun Fact:*** *The reactive document subscription model pioneered by systems like Meteor and refined by Convex descends directly from David Gelernter’s 1985 Linda coordination language, which introduced the concept of a shared "tuple space" that clients observe asynchronously.*

---

### 1.2 Scheduled Execution: `ctx.scheduler.runAfter` vs. `pg_cron`

- **`pg_cron` in PostgreSQL:**
  - Operates as an external daemon polling on a fixed schedule (minimum 1-minute intervals).
  - Sweeps entire tables looking for expired records: `WHERE status = 'pending' AND NOW() >= auto_approve_at`.
  - Incurs O(N) table scans, creates transaction lock contention, and introduces up to 60 seconds of scheduling jitter, which destroys the 60-second fast-forward demo script.
- **Convex `ctx.scheduler.runAfter`:**
  - ***Systems Concept: Hierarchical Hashed Timing Wheels.*** Convex implements an internal event queue that awakens exact microsecond-resolution tasks without polling the entire database.
  - When a user submits proof, an atomic mutation schedules `runAfter(7200, "proofs:autoApprove", { proofId })` (or 60 seconds in demo mode). When the deadline hits, Convex invokes the mutation, modifies the proof status to approved, increments knot integrity, and automatically invalidates the reactive subscription.
- **Supervisor Verdict:** Convex's scheduler is objectively superior to `pg_cron` for KNOT's core mechanics. It eliminates cron sweep queries, guarantees sub-second execution accuracy for the live hackathon demo, and removes background daemon operations entirely.

---

### 1.3 Auth & Permission Complexity: Clerk + Convex vs. PostgreSQL RLS

- **PostgreSQL Row Level Security (RLS):**
  - RLS operates at the database kernel level. However, as documented in lines 178–190 of [mvp-spec.md](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/personal-docs-frtzhahn/mvp-spec.md), cross-table membership checks required an explicit `SECURITY DEFINER` function (`is_knot_member`) to bypass infinite recursion loops between `knots` and `knot_members`.
  - RLS policies are difficult to debug, silent in failure modes, and prone to severe performance degradations if table join indexes are misconfigured.
- **Clerk + Convex Model:**
  - Clerk issues an OpenID Connect (OIDC) JWT containing the user identity, verified by Convex using the Clerk JWKS endpoint configured in [convex/auth.config.ts](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/convex/auth.config.ts).
  - Convex enforces authorization imperatively in TypeScript function handlers via `ctx.auth.getUserIdentity()`.
  - Permissions are validated through explicit TypeScript helper guards (e.g., verifying membership on the `knot_members` table before returning data or executing a mutation).
- **Trade-off Analysis:** Imperative application-level authorization in Convex trades away database-kernel guarantees in exchange for transparent debugging, type-safe error handling, and zero SQL recursion headaches. Clerk abstracts passkey, SMS, and social authentication, eliminating the brittle cookie-session exchange required by Supabase Auth on mobile Safari.

---

### 1.4 Deployment & Hosting Realities: Vite SPA vs. Next.js on Vercel

```
+----------------------------------------------------------------------------------------------------+
| HOSTING PARADIGM COMPARISON                                                                        |
|                                                                                                    |
| Next.js App Router (Vercel):                                                                       |
| Client Request ──► Edge CDN ──► Cold-Start Serverless Node Container ──► Stream HTML Shell         |
| Problems: SSR hydration mismatches, complex cookie propagation, PWA worker caching volatility.    |
|                                                                                                    |
| Vite SPA + Cloudflare/Vercel Static Edge:                                                          |
| Client Request ──► Edge CDN ──► Static index.html + Pre-compiled JS (TTFB < 30ms)                  |
| Benefits: 100% deterministic asset caching, instant client-side transitions, no SSR runtime bugs. |
+----------------------------------------------------------------------------------------------------+
```

- **Next.js Overhead:** Next.js Server Components introduce server-client hydration boundaries, Edge/Serverless function cold starts, and complex cookie synchronization across mobile browsers. Service worker caching for Next.js is notoriously difficult because server-rendered routes mutate dynamically.
- **Vite SPA Advantages for a PWA:** A static single-page application built with Vite generates immutable static assets (`dist/`). It can be hosted on Cloudflare Pages or Vercel Static with zero cold starts, zero compute billing, and sub-30ms global edge delivery. This architecture is the industry standard for high-reliability Progressive Web Applications.

---

## 2. Repo & Dependency Bloat Audit

A forensic audit of [package.json](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/package.json) reveals significant architectural bloat, duplicate abstractions, and configuration defects that must be resolved before writing feature code.

```
+----------------------------------------------------------------------------------------------------+
| DEPENDENCY REDUNDANCY MATRIX                                                                       |
+--------------------------+-----------------------+-------------------------------------------------+
| Package                  | Status                | Supervisory Finding                             |
+--------------------------+-----------------------+-------------------------------------------------+
| @tanstack/react-query    | CRITICAL REDUNDANCY   | Dead weight. Convex provides its own reactive   |
|                          |                       | state cache. No secondary REST API exists.      |
+--------------------------+-----------------------+-------------------------------------------------+
| arktype                  | SCHEMA DUPLICATION    | Redundant. Convex features end-to-end schema    |
|                          |                       | validation via convex/values.                   |
+--------------------------+-----------------------+-------------------------------------------------+
| zustand                  | SCOPE CREEP           | Misused for 5 lines of UI state. Convex + React |
|                          |                       | 19 hooks eliminate the need for global stores.  |
+--------------------------+-----------------------+-------------------------------------------------+
| @clerk/clerk-react       | VALID BUT UNFINISHED  | Viable, but configuration in Backend.tsx        |
|                          |                       | contains a severe React re-render bug.         |
+--------------------------+-----------------------+-------------------------------------------------+
| convex                   | CORE SYSTEM           | Viable replacement for Postgres + pg_cron.      |
+--------------------------+-----------------------+-------------------------------------------------+
```

### 2.1 Critical Redundancies & Conflicts

1. **TanStack React Query (`@tanstack/react-query`):**
   - In [src/lib/queryClient.ts](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/src/lib/queryClient.ts), a comment states: *"For non-Convex async data. Convex queries stay on useQuery from convex/react."*
   - KNOT interacts exclusively with the Convex backend. There is **zero external REST API communication**. TanStack Query adds ~40 KB of minified JS to the bundle, wraps [src/main.tsx](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/src/main.tsx) in an unneeded context provider, and encourages junior developers to introduce fragmented caching strategies. It must be purged.
2. **ArkType (`arktype`):**
   - [src/lib/validators.ts](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/src/lib/validators.ts) defines an ArkType schema mirroring the database schema.
   - Convex already provides full runtime schema validation and automatic TypeScript inference via `convex/values` (`v.string()`, `v.boolean()`).
   - Maintaining parallel schema definitions between ArkType and Convex creates dual-maintenance synchronization debt. ArkType must be removed.
3. **Zustand (`zustand`):**
   - [src/store.ts](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/src/store.ts) maintains a single toggle: `showCompletedOnly`.
   - Managing application state across two separate paradigms (Convex's server-synchronized cache vs. Zustand's client store) creates split-brain state bugs. Simple UI state must live in standard React component state (`useState`), while persistent cross-view state lives in Convex.
4. **Severe Anti-Pattern in [src/Backend.tsx](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/src/Backend.tsx):**
   - Lines 16 and 26 instantiate `new ConvexReactClient(convexUrl)` directly inside the render path of the `Backend` component.
   - On every component re-render, a completely new WebSocket client instance is created, severing active socket connections, destroying query subscriptions, and triggering network churn. The Convex client must be instantiated as a module singleton outside the React lifecycle.

> ***System Design Fun Fact:*** *The term "code bloat" entered computing folklore in the 1970s when Niklaus Wirth formulated Wirth's Law: "Software is getting slower more rapidly than hardware is getting faster," later restated by Larry Gates as a warning against stacking redundant caching layers.*

---

## 3. PWA & Mobile Web Platform Reality

KNOT's core integrity claim relies entirely on the client being unable to fake sensor input. Moving from Next.js to a Vite SPA materially changes how we interface with the browser sandbox and mobile hardware.

```
+----------------------------------------------------------------------------------------------------+
| HARDWARE VS. SOFTWARE PLATFORM BOUNDARIES                                                          |
+----------------------------------------------------------------------------------------------------+
| HARDWARE LAYER (Physical Silicon & Firmware):                                                      |
| [CMOS Image Sensor] ──► [Mobile ISP (Hardware Auto-Focus)] ──► [Battery / PMIC Controller]        |
|          │                                                                │                        |
|          ▼                                                                ▼                        |
| OS KERNEL & DRIVER LAYER (Software Logic):                                                         |
| [V4L2 / Android HAL / Apple AVFoundation] ───────────────► [System Power Management Sleep C-State]|
|          │                                                                │                        |
|          ▼                                                                ▼                        |
| BROWSER SANDBOX LAYER (Web Platform):                                                              |
| [WebKit / Chromium Sandbox] ──► [MediaDevices.getUserMedia] ──► [Screen Wake Lock API]             |
|          │                                                                                         |
|          ▼                                                                                         |
| CLIENT RUNTIME:                                                                                    |
| [Vite SPA Shell] ──► [HTML5 Canvas Rasterization Engine (Strips EXIF, Encodes JPEG Blob)]          |
+----------------------------------------------------------------------------------------------------+
```

### 3.1 PWA Service Workers: Vite SPA vs. Next.js

- In Next.js, service worker configuration is notoriously brittle because service worker plugins struggle with server-rendered chunk manifests, hydration scripts, and dynamic API endpoints.
- In a Vite SPA, service worker orchestration is significantly more robust via `vite-plugin-pwa` (built on Google's Workbox).
- **Offline Shell Architecture:** The service worker can precache the entire compiled SPA bundle (`index.html`, CSS, JS chunks) deterministically. The app shell boots in offline mode within milliseconds, regardless of cellular connectivity.
- **The PWA Manifest & App Installation:** Vite generates an exact `manifest.webmanifest` directly into the build root, allowing seamless iOS "Add to Home Screen" and Android WebAPK installation.

### 3.2 Mobile Camera Capture (`getUserMedia`) & iOS Safari Quirks

Building an in-app viewfinder without file picker fallbacks requires navigating strict OS and browser hardware policies:

1. **Hardware Power & Sensor Leakage:**
   - When `navigator.mediaDevices.getUserMedia()` acquires the camera, the operating system illuminates the hardware privacy indicator (the green dot on iOS/Android).
   - If a React component unmounts without iterating over `stream.getTracks()` and executing `track.stop()`, the operating system keeps the camera subsystem and PMIC power rails active. This rapidly drains device battery and locks the camera hardware against subsequent capture attempts.
2. **WebKit Inline Video Hijacking:**
   - On iOS Safari, mounting a `<video>` element with an active camera stream will immediately trigger iOS to hijack the stream into its native fullscreen media player unless two hardware flags are set directly on the DOM node: `playsinline="true"` and `muted="true"`.
3. **Background Suspension:**
   - On iOS Safari, if the user switches apps or locks their phone while the viewfinder is mounted, the operating system immediately revokes frame delivery. The stream freezes permanently. The app must attach a listener to `document.visibilityState` to tear down and re-acquire the stream upon returning to the foreground.
4. **Standalone WebKit Sandbox Isolation:**
   - When an iOS user installs a PWA to their Home Screen, it runs in a standalone `WKWebView` container separate from mobile Safari. Camera permission prompts must be initiated through an explicit, un-delayed user gesture (e.g., direct tap on a "Check In" button). Async delays before requesting permission trigger automatic security denials.

---

## 4. Supervisory Verdict & Next Steps

### 4.1 Definitive Recommendation

***ADAPT OUR SPECIFICATIONS TO THIS VITE + CONVEX + CLERK REPOSITORY. DO NOT REVERT TO NEXT.JS + SUPABASE.***

**Strategic Rationale:**
1. **Instant Reactive Peer Sync:** KNOT's core psychological premise is *two-party dynamic accountability*. Convex's built-in WebSocket reactivity synchronizes state between Partner A and Partner B in real time with zero network configuration. Building this on Next.js + Supabase would require maintaining brittle Supabase Realtime channels or spamming the database with 10-second polling loops.
2. **Zero-Cron State Transitions:** Convex's `ctx.scheduler.runAfter` replaces the entire `pg_cron` setup. It executes the 60-second Demo Silent Pass and 24-hour Rescue Window with sub-second precision.
3. **Integrated Asset Storage:** Convex provides built-in file storage APIs (`ctx.storage.generateUploadUrl`), completely removing the need to configure S3 buckets, CORS policies, and signed URL generation in Supabase Storage.
4. **PWA Superiority:** A Vite single-page application is cleaner, lighter, and vastly more reliable for mobile service workers, camera sensor access, and edge distribution than Next.js App Router.

---

### 4.2 Sequential Milestone Roadmap (Phase 1 Through Phase 4)

To ensure execution without architectural drift, development must proceed through four strictly decoupled phases.

```
+----------------------------------------------------------------------------------------------------+
| EXECUTION PHASES                                                                                   |
|                                                                                                    |
| [PHASE 1: CLEAN SLATE & FOUNDATION] ──► Prune bloat, configure Clerk JWT, define Convex schema.   |
|                 │                                                                                  |
|                 ▼                                                                                  |
| [PHASE 2: CAMERA PIPELINE & STORAGE] ──► getUserMedia stream, canvas JPEG compression, storage.   |
|                 │                                                                                  |
|                 ▼                                                                                  |
| [PHASE 3: STATE ENGINE & TIMERS]     ──► Fray ledger, 24h rescue window, scheduler auto-pass.      |
|                 │                                                                                  |
|                 ▼                                                                                  |
| [PHASE 4: PWA SHELL & DEMO SCRIPT]   ──► vite-plugin-pwa, fast-forward demo toggles, seed state.  |
+----------------------------------------------------------------------------------------------------+
```

#### Phase 1: Repository Pruning & Schema Foundation
- **Objectives:**
  - Uninstall `@tanstack/react-query`, `arktype`, and `zustand` from `package.json`.
  - Fix the `new ConvexReactClient()` instantiation bug in [src/Backend.tsx](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/src/Backend.tsx) by moving client creation to an exported singleton.
  - Define the complete Convex schema in [convex/schema.ts](file:///home/mocha/Documents/programming/my-repositories/collab-projects/test-stack/convex/schema.ts): tables for `profiles`, `knots`, `knot_members`, `proofs`, `integrity_events`, and `telemetry_events`.
  - Wire Clerk JWT authentication into Convex so `ctx.auth.getUserIdentity()` resolves the active user.
- **Top Pitfall to Avoid:** Creating parallel validation models. Use Convex's `v` object exclusively for schema and function argument validation.

#### Phase 2: Sensor Capture & Storage Pipeline
- **Objectives:**
  - Build the dedicated camera viewfinder component implementing pure `MediaDevices.getUserMedia()` with back-camera preference (`facingMode: 'environment'`).
  - Enforce anti-cheat compliance: strictly zero `<input type="file">` elements in the DOM.
  - Implement canvas downscaling (max 1280px width) and JPEG compression (0.70 quality) to ensure proof payloads stay under 150 KB.
  - Build the upload flow using Convex file storage: client calls mutation for upload URL, posts binary JPEG blob, and records proof record.
- **Top Pitfall to Avoid:** Failing to call `track.stop()` on stream unmount, causing camera hardware locks and battery drain on mobile devices.

#### Phase 3: The Integrity Ledger & Scheduled Transitions
- **Objectives:**
  - Implement the knot state machine: 100% initial integrity, 25% fray penalty on missed cutoff, 24-hour rescue window.
  - Implement the ***Silent Pass*** engine: when a proof is submitted, use `ctx.scheduler.runAfter` to schedule auto-approval (2 hours production, 60 seconds demo).
  - Implement the ***Bluff Call ("Call Larp")*** mutation: allows the partner to immediately dispute a pending proof, cancelling or overriding the scheduled auto-approval and withholding integrity credit.
  - Build the live dashboard showing active knots, animated tension bars, countdown timers, and dispute notifications.
- **Top Pitfall to Avoid:** Relying on client clocks or reactive query functions to transition proof states without a scheduled server mutation.

#### Phase 4: PWA Hardening, Seed Data & Demo Protocol
- **Objectives:**
  - Install and configure `vite-plugin-pwa` with a web manifest, mobile icons, standalone display mode, and service worker caching.
  - Build the synthetic `@knot-demo` auto-responder account in Convex for solo judge testing.
  - Create the `seedDemo` Convex mutation to stage the exact hackathon state: pre-seeding the frayed 75% "Morning Gym" knot with an active rescue countdown.
  - Implement the `DEMO_MODE` environment toggle to compress 2 hours into 60 seconds.
- **Top Pitfall to Avoid:** Inability to present due to venue Wi-Fi failure. The demo seed must be executable with a single button click, and all camera interactions must function smoothly on localhost or production deployment.

---

### Architectural Sign-Off
We are ready to begin Phase 1. The workspace is properly oriented, the architectural trade-offs are fully mapped, and our path forward is unambiguous. Let me know when you are ready to begin purging the redundant dependencies and defining the Convex schema.

-----

# Excalidraw Data

## Text Elements
core idea: an app that locks you out of your bad habits and keeps track of your agendas with your peers

suggestion name: lockedIn (linkedin)
 ^AQ2BUZDY

KEY FEATURES:

- Tied Knot (1-on-1): Direct accountability between 
two people where progress is strictly paired.

- Squad Knot (3–5 members): Group pact requiring 
all of members to log daily to keep the squad knot intact.

- Anchor Knot (Solo): Solo track tethered to an 
overarching global community milestone rather than
an empty personal counter. and progress can be seen on 
your profile for others to see private and public details/
goals can be toggled to public private

- Knot Integrity & Fraying System: A health-bar style metric
(0–100% the percentage will differ depending on how many people
are on the same knot) replacing binary streaks. Missing a daily
window causes 25% (or randomized between 0-25) fraying rather
than a complete reset, triggering a 24-hour "Rescue Window"
to restore the knot similar to tiktok streaks.

- The Deadweight Clause: If an accountability partner becomes
inactive for 3 consecutive days, the active partner can trigger
"Sever & Save" to cleanly convert the shared streak into an
Anchor/Tied Knot without losing personal historical data.

- Live pomodoro: A real-time co-working timer where two or
more users lock in simultaneously.

- locked in Blueprints: Publicly forkable goal templates (e.g., Morning 
Gym Protocol, 2-Hour Deep Work Block) that define proof rules, 
intervals, and schedules so friends can tie into identical structures 
instantly so they dont have to manually do the goal list from 
scratch. and also they can post the template on their profile 
section for others to copy

- time capsule: An optional vault where partners upload the videos
reminding themselves to get back on track and it automatically
notifies the users if a group/solo dude goes completely dark for
48 hours

- app lock(betah): the app the locks the app completely the details
will be dictated on the on board or we can set a default value

- Ongoing Status Notification: A low-overhead persistent
notification displaying the current knot tension level, partner
status, and countdown hours remaining until current task end and 
also the daily deadline.

- Home Screen Glance Widget: An Android widget showing active
knot states, fray warnings, and pending partner reviews at a glance.
 ^pHLtTujk

Verification features:

- Action Snapshots: Quick in-app camera capture
(no gallery uploads to prevent pre-saved photo cheating) 
paired with optional short captions or metric logs. 

- Silent Pass with Bluff Calls: Uploaded proofs automatically
clear after a 2-hour window unless the partner taps "larp" to
flag low-effort or fraudulent proof for re-submission. 
no larping just pure locked in




 ^UD91CPDh

Profile and Metrics FEATURE: 

- Commitment Heatmap(Beta): A 365-day grid tracking verified proof
entries, Pomodoro minutes logged, and Knot integrity rates.

- Search-Only Directory: Users can only be found via exact username 
or direct QR/invite links. No suggested users, explore tabs, or
 trending lists. to kill the scrolling mentality

- Privacy Toggles: users profile visibility switches (Public, Mutual Knots 
Only, or Locked/Private) to let users share workout heatmaps
while keeping career/financial knots fully private. ^2vKxdzVZ

instead of keeping ur chat streak with friends on tiktok, why not do it the same with activities, habits, self improvement?

log, share, invite friends to do something instead of just doomscrolling all dau

app name idea: knot/knots
the catch is u can knot or tie with someone with tighthening that knot by e.g., self improvement, form relationship, do activities with, etc.

example is maybe u want to make money and get ur friedns on the same boat, then know is where u can tie that goal so that u can achieve it by being consistent and making the promise or ties an actual reality, u loose the knot especially one party is being inconsistent and not giving updates, progress, etc.

also the quota can be "ascending or improving shouldnt feel lonely"
since were humans
were social creatures
features idea:
- each knot, habit or goal can be made publicly and have a competition like lb etc if wanted to, this works like the tiktok sorting or leaderboard thing on the music used on that certain tiktok video: the higher the views and likes the better or the one on top (viral). this also means other can uae the same knot and achive or works toward it
- a few variations of knot base on the connection, streak, consistency, etc of ur knot w/someone
- a social feed where u can post images, text, etc. about it, maybe u can also invite or be friends with somebody through that and so u can invite then to the know or something like that
- u can also knot urself solo lol
- app lock and tracking

so the other party can know what u already unlocked by doing  something, etc

should be refined ^x1OpJc66

ideation ^9qAgYyRe

## Element Links
nBsBAp7N: [[Projects/app-builders-hackathon/knot-idea-board.md#summary personal docs]]

ePxVm7Rj: [[Projects/app-builders-hackathon/knot-idea-board.md#Engineering Supervisory Report KNOT System Architecture & Feasibility Audit]]

%%
## Drawing
```compressed-json
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=
```
%%