import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function FriendsList() {
  const friends = useQuery(api.friends.list);

  if (friends === undefined) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (friends.length === 0) {
    return <p className="mt-6 text-center text-sm text-neutral-500">No friends yet.</p>;
  }

  return (
    <ul className="mt-6 divide-y divide-neutral-800">
      {friends.map((f) => (
        <li key={f.userId} className="py-3">
          <Link to={`/user/${f.username}`} className="text-sm text-white">
            {f.displayName}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FriendsPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-6">
      <h1 className="text-xl font-medium text-white">Friends</h1>
      {!clerkConfigured ? (
        <p className="mt-6 text-center text-sm text-neutral-500">
          Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to sign in.
        </p>
      ) : (
        <>
          <SignedOut>
            <Link
              to="/signin"
              className="mt-6 inline-block text-sm text-white underline"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <FriendsList />
          </SignedIn>
        </>
      )}
    </main>
  );
}
