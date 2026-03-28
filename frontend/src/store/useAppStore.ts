/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'

interface AppState {
  user: { name: string; email: string } | null;
  setUser: (user: any) => void;
  isLoadingGlobal: boolean;
  setLoadingGlobal: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: { name: "Danh", email: "danh@example.com" }, // Fake data tạm thời
  setUser: (user) => set({ user }),
  isLoadingGlobal: false,
  setLoadingGlobal: (status) => set({ isLoadingGlobal: status }),
}))