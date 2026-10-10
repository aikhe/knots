import { useEffect, useRef, useState, type ReactNode } from "react";
import { Outlet } from "react-router";
import { motion } from "motion/react";
import { useMutation, useAction } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { BottomNav } from "../../components/BottomNav/BottomNav";
import { ComposerSheet } from "../../components/Composer/ComposerSheet";
import { SideDrawer } from "../../components/SideDrawer/SideDrawer";
import { TopBar } from "../../components/TopBar/TopBar";
import { api } from "../../../../convex/_generated/api";

const DRAWER_WIDTH = 260;
const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// Keeps the users directory in sync for username search.
function EnsureUser() {
  const { user, isLoaded } = useUser();
  const ensure = useMutation(api.users.ensure);
  const syncAvatar = useAction(api.users.syncAvatar);
  const tried = useRef("");
  useEffect(() => {
    if (!isLoaded || !user) return;
    const base = (
      user.username ??
      user.primaryEmailAddress?.emailAddress.split("@")[0] ??
      ""
    ).toLowerCase();
    if (!base || tried.current === user.id + base) return;
    tried.current = user.id + base;
    ensure({ username: base })
      .catch(() => {
        ensure({
          username: `${base}_${user.id.slice(-4).toLowerCase()}`,
        }).catch(() => {});
      })
      .finally(() => {
        syncAvatar().catch(() => {});
      });
  }, [isLoaded, user, ensure, syncAvatar]);
  return null;
}

// Bare phone frame without bars or drawer, for fullscreen flows
// like onboarding.
export function BareScreen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-black sm:flex sm:items-center sm:justify-center sm:bg-white sm:py-6">
      <div className="min-h-dvh w-full overflow-hidden bg-[#101010] sm:min-h-0 sm:h-[min(852px,calc(100dvh-3rem))] sm:w-[393px] sm:rounded-[2.5rem] sm:border sm:border-neutral-800 sm:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// Phone-width column: full-bleed on small screens, centered framed
// column on desktop. The drawer pushes the page aside when open.
export function MobileScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-dvh bg-black sm:flex sm:items-center sm:justify-center sm:bg-white sm:py-6">
      {clerkConfigured ? <EnsureUser /> : null}
      <div className="relative min-h-dvh w-full overflow-hidden bg-[#101010] sm:min-h-0 sm:h-[min(852px,calc(100dvh-3rem))] sm:w-[393px] sm:rounded-[2.5rem] sm:border sm:border-neutral-800">
        <SideDrawer open={drawerOpen} onClose={closeDrawer} />
        <motion.div
          animate={{ x: drawerOpen ? DRAWER_WIDTH : 0 }}
          transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          onClick={() => {
            if (drawerOpen) closeDrawer();
          }}
          className="relative flex min-h-dvh w-full flex-col bg-[#101010] sm:min-h-0 sm:h-full"
        >
          <TopBar onMenuClick={() => setDrawerOpen((v) => !v)} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </div>
          <BottomNav />
        </motion.div>
        <ComposerSheet />
      </div>
    </div>
  );
}
