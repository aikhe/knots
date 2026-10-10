import { NavLink, useLocation } from "react-router";
import type { ComponentType } from "react";
import { useUIStore } from "../../../store";

function HomeGlyph({ active }: { active?: boolean }) {
  return (
    <img
      src="/home.svg"
      alt=""
      className={`h-[18px] w-[18px] invert ${active ? "" : "opacity-40"}`}
    />
  );
}

function KnotGlyph({ active }: { active?: boolean }) {
  return (
    <img
      src="/knot.svg"
      alt=""
      className={`h-[22px] w-auto ${active ? "" : "opacity-40"}`}
    />
  );
}

function ApplicationsGlyph({ active }: { active?: boolean }) {
  return (
    <img
      src="/MajesticonsApplications.svg"
      alt=""
      className={`h-6 w-6 invert ${active ? "" : "opacity-40"}`}
    />
  );
}

function UserGlyph({ active }: { active?: boolean }) {
  return (
    <img
      src="/MajesticonsUser.svg"
      alt=""
      className={`h-6 w-6 invert ${active ? "" : "opacity-40"}`}
    />
  );
}

// pill dock with separate circular action, per reference layout
const tabs = [
  { to: "/home", label: "Home", Icon: HomeGlyph },
  { to: "/knots", label: "Knots", Icon: KnotGlyph },
  { to: "/info", label: "Info", Icon: ApplicationsGlyph },
  { to: "/profile", label: "Profile", Icon: UserGlyph },
];

function Tab({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: ComponentType<{ active?: boolean }>;
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `flex h-14 w-16 items-center justify-center rounded-full ${isActive ? "bg-neutral-700 text-white" : "text-neutral-500"}`
      }
    >
      {({ isActive }) => <Icon active={isActive} />}
    </NavLink>
  );
}

export function BottomNav() {
  const setComposerOpen = useUIStore((s) => s.setComposerOpen);
  const setComposerMode = useUIStore((s) => s.setComposerMode);
  const location = useLocation();

  return (
    <nav className="bg-transparent px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-center gap-2">
        <ul className="flex items-center justify-center rounded-full bg-neutral-800">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <Tab to={tab.to} label={tab.label} Icon={tab.Icon} />
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            setComposerMode(
              location.pathname.startsWith("/knots") ? "knot" : "post",
            );
            setComposerOpen(true);
          }}
          aria-label="Add"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-black"
        >
          <img src="/plus.svg" alt="" className="h-5 w-5 invert" />
        </button>
      </div>
    </nav>
  );
}
