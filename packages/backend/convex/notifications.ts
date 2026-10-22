import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { callerUserId, requireUserId } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const out = [];
    for (const row of rows) {
      const knot = row.knotId ? await ctx.db.get(row.knotId) : null;
      out.push({
        _id: row._id,
        _creationTime: row._creationTime,
        kind: row.kind,
        text: row.text,
        read: row.read,
        knotId: row.knotId ?? null,
        knot: knot?.title ?? null,
      });
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const note = await ctx.db.get(args.notificationId);
    if (!note || note.userId !== userId) throw new Error("Not found.");
    await ctx.db.patch(args.notificationId, { read: true });
  },
});
