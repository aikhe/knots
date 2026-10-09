import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function Requests() {
  const incoming = useQuery(api.friends.incoming);
  const respond = useMutation(api.friends.respond);

  if (incoming === undefined) {
    return <p className="mt-6 text-sm text-neutral-500">Loading...</p>;
  }
  if (incoming.length === 0) {
    return (
      <p className="mt-6 text-sm text-neutral-500">Nothing here yet.</p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-neutral-800">
      {incoming.map((r) => (
        <li key={r._id} className="flex items-center gap-2 py-3">
          <Link
            to={`/user/${r.username}`}
            className="text-sm text-white underline"
          >
            {r.username}
          </Link>
          <span className="text-sm text-neutral-500">added you</span>
          <div className="ml-auto flex gap-3">
            <button
              onClick={() =>
                respond({
                  requestId: r._id as Id<"friend_requests">,
                  accept: true,
                })
              }
              className="text-sm text-white underline"
            >
              Accept
            </button>
            <button
              onClick={() =>
                respond({
                  requestId: r._id as Id<"friend_requests">,
                  accept: false,
                })
              }
              className="text-sm text-neutral-500 underline"
            >
              Decline
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function InfoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-medium text-white">Info</h1>
      {!clerkConfigured ? (
        <p className="mt-6 text-sm text-neutral-500">
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
            <Requests />
          </SignedIn>
        </>
      )}
    </main>
  );
}
