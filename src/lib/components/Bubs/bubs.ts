export type Suggestion = {
  id: string;
  text: string;
  to: string;
};

export type BubsContext = {
  knots: {
    _id: string;
    title: string;
    rope: "tight" | "firm" | "slack";
    resting: boolean;
  }[];
  streak: number;
  pendingRequests: { username: string }[];
  joinable: { _id: string; title: string }[];
  hasPhoto: boolean;
  hasDisplayName: boolean;
  unreadCount: number;
  recentNotes: { knotId: string; knot: string; text: string }[];
  friendActivity: { username: string; displayName: string; weekCount: number }[];
};

const REST_HINTS: [RegExp, string][] = [
  [/travel|trip|flight|vacation|airport/i, "traveling"],
  [/sick|ill\b|flu|fever|covid|cold\b/i, "sick"],
  [/exam|finals|midterm|study/i, "in exams"],
  [/hospital|injury|injured|surgery|doctor/i, "hurt"],
  [/busy|tired|exhausted|burnout|overwhelm/i, "running low"],
];

function restReason(text: string): string | null {
  for (const [pattern, reason] of REST_HINTS) {
    if (pattern.test(text)) return reason;
  }
  return null;
}
export function buildSuggestions(ctx: BubsContext): Suggestion[] {
  const out: Suggestion[] = [];
  for (const knot of ctx.knots) {
    if (knot.rope === "slack" && !knot.resting) {
      out.push({
        id: `slack-${knot._id}`,
        text: `${knot.title} is going slack, tap to check in`,
        to: `/knot/${knot._id}`,
      });
    } else if (knot.rope === "firm" && !knot.resting) {
      out.push({
        id: `firm-${knot._id}`,
        text: `${knot.title} is firm, check in to tighten it`,
        to: `/knot/${knot._id}`,
      });
    } else if (knot.resting) {
      out.push({
        id: `rest-${knot._id}`,
        text: `${knot.title} is resting`,
        to: `/knot/${knot._id}`,
      });
    }
  }
  if (ctx.streak >= 30) {
    out.push({
      id: "streak-30",
      text: `${ctx.streak}-day rhythm. Locked in.`,
      to: "/profile",
    });
  } else if (ctx.streak >= 7) {
    out.push({
      id: "streak-7",
      text: `${ctx.streak}-day rhythm, keep it tight.`,
      to: "/profile",
    });
  }
  if (!ctx.hasPhoto) {
    out.push({
      id: "nophoto",
      text: "Add a profile photo so friends recognize you",
      to: "/profile/edit",
    });
  }
  if (!ctx.hasDisplayName) {
    out.push({
      id: "noname",
      text: "Set your display name",
      to: "/profile/edit",
    });
  }
  for (const req of ctx.pendingRequests.slice(0, 3)) {
    out.push({
      id: `friend-${req.username}`,
      text: `${req.username} added you.`,
      to: "/info",
    });
  }
  for (const knot of ctx.joinable.slice(0, 2)) {
    out.push({
      id: `join-${knot._id}`,
      text: `${knot.title} is joinable.`,
      to: `/knot/${knot._id}`,
    });
  }
  if (ctx.unreadCount > 0) {
    out.push({
      id: "unread",
      text: `${ctx.unreadCount} unread ${ctx.unreadCount === 1 ? "reminder" : "reminders"}`,
      to: "/info",
    });
  }
  const seenRest = new Set<string>();
  for (const note of ctx.recentNotes.slice(0, 10)) {
    if (seenRest.has(note.knotId)) continue;
    const reason = restReason(note.text);
    if (!reason) continue;
    seenRest.add(note.knotId);
    out.push({
      id: `rest-${note.knotId}`,
      text: `Sounds like you're ${reason}, rest ${note.knot}?`,
      to: `/knot/${note.knotId}`,
    });
  }
  for (const f of ctx.friendActivity.filter((a) => a.weekCount >= 2).slice(0, 2)) {
    out.push({
      id: `match-${f.username}`,
      text: `${f.displayName} checked in ${f.weekCount} times this week, tie a knot?`,
      to: "/knots",
    });
  }
  if (out.length === 0) {
    out.push({
      id: "empty",
      text: "All tight. Make a knot or check in.",
      to: "/knots",
    });
  }
  return out;
}

export const FIRST_BLUEPRINT = {
  id: "blueprint-morning-gym",
  text: "New here? Try the Morning Gym blueprint.",
  to: "/knots",
};
