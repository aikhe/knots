import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router";
import { TaskList } from "../components/Tasks/Tasks";

const convexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL);
const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function AuthHeader() {
  if (!clerkConfigured) {
    return (
      <p className="mt-2 text-sm text-neutral-500">
        Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to sign in.
      </p>
    );
  }
  return (
    <div className="mt-2">
      <SignedOut>
        <Link to="/signin" className="mt-2 inline-block text-sm text-white underline">
          Sign in
        </Link>
      </SignedOut>
    </div>
  );
}

function Feed() {
  if (!clerkConfigured) return <TaskList />;
  return (
    <>
      <SignedOut>
        <p className="mt-6 text-sm text-neutral-500">
          Sign in to see your feed.
        </p>
      </SignedOut>
      <SignedIn>
        <TaskList />
      </SignedIn>
    </>
  );
}

export function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <AuthHeader />
      {!convexConfigured ? (
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-neutral-300">
          <li>
            Run <code className="text-white">bunx convex dev</code> to link a
            project.
          </li>
          <li>
            Copy <code className="text-white">.env.example</code> to{" "}
            <code className="text-white">.env.local</code> with your{" "}
            <code className="text-white">VITE_CONVEX_URL</code>.
          </li>
          <li>
            Run <code className="text-white">bun run dev</code>.
          </li>
        </ol>
      ) : (
        <Feed />
      )}
    </main>
  );
}
