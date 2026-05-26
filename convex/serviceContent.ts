import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const serviceContentValidator = v.object({
  _id: v.id("serviceContent"),
  _creationTime: v.number(),
  key: v.string(),
  titleId: v.string(),
  titleEn: v.string(),
  descriptionId: v.string(),
  descriptionEn: v.string(),
  image: v.string(),
  badgeText: v.string(),
  badgeClass: v.string(),
  iconBgClass: v.string(),
  iconName: v.string(),
  value1: v.string(),
  label1: v.string(),
  value2: v.string(),
  label2: v.string(),
  value3: v.string(),
  label3: v.string(),
  order: v.number(),
  updatedAt: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(serviceContentValidator),
  handler: async (ctx) => {
    return await ctx.db.query("serviceContent").withIndex("by_order").collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const update = mutation({
  args: {
    key: v.string(),
    titleId: v.string(),
    titleEn: v.string(),
    descriptionId: v.string(),
    descriptionEn: v.string(),
    image: v.string(),
    badgeText: v.string(),
    badgeClass: v.string(),
    iconBgClass: v.string(),
    iconName: v.string(),
    value1: v.string(),
    label1: v.string(),
    value2: v.string(),
    label2: v.string(),
    value3: v.string(),
    label3: v.string(),
    order: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("serviceContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    const content = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, content);
    } else {
      await ctx.db.insert("serviceContent", content);
    }

    return null;
  },
});
