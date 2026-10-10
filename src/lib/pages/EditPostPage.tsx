import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function EditForm({ postId }: { postId: string }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const post = useQuery(api.posts.get, {
    postId: postId as Id<"posts">,
  });
  const updatePost = useMutation(api.posts.update);
  const removePost = useMutation(api.posts.remove);
  const updateJoinable = useMutation(api.knots.setJoinable);
  const generateUrl = useMutation(api.posts.generateUploadUrl);
  const [text, setText] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [joinable, setJoinable] = useState<boolean | null>(null);
  const [keptIds, setKeptIds] = useState<string[] | null>(null);
  const [added, setAdded] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (post === undefined) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>;
  }
  if (post === null || post.authorId !== user?.id) {
    return <p className="mt-6 text-center text-sm text-neutral-500">Not found.</p>;
  }

  const value = text ?? post.text;
  const pub = isPublic ?? post.isPublic;
  const join = joinable ?? post.knotJoinable;
  const canFlip = post.knotCreatorId === user?.id;
  const pid = post._id;
  const kid = post.knotId;
  const wasJoinable = post.knotJoinable;
  const keptPairs =
    keptIds === null
      ? post.imageIds.map((id, i) => ({ id, url: post.imageUrls[i] as string }))
      : post.imageIds
          .map((id, i) => ({ id, url: post.imageUrls[i] as string }))
          .filter((p) => keptIds.includes(p.id));

  async function save() {
    if (!value.trim() && keptPairs.length === 0 && added.length === 0) return;
    setError(null);
    setSaving(true);
    try {
      const imageStorageIds: Id<"_storage">[] = keptPairs.map(
        (p) => p.id as Id<"_storage">,
      );
      for (const file of added.slice(0, 10 - keptPairs.length)) {
        const url = await generateUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await res.json()) as { storageId: string };
        imageStorageIds.push(storageId as Id<"_storage">);
      }
      await updatePost({
        postId: pid,
        text: value,
        isPublic: pub,
        imageStorageIds,
      });
      if (canFlip && join !== wasJoinable) {
        await updateJoinable({ knotId: kid, joinable: join });
      }
      navigate(`/post/${pid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <textarea
        value={value}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="mt-6 w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
      />
      <label className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
        <input
          type="checkbox"
          checked={pub}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Post publicly
      </label>
      {canFlip && (
        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
          <input
            type="checkbox"
            checked={join}
            onChange={(e) => setJoinable(e.target.checked)}
          />
          Joinable by others
        </label>
      )}
      {(keptPairs.length > 0 || added.length > 0) && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {keptPairs.map((p) => (
            <div key={p.id} className="relative shrink-0">
              <img
                src={p.url}
                alt=""
                className="h-20 w-20 rounded-xl object-cover"
              />
              <button
                onClick={() =>
                  setKeptIds(keptPairs.filter((k) => k.id !== p.id).map((k) => k.id))
                }
                className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          {added.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-900 px-1 text-center text-[11px] text-neutral-400"
            >
              {f.name}
            </div>
          ))}
        </div>
      )}
      <label className="mt-3 block cursor-pointer text-sm text-neutral-400">
        Add photos
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) =>
            setAdded((prev) =>
              [...prev, ...Array.from(e.target.files ?? [])].slice(0, 10),
            )
          }
        />
      </label>
      {error && <p className="mt-2 text-sm text-neutral-500">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-neutral-100 px-4 py-1.5 text-sm text-black disabled:opacity-50"
        >
          Save
        </button>
        <Link
          to={`/post/${post._id}`}
          className="px-1 py-1.5 text-sm text-neutral-500 underline"
        >
          Cancel
        </Link>
      </div>
      <div className="mt-2 flex items-center justify-center">
        <button
          onClick={() => {
            if (window.confirm("Delete this post?")) {
              removePost({ postId: pid }).then(() => navigate("/home"));
            }
          }}
          className="text-sm text-neutral-500"
        >
          Delete post
        </button>
      </div>
    </>
  );
}

export function EditPostPage() {
  const { postId = "" } = useParams();

  return (
    <main className="mx-auto max-w-2xl px-3 py-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Edit post</p>
      </div>
      <EditForm postId={postId} />
    </main>
  );
}
