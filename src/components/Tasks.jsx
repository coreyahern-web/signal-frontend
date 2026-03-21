import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Tasks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    // Fetch all entries with tasks
    const { data: entries, error: entriesError } = await supabase
      .from("knowledge_entries")
      .select("id, title, tasks")
      .order("created_at", { ascending: false });

    if (entriesError) {
      setError(entriesError.message);
      setLoading(false);
      return;
    }

    // Fetch completions
    const { data: completions } = await supabase
      .from("task_completions")
      .select("entry_id, task_index, completed");

    const completionMap = {};
    (completions || []).forEach((c) => {
      completionMap[`${c.entry_id}:${c.task_index}`] = c.completed;
    });

    // Flatten tasks
    const flat = [];
    (entries || []).forEach((entry) => {
      const tasks = entry.tasks || [];
      tasks.forEach((task, index) => {
        const key = `${entry.id}:${index}`;
        flat.push({
          key,
          entryId: entry.id,
          entryTitle: entry.title,
          taskIndex: index,
          task,
          completed: !!completionMap[key],
        });
      });
    });

    setItems(flat);
    setLoading(false);
  }

  async function toggle(item) {
    const newVal = !item.completed;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.key === item.key ? { ...i, completed: newVal } : i))
    );

    // Upsert to Supabase
    const { error } = await supabase.from("task_completions").upsert(
      {
        entry_id: item.entryId,
        task_index: item.taskIndex,
        completed: newVal,
        completed_at: newVal ? new Date().toISOString() : null,
      },
      { onConflict: "entry_id,task_index" }
    );

    if (error) {
      // Revert
      setItems((prev) =>
        prev.map((i) =>
          i.key === item.key ? { ...i, completed: item.completed } : i
        )
      );
    }
  }

  const pending = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">All Tasks</h2>
        {!loading && (
          <span className="text-xs text-gray-400">
            {done.length}/{items.length} done
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20 md:pb-4 space-y-1">
        {loading && (
          <p className="text-sm text-gray-400 text-center pt-8">Loading...</p>
        )}
        {error && (
          <p className="text-sm text-red-500 text-center pt-8">{error}</p>
        )}
        {!loading && items.length === 0 && (
          <p className="text-sm text-gray-400 text-center pt-8">No tasks yet.</p>
        )}

        {/* Pending tasks */}
        {pending.map((item) => (
          <TaskRow key={item.key} item={item} onToggle={toggle} />
        ))}

        {/* Divider */}
        {done.length > 0 && pending.length > 0 && (
          <div className="py-3 flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Completed</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* Done tasks */}
        {done.map((item) => (
          <TaskRow key={item.key} item={item} onToggle={toggle} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ item, onToggle }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
        item.completed
          ? "border-gray-100 bg-gray-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      onClick={() => onToggle(item)}
    >
      <div
        className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
          item.completed
            ? "bg-gray-900 border-gray-900"
            : "border-gray-400 hover:border-gray-600"
        }`}
      >
        {item.completed && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5l2.5 2.5L8 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            item.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {item.task}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{item.entryTitle}</p>
      </div>
    </div>
  );
}
