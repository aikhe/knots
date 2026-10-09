# 02 - Validation Framework: KNOT Tier 1 Loop Zero

> Inputs: `00-context.md`, `01-scope.md`
> Scope: Tier 1 only (Tied Knot; Integrity, Fraying, Rescue; Action Snapshots; Silent Pass and Bluff Calls in duo mode)
> Phases: (A) Hackathon demo and live judging, (B) 14-day beta with 10-20 users

---

## 1. Top 3 Riskiest Behavioral Assumptions

| ID | Assumption | Why it can kill the product |
| --- | --- | --- |
| **A1** | **Social Verification:** Partners will actually review each other's proofs and call a bluff when it is warranted, instead of letting social etiquette produce 100% passive Silent Passes. | If nobody audits, Silent Pass becomes a rubber stamp. The anti-cheat claim collapses, and KNOT becomes a shared photo log with no credibility advantage over existing habit apps. |
| **A2** | **Capture Friction:** Mandatory live-camera capture will not cause users to abandon check-ins. | The check-in is the only repeated action in the loop. If capture friction suppresses it, every downstream mechanic (integrity, rescue, audit) starves of input. |
| **A3** | **Decay Resilience:** Partial fraying plus a 24h Rescue Window will keep users engaged after a missed day, preventing the "what-the-hell" effect. | This is KNOT's core differentiator against binary streaks. If users still quit after the first miss, the integrity model is cosmetic and the product thesis is falsified. |

**Considered and excluded from the top 3:**
- *Invite acceptance and cold start.* This is a growth risk, not a loop risk, and the `@knot-demo` partner partly mitigates it.
- *Partner ghosting.* The mitigation, Deadweight Clause, is Tier 2. Ghosting is still monitored as a red flag (Section 4).

---

## 2. Falsifiable Hypotheses

Measurement definitions used below:
- **Attested pass:** a Silent Pass where the partner opened the proof before `auto_approve_at`.
- **Blind pass:** a Silent Pass where the partner never opened the proof.
- **Canary proof:** during beta days 8-14, each consenting tester deliberately submits one low-effort proof (for example, the camera pointed at a wall) at an unannounced time. Testers do not know when their partner's canary will occur. This is the only ground truth available for bluff-call accuracy in duo mode.

| ID | Hypothesis | Falsified if |
| --- | --- | --- |
| **H1** | We believe partners will review at least **60%** of proofs before Silent Pass triggers, and will flag at least **50%** of canary proofs. | Partner review rate is **below 40%**, OR canary detection is **below 30%**. |
| **H2** | We believe at least **80%** of check-in attempts (camera opened) will end in a submitted proof, with median capture-to-submit time of **30s or less**. | Capture completion is **below 65%**, OR camera permission denial exceeds **15%** of users, OR median capture time exceeds **60s**. |
| **H3** | We believe at least **50%** of fray events will be rescued within the window, and at least **60%** of knots will remain alive 7 days after their first fray. | Rescue completion is **below 25%**, OR more than **50%** of first frays are followed by **no proof from the missing member within 72h** (abandonment). |

> **Sample-size caveat:** 10-20 users produce roughly 5-10 Tied Knots. These thresholds are *directional decision bands*, not statistical significance tests. A/B testing (for example, fraying vs. binary reset) is not feasible at this sample size. H3 therefore uses within-subject behavior after the first fray.

---

## 3. Two-Tier Success Metrics

### 3.1 Hackathon Demo Validation

**Mechanical correctness** (measured during rehearsal and the live demo):

