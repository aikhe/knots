import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@knots/backend/api";
import type { Id } from "@knots/backend/dataModel";
import { safeRedirect } from "../../utils/redirect";
import { PICKS } from "./constants";

// resolves the shrunk habit text for the current pick.
export function shrunkFor(pick: string, custom: string) {
  const chosen = PICKS.find((p) => p.id === pick);
  return pick === "custom" ? custom.trim() : (chosen?.shrunk ?? "");
}

// step state, redirect gating and progress bar order for the signed-in flow.
export function useOnboardingFlow() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));
  const destination = redirect ?? "/home";
  const knots = useQuery(api.knots.mine);
  const me = useQuery(api.users.me);
  // The welcome screen runs before sign-in, so the signed-in flow starts
  // at the first real step instead of repeating the pitch.
  const [step, setStep] = useState(1);
  const [pick, setPick] = useState("");
  const [custom, setCustom] = useState("");
  const [knotId, setKnotId] = useState<string | null>(null);
  const [withFriend, setWithFriend] = useState(false);

  let gate: "loading" | "done" | null = null;
  if (step === 1) {
    if (me === undefined || me === null || knots === undefined) {
      gate = "loading";
    } else if (
      // Finished onboarding, or already tied something: nothing left to do here.
      knotId === null &&
      (Boolean(me.mascot) || knots.length > 0)
    ) {
      gate = "done";
    }
  }

  const title = shrunkFor(pick, custom);
  // Solo runs skip the share step, so the bar has one fewer segment.
  const order = withFriend ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 5, 6];
  const position = order.indexOf(step);

  return {
    gate,
    destination,
    step,
    setStep,
    pick,
    setPick,
    custom,
    setCustom,
    knotId,
    setKnotId,
    withFriend,
    setWithFriend,
    title,
    order,
    position,
    finish: () => navigate(destination, { replace: true }),
  };
}

// creates the knot, optionally with a friend picked from user search.
export function useTie(
  title: string,
  onDone: (knotId: string, withFriend: boolean) => void,
) {
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

  function selectMember(userId: string, displayName: string) {
    setMemberId(userId);
    setMemberName(displayName);
    setMemberQuery("");
  }

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

  return {
    mode,
    setMode,
    memberQuery,
    setMemberQuery,
    memberId,
    memberName,
    selectMember,
    error,
    results,
    tie,
  };
}

// builds the invite message and shares it via the share sheet or clipboard.
export function useShare(knotId: string) {
  const knot = useQuery(api.knots.get, {
    knotId: knotId as Id<"knots">,
  });
  const [shared, setShared] = useState(false);
  const token = knot?.inviteToken ?? null;
  const message = token
    ? `I tied a knot with you. Tie yours? ${window.location.origin}/join/${token}`
    : null;

  async function share() {
    if (!message) return;
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

  return { message, shared, share };
}

// loads the knot and records the first tap check-in.
export function useFirstCheckin(knotId: string) {
  const knot = useQuery(api.knots.get, {
    knotId: knotId as Id<"knots">,
  });
  const checkin = useMutation(api.checkins.checkin);
  const [done, setDone] = useState(false);

  async function tap() {
    await checkin({ knotId: knotId as Id<"knots">, kind: "tap" });
    setDone(true);
  }

  return { knot, done, tap };
}

// saves the chosen mascot.
export function usePickBub(onDone: () => void) {
  const setMascot = useMutation(api.users.setMascot);
  const [name, setName] = useState("bubs");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    try {
      await setMascot({ mascot: name });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return { name, setName, error, save };
}
