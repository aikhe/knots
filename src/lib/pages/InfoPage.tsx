import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BubsCard } from "../components/Bubs/BubsCard";
import { Link, useNavigate } from "react-router";
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
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (incoming.length === 0) {
    return null;
  }

  return (
    <>
      <ul className="divide-y divide-neutral-800">
        {incoming.map((r) => (
          <li key={r._id} className="flex items-center gap-2 py-3">
            <Link to={`/user/${r.username}`} className="text-sm text-white">
              {r.displayName}
            </Link>
            <span className="text-sm text-neutral-500">added you</span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() =>
                  respond({
                    requestId: r._id as Id<"friend_requests">,
                    accept: true,
                  })
                }
                className="rounded-full bg-white px-4 py-1.5 text-sm text-black"
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
                className="rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Tugs() {
  const incoming = useQuery(api.tugs.incoming);
  const dismiss = useMutation(api.tugs.dismiss);

  if (incoming === undefined || incoming.length === 0) return null;

  return (
    <>
      <ul className="divide-y divide-neutral-800">
        {incoming.map((t) => (
          <li key={t._id} className="flex items-center gap-2 py-3">
            <Link to={`/user/${t.from}`} className="text-sm text-white">
              {t.fromDisplay}
            </Link>
            <span className="text-sm text-neutral-500">
              tugged you in{" "}
            </span>
            <Link to={`/knot/${t.knotId}`} className="text-sm text-white">
              {t.knot}
            </Link>
            <button
              onClick={() => dismiss({ tugId: t._id })}
              className="ml-auto rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white"
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Notifications() {
  const requests = useQuery(api.friends.incoming);
  const tugs = useQuery(api.tugs.incoming);
  const notes = useQuery(api.notifications.list);
  const markRead = useMutation(api.notifications.markRead);
  if (
    requests === undefined ||
    tugs === undefined ||
    notes === undefined
  ) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  const unread = notes.filter((n) => !n.read);
  const hasAny =
    requests.length > 0 || tugs.length > 0 || unread.length > 0;
  return (
    <div className="mt-2 rounded-2xl bg-neutral-900 p-3">
      {!hasAny ? (
        <p className="py-3 text-center text-sm text-neutral-500">
          Nothing here yet.
        </p>
      ) : (
        <>
          <Requests />
          <Tugs />
          {unread.length > 0 && (
            <ul className="divide-y divide-neutral-800">
              {unread.map((n) => (
                <li key={n._id} className="flex items-center gap-2 py-3">
                  <p className="text-sm text-neutral-300">
                    {n.text}{" "}
                    {n.knot && n.knotId && (
                      <Link to={`/knot/${n.knotId}`} className="text-white">
                        {n.knot}
                      </Link>
                    )}
                  </p>
                  <button
                    onClick={() => markRead({ notificationId: n._id })}
                    className="ml-auto shrink-0 rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white"
                  >
                    Done
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function DevReset() {
  const navigate = useNavigate();
  const reset = useMutation(api.knots.resetOnboarding);
  const seed = useMutation(api.seed.seedDemo);
  const [error, setError] = useState<string | null>(null);
  if (!import.meta.env.DEV) return null;
  return (
    <div className="mt-4">
      <button
        onClick={() => reset().then(() => navigate("/welcome"))}
        className="w-full rounded-full bg-neutral-800 px-4 py-1.5 text-base text-white"
      >
        Reset onboarding (dev)
      </button>
      <button
        onClick={() => {
          setError(null);
          seed().catch((e) =>
            setError(e instanceof Error ? e.message : "Could not seed."),
          );
        }}
        className="mt-2 w-full rounded-full bg-neutral-800 px-4 py-1.5 text-base text-white"
      >
        Seed demo data (dev)
      </button>
      {error && (
        <p className="mt-1 text-center text-sm text-neutral-500">{error}</p>
      )}
    </div>
  );
}

export function InfoPage() {
  return (
    <main className="mx-auto max-w-2xl px-3">
      <h2 className="text-xl text-white">Bub's insight</h2>
      <BubsCard />
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
            <div className="mt-4">
              <h2 className="text-xl text-white">Notification</h2>
              <Notifications />
            </div>
            <DevReset />
          </SignedIn>
        </>
      )}
    </main>
  );
}
