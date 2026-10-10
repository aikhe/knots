import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function JoinDetails({ token }: { token: string }) {
  const navigate = useNavigate();
  const preview = useQuery(api.knots.preview, { token });
  const joinByToken = useMutation(api.knots.joinByToken);
  const [error, setError] = useState<string | null>(null);

  if (preview === undefined) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (preview === null) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Invite not found.</p>;
  }

  async function accept() {
    setError(null);
    try {
      const knotId = await joinByToken({ token });
      navigate(`/knot/${knotId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join.");
    }
  }

  return (
    <div className="mt-6">
      <p className="text-xl font-medium text-white">{preview.title}</p>
      <p className="mt-1 text-sm text-neutral-500">
        {preview.kind} · {preview.memberCount}{" "}
        {preview.memberCount === 1 ? "member" : "members"}
      </p>
      {preview.isMember ? (
        <Link
          to={`/knot/${preview.knotId}`}
          className="mt-4 inline-block text-sm text-white underline"
        >
          Open knot
        </Link>
      ) : (
        <button
          onClick={accept}
          className="mt-4 rounded bg-neutral-100 px-4 py-1.5 text-sm text-black"
        >
          Accept invite
        </button>
      )}
      {error && <p className="mt-2 text-sm text-neutral-500">{error}</p>}
    </div>
  );
}

export function JoinPage() {
  const { token = "" } = useParams();

  return (
    <main className="mx-auto max-w-2xl px-3 py-6">
      <h1 className="text-xl font-medium text-white">Invite</h1>
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
            <JoinDetails token={token} />
          </SignedIn>
        </>
      )}
    </main>
  );
}
