import { create } from "zustand";

type UIState = {
  showCompletedOnly: boolean;
  toggleCompletedOnly: () => void;
};

export const useUIStore = create<UIState>()((set) => ({
  showCompletedOnly: false,
  toggleCompletedOnly: () =>
    set((s) => ({ showCompletedOnly: !s.showCompletedOnly })),
}));
