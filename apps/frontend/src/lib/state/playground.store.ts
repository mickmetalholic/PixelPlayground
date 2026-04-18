import { create } from 'zustand';

type PlaygroundState = {
  readonly count: number;
  increment: () => void;
  reset: () => void;
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set(() => ({ count: 0 })),
}));
