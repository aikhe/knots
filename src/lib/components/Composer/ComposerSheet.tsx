import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
} from "motion/react";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useUIStore } from "../../../store";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function useDeferredFocus<T extends HTMLElement>(ready: boolean) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      ref.current?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(t);
  }, [ready]);
  return ref as RefObject<T | null>;
}

function KnotForm({ onDone, ready }: { onDone: () => void; ready: boolean }) {
  const createKnot = useMutation(api.knots.create);
  const titleRef = useDeferredFocus<HTMLInputElement>(ready);
  const [title, setTitle] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [memberIds, setMemberIds] = useState<
    { userId: string; username: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const searchResults = useQuery(
    api.users.search,
    memberQuery.trim() ? { prefix: memberQuery } : "skip",
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createKnot({
        title,
        joinable: false,
        memberUserIds: memberIds.map((m) => m.userId),
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not make the knot.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Knot title"
        className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
      />
      <input
        value={memberQuery}
        onChange={(e) => setMemberQuery(e.target.value)}
        placeholder="Add member by username"
        className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
      />
      {(searchResults ?? []).map((u) => (
        <button
          key={u.userId}
          type="button"
          onClick={() =>
            setMemberIds((ids) =>
              ids.some((i) => i.userId === u.userId) ? ids : [...ids, u],
            )
          }
          className="mr-2 text-sm text-neutral-300 underline"
        >
          {u.username}
        </button>
      ))}
      {memberIds.length > 0 && (
        <p className="text-sm text-neutral-400">
          {memberIds.map((m) => m.username).join(", ")}
        </p>
      )}
      <button
        type="submit"
        className="w-full rounded bg-neutral-100 px-3 py-1.5 text-sm text-black"
      >
        Make knot
      </button>
      {error && <p className="text-sm text-neutral-500">{error}</p>}
    </form>
  );
}

function PostForm({ onDone, ready }: { onDone: () => void; ready: boolean }) {
  const { user } = useUser();
  const createPost = useMutation(api.posts.create);
  const createKnot = useMutation(api.knots.create);
  const updateJoinable = useMutation(api.knots.setJoinable);
  const myKnots = useQuery(api.knots.mine);
  const textRef = useDeferredFocus<HTMLTextAreaElement>(ready);

  const [text, setText] = useState("");
  const [knotId, setKnotId] = useState("");
  const [makingKnot, setMakingKnot] = useState(false);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [joinable, setJoinable] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberIds, setMemberIds] = useState<
    { userId: string; username: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const searchResults = useQuery(
    api.users.search,
    memberQuery.trim() ? { prefix: memberQuery } : "skip",
  );

  const picked = (myKnots ?? []).find((k) => k._id === knotId);
  const canFlipJoinable =
    makingKnot || (picked !== undefined && picked.creatorId === user?.id);

  function reset() {
    setText("");
    setKnotId("");
    setMakingKnot(false);
    setTitle("");
    setIsPublic(false);
    setJoinable(false);
    setMemberQuery("");
    setMemberIds([]);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    try {
      let target = knotId;
      if (makingKnot) {
        target = await createKnot({
          title,
          joinable,
          memberUserIds: memberIds.map((m) => m.userId),
        });
      }
      if (!target) {
        setError("Pick a knot or make a new one.");
        return;
      }
      if (!makingKnot && picked && picked.joinable !== joinable) {
        await updateJoinable({
          knotId: target as Id<"knots">,
          joinable,
        });
      }
      await createPost({
        text,
        knotId: target as Id<"knots">,
        isPublic,
      });
      reset();
      onDone();
    } catch {
      setError("Sign in to post.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        ref={textRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share an update"
        rows={3}
        className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
      />
      {!makingKnot ? (
        <div className="flex gap-2">
          <select
            value={knotId}
            onChange={(e) => setKnotId(e.target.value)}
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
          >
            <option value="">Pick a knot</option>
            {(myKnots ?? []).map((k) => (
              <option key={k._id} value={k._id}>
                {k.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setMakingKnot(true)}
            className="shrink-0 rounded border border-neutral-700 px-3 py-1 text-sm text-white"
          >
            New
          </button>
        </div>
      ) : (
        <div className="space-y-2 rounded border border-neutral-800 p-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Knot title"
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
          />
          <input
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            placeholder="Add member by username"
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
          />
          {(searchResults ?? []).map((u) => (
            <button
              key={u.userId}
              type="button"
              onClick={() =>
                setMemberIds((ids) =>
                  ids.some((i) => i.userId === u.userId) ? ids : [...ids, u],
                )
              }
              className="mr-2 text-sm text-neutral-300 underline"
            >
              {u.username}
            </button>
          ))}
          {memberIds.length > 0 && (
            <p className="text-sm text-neutral-400">
              {memberIds.map((m) => m.username).join(", ")}
            </p>
          )}
          <button
            type="button"
            onClick={() => setMakingKnot(false)}
            className="text-sm text-neutral-500 underline"
          >
            Pick existing instead
          </button>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-neutral-400">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Post publicly
      </label>
      {canFlipJoinable && (
        <label className="flex items-center gap-2 text-sm text-neutral-400">
          <input
            type="checkbox"
            checked={joinable}
            onChange={(e) => setJoinable(e.target.checked)}
          />
          Joinable by others
        </label>
      )}
      <button
        type="submit"
        className="w-full rounded bg-neutral-100 px-3 py-1.5 text-sm text-black"
      >
        Post
      </button>
      {error && (
        <p className="text-sm text-neutral-500">
          {error}{" "}
          <Link to="/signin" className="text-white underline">
            Sign in
          </Link>
        </p>
      )}
    </form>
  );
}

function ComposerForm({
  onDone,
  ready,
}: {
  onDone: () => void;
  ready: boolean;
}) {
  const mode = useUIStore((s) => s.composerMode);
  return mode === "knot" ? (
    <KnotForm onDone={onDone} ready={ready} />
  ) : (
    <PostForm onDone={onDone} ready={ready} />
  );
}

export function ComposerSheet() {
  const open = useUIStore((s) => s.composerOpen);
  const setOpen = useUIStore((s) => s.setComposerOpen);
  const [entered, setEntered] = useState(false);
  const close = () => setOpen(false);
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen ]);

  return (
    <AnimatePresence onExitComplete={() => setEntered(false)}>
      {open && (
        <motion.div
          key="composer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={close}
          aria-hidden
          className="absolute inset-0 z-10 bg-black/70 backdrop-blur-[2px]"
        />
      )}
      {open && (
        <motion.div
          key="composer-sheet"
          role="dialog"
          aria-modal="true"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 42, mass: 0.9 }}
          onAnimationComplete={() => {
            setEntered(true);
          }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) close();
          }}
          className="absolute inset-x-0 bottom-0 z-20 rounded-t-3xl border-x border-t border-neutral-800 bg-[#101010] shadow-[0_-12px_48px_rgba(0,0,0,0.7)]"
        >
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab touch-none pt-2.5 pb-1 active:cursor-grabbing"
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-neutral-700" />
          </div>
          <div className="max-h-[82dvh] overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
            {!clerkConfigured ? (
              <p className="text-sm text-neutral-500">
                Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to post.
              </p>
            ) : (
              <ComposerForm onDone={close} ready={entered} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
