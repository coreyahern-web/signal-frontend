import { useState } from "react";

const platformColors = {
  instagram: "bg-pink-100 text-pink-700",
  youtube: "bg-red-100 text-red-700",
  tiktok: "bg-purple-100 text-purple-700",
  twitter: "bg-sky-100 text-sky-700",
  x: "bg-sky-100 text-sky-700",
  default: "bg-gray-100 text-gray-700",
};

const difficultyColors = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

const contentTypeColors = {
  tutorial: "bg-blue-50 text-blue-700",
  opinion: "bg-purple-50 text-purple-700",
  "case-study": "bg-cyan-50 text-cyan-700",
  "product-demo": "bg-orange-50 text-orange-700",
  strategy: "bg-indigo-50 text-indigo-700",
};

function PlatformBadge({ platform }) {
  const colorClass = platformColors[platform?.toLowerCase()] || platformColors.default;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
      {platform || "unknown"}
    </span>
  );
}

function Badge({ label, colorClass }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  );
}

function safeStr(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.map(safeStr).join(", ");
  if (typeof val === "object") return Object.values(val).map(safeStr).join(" ");
  return String(val);
}

export default function EntryCard({ entry, onArchive }) {
  const [expanded, setExpanded] = useState(false);

  const steps = Array.isArray(entry.steps) ? entry.steps : [];
  const tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
  const tools = Array.isArray(entry.tools_mentioned) ? entry.tools_mentioned : [];
  const concepts = Array.isArray(entry.key_concepts) ? entry.key_concepts : [];
  const warnings = Array.isArray(entry.warnings) ? entry.warnings : [];
  const tags = Array.isArray(entry.tags) ? entry.tags : [];
  const brandRelevance = Array.isArray(entry.brand_relevance) ? entry.brand_relevance : [];

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="p-4">
        {/* Title + platform */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug flex-1">
            {entry.title || "Untitled"}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-gray-400">{entry.created_at ? new Date(entry.created_at).toLocaleDateString() + " " + new Date(entry.created_at).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}) : ""}</span>
            <PlatformBadge platform={entry.platform} />
            <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
            {onArchive && (
              <button
                className="text-gray-300 hover:text-red-400 text-xs ml-1 transition-colors"
                onClick={(e) => { e.stopPropagation(); onArchive(entry.id); }}
                title="Archive"
              >✕</button>
            )}
          </div>
        </div>

        {/* Metadata badges */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {entry.suggested_topic && (
            <Badge label={entry.suggested_topic} colorClass="bg-blue-50 text-blue-700" />
          )}
          {entry.suggested_subtopic && (
            <Badge label={entry.suggested_subtopic} colorClass="bg-indigo-50 text-indigo-600" />
          )}
          {entry.difficulty && (
            <Badge
              label={entry.difficulty}
              colorClass={difficultyColors[entry.difficulty] || "bg-gray-100 text-gray-600"}
            />
          )}
          {entry.content_type && (
            <Badge
              label={entry.content_type}
              colorClass={contentTypeColors[entry.content_type] || "bg-gray-100 text-gray-600"}
            />
          )}
          {entry.time_to_implement && (
            <Badge label={`⏱ ${entry.time_to_implement}`} colorClass="bg-gray-100 text-gray-600" />
          )}
        </div>

        {/* Brand relevance */}
        {brandRelevance.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-2">
            {brandRelevance.map((brand, i) => (
              <Badge key={i} label={brand} colorClass="bg-orange-50 text-orange-700" />
            ))}
          </div>
        )}

        {/* Summary */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {entry.summary}
        </p>

        {/* Key Takeaway — always visible */}
        {entry.one_thing_to_steal && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <span className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Key Takeaway </span>
            <span className="text-xs text-yellow-900">{entry.one_thing_to_steal}</span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {steps.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Steps</h4>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="font-bold text-gray-400 flex-shrink-0 w-5">{i + 1}.</span>
                    <span className="text-gray-800">{safeStr(step)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {tasks.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tasks</h4>
              <ul className="space-y-1">
                {tasks.map((task, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    {safeStr(task)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {concepts.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Concepts</h4>
              <ul className="space-y-1">
                {concepts.map((c, i) => (
                  <li key={i} className="text-sm text-gray-700">{safeStr(c)}</li>
                ))}
              </ul>
            </section>
          )}

          {warnings.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Warnings</h4>
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-red-700 bg-red-50 rounded px-2 py-1">{safeStr(w)}</li>
                ))}
              </ul>
            </section>
          )}

          {tools.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tools</h4>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((t, i) => (
                  <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    {safeStr(t)}
                  </span>
                ))}
              </div>
            </section>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {safeStr(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
