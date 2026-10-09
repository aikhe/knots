import { SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PostItem } from "../components/Posts/PostItem";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function ProfileDetails() {
  const posts = useQuery(api.posts.mine);
  const knots = useQuery(api.knots.mine);
  const me = useQuery(api.users.me);
  const trust = useQuery(
    api.users.trust,
    me ? { username: me.username } : "skip",
  );
  const friends = useQuery(api.friends.list);
  const name = me?.displayName ?? me?.username ?? "you";

  return (
    <div>
      <div className="flex items-start gap-3 pt-2">
        {me?.avatarUrl ? (
          <img
            src={me.avatarUrl}
            alt={name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800 text-2xl text-white">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xl leading-tight text-white">{name}</p>
          <p className="text-sm leading-tight text-white">{me?.username}</p>
          <p className="mt-1 text-sm text-neutral-500">
            {knots === undefined
              ? "Loading data..."
              : `${knots.length} ${knots.length === 1 ? "knot" : "knots"}${trust ? ` · ${trust.level}` : ""}`}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {friends === undefined ? (
              "Loading friends..."
            ) : (
              <Link to="/profile/friends" className="text-neutral-500">
                {`${friends.length} ${friends.length === 1 ? "friend" : "friends"}`}
              </Link>
            )}
          </p>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <Link
          to="/profile/edit"
          className="flex-1 rounded-full bg-neutral-800 px-4 py-1.5 text-center text-base text-white"
        >
          Edit profile
        </Link>
        <SignOutButton>
          <button className="flex-1 rounded-full bg-neutral-800 px-4 py-1.5 text-base text-white">
            Sign out
          </button>
        </SignOutButton>
      </div>
      <div className="mt-2 pt-2">
        {posts === undefined ? (
          <p className="text-center text-sm text-neutral-500">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">No posts yet.</p>
        ) : (
          <ul>
            {posts.map((p) => (
              <PostItem
                key={p._id}
                id={p._id}
                author={me?.username ?? "you"}
                authorDisplay={
                  me?.displayName ?? me?.username ?? "you"
                }
                avatarUrl={me?.avatarUrl}
                knot={p.knot}
                text={p.text}
                time={p._creationTime}
                likeCount={p.likeCount}
                likedByMe={p.likedByMe}
                commentCount={p.commentCount}
                canEdit
                imageUrls={p.imageUrls}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <main className="mx-auto max-w-2xl px-3">
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
            <ProfileDetails />
          </SignedIn>
        </>
      )}
    </main>
  );
}
