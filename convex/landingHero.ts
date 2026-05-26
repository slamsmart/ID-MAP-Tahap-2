import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const landingHeroValidator = v.object({
  _id: v.id("landingHero"),
  _creationTime: v.number(),
  key: v.string(),
  image: v.string(),
  badgeId: v.string(),
  badgeEn: v.string(),
  headlineLine1Id: v.string(),
  headlineLine1En: v.string(),
  headlineLine2Id: v.string(),
  headlineLine2En: v.string(),
  headlineAccentId: v.string(),
  headlineAccentEn: v.string(),
  subheadId: v.string(),
  subheadEn: v.string(),
  primaryCtaLabelId: v.string(),
  primaryCtaLabelEn: v.string(),
  primaryCtaHref: v.string(),
  secondaryCtaLabelId: v.string(),
  secondaryCtaLabelEn: v.string(),
  secondaryCtaHref: v.string(),
  updatedAt: v.number(),
});

// Singleton: returns the landing-hero document or null when nothing has
// been published yet (the landing page falls back to its hard-coded copy).
export const get = query({
  args: {},
  returns: v.union(landingHeroValidator, v.null()),
  handler: async (ctx) => {
    return await ctx.db
      .query("landingHero")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
  },
});

export const update = mutation({
  args: {
    image: v.string(),
    badgeId: v.string(),
    badgeEn: v.string(),
    headlineLine1Id: v.string(),
    headlineLine1En: v.string(),
    headlineLine2Id: v.string(),
    headlineLine2En: v.string(),
    headlineAccentId: v.string(),
    headlineAccentEn: v.string(),
    subheadId: v.string(),
    subheadEn: v.string(),
    primaryCtaLabelId: v.string(),
    primaryCtaLabelEn: v.string(),
    primaryCtaHref: v.string(),
    secondaryCtaLabelId: v.string(),
    secondaryCtaLabelEn: v.string(),
    secondaryCtaHref: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("landingHero")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();

    const data = {
      key: "default",
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("landingHero", data);
    }
    return null;
  },
});
