import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { destroyKnot } from "./knots";
import { requireUserId } from "./users";

// Test-only wipe. Every row is selected by the caller's own subject, so a
// reset can never reach another account's data.
async function wipe(ctx: MutationCtx, userId: string) {
  const knots = await ctx.db
    .query("knots")
    .withIndex("by_creator", (q) => q.eq("creatorId", userId))
    .collect();
  for (const knot of knots) await destroyKnot(ctx, knot._id);

  const memberships = await ctx.db
    .query("knot_members")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const row of memberships) await ctx.db.delete(row._id);

  const posts = await ctx.db
    .query("posts")
    .withIndex("by_author", (q) => q.eq("authorId", userId))
    .collect();
  for (const post of posts) {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();
    for (const like of likes) await ctx.db.delete(like._id);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();
    for (const comment of comments) await ctx.db.delete(comment._id);
    await ctx.db.delete(post._id);
  }

  const likes = await ctx.db
    .query("likes")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const like of likes) await ctx.db.delete(like._id);

  const checkins = await ctx.db
    .query("checkins")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const checkin of checkins) await ctx.db.delete(checkin._id);

  // These tables have no author index, so they are scanned. Dev only.
  const comments = await ctx.db.query("comments").collect();
  for (const comment of comments) {
    if (comment.authorId === userId) await ctx.db.delete(comment._id);
  }
  const messages = await ctx.db.query("messages").collect();
  for (const message of messages) {
    if (message.authorId === userId) await ctx.db.delete(message._id);
  }
  const tugs = await ctx.db.query("tugs").collect();
  for (const tug of tugs) {
    if (tug.fromUserId === userId || tug.toUserId === userId) {
      await ctx.db.delete(tug._id);
    }
  }
  const requests = await ctx.db.query("friend_requests").collect();
  for (const request of requests) {
    if (request.fromUserId === userId || request.toUserId === userId) {
      await ctx.db.delete(request._id);
    }
  }

  const notifications = await ctx.db
    .query("notifications")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const note of notifications) await ctx.db.delete(note._id);
}

// Clears everything the caller owns but keeps the login, so the next load
// behaves like a brand-new account.
export const resetAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await wipe(ctx, userId);
    const self = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (self) await ctx.db.patch(self._id, { mascot: undefined });
  },
});

// Removes the users row too. The client deletes the Clerk user after this,
// while the session that authorized the wipe is still valid.
export const purgeAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await wipe(ctx, userId);
    const self = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!self) return;
    if (self.avatarStorageId) await ctx.storage.delete(self.avatarStorageId);
    await ctx.db.delete(self._id);
  },
});
