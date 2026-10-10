import { useEffect, useState } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUIStore } from "../../store";
import { PostItem } from "../components/Posts/PostItem";
import { useLocalAI } from "../ai/useLocalAI";

const convexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL);
const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function Feed({ myId }: { myId?: string }) {
  const feed = useQuery(api.posts.feed);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const [rankedIds, setRankedIds] = useState<string[] | null>(null);

  if (feed === undefined) {
    return <p className="mt-6 text-sm text-neutral-500">Loading...</p>;
  }

  const q = searchQuery.trim().toLowerCase();
  const smartActive = q !== "" && rankedIds !== null;
  const visible = smartActive
    ? (rankedIds ?? [])
        .map((id) => feed.find((p) => p._id === id))
        .filter((p) => p !== undefined)
    : q
      ? feed.filter(
          (p) =>
            p.text.toLowerCase().includes(q) ||
            p.knot.toLowerCase().includes(q),
        )
      : feed;

  if (visible.length === 0) {
    return (
      <p className="mt-6 text-sm text-neutral-500">
        {smartActive ? "Nothing matches." : "Nothing here yet."}
      </p>
    );
  }

  return (
    <>
      {q !== "" && (
        <SmartFeedRank query={searchQuery} onResult={setRankedIds} />
      )}
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
    </>
  );
}

function SmartFeedRank({
  query,
  onResult,
}: {
  query: string;
  onResult: (ids: string[] | null) => void;
}) {
  const feed = useQuery(api.posts.feed);
  const { isReady, searchBlueprints } = useLocalAI();

  useEffect(() => {
    const list = feed ?? [];
    if (!query.trim() || list.length === 0) {
      onResult(null);
      return;
    }
    if (!isReady) return;
    let live = true;
    searchBlueprints(
      query,
      list.map((p) => ({
        id: p._id,
        title: p.knot,
        text: `${p.text} ${p.knot}`,
      })),
    )
      .then((ranked) => {
        if (live) {
          onResult(ranked.filter((r) => r.score >= 0.25).map((r) => r.id));
        }
      })
      .catch(() => {
        if (live) onResult(null);
      });
    return () => {
      live = false;
    };
  }, [query, feed, isReady, searchBlueprints, onResult]);

  return null;
}

function AuthedFeed() {
  const { user } = useUser();
  return <Feed myId={user?.id} />;
}

function StartCard() {
  const knots = useQuery(api.knots.mine);
  if (knots === undefined || knots.length > 0) return null;
  return (
    <Link
      to="/welcome"
      className="mt-6 block rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
    >
      <p className="text-sm font-medium text-white">New here?</p>
      <p className="mt-1 text-sm text-neutral-400">
        Tie your first knot in under a minute.
      </p>
    </Link>
  );
}

export function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-6">
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
          <StartCard />
          <AuthedFeed />
        </SignedIn>
      )}
    </main>
  );
}
