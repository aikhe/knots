import { useTie } from "./useOnboarding";

export function Tie({
  title,
  onDone,
}: {
  title: string;
  onDone: (knotId: string, withFriend: boolean) => void;
}) {
  const {
    mode,
    setMode,
    memberQuery,
    setMemberQuery,
    memberId,
    memberName,
    selectMember,
    error,
    results,
    tie,
  } = useTie(title, onDone);
  const bub = "/bubs/buhol.svg";

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <img src={bub} alt="" className="h-24 w-auto self-start" />
      <h1 className="mt-4 text-2xl text-white">Tie your knot</h1>
      <p className="mt-1 text-base text-neutral-500">{title}</p>
      <div className="mt-4 flex gap-2">
        {(["solo", "tied"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 text-base capitalize ${
              mode === m
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-500"
            }`}
          >
            {m === "solo" ? "Solo" : "With a friend"}
          </button>
        ))}
      </div>
      {mode === "tied" && (
        <div className="mt-3">
          <input
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            placeholder="Friend's username"
            className="w-full bg-transparent py-2 text-base text-white outline-none"
          />
          {(results ?? []).map((u) => (
            <button
              key={u.userId}
              type="button"
              onClick={() => selectMember(u.userId, u.displayName)}
              className="mr-2 mt-1 text-base text-neutral-300"
            >
              {u.displayName} (@{u.username})
            </button>
          ))}
          {memberName && (
            <p className="mt-1 text-base text-neutral-500">
              With {memberName}
            </p>
          )}
        </div>
      )}
      <button
        onClick={tie}
        disabled={mode === "tied" && !memberId}
        className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black disabled:opacity-40"
      >
        Tie it
      </button>
      {error && <p className="mt-2 text-sm text-neutral-500">{error}</p>}
    </div>
  );
}
