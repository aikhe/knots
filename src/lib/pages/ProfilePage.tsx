import {
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Link } from "react-router";
import { TaskList } from "../components/Tasks/Tasks";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Task } from "../utils/validators";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

function ProfileDetails() {
  const { user } = useUser();
  const tasks = useQuery(api.tasks.get) as Task[] | undefined;
  const done = tasks?.filter((t) => t.isCompleted).length ?? 0;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <UserButton />
        <div>
          <p className="text-sm text-white">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
          <p className="text-sm text-neutral-500">
            {tasks === undefined
              ? "Loading data..."
              : `${tasks.length} items, ${done} done`}
          </p>
        </div>
      </div>
      <SignOutButton>
        <button className="mt-4 text-sm text-neutral-500 hover:text-white">
          Sign out
        </button>
      </SignOutButton>
      <div className="mt-6 border-t border-neutral-800 pt-2">
        <TaskList />
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-medium text-white">Profile</h1>
      {!clerkConfigured ? (
        <p className="mt-6 text-sm text-neutral-500">
          Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to sign in.
        </p>
      ) : (
        <>
          <SignedOut>
            <Link
              to="/signin"
              className="mt-6 inline-block text-sm text-white underline"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <ProfileDetails />
          </SignedIn>
        </>
      )}
    </main>
  );
}
