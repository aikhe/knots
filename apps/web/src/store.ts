import { create } from "zustand";

type UIState = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  composerOpen: boolean;
  setComposerOpen: (open: boolean) => void;
  composerMode: "post" | "knot";
  setComposerMode: (mode: "post" | "knot") => void;
};

export const useUIStore = create<UIState>()((set) => ({
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  composerOpen: false,
  setComposerOpen: (open) => set({ composerOpen: open }),
  composerMode: "post",
  setComposerMode: (mode) => set({ composerMode: mode }),
}));
