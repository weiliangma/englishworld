import { create } from 'zustand';

interface UserState {
  level: number;
  experience: number;
  coins: number;
  streak: number;
  totalQuestions: number;
  correctQuestions: number;
  setStats: (stats: Partial<UserState>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  level: 1,
  experience: 0,
  coins: 50,
  streak: 0,
  totalQuestions: 0,
  correctQuestions: 0,
  setStats: (stats) => set(stats),
}));

interface GameState {
  combo: number;
  currentCoins: number;
  incrementCombo: () => void;
  resetCombo: () => void;
  addCoins: (amount: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  combo: 0,
  currentCoins: 0,
  incrementCombo: () => set((s) => ({ combo: s.combo + 1 })),
  resetCombo: () => set({ combo: 0 }),
  addCoins: (amount) => set((s) => ({ currentCoins: s.currentCoins + amount })),
}));
