import { motion } from "motion/react";
import { Link, NavLink } from "react-router";

const links = [
  { to: "/home", label: "Home" },
  { to: "/knots", label: "Knots" },
  { to: "/info", label: "Info" },
  { to: "/profile", label: "Profile" },
];

export function SideDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <motion.nav
      initial={false}
      animate={{ scale: open ? 1 : 0.97, opacity: open ? 1 : 0.8 }}
      transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
      style={{ transformOrigin: "left center" }}
      className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-neutral-800 bg-[#101010]"
    >
      <div className="px-4 py-3">
        <Link
          to="/home"
          onClick={onClose}
          className="text-sm font-medium text-white"
        >
          knots
        </Link>
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
    </motion.nav>
  );
}
