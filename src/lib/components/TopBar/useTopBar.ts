import { useQuery } from "convex/react";
import { useLocation } from "react-router";
import { api } from "../../../../convex/_generated/api";

export function useTopBarVariant() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/profile")) return "profile";
  return "default";
}

export function useTopBarStreak() {
  const me = useQuery(api.users.me);
  const trust = useQuery(
    api.users.trust,
    me ? { username: me.username } : "skip",
  );
  return trust?.streak;
}
