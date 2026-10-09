#!/usr/bin/env python3
"""
sim_decay.py - KNOT Tied Knot 30-day integrity decay simulation.

Purpose
    Calibrate the Tier 1 integrity constants (fray rate, rescue recovery,
    tighten rate, silent-pass timeout) for a 1-on-1 Tied Knot by Monte Carlo
    simulation of three behavioral archetypes under two fray models.

Model (mirrors 03-loop.md, Section 2)
    - One knot-window per day. At each Submission Window Cutoff the day is
      settled for every member.
    - All members submitted   -> integrity += TIGHTEN (cap 100).
    - One or more missed       -> fray is deducted (floor 0) and a 24h Rescue
                                  Window opens per missing member.
        flat   : FRAY deducted once per missed knot-window, shared among the
                 missing members for rescue purposes.
        scaled : (100 / members) * k deducted PER missing member, where
                 k = FRAY / 50 (k = 0.5 when FRAY = 25, i.e. the kickstart
                 formula). For n = 2 a single miss costs exactly FRAY.
    - A rescue proof inside the window restores RECOVERY_RATIO * (amount that
      member actually lost). The window expires at the next cutoff.
    - Snap: at a cutoff, if integrity == 0 and no open rescue window holds a
      recoverable amount > 0, the knot is ARCHIVED (reason: snapped).

Usage
    python3 sim_decay.py                      # full report
    python3 sim_decay.py --trials 20000 --seed 7
    python3 sim_decay.py --section sweep      # one section only

Dependencies: Python 3.8+ standard library only.
"""

import argparse
import math
import random
import statistics
from dataclasses import dataclass, replace

DAYS = 30
START_INTEGRITY = 100.0
DANGER_ZONE = 50.0  # integrity below this is treated as the demotivation zone

# --------------------------------------------------------------------------
# Locked Tier 1 configuration (see 03-loop.md, Section 4)
# --------------------------------------------------------------------------
LOCKED = dict(model="scaled", fray=25.0, recovery=0.8, tighten=5.0)


@dataclass(frozen=True)
class Params:
    model: str = "scaled"   # "flat" | "scaled"
    fray: float = 25.0      # duo penalty per missing member (scaled) / per window (flat)
    recovery: float = 1.0   # fraction of the lost amount a rescue restores
    tighten: float = 5.0    # integrity gained on a day where every member submitted


# --------------------------------------------------------------------------
# Archetypes
# --------------------------------------------------------------------------
@dataclass(frozen=True)
class Archetype:
    key: str
    label: str

    def submits(self, day, rng):
        if self.key == "A":            # Consistent: 90% daily compliance
            return rng.random() < 0.90
        if self.key == "B":            # Sporadic: misses every 3rd day
            return day % 3 != 0
        if self.key == "C":            # Ghost: active days 1-3, silent after
            return day <= 3
        raise ValueError(self.key)

    def rescues(self, rng):
        if self.key == "A":            # assumption: consistent users rescue 90%
            return rng.random() < 0.90
        if self.key == "B":            # spec: rescue attempted 80% of the time
            return rng.random() < 0.80
        return False                   # Ghost never rescues


A = Archetype("A", "Consistent (90%)")
B = Archetype("B", "Sporadic (miss every 3rd, rescue 80%)")
C = Archetype("C", "Ghost (silent after day 3)")

SCENARIOS = [
    ("A+A", (A, A), "Baseline: two consistent partners"),
    ("B+A", (B, A), "Sporadic subject, consistent partner"),
    ("C+A", (C, A), "Ghost subject, consistent partner"),
    ("B+B", (B, B), "Stress: two sporadics, misses aligned"),
]


