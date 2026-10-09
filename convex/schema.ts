import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),

  knots: defineTable({
    title: v.string(),
    creatorId: v.string(),
    joinable: v.boolean(),
  }).index("by_creator", ["creatorId"]),

  knot_members: defineTable({
    knotId: v.id("knots"),
    userId: v.string(),
  })
    .index("by_knot", ["knotId"])
    .index("by_user", ["userId"]),

  posts: defineTable({
    text: v.string(),
    authorId: v.string(),
    knotId: v.id("knots"),
    isPublic: v.boolean(),
  })
    .index("by_knot", ["knotId"])
    .index("by_author", ["authorId"])
    .index("by_public", ["isPublic"]),

  likes: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"]),

  messages: defineTable({
    text: v.string(),
    authorId: v.string(),
    knotId: v.id("knots"),
  }).index("by_knot", ["knotId"]),

  friend_requests: defineTable({
    fromUserId: v.string(),
    toUserId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
  })
    .index("by_to", ["toUserId"])
    .index("by_from", ["fromUserId"]),
});
