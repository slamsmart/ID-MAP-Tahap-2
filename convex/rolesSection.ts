import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const cardValidator = v.object({
  key: v.string(),
  titleId: v.string(),
  titleEn: v.string(),
  bullet1Id: v.string(),
  bullet1En: v.string(),
  bullet2Id: v.string(),
  bullet2En: v.string(),
  bullet3Id: v.string(),
  bullet3En: v.string(),
  ctaId: v.string(),
  ctaEn: v.string(),
  href: v.string(),
  image: v.string(),
  order: v.number(),
});

const rolesSectionValidator = v.object({
  _id: v.id("rolesSection"),
  _creationTime: v.number(),
  key: v.string(),
  headlineId: v.string(),
  headlineEn: v.string(),
  subtitleId: v.string(),
  subtitleEn: v.string(),
  cards: v.array(cardValidator),
  updatedAt: v.number(),
});

export const get = query({
  args: {},
  returns: v.union(rolesSectionValidator, v.null()),
  handler: async (ctx) => {
    return await ctx.db
      .query("rolesSection")
      .withIndex("by_key", (q) => q.eq("key", "threeRoles"))
      .unique();
  },
});

export const update = mutation({
  args: {
    headlineId: v.string(),
    headlineEn: v.string(),
    subtitleId: v.string(),
    subtitleEn: v.string(),
    cards: v.array(cardValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rolesSection")
      .withIndex("by_key", (q) => q.eq("key", "threeRoles"))
      .unique();

    const data = {
      key: "threeRoles",
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("rolesSection", data);
    }

    return null;
  },
});
