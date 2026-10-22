import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@knots/backend/api";

// Creates the users row for the signed-in account and syncs its avatar.
// Renders nothing, but every authenticated query depends on the row.
export function EnsureUser() {
  const { user, isLoaded } = useUser();
  const ensure = useMutation(api.users.ensure);
  const syncAvatar = useAction(api.users.syncAvatar);
  const tried = useRef("");

  useEffect(() => {
    if (!isLoaded || !user) return;
    const base = (
      user.username ??
      user.primaryEmailAddress?.emailAddress.split("@")[0] ??
      ""
    ).toLowerCase();
    if (!base || tried.current === user.id + base) return;
    tried.current = user.id + base;
    ensure({ username: base })
      .catch(() =>
        ensure({
          username: `${base}_${user.id.slice(-4).toLowerCase()}`,
        }),
      )
      .catch(() => {})
      .finally(() => {
        syncAvatar().catch(() => {});
      });
  }, [isLoaded, user, ensure, syncAvatar]);

  return null;
}