| Signal | Target | Proves |
| --- | --- | --- |
| Consecutive clean rehearsal runs of the 6-act script (`01-scope.md` Section 4) on the production URL | **At least 5** before presenting, and **6/6 acts** completed live | Loop Zero is stable end to end |
| Silent Pass trigger accuracy (demo clock: 60s) | Approves within **±3s** of `auto_approve_at` | Timestamp-driven state and lazy evaluation are correct |
| Cross-window state propagation (proof status in partner window) | **5s or less** (polling interval) | Two-party loop feels live without realtime code |
| Snapshot capture to "Pending" on venue Wi-Fi | **5s or less**; payload **200 KB or less** | Capture friction is low under real network conditions |
| Integrity math | Fray applies exactly **25%**; rescue restores **75% → 100%** exactly | Ledger arithmetic is deterministic |
| Gallery upload paths in the proof flow | **0** `<input type="file">` elements (automated DOM check) | The anti-cheat claim is structurally true |

**Live engagement funnel** (a QR code shown at the close of the demo; judges and attendees tie a knot with `@knot-demo`):

| Funnel step | Target conversion |
| --- | --- |
| QR scan → account created | At least 50% |
| Account created → knot tied | At least 80% |
| Knot tied → first proof submitted | At least 60% |
| Median time from signup to first proof, unaided | **90s or less** |

> Event-day data validates *usability*, not *behavior*. Demo-clock data and `@knot-demo` knots are **excluded** from all beta behavioral metrics.

### 3.2 14-Day Beta Validation (10-20 users, real clock, `DEMO_MODE=false`)

Decision bands: **Proceed** (hypothesis holds) / **Iterate** (adjust mechanic, re-test) / **Kill** (rethink the mechanic).

| Metric | Definition | Proceed | Iterate | Kill | Tests |
| --- | --- | --- | --- | --- | --- |
| Invite acceptance | Invites accepted within 48h / invites sent | ≥ 70% | 40-69% | < 40% | Cold start |
| D7 knot survival | Knots `active` with at least 1 approved proof in the trailing 72h, at day 7 | ≥ 60% | 40-59% | < 40% | Overall loop |
| D14 knot survival | Same definition, at day 14 | ≥ 40% | 25-39% | < 25% | Overall loop |
| Member check-in rate | Days with an approved proof / days enrolled, per member | ≥ 70% | 50-69% | < 50% | Overall loop |
| Partner review rate | Proofs opened by the partner before `auto_approve_at` / all proofs | ≥ 60% | 40-59% | < 40% | H1 |
| Proof outcome mix | Attested pass : blind pass : disputed | ≥ 50% : ≤ 40% : 2-10% | Disputed 0-2% or 10-20% | Blind pass > 70%, or disputed > 20% | H1 |
| Canary detection | Canary proofs flagged / canary proofs submitted | ≥ 50% | 30-49% | < 30% | H1 |
| Post-dispute resubmission | Disputed proofs followed by a valid resubmission within the window | ≥ 50% | 25-49% | < 25% | H1 (bluff calls correct behavior, not destroy it) |
| Capture completion | Proofs submitted / camera sessions opened | ≥ 80% | 65-79% | < 65% | H2 |
| Median capture time | Camera opened → proof submitted | ≤ 30s | 31-60s | > 60s | H2 |
| Camera permission denial | Users denying camera at least once without later granting | ≤ 10% | 11-15% | > 15% | H2 |
| Rescue completion | Fray events rescued within window / fray events | ≥ 50% | 25-49% | < 25% | H3 |
| Post-fray survival | Knots alive 7 days after first fray / knots that frayed | ≥ 60% | 40-59% | < 40% | H3 |
| Post-fray abandonment | First frays followed by no proof from the missing member within 72h | ≤ 30% | 31-50% | > 50% | H3 |
| Untie rate | Knots archived via "Untie" / all knots | ≤ 20% | 21-35% | > 35% | Partner fit, ghosting |
| Sean Ellis test (day 14 exit survey) | "Very disappointed" if KNOT disappeared | ≥ 40% | 25-39% | < 25% | Product pull (directional) |

**Post-beta decision rule:**
- All three hypotheses **Proceed** → build Tier 2.
- H1 or H2 **Iterate/Kill** → adjust that mechanic before adding features.
- H3 **Kill** → the core thesis is at risk. Redesign the integrity model before any further build.

