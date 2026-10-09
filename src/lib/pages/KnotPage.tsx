import { useEffect, useRef, useState, type FormEvent } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { timeAgo } from "../utils/time";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

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
  const messages = useQuery(api.messages.list, {
    knotId: knotId as Id<"knots">,
  });
  const sendMessage = useMutation(api.messages.send);
  const joinKnot = useMutation(api.knots.join);
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
      <div className="border-b border-neutral-800 px-4 py-3">
        <p className="text-sm font-medium text-white">{knot.title}</p>
        <p className="text-xs text-neutral-500">
          {knot.members.map((m) => m.username).join(", ")}
        </p>
      </div>
      {!knot.isMember ? (
        <div className="px-4 py-6">
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
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
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
            className="flex gap-2 border-t border-neutral-800 px-4 py-2"
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
        <p className="mt-6 px-4 text-sm text-neutral-500">
          Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to sign in.
        </p>
      ) : (
        <>
          <SignedOut>
            <Link
              to="/signin"
              className="mt-6 inline-block px-4 text-sm text-white underline"
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
