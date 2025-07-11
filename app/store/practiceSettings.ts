import { create } from "zustand";

interface PracticeSettingsState {
  minLength: number;
  maxLength: number;
  timeLimit: number;
  questionsPerSession: number;
  setMinLength: (v: number) => void;
  setMaxLength: (v: number) => void;
  setTimeLimit: (v: number) => void;
  setQuestionsPerSession: (v: number) => void;
}

export const usePracticeSettings = create<PracticeSettingsState>((set) => ({
  minLength: 3,
  maxLength: 8,
  timeLimit: 5 * 60 * 1000,
  questionsPerSession: 80,
  setMinLength: (v) => set({ minLength: v }),
  setMaxLength: (v) => set({ maxLength: v }),
  setTimeLimit: (v) => set({ timeLimit: v }),
  setQuestionsPerSession: (v) => set({ questionsPerSession: v }),
}));
