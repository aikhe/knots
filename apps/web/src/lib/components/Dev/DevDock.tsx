import { useEffect, useState, type ReactNode } from "react";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@knots/backend/api";
import { clerkConfigured } from "../../utils/env";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm text-neutral-500">{title}</h2>
      <div className="mt-2 divide-y divide-neutral-900 border-y border-neutral-900">
        {children}
      </div>
    </section>
  );
}

function Row({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{title}</p>
        {detail && (
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
            {detail}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  disabled,
  tone = "dim",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "light" | "dim";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm disabled:opacity-40 ${
        tone === "light" ? "bg-white text-black" : "bg-neutral-800 text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmButton({
  label,
  onConfirm,
  disabled,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <Button onClick={() => setArmed(true)} disabled={disabled}>
        {label}
      </Button>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button onClick={() => setArmed(false)} disabled={disabled}>
        Cancel
      </Button>
      <Button tone="light" onClick={onConfirm} disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}

// Tracks one action at a time so every control shares the same busy and
// error state.
function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      await fn();
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return { busy, error, done, run };
}

function Tools() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const me = useQuery(api.users.me);
  const knots = useQuery(api.knots.mine);
  const resetOnboarding = useMutation(api.knots.resetOnboarding);
  const resetAccount = useMutation(api.dev.resetAccount);
  const purgeAccount = useMutation(api.dev.purgeAccount);
  const seed = useMutation(api.seed.seedDemo);
  const { busy, error, done, run } = useAction();

  const email = user?.primaryEmailAddress?.emailAddress ?? "No email";
  const knotCount = knots?.length ?? 0;

  // Full reload: both wipes invalidate the me and knots queries, and a fresh
  // load keeps the welcome flow from reading a stale snapshot.
  const resetToWelcome = (action: () => Promise<unknown>) =>
    run(async () => {
      await action();
      window.location.assign("/welcome");
    });

  const signOutToWelcome = () =>
    run(async () => {
      await signOut();
      window.location.assign("/welcome");
    });

  const deleteAccount = () =>
    run(async () => {
      if (!user) throw new Error("Clerk user is still loading.");
      if (!user.deleteSelfEnabled) {
        throw new Error("Self-deletion is off for this Clerk instance.");
      }
      await purgeAccount();
      await user.delete();
      await signOut().catch(() => {});
      window.location.assign("/welcome");
    });

  return (
    <>
      <Section title="Session">
        <Row
          title={email}
          detail={
            <>
              <span className="block">
                @{me?.username ?? "…"} · mascot {me?.mascot ?? "none"} ·{" "}
                {knotCount} {knotCount === 1 ? "knot" : "knots"}
              </span>
              <span className="mt-0.5 block truncate font-mono text-[11px] text-neutral-600">
                {user?.id}
              </span>
            </>
          }
        >
          <Button onClick={() => void signOutToWelcome()} disabled={busy}>
            Sign out
          </Button>
        </Row>
      </Section>

      <Section title="Onboarding">
        <Row
          title="Reset onboarding"
          detail="Deletes your knots and mascot, then reopens the welcome flow."
        >
          <Button
            onClick={() => void resetToWelcome(resetOnboarding)}
            disabled={busy}
          >
            Reset
          </Button>
        </Row>
        <Row
          title="Seed demo data"
          detail="Three knots with posts, messages, check-ins and a notification."
        >
          <Button onClick={() => void run(() => seed())} disabled={busy}>
            Seed
          </Button>
        </Row>
      </Section>

      <Section title="Account">
        <Row
          title="Wipe data"
          detail="Deletes every row you own. Keeps the login and username."
        >
          <ConfirmButton
            label="Wipe"
            onConfirm={() => void resetToWelcome(resetAccount)}
            disabled={busy}
          />
        </Row>
        <Row
          title="Delete account"
          detail="Removes the Clerk user and all app data. Clerk may ask you to verify first."
        >
          <ConfirmButton
            label="Delete"
            onConfirm={() => void deleteAccount()}
            disabled={busy || !user}
          />
        </Row>
      </Section>

      {error ? (
        <p className="mt-4 text-sm text-neutral-300">{error}</p>
      ) : (
        done && <p className="mt-4 text-sm text-neutral-500">Done.</p>
      )}
    </>
  );
}

// Floating dev panel, mounted at the app root so it is reachable on every
// route, including welcome and sign-in.
export function DevDock() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!import.meta.env.DEV) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open dev controls"
          className="fixed right-0 top-1/2 z-50 -translate-y-1/2 rounded-l-md border border-r-0 border-neutral-800 bg-neutral-900 px-1.5 py-3 font-mono text-[10px] tracking-[0.18em] text-neutral-500 opacity-60 hover:opacity-100 sm:left-[calc(50%+196.5px)] sm:right-auto"
        >
          DEV
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dev controls"
          className="fixed inset-0 z-[60] flex flex-col bg-black sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[min(852px,calc(100dvh-3rem))] sm:w-[393px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:rounded-[2.5rem] sm:border sm:border-neutral-800"
        >
          <header className="flex items-center justify-between border-b border-neutral-900 px-4 pb-3 pt-5">
            <h1 className="text-base text-white">Dev controls</h1>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-500 hover:text-white"
            >
              Close
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10">
            {!clerkConfigured ? (
              <p className="mt-6 text-sm text-neutral-500">
                Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to use the controls.
              </p>
            ) : (
              <>
                <SignedOut>
                  <p className="mt-6 text-sm text-neutral-500">
                    Signed out. Sign in to reset data or delete an account.
                  </p>
                  <a
                    href="/signin?redirect=%2Fhome"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-sm text-black"
                  >
                    Sign in
                  </a>
                </SignedOut>
                <SignedIn>
                  <Tools />
                </SignedIn>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
