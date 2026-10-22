import { RopeMeter } from "../Knots/RopeMeter";
import { useFirstCheckin } from "./useOnboarding";

export function FirstCheckin({
  knotId,
  onNext,
}: {
  knotId: string;
  onNext: () => void;
}) {
  const { knot, done, tap } = useFirstCheckin(knotId);
  const bub = "/bubs/nudo.svg";

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <img src={bub} alt="" className="h-24 w-auto self-start" />
      <h1 className="mt-4 text-2xl text-white">First check-in</h1>
      {knot && (
        <div className="mt-3">
          <RopeMeter rope={knot.rope} />
        </div>
      )}
      {!done ? (
        <button
          onClick={tap}
          className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black"
        >
          One tap
        </button>
      ) : (
        <>
          <p className="mt-4 rounded-2xl bg-neutral-900 px-3 py-2 text-base text-neutral-200">
            If things go quiet, I'll nudge, not scold.
          </p>
          <button
            onClick={onNext}
            className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black"
          >
            Continue
          </button>
        </>
      )}
    </div>
  );
}
