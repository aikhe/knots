import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function EditForm({ knotId }: { knotId: string }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const knot = useQuery(api.knots.get, {
    knotId: knotId as Id<"knots">,
  });
  const renameKnot = useMutation(api.knots.rename);
  const deleteKnot = useMutation(api.knots.removeKnot);
  const [title, setTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (knot === undefined) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (knot === null || knot.creatorId !== user?.id) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Not found.</p>;
  }

  const value = title ?? knot.title;
  const kid = knot._id;
  const ktitle = knot.title;

  async function save() {
    if (!value.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await renameKnot({ knotId: kid, title: value });
      navigate(`/knot/${kid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mt-2 -mx-3 border-y border-neutral-800 px-3">
        <label className="flex items-center gap-3 py-3">
          <span className="w-24 shrink-0 text-sm text-neutral-500">Title</span>
          <input
            value={value}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Knot title"
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-neutral-500">{error}</p>}
      <button
        onClick={save}
        disabled={saving}
        className="mt-5 w-full rounded-full bg-white px-3 py-1.5 text-base text-black disabled:opacity-50"
      >
        Save
      </button>
      <Link
        to={`/knot/${kid}`}
        className="mt-2 block w-full rounded-full bg-neutral-800 px-3 py-1.5 text-center text-base text-white"
      >
        Cancel
      </Link>
      <div className="mt-2 flex items-center justify-center">
        <button
          onClick={() => {
            if (window.confirm(`Delete ${ktitle}?`)) {
              deleteKnot({ knotId: kid }).then(() => navigate("/knots"));
            }
          }}
          className="text-sm text-neutral-500"
        >
          Delete knot
        </button>
      </div>
    </>
  );
}

export function EditKnotPage() {
  const { knotId = "" } = useParams();

  return (
    <main className="mx-auto max-w-2xl px-3">
      <EditForm knotId={knotId} />
    </main>
  );
}
