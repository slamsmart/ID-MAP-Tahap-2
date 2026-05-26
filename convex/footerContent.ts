import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const footerContentValidator = v.object({
  _id: v.id("footerContent"),
  _creationTime: v.number(),
  key: v.string(),
  brandName: v.string(),
  descriptionId: v.string(),
  descriptionEn: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  updatedAt: v.number(),
});

export const get = query({
  args: {},
  returns: v.union(footerContentValidator, v.null()),
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("footerContent")
      .withIndex("by_key", (q) => q.eq("key", "brand"))
      .unique();
    return doc;
  },
});

export const update = mutation({
  args: {
    brandName: v.string(),
    descriptionId: v.string(),
    descriptionEn: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("footerContent")
      .withIndex("by_key", (q) => q.eq("key", "brand"))
      .unique();

    const data = {
      key: "brand",
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("footerContent", data);
    }

    return null;
  },
});