# --------------------------------------------------------------------------
# Core simulation
# --------------------------------------------------------------------------
def run_trial(members, p, rng):
    """Simulate one 30-day knot. Returns dict of per-trial outputs."""
    n = len(members)
    integ = START_INTEGRITY
    traj = []
    open_windows = []          # [(member_idx, recoverable_amount)] from previous day
    snapped_day = None
    frays = rescues_done = 0

    for day in range(1, DAYS + 1):
        if snapped_day is not None:
            traj.append(0.0)
            continue

        # During the day: members with an open rescue window may rescue.
        for m, amount in open_windows:
            if amount > 0 and members[m].rescues(rng):
                integ = min(100.0, integ + amount * p.recovery)
                rescues_done += 1
        # Windows from the previous day expire at this cutoff (rescued or not).
        open_windows = []

        # Submission Window Cutoff: settle the day.
        missed = [i for i, mem in enumerate(members) if not mem.submits(day, rng)]
        if not missed:
            integ = min(100.0, integ + p.tighten)
        else:
            frays += len(missed)
            if p.model == "flat":
                total = p.fray
                shares = [total / len(missed)] * len(missed)
            else:  # scaled: (100 / n) * k per missing member, k = fray / 50
                per = (100.0 / n) * (p.fray / 50.0)
                shares = [per] * len(missed)
                total = per * len(missed)
            actual = min(total, integ)
            ratio = actual / total if total else 0.0
            integ -= actual
            open_windows = [(m, s * ratio) for m, s in zip(missed, shares)]

        # Snap rule: zero integrity and nothing left to rescue.
        if integ <= 0 and not any(a > 0 for _, a in open_windows):
            snapped_day = day
            integ = 0.0

        traj.append(integ)

    return dict(
        traj=traj,
        snapped_day=snapped_day,
        days_below=sum(1 for v in traj if v < DANGER_ZONE),
        ever_le_half=any(v <= DANGER_ZONE for v in traj),
        min_integ=min(traj),
        frays=frays,
        rescues=rescues_done,
    )


def simulate(members, p, trials, seed):
    rng = random.Random(seed)
    runs = [run_trial(members, p, rng) for _ in range(trials)]
    by_day = list(zip(*(r["traj"] for r in runs)))
    snaps = [r["snapped_day"] for r in runs if r["snapped_day"] is not None]
    return dict(
        mean=[statistics.fmean(d) for d in by_day],
        p10=[pct(d, 10) for d in by_day],
        p50=[pct(d, 50) for d in by_day],
        p90=[pct(d, 90) for d in by_day],
        snap_rate=len(snaps) / trials,
        snap_median=statistics.median(snaps) if snaps else None,
        days_below=statistics.fmean(r["days_below"] for r in runs),
        ever_le_half=sum(r["ever_le_half"] for r in runs) / trials,
        min_median=statistics.median(r["min_integ"] for r in runs),
        final_mean=statistics.fmean(r["traj"][-1] for r in runs),
        avg_integ=statistics.fmean(statistics.fmean(r["traj"]) for r in runs),
    )


def pct(values, q):
    s = sorted(values)
    k = (len(s) - 1) * q / 100.0
    lo, hi = math.floor(k), math.ceil(k)
    return s[lo] if lo == hi else s[lo] + (s[hi] - s[lo]) * (k - lo)


# --------------------------------------------------------------------------
# Rendering helpers
# --------------------------------------------------------------------------
def ascii_chart(series, height=10, marks=("#", ".")):
    """Band plot of up to two 0-100 series over DAYS columns.

    Each row covers a 10-point band (bottom, top]. A column shows the mark of
    the series whose value falls in that band; the first series wins ties.
    A value of exactly 0 is drawn on the '0' axis row.
    """
    rows = []
    for level in range(height, -1, -1):
        top = level * 100.0 / height
        bottom = (level - 1) * 100.0 / height
        line = []
        for d in range(DAYS):
            ch = " "
            for s, mk in zip(reversed(series), reversed(marks)):
                v = s[d]
                if (level == 0 and v <= 0) or (level > 0 and bottom < v <= top):
                    ch = mk
            line.append(ch)
        rows.append(f"{int(top):>4} |" + "".join(line))
    rows.append("     +" + "-" * DAYS)
    rows.append("      " + "".join(str(d % 10) for d in range(1, DAYS + 1)) + "  (day)")
    return "\n".join(rows)


def fmt(v):
    return f"{v:5.1f}"


CHECKPOINTS = (3, 7, 14, 21, 30)


