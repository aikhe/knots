import { useState } from "react";
import { Link } from "react-router";
import { useUIStore } from "../../../store";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13.5 13.5 17 17" strokeLinecap="round" />
    </svg>
  );
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  return (
    <header className="border-b border-neutral-800 bg-[#101010]">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          aria-label="Menu"
          className="text-neutral-300 hover:text-white"
        >
          <MenuIcon />
        </button>
        <Link to="/home" aria-label="knots home">
          <img src="/knots-wordmark.svg" alt="knots" className="h-4 w-auto" />
        </Link>
        <button
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Search"
          className="text-neutral-300 hover:text-white"
        >
          <SearchIcon />
        </button>
      </div>
      {searchOpen && (
        <div className="border-t border-neutral-800 px-4 py-2">
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
