import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { PostImages } from "./PostImages";
import { timeAgo } from "../../utils/time";

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
            <p className="text-base leading-tight">
              <Link to={`/user/${author}`} className="text-white">
                {authorDisplay}
              </Link>{" "}
              <span className="text-neutral-500">{timeAgo(time)}</span>
            </p>
            {canEdit && (
              <Link
                to={`/post/${id}/edit`}
                aria-label="Edit"
                className="group shrink-0"
              >
                <img
                  src="/MajesticonsDotsHorizontal.svg"
                  alt=""
                  className="h-5 w-5 invert opacity-40 group-hover:opacity-100"
                />
              </Link>
            )}
          </div>
          <p className="text-sm text-neutral-500">
            in <span className="text-neutral-300">{knot}</span>
          </p>
          <Link to={`/post/${id}`} className="mt-1 block text-base leading-snug text-white">
            {text}
          </Link>
        </div>
      </div>
      <PostImages urls={imageUrls} />
      <div className="mt-2 flex items-center gap-5 pl-12 text-neutral-500">
        <button
          onClick={() => toggleLike({ postId: id as Id<"posts"> })}
          aria-label="Like"
          className={`group flex items-center gap-1.5 ${likedByMe ? "text-white" : "hover:text-white"}`}
        >
          <img
            src="/MynauiHeart.svg"
            alt=""
            className={`h-5 w-5 invert ${likedByMe ? "hidden" : "opacity-40 group-hover:hidden"}`}
          />
          <img
            src="/MynauiHeartSolid.svg"
            alt=""
            className={`h-5 w-5 invert ${likedByMe ? "" : "hidden group-hover:block"}`}
          />
          {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
        </button>
        <Link
          to={`/post/${id}`}
          aria-label="Comments"
          className="group flex items-center gap-1.5 hover:text-white"
        >
          <img
            src="/MynauiChat.svg"
            alt=""
            className="h-5 w-5 invert opacity-40 group-hover:hidden"
          />
          <img
            src="/MynauiChatSolid.svg"
            alt=""
            className="hidden h-5 w-5 invert group-hover:block"
          />
          {commentCount > 0 && (
            <span className="text-xs">{commentCount}</span>
          )}
        </Link>
        <button
          onClick={share}
          aria-label="Share"
          className="group text-xs text-neutral-500 hover:text-white"
        >
          {copied ? (
            "Copied"
          ) : (
            <img
              src="/MynauiPaperclipSolid.svg"
              alt=""
              className="h-5 w-5 invert opacity-40 group-hover:opacity-100"
            />
          )}
        </button>
      </div>
    </li>
  );
}
