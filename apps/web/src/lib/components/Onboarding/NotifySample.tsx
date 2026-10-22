import { useState } from "react";

export function NotifySample({ onDone }: { onDone: () => void }) {
  const [on, setOn] = useState(false);
  const bub = "/bubs/kord.svg";
  return (
    <div className="mt-8 flex flex-1 flex-col">
      <img src={bub} alt="" className="h-24 w-auto self-start" />
      <h1 className="mt-4 text-2xl text-white">Stay in the loop</h1>
      <p className="mt-2 text-base text-neutral-500">
        Bubs nudges you when a knot goes slack, so nothing silently frays.
      </p>
      <button
        onClick={() => setOn(true)}
        disabled={on}
        className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black disabled:opacity-40"
      >
        {on ? "Nudges on" : "Enable nudges"}
      </button>
      {on && (
        <button
          onClick={onDone}
          className="mt-2 w-full rounded-full bg-white px-3 py-2 text-center text-base text-black"
        >
          Continue
        </button>
      )}
    </div>
  );
}
