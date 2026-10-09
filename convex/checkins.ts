import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./users";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const checkin = mutation({
  args: {
    knotId: v.id("knots"),
    kind: v.union(v.literal("tap"), v.literal("note"), v.literal("photo")),
    text: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const knot = await ctx.db.get(args.knotId);
    if (!knot) throw new Error("Knot not found.");
    const row = await ctx.db
      .query("knot_members")
      .withIndex("by_knot", (q) => q.eq("knotId", args.knotId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (!row) throw new Error("Only knot members can check in.");
    const text = (args.text ?? "").trim();
    if (args.kind !== "tap" && !text && !args.imageStorageId) {
      throw new Error("Add a note or photo.");
    }
    await ctx.db.insert("checkins", {
      knotId: args.knotId,
      userId,
      kind: args.kind,
      text: text || undefined,
      imageStorageId: args.imageStorageId,
    });
    await ctx.db.patch(row._id, { lastCheckinAt: Date.now(), resting: false });
  },
});
