import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { timeAgo } from "../utils/time";

type Tab = "mine" | "joinable";

function Row({
  id,
  title,
  meta,
  preview,
  background,
}: {
  id: string;
  title: string;
  meta: string;
  preview: string;
  background?: string | null;
}) {
  return (
    <li className="-mx-3 px-3">
      <Link to={`/knot/${id}`} className="flex items-center gap-3 py-3">
        {background ? (
          <img
            src={background}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-base text-white">
            {title.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base text-white">{title}</p>
          <p className="truncate text-sm text-neutral-500">{preview}</p>
        </div>
        <p className="shrink-0 text-xs text-neutral-600">{meta}</p>
      </Link>
    </li>
  );
}

export function KnotsPage() {
  const mine = useQuery(api.knots.mine);
  const browse = useQuery(api.knots.browse);
  const [tab, setTab] = useState<Tab>("mine");
  const [q, setQ] = useState("");

  const list = (tab === "mine" ? mine : browse) ?? [];
  const query = q.trim().toLowerCase();
  const visible = query
    ? list.filter((k) => k.title.toLowerCase().includes(query))
    : list;

  return (
    <main className="mx-auto max-w-2xl px-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="w-full rounded-full bg-neutral-900 px-4 py-2 text-sm text-white"
      />
      <div className="mt-2 flex gap-1">
        {(["mine", "joinable"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              tab === t ? "bg-neutral-800 text-white" : "text-neutral-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {list === undefined ? (
        <p className="mt-4 text-center text-sm text-neutral-500">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="mt-4 text-center text-sm text-neutral-500">
          {tab === "mine" ? "No knots yet. Tap + to make one." : "Nothing to join."}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-800">
          {visible.map((k) => (
            <Row
              key={k._id}
              id={k._id}
              title={k.title}
              meta={k.lastTime ? timeAgo(k.lastTime) : ""}
              preview={
                k.lastText
                  ? `${k.lastAuthor}: ${k.lastText}`
                  : `${k.memberCount} ${k.memberCount === 1 ? "member" : "members"}`
              }
              background={k.background ?? null}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
