import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import EntryCard from "./EntryCard";

export default function Feed() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("knowledge_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered =
    filter === "all"
      ? entries
      : filter === "recommended"
        ? entries.filter((e) => e.recommend === "yes")
        : filter === "high-relevancy"
          ? entries.filter((e) => Number(e.relevancy_score) >= 7)
          : entries;

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-gray-100 flex-shrink-0">
        {[
          { key: "all", label: "All" },
          { key: "recommended", label: "Recommended" },
          { key: "high-relevancy", label: "High relevancy" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              filter === tab.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20 md:pb-4">
        {loading && (
          <p className="text-sm text-gray-400 text-center pt-8">Loading...</p>
        )}
        {error && (
          <p className="text-sm text-red-500 text-center pt-8">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center pt-8">No entries.</p>
        )}
        {filtered.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
