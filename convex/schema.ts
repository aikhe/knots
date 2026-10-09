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
    inviteToken: v.optional(v.string()),
    kind: v.union(
      v.literal("solo"),
      v.literal("tied"),
      v.literal("squad"),
    ),
    joinable: v.boolean(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_invite", ["inviteToken"]),

  knot_members: defineTable({
    knotId: v.id("knots"),
    userId: v.string(),
    lastCheckinAt: v.optional(v.number()),
    resting: v.optional(v.boolean()),
  })
    .index("by_knot", ["knotId"])
    .index("by_user", ["userId"]),

  posts: defineTable({
    text: v.string(),
    authorId: v.string(),
    knotId: v.id("knots"),
    isPublic: v.boolean(),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
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

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.string(),
    text: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  }).index("by_post", ["postId"]),

  notifications: defineTable({
    userId: v.string(),
    kind: v.union(v.literal("reminder"), v.literal("tug")),
    knotId: v.optional(v.id("knots")),
    text: v.string(),
    read: v.boolean(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    text: v.string(),
    authorId: v.string(),
    knotId: v.id("knots"),
  }).index("by_knot", ["knotId"]),

  checkins: defineTable({
    knotId: v.id("knots"),
    userId: v.string(),
    kind: v.union(v.literal("tap"), v.literal("note"), v.literal("photo")),
    text: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  })
    .index("by_knot", ["knotId"])
    .index("by_user", ["userId"]),

  tugs: defineTable({
    knotId: v.id("knots"),
    fromUserId: v.string(),
    toUserId: v.string(),
  }).index("by_to", ["toUserId"]),

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
