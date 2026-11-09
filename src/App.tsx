import React, { useState, useEffect } from 'react';
import { 
  Habit, 
  DayLog, 
  NoteItem 
} from './types';
import { 
  loadHabits, 
  saveHabits, 
  loadDayLogs, 
  saveDayLogs, 
  loadNotes, 
  saveNotes, 
  calculateProgress,
  formatDateString,
  getTodayIso,
  createDaySnapshot,
  DEFAULT_HABITS,
  DEFAULT_NOTES
} from './utils/storage';
import { HabitTrackerTable } from './components/HabitTrackerTable';
import { HabitListCard } from './components/HabitListCard';
import { NotesCard } from './components/NotesCard';
import { ProgressCalendar } from './components/ProgressCalendar';
import { AddHabitModal } from './components/AddHabitModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { syncToBackend, fetchFromBackend } from './utils/apiSync';
import { 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [dayLogs, setDayLogs] = useState<DayLog[]>(() => loadDayLogs());
  const [notes, setNotes] = useState<NoteItem[]>(() => loadNotes());
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveDayLogs(dayLogs);
  }, [dayLogs]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Hydrate from backend persistent volume on mount if available
  useEffect(() => {
    fetchFromBackend().then((remoteData) => {
      if (remoteData) {
        if (Array.isArray(remoteData.habits)) {
          setHabits(remoteData.habits);
          saveHabits(remoteData.habits);
        }
        if (Array.isArray(remoteData.dayLogs)) {
          setDayLogs(remoteData.dayLogs);
          saveDayLogs(remoteData.dayLogs);
        }
        if (Array.isArray(remoteData.notes)) {
          setNotes(remoteData.notes);
          saveNotes(remoteData.notes);
        }
      }
    });
  }, []);

  // Ensure dark class is present on root HTML
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Toggle habit check for a specific day with instant synchronous persistence
  const handleToggleCheck = (dayId: string, habitId: string) => {
    setDayLogs((prev) => {
      const next = prev.map((day) => {
        if (day.id === dayId) {
          const currentVal = !!day.checks[habitId];
          const nextChecks = {
            ...day.checks,
            [habitId]: !currentVal,
          };
          const updatedDay: DayLog = {
            ...day,
            checks: nextChecks,
          };
          return {
            ...updatedDay,
            snapshot: createDaySnapshot(updatedDay, habits),
          };
        }
        return day;
      });
      // Synchronous local write + backend sync: zero data loss on immediate reload
      saveDayLogs(next);
      syncToBackend(habits, next, notes);
      return next;
    });
  };

  // Add a new day (e.g. today or tomorrow after midnight)
  const handleAddDay = (isoDate: string, formattedString: string) => {
    setDayLogs((prev) => {
      if (prev.some((d) => d.id === isoDate)) {
        return prev;
      }
      const newDay: DayLog = {
        id: isoDate,
        dateFormatted: formattedString,
        checks: {},
        createdAt: new Date().toISOString(),
      };
      newDay.snapshot = createDaySnapshot(newDay, habits);
      const next = [newDay, ...prev];
      saveDayLogs(next);
      syncToBackend(habits, next, notes);
      return next;
    });
  };

  // Delete a day
  const handleDeleteDay = (dayId: string) => {
    setDayLogs((prev) => {
      const next = prev.filter((d) => d.id !== dayId);
      saveDayLogs(next);
      syncToBackend(habits, next, notes);
      return next;
    });
  };

  // Add a new habit (creates a column in the tracker table!)
  const handleAddHabit = (name: string, icon: string) => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name,
      icon,
      order: habits.length + 1,
      createdAt: new Date().toISOString(),
    };
    const nextHabits = [...habits, newHabit];
    setHabits(nextHabits);
    saveHabits(nextHabits);
    syncToBackend(nextHabits, dayLogs, notes);
  };

  // Edit habit
  const handleUpdateHabit = (id: string, name: string, icon: string) => {
    const nextHabits = habits.map((h) => (h.id === id ? { ...h, name, icon } : h));
    setHabits(nextHabits);
    saveHabits(nextHabits);
    syncToBackend(nextHabits, dayLogs, notes);
  };

  // Delete habit
  const handleDeleteHabit = (id: string) => {
    const nextHabits = habits.filter((h) => h.id !== id);
    const nextDays = dayLogs.map((day) => {
      const nextChecks = { ...day.checks };
      delete nextChecks[id];
      return {
        ...day,
        checks: nextChecks,
      };
    });
    setHabits(nextHabits);
    setDayLogs(nextDays);
    saveHabits(nextHabits);
    saveDayLogs(nextDays);
    syncToBackend(nextHabits, nextDays, notes);
  };

  // Note actions with instant persistence
  const handleAddNote = (text: string) => {
    const newNote: NoteItem = {
      id: `n-${Date.now()}`,
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const nextNotes = [...notes, newNote];
    setNotes(nextNotes);
    saveNotes(nextNotes);
    syncToBackend(habits, dayLogs, nextNotes);
  };

  const handleToggleNote = (id: string) => {
    const nextNotes = notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n));
    setNotes(nextNotes);
    saveNotes(nextNotes);
    syncToBackend(habits, dayLogs, nextNotes);
  };

  const handleUpdateNote = (id: string, text: string) => {
    const nextNotes = notes.map((n) => (n.id === id ? { ...n, text } : n));
    setNotes(nextNotes);
    saveNotes(nextNotes);
    syncToBackend(habits, dayLogs, nextNotes);
  };

  const handleDeleteNote = (id: string) => {
    const nextNotes = notes.filter((n) => n.id !== id);
    setNotes(nextNotes);
    saveNotes(nextNotes);
    syncToBackend(habits, dayLogs, nextNotes);
  };

  // Reset: Clears Habit List and Notes to completely blank, preserves Progress History
  const handleConfirmReset = () => {
    setHabits([]);
    setNotes([]);
    saveHabits([]);
    saveNotes([]);
    syncToBackend([], dayLogs, []);
  };

  // Calculate today's progress summary
  const todayIso = getTodayIso();
  const todayLog = dayLogs.find((d) => d.id === todayIso);
  const todayProgress = todayLog 
    ? calculateProgress(todayLog, habits) 
    : { percentage: 0, completedCount: 0, totalCount: habits.length };

  return (
    <div className="min-h-screen bg-[#141414] text-[#E0E0E0]">
      {/* Top Application Bar */}
      <header className="border-b border-[#262626] bg-[#181818] sticky top-0 z-20 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white select-none">
              Simple Habit Tracker
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Today quick summary badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tabular-nums border bg-[#202020] border-[#303030] text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Today: {todayProgress.percentage}% ({todayProgress.completedCount}/{habits.length})</span>
            </div>

            {/* Reset Button (only resets Habit list and Notes & Daily TODOs with confirmation) */}
            <button
              onClick={() => setIsResetModalOpen(true)}
              title="Reset Habit list and Notes & Daily TODOs"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-[#282828] border border-[#333333] rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Two-Column Layout directly reflecting the user's uploaded screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Habit Tracker Table + Habit List */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Habit Tracker Table */}
            <HabitTrackerTable
              habits={habits}
              dayLogs={dayLogs}
              onToggleCheck={handleToggleCheck}
              onAddDay={handleAddDay}
              onDeleteDay={handleDeleteDay}
              onOpenAddHabit={() => setIsAddHabitModalOpen(true)}
            />

            {/* 2. Habit List Card */}
            <HabitListCard
              habits={habits}
              onAddHabit={handleAddHabit}
              onUpdateHabit={handleUpdateHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          </div>

          {/* Right Column: Notes & Daily TODOs + Progress History Calendar */}
          <div className="lg:col-span-4 space-y-6">
            <NotesCard
              notes={notes}
              onAddNote={handleAddNote}
              onToggleNote={handleToggleNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />

            <ProgressCalendar
              dayLogs={dayLogs}
              habits={habits}
              onSelectDayForTracker={handleAddDay}
            />
          </div>

        </div>
      </main>

      {/* Add Habit Column Modal */}
      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
        onAddHabit={handleAddHabit}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
