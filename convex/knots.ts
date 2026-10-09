import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { callerUserId, requireUserId, usernameOf, displayNameOf } from "./users";
import { knotScore, memberScore, ropeState } from "./knotScore";

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
    kind: v.union(v.literal("solo"), v.literal("tied"), v.literal("squad")),
    joinable: v.boolean(),
    memberUserIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("Knot title cannot be empty.");
    const uniqueIds = [...new Set([userId, ...args.memberUserIds])];
    if (args.kind === "solo" && uniqueIds.length > 1) {
      throw new Error("Solo knots are just you.");
    }
    if (args.kind === "tied" && uniqueIds.length > 2) {
      throw new Error("Tied knots are exactly two.");
    }
    if (uniqueIds.length > 5) {
      throw new Error("Knots hold at most five.");
    }
    const knotId = await ctx.db.insert("knots", {
      title,
      creatorId: userId,
      kind: args.kind,
      joinable: args.kind !== "solo" && args.joinable,
      inviteToken: [...crypto.getRandomValues(new Uint8Array(16))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
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
      const now = Date.now();
      const contributions = members
        .filter((mb) => !mb.resting)
        .map((mb) => memberScore(mb.lastCheckinAt, knot._creationTime, now));
      const score = knotScore(contributions);
      out.push({
        _id: knot._id,
        _creationTime: knot._creationTime,
        title: knot.title,
        creatorId: knot.creatorId,
        kind: knot.kind,
        joinable: knot.joinable,
        memberCount: members.length,
        rope: ropeState(score),
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
      const now = Date.now();
      const score = knotScore(
        members
          .filter((mb) => !mb.resting)
          .map((mb) => memberScore(mb.lastCheckinAt, knot._creationTime, now)),
      );
      out.push({
        _id: knot._id,
        _creationTime: knot._creationTime,
        title: knot.title,
        creatorId: knot.creatorId,
        kind: knot.kind,
        memberCount: members.length,
        rope: ropeState(score),
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
    if (knot.kind === "solo") throw new Error("Solo knots cannot be joined.");
    if (await isMember(ctx, args.knotId, userId)) return;
    const members = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .collect();
    if (knot.kind === "tied" && members.length >= 2) {
      throw new Error("This tied knot is full.");
    }
    if (members.length >= 5) throw new Error("This knot is full.");
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

export const setRest = mutation({
  args: { knotId: v.id("knots"), resting: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const row = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (!row) throw new Error("Only knot members can rest.");
    await ctx.db.patch(row._id, { resting: args.resting });
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
        displayName: await displayNameOf(ctx, row.userId),
      });
    }
    return out;
  },
});

export const stats = query({
  args: { knotId: v.id("knots") },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return null;
    const knot = await ctx.db.get(args.knotId);
    if (!knot) return null;
    if (!knot.joinable && !(await isMember(ctx, args.knotId, userId))) {
      return null;
    }
    const checkins = await ctx.db
      .query("checkins")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .collect();
    const today = new Date().toDateString();
    return {
      totalCheckins: checkins.length,
      activeToday: new Set(
        checkins
          .filter((c) => new Date(c._creationTime).toDateString() === today)
          .map((c) => c.userId),
      ).size,
    };
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
        displayName: await displayNameOf(ctx, row.userId),
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
    const now = Date.now();
    const score = knotScore(
      rows
        .filter((r) => !r.resting)
        .map((r) => memberScore(r.lastCheckinAt, knot._creationTime, now)),
    );
    return {
      _id: knot._id,
      _creationTime: knot._creationTime,
      title: knot.title,
      creatorId: knot.creatorId,
      kind: knot.kind,
      joinable: knot.joinable,
      isMember: member !== null,
      resting: member?.resting === true,
      rope: ropeState(score),
      inviteToken: member ? (knot.inviteToken ?? null) : null,
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

export const preview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return null;
    const knot = await ctx.db
      .query("knots")
      .withIndex("by_invite", (q) => q.eq("inviteToken", args.token))
      .unique();
    if (!knot) return null;
    const members = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", knot._id))
      .collect();
    return {
      knotId: knot._id,
      title: knot.title,
      kind: knot.kind,
      memberCount: members.length,
      isMember: members.some((m) => m.userId === userId),
    };
  },
});

export const joinByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const knot = await ctx.db
      .query("knots")
      .withIndex("by_invite", (q) => q.eq("inviteToken", args.token))
      .unique();
    if (!knot) throw new Error("Invite not found.");
    if (knot.kind === "solo") throw new Error("Solo knots cannot be joined.");
    const members = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", knot._id))
      .collect();
    if (members.some((m) => m.userId === userId)) return knot._id;
    if (knot.kind === "tied" && members.length >= 2) {
      throw new Error("This tied knot is full.");
    }
    if (members.length >= 5) throw new Error("This knot is full.");
    await ctx.db.insert("knot_members", { knotId: knot._id, userId });
    return knot._id;
  },
});
