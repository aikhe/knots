import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { callerUserId, requireUserId, usernameOf } from "./users";

type Ctx = QueryCtx | MutationCtx;

async function isMember(
  ctx: Ctx,
  knotId: Id<"knots">,
  userId: string,
) {
  const row = await ctx.db
    .query("knot_members")
    .withIndex("by_knot", (q) => q.eq("knotId", knotId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .unique();
  return row !== null;
}

export const create = mutation({
  args: {
    title: v.string(),
    joinable: v.boolean(),
    memberUserIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("Knot title cannot be empty.");
    const uniqueIds = [...new Set([userId, ...args.memberUserIds])];
    const knotId = await ctx.db.insert("knots", {
      title,
      creatorId: userId,
      joinable: args.joinable,
    });
    for (const memberId of uniqueIds) {
      await ctx.db.insert("knot_members", { knotId, userId: memberId });
    }
    return knotId;
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const memberships = await ctx.db
      .query("knot_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const out = [];
    for (const m of memberships) {
      const knot = await ctx.db.get(m.knotId);
      if (!knot) continue;
      const members = await ctx.db
        .query("knot_members")
        .withIndex("by_knot", (q) => q.eq("knotId", m.knotId))
        .collect();
      const last = await ctx.db
        .query("messages")
        .withIndex("by_knot", (q) => q.eq("knotId", m.knotId))
        .order("desc")
        .first();
      out.push({
        _id: knot._id,
        _creationTime: knot._creationTime,
        title: knot.title,
        creatorId: knot.creatorId,
        joinable: knot.joinable,
        memberCount: members.length,
        lastText: last?.text ?? null,
        lastTime: last?._creationTime ?? null,
        lastAuthor: last ? await usernameOf(ctx, last.authorId) : null,
      });
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const browse = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const all = await ctx.db.query("knots").collect();
    const out = [];
    for (const knot of all.filter((k) => k.joinable)) {
      if (await isMember(ctx, knot._id, userId)) continue;
      const members = await ctx.db
        .query("knot_members")
        .withIndex("by_knot", (q) => q.eq("knotId", knot._id))
        .collect();
      const last = await ctx.db
        .query("messages")
        .withIndex("by_knot", (q) => q.eq("knotId", knot._id))
        .order("desc")
        .first();
      out.push({
        _id: knot._id,
        _creationTime: knot._creationTime,
        title: knot.title,
        creatorId: knot.creatorId,
        memberCount: members.length,
        lastText: last?.text ?? null,
        lastTime: last?._creationTime ?? null,
        lastAuthor: last ? await usernameOf(ctx, last.authorId) : null,
      });
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const join = mutation({
  args: { knotId: v.id("knots") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const knot = await ctx.db.get(args.knotId);
    if (!knot) throw new Error("Knot not found.");
    if (!knot.joinable) throw new Error("This knot is not joinable.");
    if (await isMember(ctx, args.knotId, userId)) return;
    await ctx.db.insert("knot_members", {
      knotId: args.knotId,
      userId,
    });
  },
});

export const setJoinable = mutation({
  args: { knotId: v.id("knots"), joinable: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const knot = await ctx.db.get(args.knotId);
    if (!knot) throw new Error("Knot not found.");
    if (knot.creatorId !== userId) {
      throw new Error("Only the creator can change this.");
    }
    await ctx.db.patch(args.knotId, { joinable: args.joinable });
  },
});

export const members = query({
  args: { knotId: v.id("knots") },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const knot = await ctx.db.get(args.knotId);
    if (!knot) return [];
    if (!knot.joinable && !(await isMember(ctx, args.knotId, userId))) {
      return [];
    }
    const rows = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .collect();
    const out = [];
    for (const row of rows) {
      out.push({
        userId: row.userId,
        username: await usernameOf(ctx, row.userId),
      });
    }
    return out;
  },
});

export const get = query({
  args: { knotId: v.id("knots") },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return null;
    const knot = await ctx.db.get(args.knotId);
    if (!knot) return null;
    const member = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (!knot.joinable && !member) return null;
    const rows = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .collect();
    const members = [];
    for (const row of rows) {
      members.push({
        userId: row.userId,
        username: await usernameOf(ctx, row.userId),
      });
    }
    const knotMessages =
      member === null
        ? []
        : await ctx.db
            .query("messages")
            .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
            .collect();
    const posts = [];
    for (const row of knotMessages) {
      posts.push({
        _id: row._id,
        _creationTime: row._creationTime,
        text: row.text,
        authorId: row.authorId,
        author: await usernameOf(ctx, row.authorId),
      });
    }
    posts.sort((a, b) => a._creationTime - b._creationTime);
    return {
      _id: knot._id,
      _creationTime: knot._creationTime,
      title: knot.title,
      creatorId: knot.creatorId,
      joinable: knot.joinable,
      isMember: member !== null,
      members,
      posts,
    };
  },
});

export const sharedWith = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const target = await ctx.db
      .query("users")
      .withIndex("by_username", (q) =>
        q.eq("username", args.username.trim().toLowerCase()),
      )
      .unique();
    if (!target || target.userId === userId) return [];
    const mine = new Set(
      (
        await ctx.db
          .query("knot_members")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      ).map((m) => m.knotId),
    );
    const theirs = await ctx.db
      .query("knot_members")
      .withIndex("by_user", (q) => q.eq("userId", target.userId))
      .collect();
    const out = [];
    for (const m of theirs) {
      if (!mine.has(m.knotId)) continue;
      const knot = await ctx.db.get(m.knotId);
      if (knot) out.push({ _id: knot._id, title: knot.title });
    }
    return out;
  },
});
