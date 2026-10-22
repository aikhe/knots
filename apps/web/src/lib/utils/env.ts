// feature flags derived from public VITE_* env, baked in at build time
export const convexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL);
export const clerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
