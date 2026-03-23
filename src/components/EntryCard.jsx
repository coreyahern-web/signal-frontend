import { useState } from "react";

const platformColors = {
  instagram: "bg-pink-100 text-pink-700",
  youtube: "bg-red-100 text-red-700",
  tiktok: "bg-purple-100 text-purple-700",
  twitter: "bg-sky-100 text-sky-700",
  x: "bg-sky-100 text-sky-700",
  default: "bg-gray-100 text-gray-700",
};

function relevancyColor(score) {
  const n = Number(score) || 0;
  if (n >= 8) return "bg-emerald-100 text-emerald-700";
  if (n >= 5) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function recommendColor(val) {
  if (val === "yes") return "bg-emerald-100 text-emerald-700";
  if (val === "partially") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function copyPlain(entry) {
  const text = (entry.title || "Untitled") + "\n" + (entry.summary || "");
  navigator.clipboard.writeText(text);
}

function copyForClaude(entry) {
  const lines = [
    "[VIDEO BREAKDOWN CARD]",
    "Title: " + (entry.title || ""),
    "Summary: " + (entry.summary || ""),
    "Verdict: " + (entry.verdict || ""),
    "What works: " + formatList(entry.what_works),
    "What doesn't: " + formatList(entry.what_doesnt),
    "Next step: " + (entry.next_step || ""),
    "Recommend: " + (entry.recommend || ""),
    "Relevancy: " + (entry.relevancy_score || 0) + "/10 | Confidence: " + (entry.confidence || ""),
    "Already doing: " + (entry.already_doing || ""),
  ];
  navigator.clipboard.writeText(lines.join("\n"));
}

function formatList(val) {
  if (Array.isArray(val)) return val.join("; ");
  if (typeof val === "string" && val) {
    try { const arr = JSON.parse(val); if (Array.isArray(arr)) return arr.join("; "); } catch {}
    return val;
  }
  return "";
}

function parseArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val) {
    try { const arr = JSON.parse(val); if (Array.isArray(arr)) return arr; } catch {}
    if (val.trim()) return [val];
  }
  return [];
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Section({ label, children }) {
  return (
    <div className="py-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </h4>
      {children}
    </div>
  );
}

function DetailDrawer({ entry, onClose }) {
  const whatWorks = parseArray(entry.what_works);
  const whatDoesnt = parseArray(entry.what_doesnt);
  const prerequisites = parseArray(entry.prerequisites);
  const warnings = parseArray(entry.warnings);
  const tools = parseArray(entry.tools);
  const brandRelevance = parseArray(entry.brand_relevance);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 leading-snug">
              {entry.title || "Untitled"}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {entry.recommend && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${recommendColor(entry.recommend)}`}>
                  {entry.recommend}
                </span>
              )}
              {entry.relevancy_score != null && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${relevancyColor(entry.relevancy_score)}`}>
                  {entry.relevancy_score}/10
                </span>
              )}
              {entry.confidence && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {entry.confidence} confidence
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none p-1"
          >
            &times;
          </button>
        </div>

        <div className="px-5 pb-8 divide-y divide-gray-100">
          <Section label="Summary">
            <p className="text-sm text-gray-700 leading-relaxed">{entry.summary}</p>
          </Section>

          {entry.verdict && (
            <Section label="Verdict">
              <p className="text-sm text-gray-700">{entry.verdict}</p>
            </Section>
          )}

          {(whatWorks.length > 0 || whatDoesnt.length > 0) && (
            <div className="py-3 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">
                  What works
                </h4>
                <ul className="space-y-1">
                  {whatWorks.map((w, i) => (
                    <li key={i} className="text-sm text-gray-700">- {w}</li>
                  ))}
                  {whatWorks.length === 0 && <li className="text-sm text-gray-400">-</li>}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1.5">
                  What doesn't
                </h4>
                <ul className="space-y-1">
                  {whatDoesnt.map((w, i) => (
                    <li key={i} className="text-sm text-gray-700">- {w}</li>
                  ))}
                  {whatDoesnt.length === 0 && <li className="text-sm text-gray-400">-</li>}
                </ul>
              </div>
            </div>
          )}

          {entry.who_it_works_for && (
            <Section label="Who it works for">
              <p className="text-sm text-gray-700">{entry.who_it_works_for}</p>
            </Section>
          )}

          {prerequisites.length > 0 && (
            <Section label="Prerequisites">
              <ul className="space-y-1">
                {prerequisites.map((p, i) => (
                  <li key={i} className="text-sm text-gray-700">- {p}</li>
                ))}
              </ul>
            </Section>
          )}

          {entry.next_step && (
            <Section label="Next step">
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-blue-900">{entry.next_step}</p>
              </div>
            </Section>
          )}

          {entry.already_doing && (
            <Section label="Already doing">
              <p className="text-sm text-gray-700">{entry.already_doing}</p>
            </Section>
          )}

          {warnings.length > 0 && (
            <Section label="Warnings">
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-red-700 bg-red-50 rounded px-2 py-1">{w}</li>
                ))}
              </ul>
            </Section>
          )}

          {tools.length > 0 && (
            <Section label="Tools">
              <div className="flex flex-wrap gap-1.5">
                {tools.map((t, i) => (
                  <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </Section>
          )}

          {brandRelevance.length > 0 && (
            <Section label="Brand relevance">
              <div className="flex flex-wrap gap-1.5">
                {brandRelevance.map((b, i) => (
                  <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">{b}</span>
                ))}
              </div>
            </Section>
          )}

          <div className="py-3 flex items-center gap-3 flex-wrap">
            {entry.difficulty && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                {entry.difficulty}
              </span>
            )}
            {entry.time_to_implement && (
              <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
                {entry.time_to_implement}
              </span>
            )}
            {entry.content_type && (
              <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">
                {entry.content_type}
              </span>
            )}
          </div>

          {entry.url && (
            <div className="py-3">
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                View original &rarr;
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EntryCard({ entry }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const platformClass = platformColors[entry.platform?.toLowerCase()] || platformColors.default;

  function handleCopy(type, e) {
    e.stopPropagation();
    if (type === "plain") copyPlain(entry);
    else copyForClaude(entry);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:border-gray-300 transition-colors p-4"
        onClick={() => setDrawerOpen(true)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug flex-1">
            {entry.title || "Untitled"}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {entry.relevancy_score != null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${relevancyColor(entry.relevancy_score)}`}>
                {entry.relevancy_score}
              </span>
            )}
            {entry.recommend && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${recommendColor(entry.recommend)}`}>
                {entry.recommend}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-1 mb-3">
          {entry.summary}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${platformClass}`}>
              {entry.platform || "unknown"}
            </span>
            <span className="text-xs text-gray-400">{formatDate(entry.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => handleCopy("plain", e)}
              className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              {copied === "plain" ? "Copied" : "Copy"}
            </button>
            <button
              onClick={(e) => handleCopy("claude", e)}
              className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              {copied === "claude" ? "Copied" : "Copy for Claude"}
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <DetailDrawer entry={entry} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
}
