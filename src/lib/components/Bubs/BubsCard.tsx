import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { buildSuggestions, FIRST_BLUEPRINT } from "./bubs";

export function BubsCard() {
  const knots = useQuery(api.knots.mine);
  const browse = useQuery(api.knots.browse);
  const me = useQuery(api.users.me);
  const trust = useQuery(
    api.users.trust,
    me ? { username: me.username } : "skip",
  );
  const requests = useQuery(api.friends.incoming);
  const notes = useQuery(api.notifications.list);
  const recent = useQuery(api.checkins.recent, { limit: 10 });
  const activity = useQuery(api.friends.activity);

  if (
    knots === undefined ||
    browse === undefined ||
    requests === undefined ||
    notes === undefined ||
    recent === undefined ||
    activity === undefined
  ) {
    return <p className="mt-6 text-sm text-neutral-500">Loading...</p>;
  }

  const suggestions = [
    ...(knots.length === 0 ? [FIRST_BLUEPRINT] : []),
    ...buildSuggestions({
      knots: knots.map((k) => ({
        _id: k._id,
        title: k.title,
        rope: k.rope,
        resting: k.resting,
      })),
      streak: trust?.streak ?? 0,
      pendingRequests: requests.map((r) => ({ username: r.username })),
      joinable: browse.map((k) => ({ _id: k._id, title: k.title })),
      hasPhoto: Boolean(me?.avatarUrl),
      hasDisplayName: Boolean(me?.displayName),
      unreadCount: notes.filter((n) => !n.read).length,
      recentNotes: recent
        .filter((r) => r.text)
        .map((r) => ({
          knotId: r.knotId,
          knot: r.knot,
          text: r.text as string,
        })),
      friendActivity: activity,
    }),
  ];

  return (
    <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex w-full items-center gap-3">
        <img src="/bub.svg" alt="Bubs" className="h-10 w-10 shrink-0" />
        <p className="text-sm font-medium capitalize text-white">
          {me?.mascot ?? "Bubs"}
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {suggestions.map((s) => (
          <li key={s.id}>
            <Link
              to={s.to}
              className="block rounded-xl bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
            >
              {s.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
