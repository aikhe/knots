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
import { KnotFields, type KnotKind } from "../Knots/KnotFields";
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
  const [kind, setKind] = useState<KnotKind>("tied");
  const [background, setBackground] = useState<string | undefined>(undefined);
  const [memberIds, setMemberIds] = useState<
    { userId: string; username: string; displayName: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createKnot({
        title,
        kind,
        joinable: false,
        background,
        memberUserIds: memberIds.map((m) => m.userId),
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not make the knot.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3">
      <KnotFields
        title={title}
        setTitle={setTitle}
        kind={kind}
        setKind={setKind}
        background={background}
        setBackground={setBackground}
        memberIds={memberIds}
        setMemberIds={setMemberIds}
        titleRef={titleRef}
      />
      <button
        type="submit"
        className="mt-auto w-full rounded-full bg-white px-3 py-1.5 text-base text-black"
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
  const generateUrl = useMutation(api.posts.generateUploadUrl);
  const createKnot = useMutation(api.knots.create);
  const updateJoinable = useMutation(api.knots.setJoinable);
  const myKnots = useQuery(api.knots.mine);
  const textRef = useDeferredFocus<HTMLTextAreaElement>(ready);

  const [text, setText] = useState("");
  const [knotId, setKnotId] = useState("");
  const [makingKnot, setMakingKnot] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<KnotKind>("tied");
  const [background, setBackground] = useState<string | undefined>(undefined);
  const [isPublic, setIsPublic] = useState(false);
  const [joinable, setJoinable] = useState(false);
  const [memberIds, setMemberIds] = useState<
    { userId: string; username: string; displayName: string }[]
  >([]);
  const [knotListOpen, setKnotListOpen] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const picked = (myKnots ?? []).find((k) => k._id === knotId);
  const canFlipJoinable =
    makingKnot || (picked !== undefined && picked.creatorId === user?.id);

  function reset() {
    setText("");
    setKnotId("");
    setKnotListOpen(false);
    setMakingKnot(false);
    setTitle("");
    setKind("tied");
    setBackground(undefined);
    setIsPublic(false);
    setJoinable(false);
    setMemberIds([]);
    setPhotos([]);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() && photos.length === 0) return;
    setError(null);
    try {
      let target = knotId;
      if (makingKnot) {
        target = await createKnot({
          title,
          kind,
          joinable,
          background,
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
      const imageStorageIds: Id<"_storage">[] = [];
      for (const file of photos.slice(0, 10)) {
        const url = await generateUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await res.json()) as { storageId: string };
        imageStorageIds.push(storageId as Id<"_storage">);
      }
      await createPost({
        text,
        knotId: target as Id<"knots">,
        isPublic,
        imageStorageIds,
      });
      reset();
      onDone();
    } catch {
      setError("Sign in to post.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3">
      <textarea
        ref={textRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share an update"
        rows={3}
        className="min-h-24 w-full flex-1 resize-none bg-transparent py-2 text-base text-white outline-none"
      />
      <label className="block w-full cursor-pointer rounded-full bg-neutral-800 px-4 py-2 text-center text-sm text-white">
        {photos.length > 0 ? `${photos.length} photos` : "Add photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) =>
            setPhotos((prev) =>
              [...prev, ...Array.from(e.target.files ?? [])].slice(0, 10),
            )
          }
        />
      </label>
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {photos.map((f, i) => (
            <button
              key={`${f.name}-${i}`}
              type="button"
              onClick={() =>
                setPhotos((prev) => prev.filter((_, j) => j !== i))
              }
              className="shrink-0 text-xs text-neutral-500 underline"
            >
              {f.name} ×
            </button>
          ))}
        </div>
      )}
      {!makingKnot ? (
        <div className="flex gap-2">
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setKnotListOpen((v) => !v)}
              aria-expanded={knotListOpen}
              className="flex w-full items-center justify-between gap-2 rounded-full bg-neutral-800 py-2 pl-4 pr-4 text-base text-white"
            >
              <span className="truncate">
                {picked?.title ?? "Pick a knot"}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
                className={`shrink-0 text-neutral-500 transition-transform ${knotListOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M6 9l6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {knotListOpen && (
              <ul className="absolute inset-x-0 top-full z-10 mt-1 rounded-2xl bg-neutral-900 p-1">
                {(myKnots ?? []).map((k) => (
                  <li key={k._id}>
                    <button
                      type="button"
                      onClick={() => {
                        setKnotId(k._id);
                        setKnotListOpen(false);
                      }}
                      className={`w-full truncate rounded-xl px-3 py-2 text-left text-sm ${k._id === knotId ? "bg-neutral-800 text-white" : "text-neutral-400"}`}
                    >
                      {k.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMakingKnot(true)}
            className="shrink-0 rounded-full bg-neutral-800 px-4 py-2 text-sm text-white"
          >
            New
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <KnotFields
            title={title}
            setTitle={setTitle}
            kind={kind}
            setKind={setKind}
            background={background}
            setBackground={setBackground}
            memberIds={memberIds}
            setMemberIds={setMemberIds}
          />
          <button
            type="button"
            onClick={() => setMakingKnot(false)}
            className="text-sm text-neutral-500"
          >
            Pick existing instead
          </button>
        </div>
      )}
      <Switch
        checked={isPublic}
        onChange={setIsPublic}
        label="Post publicly"
      />
      {canFlipJoinable && (
        <Switch
          checked={joinable}
          onChange={setJoinable}
          label="Joinable by others"
        />
      )}
      <button
        type="submit"
        className="mt-auto w-full rounded-full bg-white px-3 py-1.5 text-base text-black"
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

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between py-1 pl-1"
    >
      <span className="text-sm text-neutral-400">{label}</span>
      <span
        className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${checked ? "justify-end bg-white" : "justify-start bg-neutral-800"}`}
      >
        <span
          className={`h-5 w-5 rounded-full ${checked ? "bg-black" : "bg-neutral-500"}`}
        />
      </span>
    </button>
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
          className="absolute inset-x-0 bottom-0 z-20 flex h-[60%] flex-col rounded-t-3xl bg-[#101010]"
        >
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab touch-none pt-2.5 pb-1 active:cursor-grabbing"
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-neutral-700" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
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
