import { useState, type RefObject } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { KNOT_BACKGROUNDS } from "../../utils/knotBackgrounds";
import { STARTER_BLUEPRINTS } from "../../ai/models";

export type KnotKind = "solo" | "tied" | "squad";

export function KnotFields({
  title,
  setTitle,
  kind,
  setKind,
  background,
  setBackground,
  memberIds,
  setMemberIds,
  autoFocusTitle,
  titleRef,
}: {
  title: string;
  setTitle: (v: string) => void;
  kind: KnotKind;
  setKind: (v: KnotKind) => void;
  background: string | undefined;
  setBackground: (v: string | undefined) => void;
  memberIds: { userId: string; username: string; displayName: string }[];
  setMemberIds: (
    v: { userId: string; username: string; displayName: string }[],
  ) => void;
  autoFocusTitle?: boolean;
  titleRef?: RefObject<HTMLInputElement | null>;
}) {
  const [memberQuery, setMemberQuery] = useState("");
  const [kindListOpen, setKindListOpen] = useState(false);
  const kindLabels: Record<KnotKind, string> = {
    solo: "Solo, just you",
    tied: "Tied, 1-on-1",
    squad: "Squad, up to 5",
  };
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
        className="w-full bg-transparent py-2 text-base text-white outline-none"
      />
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setKindListOpen((v) => !v)}
          aria-expanded={kindListOpen}
          className="flex w-full items-center justify-between gap-2 rounded-full bg-neutral-800 py-2 pl-4 pr-4 text-base text-white"
        >
          <span className="truncate">{kindLabels[kind]}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
            className={`shrink-0 text-neutral-500 transition-transform ${kindListOpen ? "rotate-180" : ""}`}
          >
            <path
              d="M6 9l6 6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {kindListOpen && (
          <ul className="absolute inset-x-0 top-full z-10 mt-1 rounded-2xl bg-neutral-900 p-1">
            {(Object.keys(kindLabels) as KnotKind[]).map((k) => (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => {
                    setKind(k);
                    setKindListOpen(false);
                  }}
                  className={`w-full truncate rounded-xl px-3 py-2 text-left text-sm ${k === kind ? "bg-neutral-800 text-white" : "text-neutral-400"}`}
                >
                  {kindLabels[k]}
                </button>
              </li>
            ))}
          </ul>
        )}
      <div className="flex flex-wrap gap-2">
        {STARTER_BLUEPRINTS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setTitle(b.title)}
            className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400"
          >
            {b.title}
          </button>
        ))}
      </div>
      {cap > 0 && (
        <>
          <input
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            placeholder="Add member by username"
            className="w-full bg-transparent py-2 text-base text-white outline-none"
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
              className="mr-2 text-sm text-neutral-300 disabled:opacity-40"
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
      <div className="flex gap-2">
        {KNOT_BACKGROUNDS.map((src) => (
          <button
            key={src}
            type="button"
            onClick={() =>
              setBackground(background === src ? undefined : src)
            }
            aria-label="Knot background"
            className={`h-12 w-12 overflow-hidden rounded-full ${background === src ? "ring-2 ring-white" : ""}`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </>
  );
}
