import { Link } from "react-router";

export function ErrorPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-10">
      <h1 className="text-xl font-medium text-white">Something broke</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Reload the app. If it keeps happening, tell us what you tapped.
      </p>
      <Link to="/home" className="mt-4 inline-block text-sm text-white underline">
        Back home
      </Link>
    </main>
  );
}
