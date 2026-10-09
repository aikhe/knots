import { NavLink, useLocation } from "react-router";
import { useUIStore } from "../../../store";

const tabs = [
  { to: "/home", label: "Home" },
  { to: "/knots", label: "Knots" },
];

const tabsRight = [
  { to: "/info", label: "Info" },
  { to: "/profile", label: "Profile" },
];

function Tab({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block py-3 text-center text-sm ${isActive ? "text-white" : "text-neutral-500"}`
      }
    >
      {label}
    </NavLink>
  );
}

export function BottomNav() {
  const setComposerOpen = useUIStore((s) => s.setComposerOpen);
  const setComposerMode = useUIStore((s) => s.setComposerMode);
  const location = useLocation();

  return (
    <nav className="border-t border-neutral-800 bg-[#101010]">
      <ul className="flex items-center">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <Tab to={tab.to} label={tab.label} />
          </li>
        ))}
        <li className="flex-1">
          <div className="flex justify-center">
            <button
              onClick={() => {
                setComposerMode(
                  location.pathname.startsWith("/knots") ? "knot" : "post",
                );
                setComposerOpen(true);
              }}
              aria-label="Add"
              className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </li>
        {tabsRight.map((tab) => (
          <li key={tab.to} className="flex-1">
            <Tab to={tab.to} label={tab.label} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
