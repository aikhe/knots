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

function CheckIn({ knotId }: { knotId: string }) {
  const checkin = useMutation(api.checkins.checkin);
  const generateUrl = useMutation(api.checkins.generateUploadUrl);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function tap() {
    setError(null);
    try {
      await checkin({ knotId: knotId as Id<"knots">, kind: "tap" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check in.");
    }
  }

  async function sendNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setError(null);
    try {
      await checkin({
        knotId: knotId as Id<"knots">,
        kind: "note",
        text: note,
      });
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check in.");
    }
  }

  async function sendPhoto(file: File | null) {
    if (!file) return;
    setError(null);
    try {
      const url = await generateUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = (await res.json()) as { storageId: string };
      await checkin({
        knotId: knotId as Id<"knots">,
        kind: "photo",
        imageStorageId: storageId as Id<"_storage">,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check in.");
    }
  }

  return (
    <div className="border-b border-neutral-800 px-3 py-2">
      <div className="flex gap-2">
        <button
          onClick={tap}
          className="shrink-0 rounded-full bg-neutral-100 px-4 py-1.5 text-sm text-black"
        >
          Check in
        </button>
        <form onSubmit={sendNote} className="flex w-full gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className="w-full rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white"
          />
        </form>
        <label className="shrink-0 cursor-pointer rounded-full border border-neutral-700 px-3 py-1.5 text-sm text-white">
          Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => sendPhoto(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-neutral-500">{error}</p>}
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
  const setRest = useMutation(api.knots.setRest);
  const sendTug = useMutation(api.tugs.send);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages?.length]);

  if (knot === undefined || messages === undefined) {
    return <p className="mt-6 text-sm text-neutral-500">Loading...</p>;
  }
  if (knot === null) {
    return <p className="mt-6 text-sm text-neutral-500">Not found.</p>;
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

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-800 px-3 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">{knot.title}</p>
          <span className="text-xs text-neutral-500">{knot.kind}</span>
        </div>
        <div className="mt-2">
          <RopeMeter rope={knot.rope} />
        </div>
        {stats && (
          <p className="mt-1 text-xs text-neutral-500">
            {stats.totalCheckins} check-ins · {stats.activeToday} active today
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {knot.members.map((m) => (
            <span key={m.userId} className="flex items-center gap-1 text-xs text-neutral-400">
              <Link to={`/user/${m.username}`} className="underline">
                {m.displayName}
              </Link>
              {m.userId !== myId && knot.isMember && (
                <button
                  onClick={() =>
                    sendTug({ knotId: knot._id, toUserId: m.userId })
                  }
                  className="text-neutral-500 underline hover:text-white"
                >
                  tug
                </button>
              )}
            </span>
          ))}
        </div>
        {knot.isMember && (
          <button
            onClick={() => setRest({ knotId: knot._id, resting: !knot.resting })}
            className="mt-2 text-xs text-neutral-500 underline"
          >
            {knot.resting ? "Resume" : "Rest"}
          </button>
        )}
        {knot.isMember && knot.inviteToken && (
          <p className="mt-2 text-xs text-neutral-500">
            Invite:{" "}
            <button
              onClick={() =>
                navigator.clipboard
                  ?.writeText(
                    `${window.location.origin}/join/${knot.inviteToken}`,
                  )
                  .catch(() => {})
              }
              className="underline"
            >
              copy link
            </button>
          </p>
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
              className="mt-2 text-sm text-white underline"
            >
              Join this knot
            </button>
          )}
        </div>
      ) : (
        <>
          <CheckIn knotId={knotId} />
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-sm text-neutral-500">No messages yet.</p>
            ) : (
              <ul className="space-y-2">
                {messages.map((m) => {
                  const mine = m.authorId === myId;
                  return (
                    <li
                      key={m._id}
                      className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                    >
                      {!mine &&
                        (m.avatarUrl ? (
                          <img
                            src={m.avatarUrl}
                            alt={m.author}
                            className="h-6 w-6 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[11px] text-white">
                            {m.author.slice(0, 1).toUpperCase()}
                          </div>
                        ))}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-1.5 ${
                          mine
                            ? "bg-neutral-100 text-black"
                            : "bg-neutral-900 text-white"
                        }`}
                      >
                        {!mine && (
                          <p className="text-xs text-neutral-400">{m.author}</p>
                        )}
                        <p className="text-sm">{m.text}</p>
                        <p
                          className={`mt-0.5 text-right text-[11px] ${mine ? "text-neutral-600" : "text-neutral-500"}`}
                        >
                          {timeAgo(m._creationTime)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div ref={bottomRef} />
          </div>
          <form
            onSubmit={onSend}
            className="flex gap-2 border-t border-neutral-800 px-3 py-2"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message"
              className="w-full rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-neutral-100 px-4 py-1.5 text-sm text-black"
            >
              Send
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
