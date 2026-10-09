import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUIStore } from "../../store";
import { PostItem } from "../components/Posts/PostItem";

const convexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL);
const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function Feed({ myId }: { myId?: string }) {
  const feed = useQuery(api.posts.feed);
  const searchQuery = useUIStore((s) => s.searchQuery);

  if (feed === undefined) {
    return <p className="mt-6 text-sm text-neutral-500">Loading...</p>;
  }

  const q = searchQuery.trim().toLowerCase();
  const visible = q
    ? feed.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          p.knot.toLowerCase().includes(q),
      )
    : feed;

  if (visible.length === 0) {
    return <p className="mt-6 text-sm text-neutral-500">Nothing here yet.</p>;
  }

  return (
    <ul className="mt-2">
      {visible.map((p) => (
        <PostItem
          key={p._id}
          id={p._id}
          author={p.author}
          authorDisplay={p.authorDisplay}
          avatarUrl={p.authorAvatar}
          knot={p.knot}
          text={p.text}
          time={p._creationTime}
          likeCount={p.likeCount}
          likedByMe={p.likedByMe}
          commentCount={p.commentCount}
          canEdit={myId !== undefined && p.authorId === myId}
          imageUrls={p.imageUrls}
        />
      ))}
    </ul>
  );
}

function AuthedFeed() {
  const { user } = useUser();
  return <Feed myId={user?.id} />;
}

export function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-3">
      {!clerkConfigured && (
        <p className="mt-2 text-sm text-neutral-500">
          Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to sign in.
        </p>
      )}
      {clerkConfigured && (
        <SignedOut>
          <Link
            to="/signin"
            className="mt-2 inline-block text-sm text-white underline"
          >
            Sign in
          </Link>
        </SignedOut>
      )}
      {!convexConfigured ? (
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-neutral-300">
          <li>
            Run <code className="text-white">bunx convex dev</code> to link a
            project.
          </li>
          <li>
            Copy <code className="text-white">.env.example</code> to{" "}
            <code className="text-white">.env.local</code> with your{" "}
            <code className="text-white">VITE_CONVEX_URL</code>.
          </li>
          <li>
            Run <code className="text-white">bun run dev</code>.
          </li>
        </ol>
      ) : !clerkConfigured ? (
        <Feed />
      ) : (
        <SignedIn>
          <AuthedFeed />
        </SignedIn>
      )}
    </main>
  );
}
