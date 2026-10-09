import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { callerUserId, requireUserId, usernameOf } from "./users";

async function existingBetween(
  ctx: QueryCtx | MutationCtx,
  a: string,
  b: string,
) {
  const sent = await ctx.db
    .query("friend_requests")
    .withIndex("by_from", (q) => q.eq("fromUserId", a))
    .filter((q) => q.eq(q.field("toUserId"), b))
    .unique();
  if (sent) return sent;
  return await ctx.db
    .query("friend_requests")
    .withIndex("by_from", (q) => q.eq("fromUserId", b))
    .filter((q) => q.eq(q.field("toUserId"), a))
    .unique();
}

export const send = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const target = await ctx.db
      .query("users")
      .withIndex("by_username", (q) =>
        q.eq("username", args.username.trim().toLowerCase()),
      )
      .unique();
    if (!target) throw new Error("No such user.");
    if (target.userId === userId) throw new Error("That is you.");
    const existing = await existingBetween(ctx, userId, target.userId);
    if (existing) {
      if (existing.status === "pending") throw new Error("Request pending.");
      if (existing.status === "accepted") throw new Error("Already friends.");
    }
    await ctx.db.insert("friend_requests", {
      fromUserId: userId,
      toUserId: target.userId,
      status: "pending",
    });
  },
});

export const incoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("friend_requests")
      .withIndex("by_to", (q) => q.eq("toUserId", userId))
      .collect();
    const out = [];
    for (const row of rows.filter((r) => r.status === "pending")) {
      out.push({
        _id: row._id,
        _creationTime: row._creationTime,
        username: await usernameOf(ctx, row.fromUserId),
      });
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const respond = mutation({
  args: { requestId: v.id("friend_requests"), accept: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const req = await ctx.db.get(args.requestId);
    if (!req || req.toUserId !== userId) throw new Error("Not found.");
    if (req.status !== "pending") throw new Error("Already answered.");
    await ctx.db.patch(args.requestId, {
      status: args.accept ? "accepted" : "declined",
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const sent = await ctx.db
      .query("friend_requests")
      .withIndex("by_from", (q) => q.eq("fromUserId", userId))
      .collect();
    const received = await ctx.db
      .query("friend_requests")
      .withIndex("by_to", (q) => q.eq("toUserId", userId))
      .collect();
    const ids = new Set<string>();
    for (const r of [...sent, ...received]) {
      if (r.status !== "accepted") continue;
      ids.add(r.fromUserId === userId ? r.toUserId : r.fromUserId);
    }
    const out = [];
    for (const id of ids) {
      out.push({ userId: id, username: await usernameOf(ctx, id) });
    }
    return out.sort((a, b) => a.username.localeCompare(b.username));
  },
});

export const status = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return "signed-out";
    const target = await ctx.db
      .query("users")
      .withIndex("by_username", (q) =>
        q.eq("username", args.username.trim().toLowerCase()),
      )
      .unique();
    if (!target) return "missing";
    if (target.userId === userId) return "self";
    const existing = await existingBetween(ctx, userId, target.userId);
    if (!existing) return "none";
    if (existing.status === "accepted") return "friends";
    if (existing.fromUserId === userId) return "requested";
    return "incoming";
  },
});
