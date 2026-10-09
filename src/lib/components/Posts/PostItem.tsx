import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { PostImages } from "./PostImages";
import { timeAgo } from "../../utils/time";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M10 16.5C5.5 13.5 3 10.8 3 7.8 3 5.6 4.7 4 6.8 4c1.2 0 2.4.7 3.2 1.8C10.8 4.7 12 4 13.2 4 15.3 4 17 5.6 17 7.8c0 3-2.5 5.7-7 8.7z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3.5c-3.9 0-7 2.6-7 5.8 0 1.9 1.1 3.5 2.8 4.5l-.8 2.7 3-1.6c.6.2 1.3.2 2 .2 3.9 0 7-2.6 7-5.8S13.9 3.5 10 3.5z" strokeLinejoin="round" />
    </svg>
  );
}

export function PostItem({
  id,
  author,
  authorDisplay,
  avatarUrl,
  knot,
  text,
  time,
  likeCount,
  likedByMe,
  commentCount,
  canEdit,
  imageUrls,
}: {
  id: string;
  author: string;
  authorDisplay: string;
  avatarUrl?: string | null;
  knot: string;
  text: string;
  time: number;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  canEdit?: boolean;
  imageUrls: string[];
}) {
  const toggleLike = useMutation(api.posts.toggleLike);
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${id}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li className="-mx-3 border-b border-neutral-800 px-3 py-3">
      <div className="flex gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={authorDisplay}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm text-white">
            {authorDisplay.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm">
              <Link to={`/user/${author}`} className="text-white">
                {authorDisplay}
              </Link>{" "}
              <span className="text-neutral-500">{timeAgo(time)}</span>
            </p>
            {canEdit && (
              <Link
                to={`/post/${id}/edit`}
                className="shrink-0 text-xs text-neutral-500 underline"
              >
                Edit
              </Link>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            in <span className="text-neutral-300">{knot}</span>
          </p>
          <Link to={`/post/${id}`} className="mt-1 block text-sm text-neutral-200">
            {text}
          </Link>
        </div>
      </div>
      <PostImages urls={imageUrls} />
      <div className="mt-2 flex items-center gap-5 pl-12 text-neutral-500">
        <button
          onClick={() => toggleLike({ postId: id as Id<"posts"> })}
          aria-label="Like"
          className={`flex items-center gap-1.5 ${likedByMe ? "text-white" : "hover:text-white"}`}
        >
          <HeartIcon filled={likedByMe} />
          {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
        </button>
        <Link
          to={`/post/${id}`}
          aria-label="Comments"
          className="flex items-center gap-1.5 hover:text-white"
        >
          <CommentIcon />
          {commentCount > 0 && (
            <span className="text-xs">{commentCount}</span>
          )}
        </Link>
        <button
          onClick={share}
          aria-label="Share"
          className="ml-auto text-xs text-neutral-500 hover:text-white"
        >
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </li>
  );
}
