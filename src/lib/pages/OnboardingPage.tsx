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
    <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
      <img src="/bub.svg" alt="Bubs" className="h-24 w-24" />
      <h1 className="mt-4 text-xl font-medium text-white">Meet Knots</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Your knot draws itself.
      </p>
      <p className="mt-1 text-sm text-white">
        Stop sending TikToks. Start doing things.
      </p>
      <button
        onClick={onNext}
        className="mt-6 rounded bg-neutral-100 px-6 py-2 text-sm text-black"
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
  return (
    <div className="mt-6">
      <h1 className="text-xl font-medium text-white">Pick what to lock in</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {PICKS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPick(p.id)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              pick === p.id
                ? "border-neutral-500 text-white"
                : "border-neutral-800 text-neutral-500"
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
          className="mt-3 w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
        />
      )}
      <button
        onClick={onNext}
        disabled={!shrunk}
        className="mt-4 w-full rounded bg-neutral-100 px-3 py-1.5 text-sm text-black disabled:opacity-40"
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
    <div className="mt-6">
      <h1 className="text-xl font-medium text-white">Tie your knot</h1>
      <p className="mt-1 text-sm text-neutral-400">{title}</p>
      <div className="mt-4 flex gap-2">
        {(["solo", "tied"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize ${
              mode === m
                ? "border-neutral-500 text-white"
                : "border-neutral-800 text-neutral-500"
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
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
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
              className="mr-2 mt-1 text-sm text-neutral-300 underline"
            >
              {u.displayName} (@{u.username})
            </button>
          ))}
          {memberName && (
            <p className="mt-1 text-sm text-neutral-400">
              With {memberName}
            </p>
          )}
        </div>
      )}
      <button
        onClick={tie}
        disabled={mode === "tied" && !memberId}
        className="mt-4 w-full rounded bg-neutral-100 px-3 py-1.5 text-sm text-black disabled:opacity-40"
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
    <div className="mt-6">
      <h1 className="text-xl font-medium text-white">Tied: {title}</h1>
      <p className="mt-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
        {message}
      </p>
      <button
        onClick={share}
        className="mt-4 w-full rounded bg-neutral-100 px-3 py-1.5 text-sm text-black"
      >
        {shared ? "Shared" : "Share invite"}
      </button>
      <button
        onClick={onNext}
        className="mt-2 w-full py-1.5 text-sm text-neutral-400 underline"
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

  async function tap() {
    await checkin({ knotId: knotId as Id<"knots">, kind: "tap" });
    setDone(true);
  }

  return (
    <div className="mt-6">
      <h1 className="text-xl font-medium text-white">First check-in</h1>
      {knot && (
        <div className="mt-3">
          <RopeMeter rope={knot.rope} />
        </div>
      )}
      {!done ? (
        <button
          onClick={tap}
          className="mt-4 w-full rounded bg-neutral-100 px-3 py-2 text-sm text-black"
        >
          One tap
        </button>
      ) : (
        <>
          <p className="mt-4 rounded-xl bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
            If things go quiet, I'll nudge, not scold.
          </p>
          <button
            onClick={onNext}
            className="mt-4 w-full rounded bg-neutral-100 px-3 py-1.5 text-sm text-black"
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
  return (
    <div className="mt-6">
      <h1 className="text-xl font-medium text-white">Stay in the loop</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Bubs nudges you when a knot goes slack, so nothing silently frays.
      </p>
      <button
        onClick={() => setOn(true)}
        disabled={on}
        className="mt-4 w-full rounded bg-neutral-100 px-3 py-1.5 text-sm text-black disabled:opacity-40"
      >
        {on ? "Nudges on" : "Enable nudges"}
      </button>
      {on && (
        <button
          onClick={onDone}
          className="mt-2 w-full py-1.5 text-sm text-neutral-400 underline"
        >
          Continue
        </button>
      )}
    </div>
  );
}

const MASCOTS = [
  "bubs",
  "tali",
  "buhol",
  "hibla",
  "nudo",
  "kord",
  "loop",
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
    <div className="mt-6">
      <h1 className="text-xl font-medium text-white">Pick your bub</h1>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {MASCOTS.map((m) => (
          <button
            key={m}
            onClick={() => setName(m)}
            className={`rounded-2xl border px-4 py-3 text-sm capitalize ${
              name === m
                ? "border-neutral-500 text-white"
                : "border-neutral-800 text-neutral-500"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <button
        onClick={save}
        className="mt-4 w-full rounded bg-neutral-100 px-3 py-1.5 text-sm text-black"
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
    <main className="mx-auto max-w-2xl px-3 py-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? navigate("/home") : setStep(step - 1))}
          aria-label="Back"
          className="text-sm text-neutral-400"
        >
          {"<"}
        </button>
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-neutral-100" : "bg-neutral-800"}`}
            />
          ))}
        </div>
      </div>
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
    </main>
  );
}

export function OnboardingPage() {
  return (
    <>
      <SignedOut>
        <main className="mx-auto max-w-2xl px-3 py-6">
          <Meet onNext={() => {}} />
          <Link
            to="/signin"
            className="mt-2 block text-center text-sm text-white underline"
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