### 3.3 Required Instrumentation (Tier 1)

A single `events(user_id, knot_id, proof_id, type, metadata jsonb, created_at)` table in Supabase. No third-party analytics.

| Event | Feeds |
| --- | --- |
| `invite_sent`, `invite_accepted` | Invite acceptance |
| `camera_opened`, `camera_permission_denied`, `proof_submitted` | H2 metrics |
| `proof_viewed_by_partner` | Partner review rate, attested vs. blind pass |
| `proof_auto_approved`, `proof_flagged`, `proof_resubmitted` | Outcome mix, post-dispute resubmission |
| `fray_applied`, `rescue_banner_viewed`, `rescue_completed` | H3 metrics, rescue diagnosis |
| `knot_untied`, `session_start` | Untie rate, activity asymmetry |
| `canary_submitted` (flag set via tester-only control) | Canary detection |

---

## 4. Failure Modes and Behavioral Red Flags

| # | Data pattern | Threshold | Diagnosis | Response |
| --- | --- | --- | --- | --- |
| F1 | **Bluff rate near 100%**, or one user flags more than 50% of a partner's proofs | Any knot | Toxic griefing; bluff calls used as a weapon | Weekly flag cap per user; pull the Tier 3 caller penalty forward |
| F2 | **Bluff rate 0%** AND review rate < 40% AND canary detection < 30% | Cohort-wide | Rubber-stamping; verification is theater (H1 falsified) | Add an explicit "Vouch" tap that grants a small integrity bonus, making review active instead of passive |
| F3 | Bluff rate 0% BUT review rate ≥ 60% AND canary detection ≥ 50% | Cohort-wide | **Healthy, not a red flag.** Users are honest and partners are watching. | None. Shows why bluff rate alone is never a sufficient metric. |
| F4 | **Disputed proofs never resubmitted**, followed by member inactivity | Resubmission < 25% | Shame spiral; disputes end engagement instead of correcting it | Soften dispute copy; show an immediate "Retake" call to action |
| F5 | **Rescue completion near 0%** with `rescue_banner_viewed` absent | < 10% viewed | Rescue is *unseen*; in-app banners alone are insufficient | Pull Web Push forward from post-hackathon scope |
| F6 | **Rescue completion near 0%** with `rescue_banner_viewed` present | ≥ 50% viewed | Rescue is *seen but ignored*; the window is too short or the cost too high | Extend the window or lower the rescue requirement; re-test |
| F7 | **Rescue completion near 100%** with frequent frays (more than 2 per member per week) | Per member | Rescue farming; fraying carries no real cost | Diminishing returns (each successive rescue restores less); cap rescues per week |
| F8 | **Integrity permanently at 100%** with zero frays across the cohort | Cohort-wide | Goals are trivially easy, or check-ins are being gamed | Audit proof quality; check canary results; raise preset difficulty |
| F9 | **Camera opened, then abandoned**, clustered on specific browsers or devices | Abandonment > 35% on one platform | Platform defect (for example, iOS Safari permission flow), not user motivation | Fix device-specific capture; segment H2 metrics by user agent |
| F10 | **Activity asymmetry:** one member submits 3x or more proofs than the other over 5+ days | Per knot | Impending ghosting | Prioritize Deadweight Clause (Tier 2.2) |
| F11 | **Post-fray abandonment > 50%** | Cohort-wide | The "what-the-hell" effect persists despite partial decay (H3 falsified) | Redesign the decay model before any Tier 2 work |
| F12 | **More than 50% of tester knots are with `@knot-demo`** instead of real partners | Cohort-wide | The social premise is not being adopted; users treat KNOT as a solo tool | Investigate invite friction; re-prioritize Anchor Knot (Tier 2.1) as the honest solo path |
| F13 | **Untie events before day 3** exceed 25% of knots | Cohort-wide | Partner mismatch or onboarding friction, not loop failure | Review invite flow and preset difficulty; interview the users who untied |
