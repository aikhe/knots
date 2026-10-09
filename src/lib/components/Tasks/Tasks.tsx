import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useUIStore } from "../../../store";
import type { Task } from "../../utils/validators";

export function TaskList() {
  const tasks = useQuery(api.tasks.get) as Task[] | undefined;
  const toggleTask = useMutation(api.tasks.toggle);
  const removeTask = useMutation(api.tasks.remove);
  const showCompletedOnly = useUIStore((s) => s.showCompletedOnly);
  const toggleCompletedOnly = useUIStore((s) => s.toggleCompletedOnly);
  const searchQuery = useUIStore((s) => s.searchQuery);

  if (tasks === undefined) {
    return <p className="mt-6 text-sm text-neutral-500">Loading...</p>;
  }

  const q = searchQuery.trim().toLowerCase();
  const visible = tasks.filter(
    (t) =>
      (!showCompletedOnly || t.isCompleted) &&
      (!q || t.text.toLowerCase().includes(q)),
  );

  return (
    <div className="mt-6">
      <label className="flex items-center gap-2 text-sm text-neutral-400">
        <input
          type="checkbox"
          checked={showCompletedOnly}
          onChange={toggleCompletedOnly}
        />
        Completed only
      </label>
      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">Nothing here yet.</p>
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
