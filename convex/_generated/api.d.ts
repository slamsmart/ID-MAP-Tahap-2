/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aboutContent from "../aboutContent.js";
import type * as activities from "../activities.js";
import type * as certificates from "../certificates.js";
import type * as contributions from "../contributions.js";
import type * as faqContent from "../faqContent.js";
import type * as footerContent from "../footerContent.js";
import type * as kyc from "../kyc.js";
import type * as landingHero from "../landingHero.js";
import type * as mrvReports from "../mrvReports.js";
import type * as otpCodes from "../otpCodes.js";
import type * as partnerOrganizations from "../partnerOrganizations.js";
import type * as platformStats from "../platformStats.js";
import type * as projects from "../projects.js";
import type * as rolesSection from "../rolesSection.js";
import type * as seed from "../seed.js";
import type * as serviceContent from "../serviceContent.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aboutContent: typeof aboutContent;
  activities: typeof activities;
  certificates: typeof certificates;
  contributions: typeof contributions;
  faqContent: typeof faqContent;
  footerContent: typeof footerContent;
  kyc: typeof kyc;
  landingHero: typeof landingHero;
  mrvReports: typeof mrvReports;
  otpCodes: typeof otpCodes;
  partnerOrganizations: typeof partnerOrganizations;
  platformStats: typeof platformStats;
  projects: typeof projects;
  rolesSection: typeof rolesSection;
  seed: typeof seed;
  serviceContent: typeof serviceContent;
  transactions: typeof transactions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
