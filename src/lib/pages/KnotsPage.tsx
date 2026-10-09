import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { timeAgo } from "../utils/time";
import { useLocalAI } from "../ai/useLocalAI";

type Tab = "mine" | "joinable";

function SmartRanker({
  query,
  tab,
  onResult,
  onStatus,
}: {
  query: string;
  tab: Tab;
  onResult: (ids: string[] | null, scores: Record<string, number>) => void;
  onStatus: (s: string | null) => void;
}) {
  const mine = useQuery(api.knots.mine);
  const browse = useQuery(api.knots.browse);
  const { isReady, isModelLoading, loadingProgress, searchBlueprints } =
    useLocalAI();

  useEffect(() => {
    const list = (tab === "mine" ? mine : browse) ?? [];
    if (!query.trim() || list.length === 0) {
      onResult(null, {});
      onStatus(null);
      return;
    }
    if (!isReady) {
      onStatus(
        isModelLoading ? `loading models ${loadingProgress}%` : "starting",
      );
      return;
    }
    onStatus("smart");
    let live = true;
    searchBlueprints(
      query,
      list.map((k) => ({
        id: k._id,
        title: k.title,
        text: `${k.title} ${k.kind} knot ${k.lastNote ?? ""} ${k.lastText ?? ""}`,
      })),
    )
      .then((ranked) => {
        if (!live) return;
        const scores: Record<string, number> = {};
        for (const r of ranked) scores[r.id] = r.score;
        onResult(
          ranked.filter((r) => r.score >= 0.25).map((r) => r.id),
          scores,
        );
      })
      .catch(() => {
        if (live) {
          onResult(null, {});
          onStatus("search failed");
        }
      });
    return () => {
      live = false;
    };
  }, [
    query,
    tab,
    mine,
    browse,
    isReady,
    isModelLoading,
    loadingProgress,
    searchBlueprints,
    onResult,
    onStatus,
  ]);

  return null;
}

function Row({
  id,
  title,
  meta,
  preview,
}: {
  id: string;
  title: string;
  meta: string;
  preview: string;
}) {
  return (
    <li>
      <Link to={`/knot/${id}`} className="flex items-center gap-3 py-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-base text-white">
          {title.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white">{title}</p>
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
  const [smart, setSmart] = useState(false);
  const [rankedIds, setRankedIds] = useState<string[] | null>(null);
  const [rankedScores, setRankedScores] = useState<Record<string, number>>({});
  const [smartStatus, setSmartStatus] = useState<string | null>(null);
  const handleRankResult = useCallback(
    (ids: string[] | null, scores: Record<string, number>) => {
      setRankedIds(ids);
      setRankedScores(scores);
    },
    [],
  );

  const list = (tab === "mine" ? mine : browse) ?? [];
  const query = q.trim().toLowerCase();
  const smartActive = smart && query !== "" && rankedIds !== null;
  const textFiltered = query
    ? list.filter((k) => k.title.toLowerCase().includes(query))
    : list;
  const visible = smartActive
    ? (rankedIds ?? [])
        .map((id) => list.find((k) => k._id === id))
        .filter((k) => k !== undefined)
    : textFiltered;

  return (
    <main className="mx-auto max-w-2xl px-3 py-6">
      <h1 className="text-2xl font-medium text-white">Knots</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="mt-4 w-full rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white"
      />
      <div className="mt-3 flex items-center gap-2">
        {(["mine", "joinable"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize ${
              tab === t
                ? "border-neutral-500 text-white"
                : "border-neutral-800 text-neutral-500"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => {
            setSmart((v) => !v);
            setRankedIds(null);
            setSmartStatus(null);
          }}
          className={`rounded-full border px-4 py-1.5 text-sm ${
            smart
              ? "border-neutral-500 text-white"
              : "border-neutral-800 text-neutral-500"
          }`}
        >
          Smart
        </button>
        {smartStatus && (
          <span className="text-xs text-neutral-500">{smartStatus}</span>
        )}
      </div>
      {smart && (
        <SmartRanker
          query={q}
          tab={tab}
          onResult={handleRankResult}
          onStatus={setSmartStatus}
        />
      )}
      {list === undefined ? (
        <p className="mt-4 text-sm text-neutral-500">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          {smart && query
            ? (rankedIds
              ? "Nothing matches."
              : (smartStatus ?? "Ranking..."))
            : tab === "mine"
              ? "No knots yet. Tap + to make one."
              : "Nothing to join."}
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
                smartActive && rankedScores[k._id] !== undefined
                  ? `${rankedScores[k._id]?.toFixed(3)} · ${k.lastText
                    ? `${k.lastAuthor}: ${k.lastText}`
                    : `${k.memberCount} ${k.memberCount === 1 ? "member" : "members"}`}`
                  : k.lastText
                    ? `${k.lastAuthor}: ${k.lastText}`
                    : `${k.memberCount} ${k.memberCount === 1 ? "member" : "members"}`
              }
            />
          ))}
        </ul>
      )}
    </main>
  );
}
