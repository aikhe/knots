import { useShare } from "./useOnboarding";

export function Share({
  knotId,
  title,
  onNext,
}: {
  knotId: string;
  title: string;
  onNext: () => void;
}) {
  const { message, shared, share } = useShare(knotId);
  const bub = "/bubs/hibla.svg";

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <img src={bub} alt="" className="h-24 w-auto self-start" />
      <h1 className="mt-4 text-2xl text-white">Tied: {title}</h1>
      {message && (
        <p className="mt-2 rounded-2xl bg-neutral-900 px-3 py-2 text-base text-neutral-200">
          {message}
        </p>
      )}
      <button
        onClick={share}
        disabled={!message}
        className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black disabled:opacity-40"
      >
        {shared ? "Shared" : "Share invite"}
      </button>
      <button
        onClick={onNext}
        className="mt-2 w-full py-1.5 text-center text-base text-neutral-500"
      >
        {shared ? "Continue" : "Skip"}
      </button>
    </div>
  );
}
