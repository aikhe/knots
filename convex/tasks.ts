import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Clerk subject of the caller, or null when signed out.
async function callerUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) throw new Error("Sign in to add tasks.");
    const text = args.text.trim();
    if (!text) throw new Error("Task text cannot be empty.");
    await ctx.db.insert("tasks", { text, isCompleted: false, userId });
  },
});

export const toggle = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) throw new Error("Sign in to update tasks.");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Task not found.");
    await ctx.db.patch(args.id, { isCompleted: !task.isCompleted });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) throw new Error("Sign in to delete tasks.");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Task not found.");
    await ctx.db.delete(args.id);
  },
});
