import { PICKS } from "./constants";
import { shrunkFor } from "./useOnboarding";

export function Pick({
  pick,
  setPick,
  custom,
  setCustom,
  onNext,
}: {
  pick: string;
  setPick: (v: string) => void;
  custom: string;
  setCustom: (v: string) => void;
  onNext: () => void;
}) {
  const shrunk = shrunkFor(pick, custom);
  const bub = "/bubs/tali.svg";
  return (
    <div className="mt-8 flex flex-1 flex-col">
      <img src={bub} alt="" className="h-24 w-auto self-start" />
      <h1 className="mt-4 text-2xl text-white">Pick what to lock in</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {PICKS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPick(p.id)}
            className={`rounded-full px-4 py-1.5 text-base ${
              pick === p.id
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-500"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {pick === "custom" && (
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Something small and specific"
          className="mt-3 w-full bg-transparent py-2 text-base text-white outline-none"
        />
      )}
      <button
        onClick={onNext}
        disabled={!shrunk}
        className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
