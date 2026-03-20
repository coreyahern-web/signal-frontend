import { useState } from "react";

const platformColors = {
  instagram: "bg-pink-100 text-pink-700",
  youtube: "bg-red-100 text-red-700",
  tiktok: "bg-purple-100 text-purple-700",
  twitter: "bg-sky-100 text-sky-700",
  x: "bg-sky-100 text-sky-700",
  default: "bg-gray-100 text-gray-700",
};

function PlatformBadge({ platform }) {
  const colorClass = platformColors[platform?.toLowerCase()] || platformColors.default;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
      {platform || "unknown"}
    </span>
  );
}

function Tag({ label }) {
  return (
    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}

export default function EntryCard({ entry }) {
  const [expanded, setExpanded] = useState(false);

  const analysis = entry.analysis || {};
  const steps = analysis.steps || [];
  const tasks = analysis.tasks || [];
  const tools = analysis.tools_mentioned || [];
  const concepts = analysis.key_concepts || [];
  const warnings = analysis.warnings || [];
  const tags = analysis.tags || [];

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Collapsed header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug flex-1">
            {entry.title || "Untitled"}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <PlatformBadge platform={entry.platform} />
            <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-2">
          {entry.suggested_topic && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {entry.suggested_topic}
            </span>
          )}
          {entry.suggested_subtopic && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              {entry.suggested_subtopic}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {entry.summary}
        </p>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Steps */}
          {steps.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Steps
              </h4>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="font-bold text-gray-400 flex-shrink-0 w-5">
                      {i + 1}.
                    </span>
                    <div>
                      <span className="font-semibold text-gray-800">
                        {step.action}
                      </span>
                      {step.detail && (
                        <span className="text-gray-600"> — {step.detail}</span>
                      )}
                      {step.tool && (
                        <span className="ml-1 text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                          {step.tool}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Tasks
              </h4>
              <ul className="space-y-1">
                {tasks.map((task, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    {task}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Key Concepts */}
          {concepts.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Key Concepts
              </h4>
              <ul className="space-y-1">
                {concepts.map((c, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {typeof c === "string" ? (
                      c
                    ) : (
                      <>
                        <span className="font-medium">{c.concept}</span>
                        {c.explanation && (
                          <span className="text-gray-500"> — {c.explanation}</span>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
                Warnings
              </h4>
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-red-700 bg-red-50 rounded px-2 py-1">
                    {w}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tools mentioned */}
          {tools.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Tools
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, i) => (
                <Tag key={i} label={tag} />
              ))}
            </div>
          )}

          {/* Transcript snippet */}
          {entry.transcript_snippet && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Transcript
              </h4>
              <p className="text-xs text-gray-500 bg-gray-50 rounded p-2 leading-relaxed line-clamp-6">
                {entry.transcript_snippet}
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