def section_header(title):
    print("\n" + "=" * 78)
    print(title)
    print("=" * 78)


# --------------------------------------------------------------------------
# Report sections
# --------------------------------------------------------------------------
def report_models(trials, seed):
    section_header("1. FLAT vs SCALED (fray=25, recovery=1.0, tighten=5)  "
                   f"[trials={trials}, seed={seed}]")
    print(f"{'Scenario':<6} {'Model':<7} " +
          " ".join(f"D{d:<5}" for d in CHECKPOINTS) +
          " Snap%  SnapDay  Days<50  P(<=50)")
    for key, members, _desc in SCENARIOS:
        for model in ("flat", "scaled"):
            r = simulate(members, Params(model=model, recovery=1.0), trials, seed)
            cps = " ".join(fmt(r["mean"][d - 1]) + " " for d in CHECKPOINTS)
            sd = f"{r['snap_median']:>7.0f}" if r["snap_median"] else "      -"
            print(f"{key:<6} {model:<7} {cps} {r['snap_rate']*100:5.1f} {sd}"
                  f"  {r['days_below']:7.2f}  {r['ever_le_half']*100:6.1f}%")
    print("\nValues D3..D30 are MEAN knot integrity (%); snapped knots count as 0.")


def report_sweep(trials, seed):
    section_header("2. CALIBRATION SWEEP (scaled model, tighten=5)")
    base_aa = simulate((A, A), Params(model="scaled", fray=25, recovery=1.0), trials, seed)
    print(f"{'Fray':>5} {'Recov':>6} | {'B+A Snap%':>9} {'Days<50':>8} {'P(<=50)':>8}"
          f" {'Avg':>6} | {'B+B Snap%':>9} {'Avg':>6} | {'C+A SnapDay':>11} | {'Gap A-B':>7}")
    for fray in (15.0, 20.0, 25.0, 33.0):
        for rec in (1.0, 0.8, 0.6):
            p = Params(model="scaled", fray=fray, recovery=rec)
            aa = simulate((A, A), p, trials, seed)
            ba = simulate((B, A), p, trials, seed)
            bb = simulate((B, B), p, trials, seed)
            ca = simulate((C, A), p, trials, seed)
            sd = f"{ca['snap_median']:.0f}" if ca["snap_median"] else "-"
            print(f"{fray:5.0f} {rec:6.1f} | {ba['snap_rate']*100:8.1f}% {ba['days_below']:8.2f}"
                  f" {ba['ever_le_half']*100:7.1f}% {ba['avg_integ']:6.1f} |"
                  f" {bb['snap_rate']*100:8.1f}% {bb['avg_integ']:6.1f} | {sd:>11} |"
                  f" {aa['avg_integ'] - ba['avg_integ']:7.1f}")
    print("\nGap A-B = 30-day average integrity of A+A minus B+A (consistency reward signal).")
    _ = base_aa


def report_tighten(trials, seed):
    section_header("3. TIGHTEN-RATE SENSITIVITY (scaled, fray=25, recovery=0.8)")
    print(f"{'Tighten':>7} | {'A+A Avg':>7} | {'B+A Avg':>7} {'Snap%':>6} {'Days<50':>8} | {'B+B Snap%':>9}")
    for t in (0.0, 2.5, 5.0, 10.0):
        p = Params(model="scaled", fray=25, recovery=0.8, tighten=t)
        aa = simulate((A, A), p, trials, seed)
        ba = simulate((B, A), p, trials, seed)
        bb = simulate((B, B), p, trials, seed)
        print(f"{t:7.1f} | {aa['avg_integ']:7.1f} | {ba['avg_integ']:7.1f} {ba['snap_rate']*100:5.1f}%"
              f" {ba['days_below']:8.2f} | {bb['snap_rate']*100:8.1f}%")


