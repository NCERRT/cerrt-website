/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as advisories from "../advisories.js";
import type * as auth from "../auth.js";
import type * as contactSubmissions from "../contactSubmissions.js";
import type * as crons from "../crons.js";
import type * as defacementStats from "../defacementStats.js";
import type * as incidentReports from "../incidentReports.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_passwordPolicy from "../lib/passwordPolicy.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as maintenance from "../maintenance.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  advisories: typeof advisories;
  auth: typeof auth;
  contactSubmissions: typeof contactSubmissions;
  crons: typeof crons;
  defacementStats: typeof defacementStats;
  incidentReports: typeof incidentReports;
  "lib/auth": typeof lib_auth;
  "lib/passwordPolicy": typeof lib_passwordPolicy;
  "lib/rateLimit": typeof lib_rateLimit;
  maintenance: typeof maintenance;
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
