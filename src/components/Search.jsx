import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import EntryCard from "./EntryCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const term = `%${query.trim()}%`;
      const { data, error } = await supabase
        .from("knowledge_entries")
        .select("*")
        .or(`title.ilike.${term},summary.ilike.${term}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error) setResults(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="search"
            placeholder="Search entries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-xl border-0 outline-none focus:ring-2 focus:ring-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20 md:pb-4">
        {!query.trim() && (
          <p className="text-sm text-gray-400 text-center pt-8">
            Type to search entries.
          </p>
        )}
        {loading && (
          <p className="text-sm text-gray-400 text-center pt-8">Searching...</p>
        )}
        {!loading && query.trim() && results.length === 0 && (
          <p className="text-sm text-gray-400 text-center pt-8">
            No results for "{query}".
          </p>
        )}
        {results.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
