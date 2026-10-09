import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { useUIStore } from "./store";
import type { Task } from "./lib/validators";

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
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

function TaskManager() {
  const tasks = useQuery(api.tasks.get) as Task[] | undefined;
  const createTask = useMutation(api.tasks.create);
  const toggleTask = useMutation(api.tasks.toggle);
  const removeTask = useMutation(api.tasks.remove);
  const showCompletedOnly = useUIStore((s) => s.showCompletedOnly);
  const toggleCompletedOnly = useUIStore((s) => s.toggleCompletedOnly);
  const [text, setText] = useState("");

  if (tasks === undefined) {
    return <p className="mt-6 text-sm text-neutral-500">Loading tasks...</p>;
  }

  const visible = showCompletedOnly
    ? tasks.filter((t) => t.isCompleted)
    : tasks;

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await createTask({ text });
    setText("");
  }

  return (
    <div className="mt-6">
      <form onSubmit={onAdd} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New task"
          className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
        />
        <button
          type="submit"
          className="rounded bg-neutral-100 px-3 py-1 text-sm text-black"
        >
          Add
        </button>
      </form>
      <label className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
        <input
          type="checkbox"
          checked={showCompletedOnly}
          onChange={toggleCompletedOnly}
        />
        Completed only
      </label>
      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          No tasks yet. Add one above.
        </p>
      ) : (
        <ul className="mt-4 space-y-1 text-sm text-neutral-300">
          {visible.map((task) => (
            <li key={task._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() =>
                  toggleTask({ id: task._id as Id<"tasks"> })
                }
              />
              <span
                className={
                  task.isCompleted ? "text-neutral-500" : "text-white"
                }
              >
                {task.text}
              </span>
              <button
                onClick={() => removeTask({ id: task._id as Id<"tasks"> })}
                className="ml-auto text-sm text-neutral-500 hover:text-white"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TasksView() {
  if (!clerkConfigured) return <TaskManager />;
  return (
    <>
      <SignedOut>
        <p className="mt-6 text-sm text-neutral-500">
          Sign in to manage your tasks.
        </p>
      </SignedOut>
      <SignedIn>
        <TaskManager />
      </SignedIn>
    </>
  );
}

function App() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-semibold text-white">knots</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Vite + React + Tailwind + Convex base.
      </p>
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
        <TasksView />
      )}
    </main>
  );
}

export default App;
