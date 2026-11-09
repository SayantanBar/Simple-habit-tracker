import { Habit, DayLog, NoteItem, DaySnapshot } from '../types';

const HABITS_KEY = 'daypulse_habits_v2';
const DAYS_KEY = 'daypulse_day_logs_v2';
const NOTES_KEY = 'daypulse_notes_v1';

export const DEFAULT_HABITS: Habit[] = [
  { id: 'h-sleep', name: 'Sleep 8 Hours', icon: '🛏️', order: 1, createdAt: '2026-10-01T00:00:00.000Z' },
  { id: 'h-nutrition', name: 'Healthy Nutrition', icon: '🍴', order: 2, createdAt: '2026-10-01T00:00:00.000Z' },
  { id: 'h-walk', name: 'Morning Walk / Exercise', icon: '🚶', order: 3, createdAt: '2026-10-01T00:00:00.000Z' },
  { id: 'h-study', name: 'Morning Kubernetes Lecture', icon: '📓', order: 4, createdAt: '2026-10-01T00:00:00.000Z' },
  { id: 'h-problems', name: 'Solve escbash.com problems', icon: '🏋️', order: 5, createdAt: '2026-10-01T00:00:00.000Z' },
  { id: 'h-water', name: 'Hydration 2.5L Water', icon: '💧', order: 6, createdAt: '2026-10-01T00:00:00.000Z' },
];

export function formatDateString(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayIso(): string {
  return formatIsoDate(new Date());
}

export function getTomorrowIso(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatIsoDate(tomorrow);
}

export const DEFAULT_DAYS: DayLog[] = [
  {
    id: '2026-11-09',
    dateFormatted: 'November 9, 2026',
    checks: {
      'h-nutrition': true,
      'h-problems': true,
    },
    snapshot: {
      percentage: 33,
      completedCount: 2,
      totalHabitsCount: 6,
      activeHabitIds: ['h-sleep', 'h-nutrition', 'h-walk', 'h-study', 'h-problems', 'h-water'],
      savedAt: '2026-11-09T08:00:00.000Z',
    },
    createdAt: new Date('2026-11-09T00:05:00').toISOString(),
  },
  {
    id: '2026-11-08',
    dateFormatted: 'November 8, 2026',
    checks: {
      'h-sleep': true,
      'h-nutrition': true,
      'h-walk': true,
      'h-study': true,
    },
    snapshot: {
      percentage: 67,
      completedCount: 4,
      totalHabitsCount: 6,
      activeHabitIds: ['h-sleep', 'h-nutrition', 'h-walk', 'h-study', 'h-problems', 'h-water'],
      savedAt: '2026-11-08T23:59:00.000Z',
    },
    createdAt: new Date('2026-11-08T00:05:00').toISOString(),
  },
  {
    id: '2026-11-06',
    dateFormatted: 'November 6, 2026',
    checks: {
      'h-sleep': true,
      'h-nutrition': true,
      'h-walk': true,
      'h-study': true,
      'h-water': true,
    },
    snapshot: {
      percentage: 83,
      completedCount: 5,
      totalHabitsCount: 6,
      activeHabitIds: ['h-sleep', 'h-nutrition', 'h-walk', 'h-study', 'h-problems', 'h-water'],
      savedAt: '2026-11-06T23:59:00.000Z',
    },
    createdAt: new Date('2026-11-06T00:05:00').toISOString(),
  },
  {
    id: '2026-10-30', // 10 days back from Nov 9
    dateFormatted: 'October 30, 2026',
    checks: {
      'h-sleep': true,
      'h-walk': true,
      'h-study': true,
    },
    snapshot: {
      percentage: 50,
      completedCount: 3,
      totalHabitsCount: 6,
      activeHabitIds: ['h-sleep', 'h-nutrition', 'h-walk', 'h-study', 'h-problems', 'h-water'],
      savedAt: '2026-10-30T23:59:00.000Z',
    },
    createdAt: new Date('2026-10-30T00:05:00').toISOString(),
  },
];

export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'n-1',
    text: 'Activate the automatic cat feeder and buy new cans of tuna.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-2',
    text: 'Check to make sure everything is in place',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-3',
    text: 'Not forget to put my winter playlist in my official library and get all the songs saved in case of stockage loss',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-4',
    text: 'To lock the front and back doors',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-5',
    text: 'Book the restaurant table and prepare surprise for my friends.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export function isHabitEligibleForDay(habit: Habit, dayId: string): boolean {
  if (!habit.createdAt) return true;
  const habitCreationDate = habit.createdAt.slice(0, 10);
  // Habit must have been created on or before this day
  return habitCreationDate <= dayId;
}

