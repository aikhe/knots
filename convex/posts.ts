import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { callerUserId, requireUserId, usernameOf, avatarUrlOf } from "./users";

export async function likeInfo(
  ctx: QueryCtx | MutationCtx,
  postId: Id<"posts">,
  userId: string,
) {
  const likes = await ctx.db
    .query("likes")
    .withIndex("by_post", (q) => q.eq("postId", postId))
    .collect();
  return {
    likeCount: likes.length,
    likedByMe: likes.some((l) => l.userId === userId),
  };
}

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return;
    }
    await ctx.db.insert("likes", { postId: args.postId, userId });
  },
});

export const create = mutation({
  args: {
    text: v.string(),
    knotId: v.id("knots"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const text = args.text.trim();
    if (!text) throw new Error("Post cannot be empty.");
    const knot = await ctx.db.get(args.knotId);
    if (!knot) throw new Error("Knot not found.");
    const membership = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (!membership) throw new Error("Only knot members can post.");
    await ctx.db.insert("posts", {
      text,
      authorId: userId,
      knotId: args.knotId,
      isPublic: args.isPublic,
    });
  },
});

export const feed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const memberships = await ctx.db
      .query("knot_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const knotIds = new Set(memberships.map((m) => m.knotId));
    const out: {
      _id: string;
      _creationTime: number;
      text: string;
      authorId: string;
      author: string;
      authorAvatar: string | null;
      knotId: string;
      knot: string;
      likeCount: number;
      likedByMe: boolean;
    }[] = [];
    const seen = new Set<string>();
    const pushPost = async (post: Doc<"posts">, knotTitle: string) => {
      if (seen.has(post._id)) return;
      seen.add(post._id);
      const { likeCount, likedByMe } = await likeInfo(ctx, post._id, userId);
      out.push({
        _id: post._id,
        _creationTime: post._creationTime,
        text: post.text,
        authorId: post.authorId,
        author: await usernameOf(ctx, post.authorId),
        authorAvatar: await avatarUrlOf(ctx, post.authorId),
        knotId: post.knotId,
        knot: knotTitle,
        likeCount,
        likedByMe,
      });
    };
    for (const knotId of knotIds) {
      const knot = await ctx.db.get(knotId);
      if (!knot) continue;
      const posts = await ctx.db
        .query("posts")
        .withIndex("by_knot", (q) => q.eq("knotId", knotId))
        .collect();
      for (const post of posts) {
        await pushPost(post, knot.title);
      }
    }
    const pub = await ctx.db
      .query("posts")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();
    for (const post of pub) {
      const knot = await ctx.db.get(post.knotId);
      if (!knot) continue;
      await pushPost(post, knot.title);
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();
    const out = [];
    for (const post of posts) {
      const knot = await ctx.db.get(post.knotId);
      const { likeCount, likedByMe } = await likeInfo(ctx, post._id, userId);
      out.push({
        _id: post._id,
        _creationTime: post._creationTime,
        text: post.text,
        knotId: post.knotId,
        knot: knot?.title ?? "deleted knot",
        likeCount,
        likedByMe,
      });
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const get = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return null;
    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    const knot = await ctx.db.get(post.knotId);
    if (!knot) return null;
    const membership = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", post.knotId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (!post.isPublic && !membership) return null;
    const { likeCount, likedByMe } = await likeInfo(ctx, post._id, userId);
    return {
      _id: post._id,
      _creationTime: post._creationTime,
      text: post.text,
      authorId: post.authorId,
      author: await usernameOf(ctx, post.authorId),
      authorAvatar: await avatarUrlOf(ctx, post.authorId),
      knotId: post.knotId,
      knot: knot.title,
      knotJoinable: knot.joinable,
      isMember: membership !== null,
      isPublic: post.isPublic,
      likeCount,
      likedByMe,
    };
  },
});

export const byUser = query({
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
    if (!target) return [];
    const mine = new Set(
      (
        await ctx.db
          .query("knot_members")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      ).map((m) => m.knotId),
    );
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", target.userId))
      .collect();
    const out = [];
    for (const post of posts) {
      if (!post.isPublic && !mine.has(post.knotId)) continue;
      const knot = await ctx.db.get(post.knotId);
      if (!knot) continue;
      const { likeCount, likedByMe } = await likeInfo(
        ctx,
        post._id,
        userId,
      );
      out.push({
        _id: post._id,
        _creationTime: post._creationTime,
        text: post.text,
        knotId: post.knotId,
        knot: knot.title,
        likeCount,
        likedByMe,
      });
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});
