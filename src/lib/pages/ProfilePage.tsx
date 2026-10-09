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
  const friends = useQuery(api.friends.list);
  const name = me?.displayName ?? me?.username ?? "you";

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        {me?.avatarUrl ? (
          <img
            src={me.avatarUrl}
            alt={name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-sm text-white">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm text-white">{name}</p>
          <p className="text-sm text-neutral-500">{me?.username}</p>
          <p className="text-sm text-neutral-500">
            {posts === undefined || knots === undefined
              ? "Loading data..."
              : `${knots.length} knots, ${posts.length} posts`}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <Link to="/profile/edit" className="text-sm text-white underline">
          Edit
        </Link>
        <SignOutButton>
          <button className="text-sm text-neutral-500 hover:text-white">
            Sign out
          </button>
        </SignOutButton>
      </div>
      <div className="mt-4">
        <p className="text-sm text-neutral-500">
          {friends === undefined
            ? "Loading friends..."
            : `${friends.length} ${friends.length === 1 ? "friend" : "friends"}`}
        </p>
        {(friends ?? []).length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-2">
            {friends?.map((f) => (
              <li key={f.userId}>
                <Link
                  to={`/user/${f.username}`}
                  className="text-sm text-neutral-300 underline"
                >
                  {f.username}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 border-t border-neutral-800 pt-2">
        {posts === undefined ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-neutral-500">No posts yet.</p>
        ) : (
          <ul>
            {posts.map((p) => (
              <PostItem
                key={p._id}
                id={p._id}
                author={me?.username ?? "you"}
                avatarUrl={me?.avatarUrl}
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

export function ProfilePage() {
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
            <ProfileDetails />
          </SignedIn>
        </>
      )}
    </main>
  );
}
