import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const orgValidator = v.object({
  _id: v.id("partnerOrganizations"),
  _creationTime: v.number(),
  name: v.string(),
  legalName: v.string(),
  type: v.union(
    v.literal("ngo"),
    v.literal("akademisi"),
    v.literal("pemerintah_daerah"),
    v.literal("koperasi")
  ),
  capabilities: v.array(v.string()),
  contactEmail: v.string(),
  website: v.optional(v.string()),
  logo: v.optional(v.string()),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("aktif"),
    v.literal("review"),
    v.literal("nonaktif")
  ),
  whitelistedAt: v.number(),
  updatedAt: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(orgValidator),
  handler: async (ctx) => {
    return await ctx.db.query("partnerOrganizations").order("desc").collect();
  },
});

export const listAktif = query({
  args: {},
  returns: v.array(orgValidator),
  handler: async (ctx) => {
    return await ctx.db
      .query("partnerOrganizations")
      .withIndex("by_status", (q) => q.eq("status", "aktif"))
      .collect();
  },
});

export const get = query({
  args: { orgId: v.id("partnerOrganizations") },
  returns: v.union(orgValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    legalName: v.string(),
    type: v.union(
      v.literal("ngo"),
      v.literal("akademisi"),
      v.literal("pemerintah_daerah"),
      v.literal("koperasi")
    ),
    capabilities: v.array(v.string()),
    contactEmail: v.string(),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.id("partnerOrganizations"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("partnerOrganizations", {
      ...args,
      status: "aktif",
      whitelistedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    orgId: v.id("partnerOrganizations"),
    status: v.union(
      v.literal("aktif"),
      v.literal("review"),
      v.literal("nonaktif")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orgId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Seed 3 NGO pilot — dipakai sekali untuk submission demo.
// Run: npx convex run partnerOrganizations:seedPilot
export const seedPilot = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("partnerOrganizations").first();
    if (existing) return "Skipped: NGO whitelist sudah pernah di-seed.";

    const orgs = [
      {
        name: "YKAN",
        legalName: "Yayasan Konservasi Alam Nusantara",
        type: "ngo" as const,
        capabilities: ["mangrove", "blue_carbon", "mrv"],
        contactEmail: "info@ykan.or.id",
        website: "https://ykan.or.id",
        description:
          "Yayasan Konservasi Alam Nusantara — afiliasi The Nature Conservancy untuk konservasi laut & pesisir Indonesia.",
      },
      {
        name: "KEHATI",
        legalName: "Yayasan Keanekaragaman Hayati Indonesia",
        type: "ngo" as const,
        capabilities: ["mangrove", "biodiversity", "community"],
        contactEmail: "info@kehati.or.id",
        website: "https://kehati.or.id",
        description:
          "Yayasan KEHATI — pendana program biodiversitas dan keberlanjutan ekosistem Indonesia.",
      },
      {
        name: "WCS Indonesia",
        legalName: "Wildlife Conservation Society Indonesia Program",
        type: "ngo" as const,
        capabilities: ["penyu", "habitat_protection", "mrv"],
        contactEmail: "wcsindonesia@wcs.org",
        website: "https://indonesia.wcs.org",
        description:
          "Wildlife Conservation Society — riset & konservasi habitat penyu dan satwa pesisir.",
      },
    ];

    const ids: string[] = [];
    const now = Date.now();
    for (const org of orgs) {
      const id = await ctx.db.insert("partnerOrganizations", {
        ...org,
        status: "aktif",
        whitelistedAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    return `NGO pilot seeded: ${ids.length} organisasi (YKAN, KEHATI, WCS Indonesia).`;
  },
});
