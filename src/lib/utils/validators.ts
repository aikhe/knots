import { type } from "arktype";

// Mirrors the tables in convex/schema.ts. Convex enforces its schema
// server-side; these are the shared static types plus runtime validators
// for client inputs (forms, imports).
export const UserSchema = type({
  _id: "string",
  _creationTime: "number",
  userId: "string",
  username: "string",
});

export const KnotSchema = type({
  _id: "string",
  _creationTime: "number",
  title: "string",
  creatorId: "string",
  joinable: "boolean",
});

export const PostSchema = type({
  _id: "string",
  _creationTime: "number",
  text: "string",
  authorId: "string",
  knotId: "string",
  isPublic: "boolean",
});

export type KnotUser = typeof UserSchema.infer;
export type Knot = typeof KnotSchema.infer;
export type Post = typeof PostSchema.infer;
