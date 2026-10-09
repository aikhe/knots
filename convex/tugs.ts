import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { callerUserId, requireUserId, usernameOf, displayNameOf } from "./users";

export const send = mutation({
  args: { knotId: v.id("knots"), toUserId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.toUserId === userId) throw new Error("That is you.");
    const knot = await ctx.db.get(args.knotId);
    if (!knot) throw new Error("Knot not found.");
    const rows = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .collect();
    const ids = new Set(rows.map((r) => r.userId));
    if (!ids.has(userId) || !ids.has(args.toUserId)) {
      throw new Error("Both of you must be in the knot.");
    }
    await ctx.db.insert("tugs", {
      knotId: args.knotId,
      fromUserId: userId,
      toUserId: args.toUserId,
    });
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
