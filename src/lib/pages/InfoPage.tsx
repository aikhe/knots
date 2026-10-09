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
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (incoming.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="mt-6 text-center text-sm text-neutral-500">Friend requests</h2>
      <ul className="divide-y divide-neutral-800">
        {incoming.map((r) => (
          <li key={r._id} className="flex items-center gap-2 py-3">
            <Link
              to={`/user/${r.username}`}
              className="text-sm text-white underline"
            >
              {r.displayName}
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
    </>
  );
}

function Tugs() {
  const incoming = useQuery(api.tugs.incoming);
  const dismiss = useMutation(api.tugs.dismiss);

  if (incoming === undefined || incoming.length === 0) return null;

  return (
    <>
      <h2 className="mt-6 text-center text-sm text-neutral-500">Tugs</h2>
      <ul className="divide-y divide-neutral-800">
        {incoming.map((t) => (
          <li key={t._id} className="flex items-center gap-2 py-3">
            <Link
              to={`/user/${t.from}`}
              className="text-sm text-white underline"
            >
              {t.fromDisplay}
            </Link>
            <span className="text-sm text-neutral-500">
              tugged you in{" "}
            </span>
            <Link
              to={`/knot/${t.knotId}`}
              className="text-sm text-white underline"
            >
              {t.knot}
            </Link>
            <button
              onClick={() => dismiss({ tugId: t._id })}
              className="ml-auto text-sm text-neutral-500 underline"
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Empty({ show }: { show: boolean }) {
  if (!show) return null;
  return <p className="mt-6 text-center text-sm text-neutral-500">Nothing here yet.</p>;
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
  return (
    <>
      <Requests />
      <Tugs />
      {(notes.filter((n) => !n.read) ?? []).length > 0 && (
        <>
          <h2 className="mt-6 text-center text-sm text-neutral-500">Reminders</h2>
          <ul className="divide-y divide-neutral-800">
            {notes
              .filter((n) => !n.read)
              .map((n) => (
                <li key={n._id} className="flex items-center gap-2 py-3">
                  <p className="text-sm text-neutral-300">
                    {n.text}{" "}
                    {n.knot && n.knotId && (
                      <Link
                        to={`/knot/${n.knotId}`}
                        className="text-white underline"
                      >
                        {n.knot}
                      </Link>
                    )}
                  </p>
                  <button
                    onClick={() => markRead({ notificationId: n._id })}
                    className="ml-auto shrink-0 text-sm text-neutral-500 underline"
                  >
                    Done
                  </button>
                </li>
              ))}
          </ul>
        </>
      )}
      <Empty
        show={
          requests.length === 0 &&
          tugs.length === 0 &&
          notes.filter((n) => !n.read).length === 0
        }
      />
    </>
  );
}

export function InfoPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-6">
      <h1 className="text-xl font-medium text-white">Info</h1>
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
            <Notifications />
          </SignedIn>
        </>
      )}
    </main>
  );
}
