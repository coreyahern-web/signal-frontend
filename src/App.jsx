import { useState } from "react";
import Nav from "./components/Nav";
import Feed from "./components/Feed";
import Search from "./components/Search";
import Tasks from "./components/Tasks";

export default function App() {
  const [tab, setTab] = useState("feed");

  return (
    <div className="flex flex-col h-svh bg-gray-50">
      <Nav active={tab} onChange={setTab} />

      <main className="flex-1 overflow-hidden">
        {tab === "feed" && <Feed />}
        {tab === "search" && <Search />}
        {tab === "tasks" && <Tasks />}
      </main>
    </div>
  );
}
