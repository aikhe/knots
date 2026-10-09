import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PostItem } from "../components/Posts/PostItem";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function UserDetails({ username }: { username: string }) {
  const profile = useQuery(api.users.byUsername, { username });
  const posts = useQuery(api.posts.byUser, { username });
  const shared = useQuery(api.knots.sharedWith, { username });
  const relation = useQuery(api.friends.status, { username });
  const sendRequest = useMutation(api.friends.send);

  if (profile === undefined || posts === undefined || shared === undefined) {
    return <p className="mt-6 text-sm text-neutral-500">Loading...</p>;
  }
  if (profile === null) {
    return <p className="mt-6 text-sm text-neutral-500">No such user.</p>;
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-white">
        {profile.displayName ?? profile.username}
      </p>
      <p className="text-sm text-neutral-500">{profile.username}</p>
      <p className="mt-1 text-sm text-neutral-500">
        {posts.length} {posts.length === 1 ? "post" : "posts"} visible to you
      </p>
      {shared.length > 0 && (
        <p className="mt-1 text-sm text-neutral-500">
          Shared knots: {shared.map((k) => k.title).join(", ")}
        </p>
      )}
      {relation === "none" && (
        <button
          onClick={() => sendRequest({ username })}
          className="mt-3 text-sm text-white underline"
        >
          Add friend
        </button>
      )}
      {relation === "requested" && (
        <p className="mt-3 text-sm text-neutral-500">Request sent.</p>
      )}
      {relation === "friends" && (
        <p className="mt-3 text-sm text-neutral-500">Friends.</p>
      )}
      <div className="mt-4 border-t border-neutral-800">
        {posts.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No posts to show.</p>
        ) : (
          <ul>
            {posts.map((p) => (
              <PostItem
                key={p._id}
                id={p._id}
                author={username}
                avatarUrl={profile.avatarUrl}
                knot={p.knot}
                text={p.text}
                time={p._creationTime}
                likeCount={p.likeCount}
                likedByMe={p.likedByMe}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function UserPage() {
  const { username = "" } = useParams();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-medium text-white">Profile</h1>
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
            <UserDetails username={username} />
          </SignedIn>
        </>
      )}
    </main>
  );
}
