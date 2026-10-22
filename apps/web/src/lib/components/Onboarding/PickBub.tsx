import { MASCOTS } from "./constants";
import { usePickBub } from "./useOnboarding";

export function PickBub({ onDone }: { onDone: () => void }) {
  const { name, setName, error, save } = usePickBub(onDone);

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <h1 className="text-2xl text-white">Pick your bub</h1>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {MASCOTS.map((m) => (
          <button
            key={m.id}
            onClick={() => setName(m.id)}
            className={`flex flex-col items-center rounded-2xl px-4 py-3 text-base capitalize ${
              name === m.id
                ? "bg-neutral-800 text-white"
                : "bg-neutral-900 text-neutral-500"
            }`}
          >
            <img src={m.art} alt="" className="h-16 w-auto" />
            <span className="mt-1">{m.id}</span>
          </button>
        ))}
      </div>
      <button
        onClick={save}
        className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black"
      >
        Enter Knots
      </button>
      {error && <p className="mt-2 text-sm text-neutral-500">{error}</p>}
    </div>
  );
}
