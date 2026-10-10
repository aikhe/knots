import { useEffect, useRef, useState, type FormEvent } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { timeAgo } from "../utils/time";
import { RopeMeter } from "../components/Knots/RopeMeter";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function CheckIn({
  knotId,
  resting,
  tuggable,
  onTug,
}: {
  knotId: string;
  resting: boolean;
  tuggable: { userId: string; displayName: string }[];
  onTug: (userId: string) => void;
}) {
  const checkin = useMutation(api.checkins.checkin);
  const setRest = useMutation(api.knots.setRest);
  const [error, setError] = useState<string | null>(null);

  async function tap() {
    setError(null);
    try {
      await checkin({ knotId: knotId as Id<"knots">, kind: "tap" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check in.");
    }
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={tap}
          className="flex-1 rounded-full bg-neutral-800 px-4 py-2 text-center text-sm text-white"
        >
          Check in
        </button>
        {tuggable.map((t) => (
          <button
            key={t.userId}
            onClick={() => onTug(t.userId)}
            aria-label={`Tug ${t.displayName}`}
            className="flex-1 rounded-full bg-neutral-800 px-4 py-2 text-center text-sm text-white"
          >
            tug
          </button>
        ))}
        <button
          onClick={() => setRest({ knotId: knotId as Id<"knots">, resting: !resting })}
          className="flex-1 rounded-full bg-neutral-800 px-4 py-2 text-center text-sm text-white"
        >
          {resting ? "Resume" : "Rest"}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-center text-sm text-neutral-500">{error}</p>
      )}
    </div>
  );
}

