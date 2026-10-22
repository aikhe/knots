import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Navigate, Outlet, useLocation } from "react-router";
import { api } from "../../../convex/_generated/api";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// Gate for every in-app route: signed-out visitors go to sign-in with a
// return path, and new accounts go through onboarding first. Invites skip
// onboarding so a shared link lands on the knot it points to.
export function RequireAuth() {
  if (!clerkConfigured) return <Outlet />;
  return <AuthGate />;
}

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const { pathname, search } = useLocation();
  const signedIn = Boolean(isSignedIn);
  const me = useQuery(api.users.me, signedIn ? {} : "skip");
  const knots = useQuery(api.knots.mine, signedIn ? {} : "skip");

  if (!isLoaded) return null;

  const redirect = `${pathname}${search}`;
  if (!isSignedIn) {
    return (
      <Navigate
        to={`/signin?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  // me is null until EnsureUser creates the row, and knots is undefined
  // until the first subscription returns. Waiting avoids a redirect flash.
  if (me === undefined || me === null || knots === undefined) return null;

  const invited = pathname.startsWith("/join/");
  if (!invited && me.mascot === null && knots.length === 0) {
    return (
      <Navigate
        to={`/welcome?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
