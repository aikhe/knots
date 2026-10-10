import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { RopeMeter } from "../components/Knots/RopeMeter";

const PICKS = [
  { id: "fitness", label: "Fitness", shrunk: "walk 20 minutes, 3 times a week" },
  { id: "creative", label: "Creative", shrunk: "sketch 15 minutes daily" },
  { id: "study", label: "Study", shrunk: "read 10 pages every night" },
  { id: "family", label: "Call family", shrunk: "call home every Sunday" },
  { id: "selfcare", label: "Self-care", shrunk: "lights out by 11pm nightly" },
  { id: "custom", label: "Custom", shrunk: "" },
];

function Meet({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <img src="/knots%20onboard.svg" alt="Knots" className="h-36 w-auto" />
        <p className="mt-4 text-base text-white">
          Stop sending TikToks. Start doing things.
        </p>
      </div>
      <button
        onClick={onNext}
        className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black"
      >
        Get started
      </button>
    </div>
  );
}

function Pick({
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
  const chosen = PICKS.find((p) => p.id === pick);
  const shrunk =
    pick === "custom" ? custom.trim() : (chosen?.shrunk ?? "");
  const bub = "/bubs/Group%2064.svg";
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
        Tie it
      </button>
    </div>
  );
}

function Tie({
  title,
  onDone,
}: {
  title: string;
  onDone: (knotId: string, withFriend: boolean) => void;
}) {
  const createKnot = useMutation(api.knots.create);
  const [mode, setMode] = useState<"solo" | "tied">("solo");
  const [memberQuery, setMemberQuery] = useState("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bub = "/bubs/Group%2066.svg";
  const results = useQuery(
    api.users.search,
    memberQuery.trim() ? { prefix: memberQuery } : "skip",
  );

  async function tie() {
    setError(null);
    try {
      const knotId = await createKnot({
        title,
        kind: mode === "solo" ? "solo" : "tied",
        joinable: false,
        memberUserIds: memberId ? [memberId] : [],
      });
      onDone(knotId, mode === "tied");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not tie it.");
    }
  }

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
              onClick={() => {
                setMemberId(u.userId);
                setMemberName(u.displayName);
                setMemberQuery("");
              }}
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

function Share({
  knotId,
  title,
  onNext,
}: {
  knotId: string;
  title: string;
  onNext: () => void;
}) {
  const knot = useQuery(api.knots.get, {
    knotId: knotId as Id<"knots">,
  });
  const [shared, setShared] = useState(false);
  const bub = "/bubs/Group%2067.svg";
  const message = `I tied a knot with you. Tie yours? ${window.location.origin}/join/${knot?.inviteToken ?? ""}`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
      } else {
        await navigator.clipboard.writeText(message);
      }
    } catch {
      /* dismissed */
    } finally {
      setShared(true);
    }
  }

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <img src={bub} alt="" className="h-24 w-auto self-start" />
      <h1 className="mt-4 text-2xl text-white">Tied: {title}</h1>
      <p className="mt-2 rounded-2xl bg-neutral-900 px-3 py-2 text-base text-neutral-200">
        {message}
      </p>
      <button
        onClick={share}
        className="mt-auto w-full rounded-full bg-white px-3 py-2 text-base text-black"
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

function FirstCheckin({
  knotId,
  onNext,
}: {
  knotId: string;
  onNext: () => void;
}) {
  const knot = useQuery(api.knots.get, {
    knotId: knotId as Id<"knots">,
  });
  const checkin = useMutation(api.checkins.checkin);
  const [done, setDone] = useState(false);
  const bub = "/bubs/Group%2068.svg";

  async function tap() {
    await checkin({ knotId: knotId as Id<"knots">, kind: "tap" });
    setDone(true);
  }

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

function NotifySample({ onDone }: { onDone: () => void }) {
  const [on, setOn] = useState(false);
  const bub = "/bubs/Group%2069.svg";
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

const MASCOTS = [
  { id: "bubs", art: "/bubs/Group.svg" },
  { id: "tali", art: "/bubs/Group%2064.svg" },
  { id: "buhol", art: "/bubs/Group%2066.svg" },
  { id: "hibla", art: "/bubs/Group%2067.svg" },
  { id: "nudo", art: "/bubs/Group%2068.svg" },
  { id: "kord", art: "/bubs/Group%2069.svg" },
  { id: "loop", art: "/bubs/Group.svg" },
];

function PickBub({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const setMascot = useMutation(api.users.setMascot);
  const [name, setName] = useState("bubs");

  async function save() {
    await setMascot({ mascot: name }).catch(() => {});
    onDone();
    navigate("/home");
  }

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
    </div>
  );
}

function Flow() {
  const navigate = useNavigate();
  const knots = useQuery(api.knots.mine);
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState("fitness");
  const [custom, setCustom] = useState("");
  const [knotId, setKnotId] = useState<string | null>(null);
  const [withFriend, setWithFriend] = useState(false);

  if (step === 0 && knots !== undefined && knots.length > 0) {
    return <Navigate to="/home" replace />;
  }

  const chosen = PICKS.find((p) => p.id === pick);
  const title =
    pick === "custom" ? custom.trim() : (chosen?.shrunk ?? "");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-3 pb-6 pt-6 sm:min-h-0 sm:h-full">
      <div className="flex items-center gap-1">
        <button
          onClick={() => (step === 0 ? navigate("/home") : setStep(step - 1))}
          aria-label="Back"
          className="text-neutral-500 hover:text-white"
        >
          <img
            src="/MajesticonsChevronLeft.svg"
            alt=""
            className="h-6 w-6 invert"
          />
        </button>
        <div className="flex flex-1 gap-1 px-2">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${i <= step ? "bg-white" : "bg-neutral-800"}`}
            />
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
      {step === 0 && <Meet onNext={() => setStep(1)} />}
      {step === 1 && (
        <Pick
          pick={pick}
          setPick={setPick}
          custom={custom}
          setCustom={setCustom}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Tie
          title={title}
          onDone={(id, friend) => {
            setKnotId(id);
            setWithFriend(friend);
            setStep(3);
          }}
        />
      )}
      {step === 3 &&
        (knotId && withFriend ? (
          <Share knotId={knotId} title={title} onNext={() => setStep(4)} />
        ) : (
          <FirstCheckin knotId={knotId ?? ""} onNext={() => setStep(5)} />
        ))}
      {step === 4 && (
        <FirstCheckin knotId={knotId ?? ""} onNext={() => setStep(5)} />
      )}
      {step === 5 && <NotifySample onDone={() => setStep(6)} />}
      {step === 6 && <PickBub onDone={() => navigate("/home")} />}
      </div>
    </main>
  );
}

export function OnboardingPage() {
  return (
    <>
      <SignedOut>
        <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-3 pb-6 pt-6 sm:min-h-0 sm:h-full">
          <Meet onNext={() => {}} />
          <Link
            to="/signin"
            className="mt-4 block rounded-full bg-white px-3 py-1.5 text-center text-base text-black"
          >
            Sign in to continue
          </Link>
        </main>
      </SignedOut>
      <SignedIn>
        <Flow />
      </SignedIn>
    </>
  );
}
