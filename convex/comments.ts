import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { callerUserId, requireUserId, usernameOf, avatarUrlOf, displayNameOf } from "./users";

type Ctx = QueryCtx | MutationCtx;

async function canSee(ctx: Ctx, postId: Id<"posts">, userId: string) {
  const post = await ctx.db.get(postId);
  if (!post) return false;
  if (post.isPublic) return true;
  const membership = await ctx.db
    .query("knot_members")
    .withIndex("by_knot", (q) => q.eq("knotId", post.knotId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .unique();
  return membership !== null;
}

export const create = mutation({
  args: {
    postId: v.id("posts"),
    text: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const text = args.text.trim();
    if (!text && !args.imageStorageId) {
      throw new Error("Comment cannot be empty.");
    }
    if (!(await canSee(ctx, args.postId, userId))) {
      throw new Error("Not found.");
    }
    await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: userId,
      text,
      imageStorageId: args.imageStorageId,
    });
  },
});

export const list = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx);
    if (userId === null) return [];
    if (!(await canSee(ctx, args.postId, userId))) return [];
    const rows = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    const out = [];
    for (const row of rows) {
      out.push({
        _id: row._id,
        _creationTime: row._creationTime,
        text: row.text,
        authorId: row.authorId,
        author: await usernameOf(ctx, row.authorId),
        authorDisplay: await displayNameOf(ctx, row.authorId),
        authorAvatar: await avatarUrlOf(ctx, row.authorId),
        imageUrl: row.imageStorageId
          ? await ctx.storage.getUrl(row.imageStorageId)
          : null,
      });
    }
    return out.sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.authorId !== userId) {
      throw new Error("Not found.");
    }
    await ctx.db.delete(args.commentId);
  },
});
