import { internalMutation } from "./_generated/server";
import { knotScore, memberScore } from "./knotScore";

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
