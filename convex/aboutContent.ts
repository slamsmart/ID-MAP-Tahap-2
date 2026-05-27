import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const serviceItem = v.object({
  iconKey: v.string(),
  titleId: v.string(),
  titleEn: v.string(),
  descId: v.string(),
  descEn: v.string(),
  image: v.optional(v.string()),
});

const whyCard = v.object({
  iconKey: v.string(),
  titleId: v.string(),
  titleEn: v.string(),
  descId: v.string(),
  descEn: v.string(),
});

const aboutValidator = v.object({
  _id: v.id("aboutContent"),
  _creationTime: v.number(),
  key: v.string(),
  heroImage: v.optional(v.string()),
  heroTitleId: v.string(),
  heroTitleEn: v.string(),
  heroSubtitleId: v.string(),
  heroSubtitleEn: v.string(),
  apaItuTitleId: v.string(),
  apaItuTitleEn: v.string(),
  apaItuParagraph1Id: v.string(),
  apaItuParagraph1En: v.string(),
  apaItuParagraph2Id: v.string(),
  apaItuParagraph2En: v.string(),
  missionId: v.string(),
  missionEn: v.string(),
  visionId: v.string(),
  visionEn: v.string(),
  services: v.array(serviceItem),
  whyCards: v.array(whyCard),
  updatedAt: v.number(),
});

// Singleton — falls back to hard-coded defaults in /tentang when null.
export const get = query({
  args: {},
  returns: v.union(aboutValidator, v.null()),
  handler: async (ctx) => {
    return await ctx.db
      .query("aboutContent")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
  },
});

export const update = mutation({
  args: {
    heroImage: v.optional(v.string()),
    heroTitleId: v.string(),
    heroTitleEn: v.string(),
    heroSubtitleId: v.string(),
    heroSubtitleEn: v.string(),
    apaItuTitleId: v.string(),
    apaItuTitleEn: v.string(),
    apaItuParagraph1Id: v.string(),
    apaItuParagraph1En: v.string(),
    apaItuParagraph2Id: v.string(),
    apaItuParagraph2En: v.string(),
    missionId: v.string(),
    missionEn: v.string(),
    visionId: v.string(),
    visionEn: v.string(),
    services: v.array(serviceItem),
    whyCards: v.array(whyCard),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aboutContent")
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
      await ctx.db.insert("aboutContent", data);
    }
    return null;
  },
});
