import { useState, type RefObject } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export type KnotKind = "solo" | "tied" | "squad";

export function KnotFields({
  title,
  setTitle,
  kind,
  setKind,
  memberIds,
  setMemberIds,
  autoFocusTitle,
  titleRef,
}: {
  title: string;
  setTitle: (v: string) => void;
  kind: KnotKind;
  setKind: (v: KnotKind) => void;
  memberIds: { userId: string; username: string; displayName: string }[];
  setMemberIds: (
    v: { userId: string; username: string; displayName: string }[],
  ) => void;
  autoFocusTitle?: boolean;
  titleRef?: RefObject<HTMLInputElement | null>;
}) {
  const [memberQuery, setMemberQuery] = useState("");
  const searchResults = useQuery(
    api.users.search,
    memberQuery.trim() ? { prefix: memberQuery } : "skip",
  );
  const cap = kind === "solo" ? 0 : kind === "tied" ? 1 : 4;

  return (
    <>
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Knot title"
        autoFocus={autoFocusTitle}
        className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
      />
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as KnotKind)}
        className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
      >
        <option value="solo">Solo, just you</option>
        <option value="tied">Tied, 1-on-1</option>
        <option value="squad">Squad, up to 5</option>
      </select>
      {cap > 0 && (
        <>
          <input
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            placeholder="Add member by username"
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
          />
          {(searchResults ?? []).map((u) => (
            <button
              key={u.userId}
              type="button"
              disabled={memberIds.length >= cap}
              onClick={() =>
                setMemberIds(
                  memberIds.some((i) => i.userId === u.userId)
                    ? memberIds
                    : [...memberIds, u],
                )
              }
              className="mr-2 text-sm text-neutral-300 underline disabled:opacity-40"
            >
              {u.username}
            </button>
          ))}
          {memberIds.length > 0 && (
            <p className="text-sm text-neutral-400">
              {memberIds.map((m) => m.displayName).join(", ")}
            </p>
          )}
        </>
      )}
    </>
  );
}
