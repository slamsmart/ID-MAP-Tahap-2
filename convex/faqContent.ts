import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, requireServerMutationSecret } from "./authz";

const itemValidator = v.object({
  questionId: v.string(),
  questionEn: v.string(),
  answerId: v.string(),
  answerEn: v.string(),
});

const faqValidator = v.object({
  _id: v.id("faqContent"),
  _creationTime: v.number(),
  key: v.string(),
  heroTitleId: v.string(),
  heroTitleEn: v.string(),
  heroSubtitleId: v.string(),
  heroSubtitleEn: v.string(),
  items: v.array(itemValidator),
  updatedAt: v.number(),
});

// Singleton — falls back to hard-coded defaults in /faq when null.
export const get = query({
  args: {},
  returns: v.union(faqValidator, v.null()),
  handler: async (ctx) => {
    return await ctx.db
      .query("faqContent")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
  },
});

export const update = mutation({
  args: {
    actorId: v.id("users"),
    adminSecret: v.string(),
    heroTitleId: v.string(),
    heroTitleEn: v.string(),
    heroSubtitleId: v.string(),
    heroSubtitleEn: v.string(),
    items: v.array(itemValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { actorId, adminSecret, ...content } = args;
    requireServerMutationSecret(adminSecret);
    await requireRole(ctx, actorId, ["admin", "verifikator"]);
    const existing = await ctx.db
      .query("faqContent")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();

    const data = {
      key: "default",
      ...content,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("faqContent", data);
    }
    return null;
  },
});
