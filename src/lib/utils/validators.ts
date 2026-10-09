import { type } from "arktype";

// Mirrors the tasks table in convex/schema.ts. Convex enforces its schema
// server-side; this is the shared static type plus a runtime validator for
// client inputs (forms, imports).
export const TaskSchema = type({
  _id: "string",
  _creationTime: "number",
  text: "string",
  isCompleted: "boolean",
  userId: "string",
});

export type Task = typeof TaskSchema.infer;
