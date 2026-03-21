import Nav from "./components/Nav";
import Feed from "./components/Feed";

export default function App() {
  return (
    <div className="flex flex-col h-svh bg-gray-50">
      <Nav />
      <main className="flex-1 overflow-hidden">
        <Feed />
      </main>
    </div>
  );
}
