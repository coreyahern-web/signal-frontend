const tabs = [
  { id: "feed", label: "Feed", icon: "📡" },
  { id: "search", label: "Search", icon: "🔍" },
  { id: "tasks", label: "Tasks", icon: "✅" },
];

export default function Nav({ active, onChange }) {
  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center gap-1 px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <span className="font-bold text-gray-900 mr-6 text-sm tracking-tight">
          Signal
        </span>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active === tab.id
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              active === tab.id ? "text-gray-900" : "text-gray-400"
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}
