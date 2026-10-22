import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { callerUserId, requireUserId, usernameOf, displayNameOf } from "./users";

export const tugKnot = mutation({
  args: { knotId: v.id("knots") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const knot = await ctx.db.get(args.knotId);
    if (!knot) throw new Error("Knot not found.");
    const rows = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .collect();
    if (!rows.some((r) => r.userId === userId)) {
      throw new Error("Join the knot first.");
    }
    const outstanding = await ctx.db
      .query("tugs")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .collect();
    const already = new Set(
      outstanding
        .filter((t) => t.fromUserId === userId)
        .map((t) => t.toUserId),
    );
    let n = 0;
    for (const row of rows) {
      if (row.userId === userId || already.has(row.userId)) continue;
      await ctx.db.insert("tugs", {
        knotId: args.knotId,
        fromUserId: userId,
        toUserId: row.userId,
      });
      n++;
    }
    return n;
  },
});

export const incoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("tugs")
      .withIndex("by_to", (q) => q.eq("toUserId", userId))
      .collect();
    const out = [];
    for (const row of rows) {
      const knot = await ctx.db.get(row.knotId);
      if (!knot) continue;
      out.push({
        _id: row._id,
        _creationTime: row._creationTime,
        from: await usernameOf(ctx, row.fromUserId),
        fromDisplay: await displayNameOf(ctx, row.fromUserId),
        knot: knot.title,
        knotId: row.knotId,
      });
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const dismiss = mutation({
  args: { tugId: v.id("tugs") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tug = await ctx.db.get(args.tugId);
    if (!tug || tug.toUserId !== userId) throw new Error("Not found.");
    await ctx.db.delete(args.tugId);
  },
});
