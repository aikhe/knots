import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PostItem } from "../components/Posts/PostItem";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function PostDetails({ postId }: { postId: string }) {
  const post = useQuery(api.posts.get, {
    postId: postId as Id<"posts">,
  });
  const joinKnot = useMutation(api.knots.join);

  if (post === undefined) {
    return <p className="mt-6 text-sm text-neutral-500">Loading...</p>;
  }
  if (post === null) {
    return <p className="mt-6 text-sm text-neutral-500">Not found.</p>;
  }

  return (
    <div className="mt-6">
      <ul>
        <PostItem
          id={post._id}
          author={post.author}
          knot={post.knot}
          text={post.text}
          time={post._creationTime}
          likeCount={post.likeCount}
          likedByMe={post.likedByMe}
        />
      </ul>
      {post.knotJoinable && !post.isMember && (
        <button
          onClick={() => joinKnot({ knotId: post.knotId })}
          className="mt-4 text-sm text-white underline"
        >
          Join this knot
        </button>
      )}
    </div>
  );
}

export function PostPage() {
  const { postId = "" } = useParams();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {!clerkConfigured ? (
        <p className="mt-2 text-sm text-neutral-500">
          Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to sign in.
        </p>
      ) : (
        <>
          <SignedOut>
            <Link
              to="/signin"
              className="mt-2 inline-block text-sm text-white underline"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <PostDetails postId={postId} />
          </SignedIn>
        </>
      )}
    </main>
  );
}
