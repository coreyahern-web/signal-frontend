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
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (filter === "summary") {
      loadSummary();
      return;
    }
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

  async function loadSummary() {
    setSummaryLoading(true);
    const [activeRes, archivedRes, actRes] = await Promise.all([
      supabase.from("knowledge_entries").select("upgrade_status", { count: "exact", head: true }).eq("archived", false),
      supabase.from("knowledge_entries").select("id", { count: "exact", head: true }).eq("archived", true),
      supabase.from("knowledge_entries").select("id, title, upgrade_type, brief_ref").eq("upgrade_status", "act").eq("archived", false).order("created_at", { ascending: false }),
    ]);
    // Count by status from active entries
    const countRes = await Promise.all([
      supabase.from("knowledge_entries").select("id", { count: "exact", head: true }).eq("archived", false).is("upgrade_status", null),
      supabase.from("knowledge_entries").select("id", { count: "exact", head: true }).eq("archived", false).eq("upgrade_status", "act"),
      supabase.from("knowledge_entries").select("id", { count: "exact", head: true }).eq("archived", false).eq("upgrade_status", "queue"),
      supabase.from("knowledge_entries").select("id", { count: "exact", head: true }).eq("archived", false).eq("upgrade_status", "save"),
      supabase.from("knowledge_entries").select("id", { count: "exact", head: true }).eq("archived", false).eq("upgrade_status", "discard"),
    ]);
    setSummary({
      total: activeRes.count || 0,
      archived: archivedRes.count || 0,
      unreviewed: countRes[0].count || 0,
      act: countRes[1].count || 0,
      queue: countRes[2].count || 0,
      save: countRes[3].count || 0,
      discard: countRes[4].count || 0,
      actItems: actRes.data || [],
    });
    setSummaryLoading(false);
  }

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

  async function handleBulkArchive() {
    const ids = [...selected];
    setEntries((prev) => prev.filter((e) => !selected.has(e.id)));
    setSelected(new Set());
    await supabase.from("knowledge_entries").update({ archived: true }).in("id", ids);
  }

  async function handleBulkStatus(status) {
    const ids = [...selected];
    setEntries((prev) => prev.map((e) => ids.includes(e.id) ? { ...e, upgrade_status: status } : e));
    setSelected(new Set());
    await supabase.from("knowledge_entries").update({ upgrade_status: status }).in("id", ids);
  }

  function toggleSelectAll() {
    const visibleIds = result.map((e) => e.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visibleIds));
    }
  }

  const isArchivedView = filter === "archived";
  const allVisibleSelected = result.length > 0 && result.every((e) => selected.has(e.id));

  return (
    <div className="flex flex-col h-full relative">
      {/* Filter tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-gray-100 flex-shrink-0">
        {[
          { key: "all", label: "All" },
          { key: "recommended", label: "Recommended" },
          { key: "high-relevancy", label: "High relevancy" },
          { key: "archived", label: "Archived" },
          { key: "summary", label: "Summary" },
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

      {/* Search + sort + upgrade filters (hidden on summary tab) */}
      {filter !== "summary" && (
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
      )}

      {/* Summary view */}
      {filter === "summary" && (
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-20 md:pb-4">
          {summaryLoading && (
            <p className="text-sm text-gray-400 text-center pt-8">Loading summary...</p>
          )}
          {summary && !summaryLoading && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Active cards</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-400">{summary.archived}</p>
                  <p className="text-xs text-gray-500 mt-1">Archived</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">By status</h3>
                {[
                  { label: "Unreviewed", count: summary.unreviewed, color: "bg-gray-100 text-gray-600" },
                  { label: "Act", count: summary.act, color: "bg-blue-100 text-blue-700" },
                  { label: "Queue", count: summary.queue, color: "bg-violet-100 text-violet-700" },
                  { label: "Save", count: summary.save, color: "bg-amber-100 text-amber-700" },
                  { label: "Discard", count: summary.discard, color: "bg-gray-200 text-gray-500" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.color}`}>{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{row.count}</span>
                  </div>
                ))}
              </div>

              {summary.actItems.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Act items</h3>
                  {summary.actItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-snug">{item.title}</p>
                        {item.brief_ref && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {item.brief_ref.startsWith("http") ? (
                              <a href={item.brief_ref} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{item.brief_ref}</a>
                            ) : item.brief_ref}
                          </p>
                        )}
                      </div>
                      {item.upgrade_type && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          { build: "bg-blue-50 text-blue-600", configure: "bg-cyan-50 text-cyan-600", ops: "bg-gray-100 text-gray-600", marketing: "bg-pink-50 text-pink-600", strategy: "bg-indigo-50 text-indigo-600", vendor: "bg-orange-50 text-orange-600" }[item.upgrade_type] || "bg-gray-100 text-gray-600"
                        }`}>
                          {item.upgrade_type}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Card grid (hidden on summary tab) */}
      {filter !== "summary" && (
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
          {result.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div
                onClick={toggleSelectAll}
                className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                  allVisibleSelected ? "bg-gray-900 border-gray-900" : "border-gray-300 hover:border-gray-500"
                }`}
              >
                {allVisibleSelected && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {selected.size > 0 ? `${selected.size} of ${result.length} selected` : `Select all ${result.length}`}
              </span>
            </div>
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
      )}

      {/* Floating action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center p-3 pointer-events-none md:bottom-4">
          <div className="pointer-events-auto flex items-center gap-2 bg-gray-900 text-white rounded-xl shadow-lg px-4 py-2.5 flex-wrap justify-center">
            <span className="text-sm font-medium mr-1">
              {selected.size} card{selected.size > 1 ? "s" : ""}
            </span>
            <div className="w-px h-4 bg-gray-700" />
            {!isArchivedView && (
              <button
                onClick={handleBulkArchive}
                className="text-sm font-medium px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                Archive
              </button>
            )}
            {[
              { key: "act", label: "Act", cls: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" },
              { key: "queue", label: "Queue", cls: "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30" },
              { key: "save", label: "Save", cls: "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" },
              { key: "discard", label: "Discard", cls: "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => handleBulkStatus(s.key)}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${s.cls}`}
              >
                {s.label}
              </button>
            ))}
            <div className="w-px h-4 bg-gray-700" />
            <button
              onClick={copySelectedForClaude}
              className="text-sm font-medium px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {batchCopied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm font-medium px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
