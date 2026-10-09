import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PostItem } from "../components/Posts/PostItem";
import { timeAgo } from "../utils/time";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function PostDetails({ postId }: { postId: string }) {
  const post = useQuery(api.posts.get, {
    postId: postId as Id<"posts">,
  });
  const joinKnot = useMutation(api.knots.join);
  const comments = useQuery(api.comments.list, {
    postId: postId as Id<"posts">,
  });
  const addComment = useMutation(api.comments.create);
  const removeComment = useMutation(api.comments.remove);
  const generateCommentUrl = useMutation(api.posts.generateUploadUrl);
  const [draft, setDraft] = useState("");
  const [commentPhoto, setCommentPhoto] = useState<File | null>(null);
  const { user } = useUser();

  if (post === undefined) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (post === null) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Not found.</p>;
  }

  return (
    <div>
      <div className="flex justify-end">
        {post.authorId === user?.id && (
          <Link
            to={`/post/${post._id}/edit`}
            aria-label="Edit"
            className="group"
          >
            <img
              src="/MajesticonsDotsHorizontal.svg"
              alt=""
              className="h-5 w-5 invert opacity-40 group-hover:opacity-100"
            />
          </Link>
        )}
      </div>
      <ul>
        <PostItem
          id={post._id}
          author={post.author}
          authorDisplay={post.authorDisplay}
          avatarUrl={post.authorAvatar}
          knot={post.knot}
          text={post.text}
          time={post._creationTime}
          likeCount={post.likeCount}
          likedByMe={post.likedByMe}
          commentCount={post.commentCount}
          imageUrls={post.imageUrls}
        />
      </ul>
      {post.knotJoinable && !post.isMember && (
        <button
          onClick={() => joinKnot({ knotId: post.knotId })}
          className="mt-4 w-full rounded-full bg-neutral-800 px-4 py-1.5 text-base text-white"
        >
          Join this knot
        </button>
      )}
      <div className="mt-2 pt-2">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!draft.trim() && !commentPhoto) return;
            let imageStorageId: Id<"_storage"> | undefined;
            if (commentPhoto) {
              const url = await generateCommentUrl();
              const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": commentPhoto.type },
                body: commentPhoto,
              });
              const { storageId } = (await res.json()) as {
                storageId: string;
              };
              imageStorageId = storageId as Id<"_storage">;
            }
            addComment({
              postId: post._id,
              text: draft,
              imageStorageId,
            }).then(() => {
              setDraft("");
              setCommentPhoto(null);
            });
          }}
          className="flex items-center gap-1 rounded-full bg-neutral-900 py-1.5 pl-3 pr-1.5"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment"
            className="w-full bg-transparent text-sm text-white outline-none"
          />
          <label className="group flex shrink-0 cursor-pointer items-center gap-1 px-1 py-1.5 text-sm text-neutral-400">
            {commentPhoto ? (
              "1 photo"
            ) : (
              <img
                src="/MajesticonsAttachment.svg"
                alt=""
                className="h-5 w-5 invert opacity-40 group-hover:opacity-100"
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCommentPhoto(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="submit"
            aria-label="Post"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black"
          >
            <img
              src="/MajesticonsPaperAirplaneLine.svg"
              alt=""
              className="h-5 w-5"
            />
          </button>
        </form>
        <ul className="mt-4 space-y-3">
          {(comments ?? []).map((c) => (
            <li key={c._id} className="flex gap-3">
              {c.authorAvatar ? (
                <img
                  src={c.authorAvatar}
                  alt={c.authorDisplay}
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs text-white">
                  {c.authorDisplay.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <Link
                    to={`/user/${c.author}`}
                    className="text-white"
                  >
                    {c.authorDisplay}
                  </Link>{" "}
                  <span className="text-neutral-500">
                    {timeAgo(c._creationTime)}
                  </span>
                </p>
                {c.text && (
                  <p className="mt-1 text-sm text-neutral-200">{c.text}</p>
                )}
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="mt-1 max-h-48 w-full rounded-xl object-cover"
                  />
                )}
                {c.authorId === user?.id && (
                  <button
                    onClick={() => removeComment({ commentId: c._id })}
                    className="mt-1 text-xs text-neutral-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PostPage() {
  const { postId = "" } = useParams();

  return (
    <main className="mx-auto max-w-2xl px-3">
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