function Chat({
  knotId,
  myId,
}: {
  knotId: string;
  myId: string;
}) {
  const knot = useQuery(api.knots.get, {
    knotId: knotId as Id<"knots">,
  });
  const stats = useQuery(api.knots.stats, {
    knotId: knotId as Id<"knots">,
  });
  const messages = useQuery(api.messages.list, {
    knotId: knotId as Id<"knots">,
  });
  const sendMessage = useMutation(api.messages.send);
  const joinKnot = useMutation(api.knots.join);
  const sendTug = useMutation(api.tugs.send);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const removeMember = useMutation(api.knots.removeMember);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages?.length]);

  if (knot === undefined || messages === undefined) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (knot === null) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Not found.</p>;
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const message = text;
    setText("");
    await sendMessage({
      text: message,
      knotId: knotId as Id<"knots">,
    });
  }

  async function copyInvite() {
    const token = knot?.inviteToken;
    if (!token) return;
    try {
      await navigator.clipboard?.writeText(
        `${window.location.origin}/join/${token}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      {copied && (
        <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white">
          Copied
        </div>
      )}
      <div className="px-3 py-3">
        <div className="flex flex-col items-center">
          <div className="relative">
            {knot.background ? (
              <img
                src={knot.background}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800 text-2xl text-white">
                {knot.title.slice(0, 1).toUpperCase()}
              </div>
            )}
            {knot.creatorId === myId && (
              <Link
                to={`/knot/${knot._id}/edit`}
                aria-label="Knot settings"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800"
              >
                <img
                  src="/MajesticonsCogLine.svg"
                  alt=""
                  className="h-5 w-5 invert"
                />
              </Link>
            )}
          </div>
          <p className="mt-2 text-center text-base text-white">{knot.title}</p>
        </div>
        <div className="mx-auto mt-2 w-4/5">
          <RopeMeter rope={knot.rope} />
        </div>
        {stats && (
          <p className="mt-3 text-center text-sm text-neutral-500">
            {stats.totalCheckins} check-ins · {stats.activeToday} active today
          </p>
        )}
        {knot.isMember && !knot.resting && knot.rope === "slack" && (
          <p className="mt-2 rounded-2xl bg-neutral-900 px-3 py-2 text-center text-sm text-neutral-300">
            Stuck? Rest it for a breather, tug a member, or trim the goal.
          </p>
        )}
        <div className="mt-3 flex items-center justify-center">
          <div className="flex -space-x-2">
            {knot.members.map((m) => (
              <Link
                key={m.userId}
                to={`/user/${m.username}`}
                aria-label={m.displayName}
                title={m.displayName}
              >
                {m.avatarUrl ? (
                  <img
                    src={m.avatarUrl}
                    alt={m.displayName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm text-white">
                    {m.displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </Link>
            ))}
            {knot.isMember && knot.inviteToken && (
              <button
                onClick={copyInvite}
                aria-label="Copy invite link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800"
              >
                <img
                  src="/plus.svg"
                  alt=""
                  className="h-3.5 w-3.5 opacity-70"
                />
              </button>
            )}
          </div>
        </div>
        {knot.creatorId === myId &&
          knot.members.some((m) => m.userId !== myId) && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              {knot.members
                .filter((m) => m.userId !== myId)
                .map((m) => (
                  <button
                    key={m.userId}
                    onClick={() =>
                      removeMember({ knotId: knot._id, userId: m.userId })
                    }
                    className="text-xs text-neutral-600"
                  >
                    remove {m.displayName}
                  </button>
                ))}
            </div>
          )}
      </div>
      {!knot.isMember ? (
        <div className="px-3 py-6">
          <p className="text-sm text-neutral-500">
            You are not in this knot.
          </p>
          {knot.joinable && (
            <button
              onClick={() => joinKnot({ knotId: knot._id })}
              className="mt-4 w-full rounded-full bg-neutral-800 px-4 py-1.5 text-base text-white"
            >
              Join this knot
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-neutral-500">No messages yet.</p>
            ) : (
              <ul className="space-y-2">
                {messages.map((m) => {
                  const mine = m.authorId === myId;
                  if (mine) {
                    return (
                      <li key={m._id} className="flex flex-col items-end gap-1">
                        <div className="max-w-[80%] rounded-2xl bg-white px-3 py-1.5 text-black">
                          <p className="text-sm">{m.text}</p>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {timeAgo(m._creationTime)}
                        </p>
                      </li>
                    );
                  }
                  return (
                    <li key={m._id} className="flex flex-col gap-1">
                      <p className="pl-8 text-xs text-neutral-400">{m.author}</p>
                      <div className="flex items-end gap-2">
                        {m.avatarUrl ? (
                          <img
                            src={m.avatarUrl}
                            alt={m.author}
                            className="h-6 w-6 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[11px] text-white">
                            {m.author.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="max-w-[80%] rounded-2xl bg-neutral-800 px-3 py-1.5 text-white">
                          <p className="text-sm">{m.text}</p>
                        </div>
                      </div>
                      <p className="pl-8 text-[11px] text-neutral-500">
                        {timeAgo(m._creationTime)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <div ref={bottomRef} />
          </div>
          <CheckIn
            knotId={knotId}
            resting={knot.resting}
            tuggable={knot.members
              .filter((m) => m.userId !== myId)
              .map((m) => ({ userId: m.userId, displayName: m.displayName }))}
            onTug={(userId) => sendTug({ knotId: knot._id, toUserId: userId })}
          />
          <form
            onSubmit={onSend}
            className="mx-3 mb-3 flex items-center gap-1 rounded-full bg-neutral-900 py-1.5 pl-3 pr-1.5"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message"
              aria-label="Message"
              className="w-full bg-transparent text-sm text-white outline-none"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black"
            >
              <img src="/MajesticonsPaperAirplaneLine.svg" alt="" className="h-5 w-5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function KnotScreen({ knotId }: { knotId: string }) {
  const { user } = useUser();
  if (!user) return null;
  return <Chat knotId={knotId} myId={user.id} />;
}

export function KnotPage() {
  const { knotId = "" } = useParams();

  return (
    <main className="mx-auto flex h-full max-w-2xl flex-col px-0">
      {!clerkConfigured ? (
        <p className="mt-6 px-3 text-sm text-neutral-500">
          Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to sign in.
        </p>
      ) : (
        <>
          <SignedOut>
            <Link
              to="/signin"
              className="mt-6 inline-block px-3 text-sm text-white underline"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <KnotScreen knotId={knotId} />
          </SignedIn>
        </>
      )}
    </main>
  );
}
