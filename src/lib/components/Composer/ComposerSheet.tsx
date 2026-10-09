import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation } from "convex/react";
import { Link } from "react-router";
import { api } from "../../../../convex/_generated/api";
import { useUIStore } from "../../../store";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

export function ComposerSheet() {
  const open = useUIStore((s) => s.composerOpen);
  const setOpen = useUIStore((s) => s.setComposerOpen);
  const createTask = useMutation(api.tasks.create);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    try {
      await createTask({ text });
      setText("");
      setOpen(false);
    } catch {
      setError("Sign in to add items.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-10 bg-black/60"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-0 z-20 border-t border-neutral-800 bg-[#101010] px-4 pb-8 pt-4"
          >
            {!clerkConfigured ? (
              <p className="text-sm text-neutral-500">
                Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to add items.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="New item"
                  autoFocus
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
                />
                <button
                  type="submit"
                  className="rounded bg-neutral-100 px-3 py-1 text-sm text-black"
                >
                  Add
                </button>
              </form>
            )}
            {error && (
              <p className="mt-2 text-sm text-neutral-500">
                {error}{" "}
                <Link
                  to="/signin"
                  onClick={() => setOpen(false)}
                  className="text-white underline"
                >
                  Sign in
                </Link>
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