def report_locked(trials, seed):
    p = Params(**LOCKED)
    section_header(f"4. LOCKED CONFIG TRAJECTORIES  {LOCKED}")
    results = {}
    for key, members, desc in SCENARIOS:
        r = simulate(members, p, trials, seed)
        results[key] = r
        print(f"\n[{key}] {desc}")
        print(f"  '#' = mean integrity, '.' = P10 (worst 10% of knots)")
        print(ascii_chart([r["mean"], r["p10"]]))
        print("  Day   " + " ".join(f"{d:>5}" for d in CHECKPOINTS))
        for lab in ("mean", "p10", "p50", "p90"):
            print(f"  {lab:<5} " + " ".join(fmt(r[lab][d - 1]) for d in CHECKPOINTS))
        sd = f"day {r['snap_median']:.0f}" if r["snap_median"] else "n/a"
        print(f"  snap rate {r['snap_rate']*100:.1f}%  median snap {sd}  "
              f"mean days<50 {r['days_below']:.2f}  P(ever<=50) {r['ever_le_half']*100:.1f}%")

    section_header("5. CALIBRATION CRITERIA (locked config)")
    gap = results["A+A"]["avg_integ"] - results["B+A"]["avg_integ"]
    checks = [
        ("C1 B+A snap rate <= 5%", results["B+A"]["snap_rate"] <= 0.05,
         f"{results['B+A']['snap_rate']*100:.1f}%"),
        ("C2 B+A mean days in danger zone <= 3", results["B+A"]["days_below"] <= 3,
         f"{results['B+A']['days_below']:.2f}"),
        ("C3 A+A 30-day avg integrity >= 90", results["A+A"]["avg_integ"] >= 90,
         f"{results['A+A']['avg_integ']:.1f}"),
        ("C4 C+A snaps within 5 days of going silent (by day 8)",
         results["C+A"]["snap_median"] is not None and results["C+A"]["snap_median"] <= 8,
         f"day {results['C+A']['snap_median']}"),
        ("C5 consistency reward gap (A+A minus B+A avg) >= 5 pts", gap >= 5,
         f"{gap:.1f}"),
    ]
    for name, ok, val in checks:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name:<58} {val}")


def report_silent_pass():
    section_header("6. SILENT PASS TIMEOUT vs PARTNER REVIEW COVERAGE (analytic)")
    print("Assumptions: proofs submitted uniformly during partner waking hours 07:00-23:00;")
    print("partner opens the app as a Poisson process at rate L per waking hour; no opens")
    print("while asleep; no Web Push in Tier 1. Coverage = P(partner opens app before")
    print("auto-approval). H1 target: >= 60% review rate; kill threshold < 40%.\n")
    wake_start, wake_end = 7 * 60, 23 * 60

    def waking_minutes(start, length):
        total = 0
        for t in range(start, start + length):
            if wake_start <= t % 1440 < wake_end:
                total += 1
        return total

    lambdas = (0.125, 0.25, 0.5)
    timeouts = (1, 2, 4, 6, 8, 12)
    print(f"{'Timeout':>8} | " + " | ".join(f"L={l:<5} (1 open/{1/l:.0f}h)" for l in lambdas))
    for T in timeouts:
        cells = []
        for lam in lambdas:
            cov = []
            for s in range(wake_start, wake_end, 5):
                w = waking_minutes(s, T * 60) / 60.0
                cov.append(1 - math.exp(-lam * w))
            cells.append(f"{statistics.fmean(cov)*100:18.1f}%")
        print(f"{T:>6} h | " + " | ".join(cells))


def main():
    ap = argparse.ArgumentParser(description="KNOT Tied Knot decay simulation")
    ap.add_argument("--trials", type=int, default=5000, help="Monte Carlo trials per run")
    ap.add_argument("--seed", type=int, default=42, help="RNG seed (deterministic output)")
    ap.add_argument("--section", choices=("models", "sweep", "tighten", "locked", "silent", "all"),
                    default="all")
    a = ap.parse_args()
    sec = a.section
    if sec in ("models", "all"):
        report_models(a.trials, a.seed)
    if sec in ("sweep", "all"):
        report_sweep(a.trials, a.seed)
    if sec in ("tighten", "all"):
        report_tighten(a.trials, a.seed)
    if sec in ("locked", "all"):
        report_locked(a.trials, a.seed)
    if sec in ("silent", "all"):
        report_silent_pass()


if __name__ == "__main__":
    main()
