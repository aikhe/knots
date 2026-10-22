import { internalMutation } from "./_generated/server";
import { knotScore, memberScore, ropeState } from "./knotScore";

const DAY_MS = 24 * 3600 * 1000;

// Daily sweep: nudge active members of slack knots who went quiet.
export const sendSlack = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const knots = await ctx.db.query("knots").collect();
    for (const knot of knots) {
      const members = await ctx.db
        .query("knot_members")
        .withIndex("by_knot", (q) => q.eq("knotId", knot._id))
        .collect();
      const active = members.filter((m) => !m.resting);
      const score = knotScore(
        active.map((m) => memberScore(m.lastCheckinAt, knot._creationTime, now)),
      );
      if (score >= 40) continue;
      for (const m of active) {
        const last = m.lastCheckinAt ?? knot._creationTime;
        if (now - last <= DAY_MS) continue;
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", m.userId))
          .filter((q) =>
            q.and(
              q.eq(q.field("knotId"), knot._id),
              q.eq(q.field("read"), false),
            ),
          )
          .unique();
        if (existing) continue;
        await ctx.db.insert("notifications", {
          userId: m.userId,
          kind: "reminder",
          knotId: knot._id,
          text: "Tighten this together?",
          read: false,
        });
      }
    }
  },
});

// Morning digest: one summary notification per user with rope states
// plus a single focus suggestion.
export const sendDigest = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const knots = await ctx.db.query("knots").collect();
    const byUser = new Map<string, { tight: number; firm: number; slack: string[] }>();
    for (const knot of knots) {
      const members = await ctx.db
        .query("knot_members")
        .withIndex("by_knot", (q) => q.eq("knotId", knot._id))
        .collect();
      const active = members.filter((m) => !m.resting);
      const score = knotScore(
        active.map((m) => memberScore(m.lastCheckinAt, knot._creationTime, now)),
      );
      const state = ropeState(score);
      for (const m of active) {
        const entry = byUser.get(m.userId) ?? { tight: 0, firm: 0, slack: [] };
        if (state === "tight") entry.tight += 1;
        else if (state === "firm") entry.firm += 1;
        else entry.slack.push(knot.title);
        byUser.set(m.userId, entry);
      }
    }
    for (const [userId, summary] of byUser) {
      if (summary.tight + summary.firm + summary.slack.length === 0) continue;
      const focus =
        summary.slack.length > 0
          ? `Focus: ${summary.slack[0]} needs you today.`
          : "Everything is tight. Keep the rhythm.";
      const text =
        `${summary.tight} tight, ${summary.firm} firm, ${summary.slack.length} slack. ` +
        focus;
      const existing = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.and(
            q.eq(q.field("kind"), "digest"),
            q.eq(q.field("read"), false),
          ),
        )
        .unique();
      if (existing) continue;
      await ctx.db.insert("notifications", {
        userId,
        kind: "digest",
        text,
        read: false,
      });
    }
  },
});
