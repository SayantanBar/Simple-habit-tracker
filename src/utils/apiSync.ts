import { Habit, DayLog, NoteItem } from '../types';

export async function syncToBackend(
  habits: Habit[],
  dayLogs: DayLog[],
  notes: NoteItem[]
): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habits,
        dayLogs,
        notes,
        updatedAt: new Date().toISOString(),
      }),
    });
  } catch {
    // If backend is unreachable or offline, local storage has already saved synchronously
  }
}

export async function fetchFromBackend(): Promise<{
  habits?: Habit[];
  dayLogs?: DayLog[];
  notes?: NoteItem[];
} | null> {
  try {
    const res = await fetch('/api/db');
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}
