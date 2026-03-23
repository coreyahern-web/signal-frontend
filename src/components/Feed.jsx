import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import EntryCard, { buildClaudeBlock } from "./EntryCard";

function searchText(val) {
  if (!val) return "";
  if (typeof val === "string") return val.toLowerCase();
  if (Array.isArray(val)) return val.map(searchText).join(" ");
  return "";
}

const STATUS_OPTIONS = [
  { key: null, label: "All statuses" },
  { key: "unreviewed", label: "Unreviewed" },
  { key: "act", label: "Act" },
  { key: "queue", label: "Queue" },
  { key: "save", label: "Save" },
  { key: "discard", label: "Discard" },
];

const TYPE_OPTIONS = [
  { key: null, label: "All types" },
  { key: "build", label: "Build" },
  { key: "configure", label: "Configure" },
  { key: "ops", label: "Ops" },
  { key: "marketing", label: "Marketing" },
  { key: "strategy", label: "Strategy" },
  { key: "vendor", label: "Vendor" },
];

export default function Feed() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [batchCopied, setBatchCopied] = useState(false);
  const [copiedIds, setCopiedIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const isArchived = filter === "archived";
      const { data, error } = await supabase
        .from("knowledge_entries")
        .select("*")
        .eq("archived", isArchived)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    }
    load();
  }, [filter]);

  // Filter by tab
  let result =
    filter === "all" || filter === "archived"
      ? entries
      : filter === "recommended"
        ? entries.filter((e) => e.recommend === "yes")
        : filter === "high-relevancy"
          ? entries.filter((e) => Number(e.relevancy_score) >= 7)
          : entries;

  // Filter by upgrade_status
  if (statusFilter === "unreviewed") {
    result = result.filter((e) => !e.upgrade_status);
  } else if (statusFilter) {
    result = result.filter((e) => e.upgrade_status === statusFilter);
  }

  // Filter by upgrade_type
  if (typeFilter) {
    result = result.filter((e) => e.upgrade_type === typeFilter);
  }

  // Search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((e) => {
      return (
        searchText(e.title).includes(q) ||
        searchText(e.summary).includes(q) ||
        searchText(e.verdict).includes(q) ||
        searchText(e.what_works).includes(q) ||
        searchText(e.next_step).includes(q)
      );
    });
  }

  // Sort
  if (sort === "relevancy") {
    result = [...result].sort((a, b) => (Number(b.relevancy_score) || 0) - (Number(a.relevancy_score) || 0));
  } else if (sort === "recommended") {
    const order = { yes: 0, partially: 1, no: 2 };
    result = [...result].sort((a, b) => (order[a.recommend] ?? 3) - (order[b.recommend] ?? 3));
  }

  async function handleArchive(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    await supabase.from("knowledge_entries").update({ archived: true }).eq("id", id);
  }

  async function handleUnarchive(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    await supabase.from("knowledge_entries").update({ archived: false }).eq("id", id);
  }

  async function handleDelete(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    await supabase.from("knowledge_entries").delete().eq("id", id);
  }

  async function handleUpdateEntry(id, fields) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...fields } : e));
    await supabase.from("knowledge_entries").update(fields).eq("id", id);
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function copySelectedForClaude() {
    const selectedEntries = result.filter((e) => selected.has(e.id));
    const blocks = selectedEntries.map((e, i) => buildClaudeBlock(e, i));
    navigator.clipboard.writeText(blocks.join("\n\n"));
    setCopiedIds((prev) => {
      const next = new Set(prev);
      selectedEntries.forEach((e) => next.add(e.id));
      return next;
    });
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 1500);
  }

  function markCopied(id) {
    setCopiedIds((prev) => new Set(prev).add(id));
  }

  const isArchivedView = filter === "archived";

  return (
    <div className="flex flex-col h-full relative">
      {/* Filter tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-gray-100 flex-shrink-0">
        {[
          { key: "all", label: "All" },
          { key: "recommended", label: "Recommended" },
          { key: "high-relevancy", label: "High relevancy" },
          { key: "archived", label: "Archived" },
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

      {/* Search + sort + upgrade filters */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 flex-shrink-0 flex-wrap">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[120px] text-sm px-3 py-1.5 rounded-lg bg-gray-100 border-0 outline-none focus:ring-2 focus:ring-gray-900 placeholder-gray-400"
        />
        <select
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="text-xs font-medium px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 border-0 outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.key || "all"} value={o.key || ""}>{o.label}</option>
          ))}
        </select>
        <select
          value={typeFilter || ""}
          onChange={(e) => setTypeFilter(e.target.value || null)}
          className="text-xs font-medium px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 border-0 outline-none cursor-pointer"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.key || "all"} value={o.key || ""}>{o.label}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-xs font-medium px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 border-0 outline-none cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="relevancy">Highest relevancy</option>
          <option value="recommended">Recommended first</option>
        </select>
      </div>

      <div className={`flex-1 overflow-y-auto px-4 py-4 ${selected.size > 0 ? "pb-24" : "pb-20"} md:pb-4`}>
        {loading && (
          <p className="text-sm text-gray-400 text-center pt-8">Loading...</p>
        )}
        {error && (
          <p className="text-sm text-red-500 text-center pt-8">{error}</p>
        )}
        {!loading && !error && result.length === 0 && (
          <p className="text-sm text-gray-400 text-center pt-8">No entries.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onArchive={isArchivedView ? null : handleArchive}
              onUnarchive={isArchivedView ? handleUnarchive : null}
              onDelete={handleDelete}
              selected={selected.has(entry.id)}
              onSelect={toggleSelect}
              wasCopied={copiedIds.has(entry.id)}
              onMarkCopied={markCopied}
              onUpdateEntry={handleUpdateEntry}
            />
          ))}
        </div>
      </div>

      {/* Floating action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center p-3 pointer-events-none md:bottom-4">
          <div className="pointer-events-auto flex items-center gap-3 bg-gray-900 text-white rounded-xl shadow-lg px-5 py-3">
            <span className="text-sm font-medium">
              {selected.size} card{selected.size > 1 ? "s" : ""} selected
            </span>
            <div className="w-px h-4 bg-gray-700" />
            <button
              onClick={copySelectedForClaude}
              className="text-sm font-medium px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {batchCopied ? "Copied" : "Copy for Claude"}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm font-medium px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
