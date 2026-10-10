import { useState } from "react";
import { Link } from "react-router";
import { useUIStore } from "../../../store";
import { useTopBarStreak, useTopBarVariant } from "./useTopBar";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const variant = useTopBarVariant();
  const streak = useTopBarStreak();

  return (
    <header className="bg-[#101010]">
      <div className="flex items-center justify-between px-4 pb-4 pt-6">
        {variant === "profile" ? (
          <button aria-label="Streak" className="flex items-center gap-1 text-neutral-300 hover:text-white">
            <img src="/MajesticonsFireLine.svg" alt="" className="h-7 w-7 invert opacity-70" />
            {streak !== undefined && (
              <span className="text-base text-white opacity-70">{streak}</span>
            )}
          </button>
        ) : (
          <button
            onClick={onMenuClick}
            aria-label="Menu"
            className="text-neutral-300 hover:text-white"
          >
            <img src="/MajesticonsMenuAlt.svg" alt="" className="h-6 w-6 invert scale-y-[0.85]" />
          </button>
        )}
        <Link to="/home" aria-label="knots home" className="hidden">
          <img src="/knots-wordmark.svg" alt="knots" className="h-6 w-auto" />
        </Link>
        {variant === "profile" ? (
          <button aria-label="Settings" className="text-neutral-300 hover:text-white">
            <img src="/MajesticonsCogLine.svg" alt="" className="h-7 w-7 invert opacity-70" />
          </button>
        ) : searchOpen ? (
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              if (!searchQuery.trim()) setSearchOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchOpen(false);
            }}
            placeholder="Search"
            autoFocus
            aria-label="Search"
            className="w-full bg-transparent text-right text-sm text-white outline-none"
          />
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="text-neutral-300 hover:text-white"
          >
            <img src="/MajesticonsSearchLine.svg" alt="" className="h-7 w-7 invert opacity-70" />
          </button>
        )}
      </div>
    </header>
  );
}
