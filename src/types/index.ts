export interface Habit {
  id: string;
  name: string;
  icon: string;
  category?: string;
  order: number;
  createdAt: string; // ISO timestamp to determine availability across dates
}

export interface DaySnapshot {
  percentage: number;
  completedCount: number;
  totalHabitsCount: number;
  activeHabitIds: string[];
  savedAt: string;
}

export interface DayLog {
  id: string; // ISO date string YYYY-MM-DD
  dateFormatted: string; // e.g. "November 8, 2026"
  checks: Record<string, boolean>; // habitId -> boolean
  snapshot?: DaySnapshot; // Immutable snapshot for past dates
  createdAt: string;
}

export interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface HabitStats {
  totalDays: number;
  completedTodayCount: number;
  totalHabitsCount: number;
  todayPercentage: number;
  currentStreak: number;
}
