import { Link, NavLink } from "react-router";

const links = [
  { to: "/home", label: "Home" },
  { to: "/knots", label: "Knots" },
  { to: "/info", label: "Info" },
  { to: "/profile", label: "Profile" },
];

export function SideDrawer({ onClose }: { onClose: () => void }) {
  return (
    <nav className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-neutral-800 bg-[#101010]">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          to="/home"
          onClick={onClose}
          className="text-sm font-medium text-white"
        >
          knots
        </Link>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="text-neutral-400 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <ul className="border-t border-neutral-800">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm ${isActive ? "text-white" : "text-neutral-400"}`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
