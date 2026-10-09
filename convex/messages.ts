import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { avatarUrlOf, callerUserId, requireUserId, usernameOf } from "./users";

export const send = mutation({
  args: { text: v.string(), knotId: v.id("knots") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const text = args.text.trim();
    if (!text) throw new Error("Message cannot be empty.");
    const knot = await ctx.db.get(args.knotId);
    if (!knot) throw new Error("Knot not found.");
    const membership = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (!membership) throw new Error("Only knot members can chat.");
    await ctx.db.insert("messages", {
      text,
      authorId: userId,
      knotId: args.knotId,
    });
  },
});

export const list = query({
  args: { knotId: v.id("knots") },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const membership = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (!membership) return [];
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .collect();
    const out = [];
    for (const row of rows) {
      out.push({
        _id: row._id,
        _creationTime: row._creationTime,
        text: row.text,
        authorId: row.authorId,
        author: await usernameOf(ctx, row.authorId),
        avatarUrl: await avatarUrlOf(ctx, row.authorId),
      });
    }
    return out.sort((a, b) => a._creationTime - b._creationTime);
  },
});
