import React, { useState } from 'react';
import { 
  Table as TableIcon, 
  Plus, 
  Calendar, 
  Hourglass, 
  Search, 
  ArrowUpDown, 
  Trash2, 
  Check, 
  ChevronDown, 
  Sparkles 
} from 'lucide-react';
import { Habit, DayLog } from '../types';
import { calculateProgress, formatDateString, getTodayIso, getTomorrowIso, isHabitEligibleForDay } from '../utils/storage';

interface HabitTrackerTableProps {
  habits: Habit[];
  dayLogs: DayLog[];
  onToggleCheck: (dayId: string, habitId: string) => void;
  onAddDay: (dateString: string, formattedString: string) => void;
  onDeleteDay: (dayId: string) => void;
  onOpenAddHabit: () => void;
}

export const HabitTrackerTable: React.FC<HabitTrackerTableProps> = ({
  habits,
  dayLogs,
  onToggleCheck,
  onAddDay,
  onDeleteDay,
  onOpenAddHabit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showNewDayDropdown, setShowNewDayDropdown] = useState(false);
  const [customDate, setCustomDate] = useState('');

  // Filter and sort days
  const filteredDays = dayLogs
    .filter((day) => 
      day.dateFormatted.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.id.localeCompare(a.id);
      }
      return a.id.localeCompare(b.id);
    });

  const handleStartAddDay = (type: 'today' | 'tomorrow') => {
    setShowNewDayDropdown(false);
    if (type === 'today') {
      const todayDate = new Date();
      const iso = getTodayIso();
      onAddDay(iso, formatDateString(todayDate));
    } else if (type === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const iso = getTomorrowIso();
      onAddDay(iso, formatDateString(tomorrow));
    }
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) return;
    const parts = customDate.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      onAddDay(customDate, formatDateString(d));
      setCustomDate('');
      setShowNewDayDropdown(false);
    }
  };

  return (
    <div className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl overflow-hidden shadow-lg transition-colors">
      {/* Top Card Header */}
      <div className="px-5 py-3.5 border-b border-[#2E2E2E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4 opacity-80">
            <span className="w-1.5 h-1.5 bg-neutral-300 rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-300 rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-300 rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-300 rounded-[1px]"></span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-neutral-200">
            Habit Tracker
          </span>
        </div>
      </div>

      {/* Internal Toolbar (Notion styled) */}
      <div className="p-4 border-b border-[#282828] flex flex-wrap items-center justify-between gap-3 bg-[#1B1B1B]">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#282828] text-neutral-200 border border-[#363636] rounded-md text-xs font-medium shadow-xs">
            <TableIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>Habits</span>
          </div>
          <span className="text-xs text-neutral-500 font-mono tabular-nums">
            {habits.length} habits configured
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {showSearch ? (
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search day..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-36 sm:w-44 text-xs bg-[#262626] border border-[#3A3A3A] text-neutral-200 rounded px-2.5 py-1 focus:outline-none focus:border-neutral-400"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="ml-1 text-xs text-neutral-400 hover:text-neutral-200 px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              title="Search records"
              className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            title={`Sort order: ${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          {/* "+ New" blue button from screenshot */}
          <div className="relative">
            <button
              onClick={() => setShowNewDayDropdown(!showNewDayDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#0070F3] hover:bg-[#0060DF] active:bg-[#0050BF] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <span>New</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showNewDayDropdown && (
              <>
                {/* Click outside backdrop */}
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowNewDayDropdown(false)} 
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#252525] border border-[#383838] rounded-lg shadow-xl z-30 p-2 text-xs">
                  <div className="font-semibold text-neutral-300 px-2 py-1 mb-1 border-b border-[#333333]">
                    Add Tracking Day
                  </div>
                  <button
                    onClick={() => handleStartAddDay('today')}
                    className="w-full text-left px-2 py-1.5 text-neutral-200 hover:bg-[#323232] rounded flex items-center justify-between cursor-pointer"
                  >
                    <span>Add Today</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Today</span>
                  </button>
                  <button
                    onClick={() => handleStartAddDay('tomorrow')}
                    className="w-full text-left px-2 py-1.5 text-neutral-200 hover:bg-[#323232] rounded flex items-center justify-between cursor-pointer"
                  >
                    <span>Add Tomorrow (Midnight prep)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Tomorrow</span>
                  </button>
                  
                  <form onSubmit={handleCustomDateSubmit} className="mt-2 pt-2 border-t border-[#333333] px-1">
                    <label className="text-[10px] text-neutral-400 block mb-1">Custom Future Date</label>
                    <div className="flex gap-1">
                      <input
                        type="date"
                        min={getTodayIso()}
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#404040] text-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-neutral-400"
                      />
                      <button
                        type="submit"
                        disabled={!customDate || customDate < getTodayIso()}
                        className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 text-white rounded text-xs cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table Section with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[580px]">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-xs text-neutral-400 font-normal bg-[#1C1C1C]">
              {/* Day Column */}
              <th className="py-2.5 px-4 font-normal text-neutral-400 whitespace-nowrap min-w-[150px]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Day</span>
                </div>
              </th>

              {/* Dynamic Habit Columns */}
              {habits.map((habit) => (
                <th
                  key={habit.id}
                  title={`${habit.name} (click to focus)`}
                  className="py-2.5 px-3 font-normal text-neutral-300 text-center whitespace-nowrap min-w-[48px] group cursor-default"
                >
                  <span className="text-base select-none inline-block transform group-hover:scale-110 transition-transform">
                    {habit.icon}
                  </span>
                </th>
              ))}

              {/* Add column quick trigger */}
              <th className="py-2.5 px-2 text-center w-8">
                <button
                  onClick={onOpenAddHabit}
                  title="Add another habit column"
                  className="text-neutral-500 hover:text-neutral-200 p-1 rounded hover:bg-[#282828] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </th>

              {/* Progress Column */}
              <th className="py-2.5 px-4 font-normal text-neutral-400 whitespace-nowrap min-w-[170px]">
                <div className="flex items-center gap-1.5">
                  <Hourglass className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Progress</span>
                </div>
              </th>

              {/* Row Action Column */}
              <th className="py-2.5 px-3 text-right w-10"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#262626] text-xs text-neutral-200">
            {filteredDays.length === 0 ? (
              <tr>
                <td
                  colSpan={habits.length + 3}
                  className="py-8 text-center text-neutral-500 text-xs"
                >
                  No days found. Click &quot;+ New page&quot; below to start tracking.
                </td>
              </tr>
            ) : (
              filteredDays.map((day) => {
                const { percentage, completedCount, totalCount } = calculateProgress(day, habits);
                const isComplete = totalCount > 0 && completedCount === totalCount;

                return (
                  <tr
                    key={day.id}
                    className="hover:bg-[#242424]/60 transition-colors group"
                  >
                    {/* Day Date Label */}
                    <td className="py-2.5 px-4 font-medium text-neutral-300 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px]">{day.dateFormatted}</span>
                        {day.id === getTodayIso() && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono">
                            Today
                          </span>
                        )}
                        {day.id === getTomorrowIso() && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded font-mono">
                            Tomorrow
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Habit Checkboxes or Dash if created later */}
                    {habits.map((habit) => {
                      const isEligible = isHabitEligibleForDay(habit, day.id);
                      const isChecked = isEligible && !!day.checks[habit.id];

                      if (!isEligible) {
                        return (
                          <td
                            key={habit.id}
                            className="py-2.5 px-3 text-center align-middle"
                            title={`"${habit.name}" was added after this day`}
                          >
                            <span className="text-neutral-600 font-mono text-xs select-none">
                              —
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={habit.id}
                          className="py-2.5 px-3 text-center align-middle"
                        >
                          <label className="inline-flex items-center justify-center cursor-pointer p-1 rounded hover:bg-[#2E2E2E]">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleCheck(day.id, habit.id)}
                              className="sr-only peer"
                            />
                            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-[#0070F3] border-[#0070F3] text-white shadow-xs'
                                : 'border-[#4A4A4A] bg-[#1E1E1E] hover:border-[#6A6A6A]'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </label>
                        </td>
                      );
                    })}

                    {/* Spacer for habit add column */}
                    <td></td>

                    {/* Progress Bar & Percentage */}
                    <td className="py-2.5 px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="font-mono tabular-nums text-xs font-semibold w-10 text-neutral-300">
                          {percentage}%
                        </span>
                        <div className="flex-1 min-w-[90px] max-w-[130px] h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isComplete
                                ? 'bg-emerald-400'
                                : percentage > 50
                                ? 'bg-[#0070F3]'
                                : percentage > 0
                                ? 'bg-[#38BDF8]'
                                : 'bg-transparent'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        {isComplete && (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Delete Day Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onDeleteDay(day.id)}
                        title="Delete this day"
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 hover:bg-[#2A2A2A] rounded transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}

            {/* Bottom summary numbers strip (matching "0 0 0" in screenshot) */}
            <tr className="border-t border-[#262626] text-[11px] text-neutral-500 font-mono">
              <td className="py-2 px-4">
                {dayLogs.length} {dayLogs.length === 1 ? 'day' : 'days'}
              </td>
              {habits.map((habit) => {
                const count = dayLogs.filter((d) => isHabitEligibleForDay(habit, d.id) && d.checks[habit.id]).length;
                return (
                  <td key={habit.id} className="py-2 px-3 text-center">
                    {count}
                  </td>
                );
              })}
              <td></td>
              <td className="py-2 px-4" colSpan={2}>
                {filteredDays.length > 0 ? (
                  <span>
                    Avg: {Math.round(
                      filteredDays.reduce((acc, d) => acc + calculateProgress(d, habits).percentage, 0) /
                      filteredDays.length
                    )}%
                  </span>
                ) : '0%'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
