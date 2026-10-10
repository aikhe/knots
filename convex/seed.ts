import { mutation } from "./_generated/server";
import { requireUserId } from "./users";

// Dev-only: seed demo knots, posts, messages, checkins and a
// notification so every surface has something to render.
export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("knots")
      .withIndex("by_creator", (q) => q.eq("creatorId", userId))
      .collect();
    if (existing.length > 0) throw new Error("Already seeded.");

    const now = Date.now();
    const specs = [
      {
        title: "Morning Gym",
        background: "/knot-bgs/Frame-33-vector.svg",
        posts: ["Leg day done.", "Early session tomorrow."],
        messages: ["Who is in tomorrow?", "In. 6am."],
        note: "Felt strong today.",
      },
      {
        title: "Deep Work",
        background: "/knot-bgs/Frame-33-1-vector.svg",
        posts: ["Two hour block, no phone."],
        messages: ["Focus room at 9?"],
        note: "Shipped the draft.",
      },
      {
        title: "Daily Reading",
        background: "/knot-bgs/Frame-33-2-vector.svg",
        posts: ["Chapter 4 highlights."],
        messages: [],
        note: "20 pages before bed.",
      },
    ];

    for (const spec of specs) {
      const knotId = await ctx.db.insert("knots", {
        title: spec.title,
        creatorId: userId,
        kind: "solo",
        joinable: false,
        background: spec.background,
        inviteToken: [...crypto.getRandomValues(new Uint8Array(16))]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      });
      await ctx.db.insert("knot_members", {
        knotId,
        userId,
        lastCheckinAt: now,
      });
      for (const text of spec.posts) {
        await ctx.db.insert("posts", {
          text,
          authorId: userId,
          knotId,
          isPublic: false,
        });
      }
      for (const text of spec.messages) {
        await ctx.db.insert("messages", { text, authorId: userId, knotId });
      }
      await ctx.db.insert("checkins", {
        knotId,
        userId,
        kind: "note",
        text: spec.note,
      });
    }

    const first = (
      await ctx.db
        .query("knots")
        .withIndex("by_creator", (q) => q.eq("creatorId", userId))
        .collect()
    )[0];
    await ctx.db.insert("notifications", {
      userId,
      kind: "digest",
      knotId: first?._id,
      text: "2 tight, 1 firm, 0 slack. Everything is tight. Keep the rhythm.",
      read: false,
    });
  },
});
