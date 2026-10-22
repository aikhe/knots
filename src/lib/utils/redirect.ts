// Only same-origin paths may be used as post-auth destinations.
export function safeRedirect(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
