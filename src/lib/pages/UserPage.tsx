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
  const trust = useQuery(api.users.trust, { username });
  const relation = useQuery(api.friends.status, { username });
  const sendRequest = useMutation(api.friends.send);

  if (profile === undefined || posts === undefined || shared === undefined) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (profile === null) {
    return <p className="mt-6 text-center text-sm text-neutral-500">No such user.</p>;
  }

  return (
    <div>
      <div className="flex items-start gap-3 pt-2">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName ?? username}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-2xl text-white">
            {(profile.displayName ?? username).slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xl leading-tight text-white">
            {profile.displayName ?? profile.username}
          </p>
          <p className="text-sm leading-tight text-white">
            {profile.username}
          </p>
          {trust && (
            <p className="mt-1 text-sm text-neutral-500">
              {trust.level} · {trust.streak}-day streak
            </p>
          )}
          <p className="mt-1 text-sm text-neutral-500">
            {posts.length} {posts.length === 1 ? "post" : "posts"} visible
            to you
          </p>
          {shared.length > 0 && (
            <p className="mt-1 text-sm text-neutral-500">
              Shared knots: {shared.map((k) => k.title).join(", ")}
            </p>
          )}
        </div>
      </div>
      {relation === "none" && (
        <button
          onClick={() => sendRequest({ username })}
          className="mt-5 w-full rounded-full bg-neutral-800 px-4 py-1.5 text-base text-white"
        >
          Add friend
        </button>
      )}
      {relation === "requested" && (
        <p className="mt-5 text-sm text-neutral-500">Request sent.</p>
      )}
      {relation === "friends" && (
        <p className="mt-5 text-sm text-neutral-500">Friends.</p>
      )}
      <div className="mt-2 pt-2">
        {posts.length === 0 ? (
          <p className="mt-2 text-center text-sm text-neutral-500">No posts to show.</p>
        ) : (
          <ul>
            {posts.map((p) => (
              <PostItem
                key={p._id}
                id={p._id}
                author={username}
                authorDisplay={profile.displayName ?? username}
                avatarUrl={profile.avatarUrl}
                knot={p.knot}
                text={p.text}
                time={p._creationTime}
                likeCount={p.likeCount}
                likedByMe={p.likedByMe}
                commentCount={p.commentCount}
                imageUrls={p.imageUrls}
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
    <main className="mx-auto max-w-2xl px-3">
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
            <UserDetails username={username} />
          </SignedIn>
        </>
      )}
    </main>
  );
}
