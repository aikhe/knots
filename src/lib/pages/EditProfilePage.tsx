import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function EditForm({
  initial,
}: {
  initial: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}) {
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUrl = useMutation(api.users.generateAvatarUploadUrl);
  const saveAvatar = useMutation(api.users.saveAvatar);
  const [username, setUsername] = useState(initial.username);
  const [displayName, setDisplayName] = useState(initial.displayName ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function pickFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      await updateProfile({
        username: username.trim() || undefined,
        displayName: displayName.trim() || undefined,
      });
      if (file) {
        const url = await generateUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await res.json()) as { storageId: string };
        await saveAvatar({ storageId: storageId as Id<"_storage"> });
      }
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const shownAvatar = preview ?? initial.avatarUrl ?? null;
  const initialLetter = (username || initial.username || "?")
    .slice(0, 1)
    .toUpperCase();

  return (
    <>
      <div className="mt-2 flex flex-col items-center">
        {shownAvatar ? (
          <img
            src={shownAvatar}
            alt="Profile photo"
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-800 text-2xl text-white">
            {initialLetter}
          </div>
        )}
        <label className="mt-3 cursor-pointer rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white">
          Edit picture
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      <div className="-mx-3 mt-4 divide-y divide-neutral-800 border-y border-neutral-800 px-3">
        <label className="flex items-center gap-3 py-3">
          <span className="w-24 shrink-0 text-sm text-neutral-500">Name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>
        <label className="flex items-center gap-3 py-3">
          <span className="w-24 shrink-0 text-sm text-neutral-500">
            Username
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
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
        to="/profile"
        className="mt-2 block w-full rounded-full bg-neutral-800 px-3 py-1.5 text-center text-base text-white"
      >
        Cancel
      </Link>
    </>
  );
}

export function EditProfilePage() {
  const me = useQuery(api.users.me);

  return (
    <main className="mx-auto max-w-2xl px-3">
      {me === undefined ? (
        <p className="mt-6 text-center text-sm text-neutral-500">Loading...</p>
      ) : me === null ? (
        <p className="mt-6 text-center text-sm text-neutral-500">Sign in to edit.</p>
      ) : (
        <EditForm initial={me} />
      )}
    </main>
  );
}
