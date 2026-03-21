import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import EntryCard from "./EntryCard";

const BRANDS = ["Estimate PM", "Cashflow Panda", "Connect Construction", "Cold Holdings"];

export default function Feed() {
  const [entries, setEntries] = useState([]);
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeBrand, setActiveBrand] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("knowledge_entries")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setEntries(data || []);
      const distinct = [
        "All",
        ...Array.from(
          new Set((data || []).map((e) => e.suggested_topic).filter(Boolean))
        ),
      ];
      setTopics(distinct);
    }
    setLoading(false);
  }

  async function archive(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await supabase.from("knowledge_entries").update({ archived: true }).eq("id", id);
  }

  const filtered = entries.filter((e) => {
    if (activeTopic !== "All" && e.suggested_topic !== activeTopic) return false;
    if (activeBrand && !(e.brand_relevance || []).includes(activeBrand)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (e.title || "").toLowerCase().includes(q) ||
        (e.summary || "").toLowerCase().includes(q) ||
        (e.one_thing_to_steal || "").toLowerCase().includes(q) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-gray-400 placeholder-gray-400"
        />
      </div>

      {/* Brand filter */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide flex-shrink-0">
        {BRANDS.map((brand) => (
          <button
            key={brand}
            onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              activeBrand === brand
                ? "bg-orange-500 text-white"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Topic filter */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide border-b border-gray-100 flex-shrink-0">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setActiveTopic(topic)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              activeTopic === topic
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
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
          <EntryCard key={entry.id} entry={entry} onArchive={archive} />
        ))}
      </div>
    </div>
  );
}
