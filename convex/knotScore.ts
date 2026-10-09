// Rope tightness: each active member contributes 1 when checked in
// within 24h, decaying to 0 at 72h. Resting members sit out. The score
// is the average contribution, 0-100. Never shown as a number in UI.

const FULL_MS = 24 * 3600 * 1000;
const ZERO_MS = 72 * 3600 * 1000;

export function memberScore(
  lastCheckinAt: number | undefined,
  fallbackAt: number,
  now: number,
) {
  const last = lastCheckinAt ?? fallbackAt;
  if (now - last <= FULL_MS) return 1;
  if (now - last >= ZERO_MS) return 0;
  return 1 - (now - last - FULL_MS) / (ZERO_MS - FULL_MS);
}

export function knotScore(contributions: number[]) {
  if (contributions.length === 0) return 100;
  const sum = contributions.reduce((a, b) => a + b, 0);
  return Math.round((sum / contributions.length) * 100);
}

export type RopeState = "tight" | "firm" | "slack";

export function ropeState(score: number): RopeState {
  if (score >= 70) return "tight";
  if (score >= 40) return "firm";
  return "slack";
}
