/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as checkins from "../checkins.js";
import type * as comments from "../comments.js";
import type * as crons from "../crons.js";
import type * as friends from "../friends.js";
import type * as knotScore from "../knotScore.js";
import type * as knots from "../knots.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as reminders from "../reminders.js";
import type * as tugs from "../tugs.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  checkins: typeof checkins;
  comments: typeof comments;
  crons: typeof crons;
  friends: typeof friends;
  knotScore: typeof knotScore;
  knots: typeof knots;
  messages: typeof messages;
  notifications: typeof notifications;
  posts: typeof posts;
  reminders: typeof reminders;
  tugs: typeof tugs;
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
