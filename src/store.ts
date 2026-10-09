import { create } from "zustand";

type UIState = {
  showCompletedOnly: boolean;
  toggleCompletedOnly: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  composerOpen: boolean;
  setComposerOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>()((set) => ({
  showCompletedOnly: false,
  toggleCompletedOnly: () =>
    set((s) => ({ showCompletedOnly: !s.showCompletedOnly })),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  composerOpen: false,
  setComposerOpen: (open) => set({ composerOpen: open }),
}));