/**
 * Calculates completion progress for a given day log.
 * If day is in the past and has an existing snapshot, returns the frozen snapshot.
 * Otherwise, calculates against habits that existed on or before that day.
 */
export function calculateProgress(dayLog: DayLog, habits: Habit[]): {
  percentage: number;
  completedCount: number;
  totalCount: number;
} {
  const todayIso = getTodayIso();
  const isPastDay = dayLog.id < todayIso;

  // If this past day already has a frozen snapshot, preserve it forever!
  if (isPastDay && dayLog.snapshot) {
    return {
      percentage: dayLog.snapshot.percentage,
      completedCount: dayLog.snapshot.completedCount,
      totalCount: dayLog.snapshot.totalHabitsCount,
    };
  }

  // Filter to habits that were available on or before this day
  const eligibleHabits = habits.filter((h) => isHabitEligibleForDay(h, dayLog.id));

  if (eligibleHabits.length === 0) {
    return { percentage: 0, completedCount: 0, totalCount: 0 };
  }

  const completedCount = eligibleHabits.reduce((acc, habit) => {
    return dayLog.checks[habit.id] ? acc + 1 : acc;
  }, 0);

  const percentage = Math.round((completedCount / eligibleHabits.length) * 100);
  return { percentage, completedCount, totalCount: eligibleHabits.length };
}

/**
 * Creates/updates a frozen snapshot for a day log based on currently eligible habits.
 */
export function createDaySnapshot(dayLog: DayLog, habits: Habit[]): DaySnapshot {
  const eligibleHabits = habits.filter((h) => isHabitEligibleForDay(h, dayLog.id));
  const completedCount = eligibleHabits.reduce((acc, habit) => {
    return dayLog.checks[habit.id] ? acc + 1 : acc;
  }, 0);

  const percentage = eligibleHabits.length > 0 
    ? Math.round((completedCount / eligibleHabits.length) * 100)
    : 0;

  return {
    percentage,
    completedCount,
    totalHabitsCount: eligibleHabits.length,
    activeHabitIds: eligibleHabits.map((h) => h.id),
    savedAt: new Date().toISOString(),
  };
}

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) {
      // Migrate from v1 if present
      const v1 = localStorage.getItem('daypulse_habits_v1');
      if (v1) {
        const parsedV1 = JSON.parse(v1);
        return parsedV1.map((h: any) => ({
          ...h,
          createdAt: h.createdAt || '2026-10-01T00:00:00.000Z',
        }));
      }
      return DEFAULT_HABITS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map((h) => ({ ...h, createdAt: h.createdAt || '2026-10-01T00:00:00.000Z' }))
      : DEFAULT_HABITS;
  } catch {
    return DEFAULT_HABITS;
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (err) {
    console.error('Failed to save habits to localStorage:', err);
  }
}

export function loadDayLogs(): DayLog[] {
  try {
    const raw = localStorage.getItem(DAYS_KEY);
    if (!raw) {
      // Migrate from v1 if present
      const v1 = localStorage.getItem('daypulse_day_logs_v1');
      if (v1) {
        const parsedV1 = JSON.parse(v1);
        return parsedV1.map((d: any) => ({
          ...d,
          snapshot: d.snapshot || createDaySnapshot(d, DEFAULT_HABITS),
        }));
      }
      return DEFAULT_DAYS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DAYS;
  } catch {
    return DEFAULT_DAYS;
  }
}

export function saveDayLogs(dayLogs: DayLog[]): void {
  try {
    localStorage.setItem(DAYS_KEY, JSON.stringify(dayLogs));
  } catch (err) {
    console.error('Failed to save day logs to localStorage:', err);
  }
}

export function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return DEFAULT_NOTES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NOTES;
  } catch {
    return DEFAULT_NOTES;
  }
}

export function saveNotes(notes: NoteItem[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to localStorage:', err);
  }
}
