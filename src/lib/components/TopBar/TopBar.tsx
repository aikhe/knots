import { useState } from "react";
import { Link } from "react-router";
import { useUIStore } from "../../../store";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  return (
    <header className="bg-[#101010]">
      <div className="flex items-center justify-between px-4 pb-4 pt-6">
        <button
          onClick={onMenuClick}
          aria-label="Menu"
          className="text-neutral-300 hover:text-white"
        >
          <img src="/MajesticonsMenuAlt.svg" alt="" className="h-6 w-6 invert scale-y-[0.85]" />
        </button>
        <Link to="/home" aria-label="knots home" className="hidden">
          <img src="/knots-wordmark.svg" alt="knots" className="h-6 w-auto" />
        </Link>
        <button
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Search"
          className="text-neutral-300 hover:text-white"
        >
          <img src="/MajesticonsSearchLine.svg" alt="" className="h-7 w-7 invert opacity-70" />
        </button>
      </div>
      {searchOpen && (
        <div className="border-t border-neutral-800 px-3 py-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            autoFocus
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-white"
          />
        </div>
      )}
    </header>
  );
}
