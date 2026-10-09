import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Clerk subject of the caller, or null when signed out.
export async function callerUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

export async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await callerUserId(ctx);
  if (userId === null) throw new Error("Sign in to continue.");
  return userId;
}

// Username lookup, lowercased.
export async function usernameOf(
  ctx: QueryCtx | MutationCtx,
  userId: string,
) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  return user?.username ?? "unknown";
}

export async function avatarUrlOf(
  ctx: QueryCtx | MutationCtx,
  userId: string,
) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!user?.avatarStorageId) return null;
  return await ctx.storage.getUrl(user.avatarStorageId);
}

// Display name, falling back to username.
export async function displayNameOf(
  ctx: QueryCtx | MutationCtx,
  userId: string,
) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  return user?.displayName ?? user?.username ?? "unknown";
}

export const ensure = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const username = args.username.trim().toLowerCase();
    if (!username) throw new Error("Username cannot be empty.");
    const taken = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    if (taken && taken.userId !== userId) {
      throw new Error("Username is taken.");
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      if (existing.username !== username) {
        await ctx.db.patch(existing._id, { username });
      }
      return;
    }
    await ctx.db.insert("users", { userId, username });
  },
});

export const search = query({
  args: { prefix: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const prefix = args.prefix.trim().toLowerCase();
    if (!prefix) return [];
    const all = await ctx.db.query("users").collect();
    const out = [];
    for (const u of all.filter(
      (u) => u.userId !== userId && u.username.startsWith(prefix),
    )) {
      out.push({
        userId: u.userId,
        username: u.username,
        displayName: u.displayName ?? u.username,
      });
      if (out.length >= 10) break;
    }
    return out;
  },
});

export const byUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) =>
        q.eq("username", args.username.trim().toLowerCase()),
      )
      .unique();
    if (!user) return null;
    return {
      userId: user.userId,
      username: user.username,
      displayName: user.displayName ?? null,
      avatarUrl: user.avatarStorageId
        ? await ctx.storage.getUrl(user.avatarStorageId)
        : null,
    };
  },
});

export const trust = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx);
    const target = await ctx.db
      .query("users")
      .withIndex("by_username", (q) =>
        q.eq("username", args.username.trim().toLowerCase()),
      )
      .unique();
    if (!target) return null;
    const rows = await ctx.db
      .query("checkins")
      .withIndex("by_user", (q) => q.eq("userId", target.userId))
      .collect();
    const days = new Set(
      rows.map((r) => new Date(r._creationTime).toDateString()),
    );
    let streak = 0;
    const day = new Date();
    if (!days.has(day.toDateString())) day.setDate(day.getDate() - 1);
    while (days.has(day.toDateString())) {
      streak += 1;
      day.setDate(day.getDate() - 1);
    }
    const level =
      streak >= 30 ? "Locked in" : streak >= 7 ? "Steady" : "Warming up";
    return { total: rows.length, streak, level };
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;
    return {
      username: user.username,
      displayName: user.displayName ?? null,
      avatarUrl: user.avatarStorageId
        ? await ctx.storage.getUrl(user.avatarStorageId)
        : null,
    };
  },
});

export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const self = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!self) throw new Error("Sign in to edit your profile.");
    const patch: { username?: string; displayName?: string } = {};
    if (args.username !== undefined) {
      const username = args.username.trim().toLowerCase();
      if (!username) throw new Error("Username cannot be empty.");
      const taken = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .unique();
      if (taken && taken.userId !== userId) {
        throw new Error("Username is taken.");
      }
      patch.username = username;
    }
    if (args.displayName !== undefined) {
      const displayName = args.displayName.trim();
      if (!displayName) throw new Error("Display name cannot be empty.");
      patch.displayName = displayName;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(self._id, patch);
    }
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const self = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!self) throw new Error("Sign in to edit your profile.");
    if (self.avatarStorageId) {
      await ctx.storage.delete(self.avatarStorageId);
    }
    await ctx.db.patch(self._id, { avatarStorageId: args.storageId });
  },
});

export const getBySubject = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const setAvatarStorage = internalMutation({
  args: { userId: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const self = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!self || self.avatarStorageId) return;
    await ctx.db.patch(self._id, { avatarStorageId: args.storageId });
  },
});

// Copies the OAuth profile photo (e.g. Google) into Convex storage on
// first login. Never overwrites an uploaded photo.
export const syncAvatar = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const self = await ctx.runQuery(internal.users.getBySubject, {
      userId: identity.subject,
    });
    if (!self || self.avatarStorageId) return;
    if (!identity.pictureUrl) return;
    const res = await fetch(identity.pictureUrl);
    if (!res.ok) return;
    const blob = await res.blob();
    const storageId = await ctx.storage.store(blob);
    await ctx.runMutation(internal.users.setAvatarStorage, {
      userId: identity.subject,
      storageId,
    });
  },
});
