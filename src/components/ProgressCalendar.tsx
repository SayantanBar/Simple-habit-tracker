import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Habit, DayLog } from '../types';
import { calculateProgress, formatDateString, getTodayIso } from '../utils/storage';

interface ProgressCalendarProps {
  dayLogs: DayLog[];
  habits: Habit[];
  onSelectDayForTracker?: (isoDate: string, formattedString: string) => void;
}

export const ProgressCalendar: React.FC<ProgressCalendarProps> = ({
  dayLogs,
  habits,
}) => {
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [hoveredDayIso, setHoveredDayIso] = useState<string | null>(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Build calendar matrix
  const calendarCells = [];
  // Empty padding cells before 1st day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      iso: dayIso,
    });
  }

  // Calculate monthly stats
  const daysWithRecords = dayLogs.filter((d) => d.id.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const avgMonthlyProgress = daysWithRecords.length > 0
    ? Math.round(
        daysWithRecords.reduce((acc, d) => acc + calculateProgress(d, habits).percentage, 0) /
        daysWithRecords.length
      )
    : 0;

  return (
    <div className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl shadow-lg transition-colors overflow-visible relative">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-[#2E2E2E] flex items-center justify-between rounded-t-xl bg-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-neutral-200">
            Progress History
          </span>
        </div>
        <button
          onClick={handleJumpToToday}
          className="text-[11px] font-mono text-neutral-400 hover:text-emerald-400 hover:underline cursor-pointer"
        >
          Jump to Today
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Month Navigator */}
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-semibold text-neutral-200 tracking-wide">
            {monthName}
          </h4>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              title="Previous month"
              className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              title="Next month"
              className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Calendar Grid Cells (Smaller compact squares with shades of green) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-8 sm:h-9" />;
            }

            const dayLog = dayLogs.find((d) => d.id === cell.iso);
            const progress = dayLog ? calculateProgress(dayLog, habits) : null;
            const percentage = progress ? progress.percentage : 0;
            const isToday = cell.iso === getTodayIso();
            const colIndex = idx % 7; // 0 to 6

            // GitHub-style green heat map intensity:
            // Less work = less green, more work = more green
            let heatClasses = 'bg-[#181818] border-[#2A2A2A] text-neutral-400 hover:border-neutral-500';
            if (progress) {
              if (percentage === 100) {
                // 100% Mastery - richest vibrant green
                heatClasses = 'bg-[#39D353] border-[#39D353] text-[#0D1117] font-bold shadow-xs';
              } else if (percentage >= 67) {
                // High progress - bright green
                heatClasses = 'bg-[#26A641] border-[#39D353]/50 text-white font-medium';
              } else if (percentage >= 34) {
                // Medium progress - medium green
                heatClasses = 'bg-[#006D32] border-[#26A641]/40 text-emerald-100';
              } else if (percentage > 0) {
                // Low progress - dark moss green
                heatClasses = 'bg-[#0E4429] border-[#006D32]/40 text-[#7EE787]';
              }
            }

            // Dynamic tooltip positioning to prevent border/margin clipping
            let tooltipPositionClass = 'left-1/2 -translate-x-1/2';
            if (colIndex <= 1) {
              // Far left column (Sun, Mon): anchor to left edge, expand right
              tooltipPositionClass = 'left-0 translate-x-0';
            } else if (colIndex >= 5) {
              // Far right column (Fri, Sat): anchor to right edge, expand left
              tooltipPositionClass = 'right-0 left-auto translate-x-0';
            }

            return (
              <div key={cell.iso} className="relative group">
                <button
                  type="button"
                  onMouseEnter={() => setHoveredDayIso(cell.iso)}
                  onMouseLeave={() => setHoveredDayIso(null)}
                  className={`w-full h-8 sm:h-9 rounded-md border flex items-center justify-center transition-all cursor-pointer ${heatClasses} ${
                    isToday ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-[#1E1E1E]' : ''
                  }`}
                >
                  <span className="text-[11px] font-mono leading-none">
                    {cell.dayNumber}
                  </span>
                </button>

                {/* Instant Hover Tooltip (Properly aligned to prevent clipping) */}
                {hoveredDayIso === cell.iso && (
                  <div
                    className={`absolute bottom-full mb-2 px-2.5 py-1.5 bg-[#121212] border border-[#3E3E3E] rounded-md shadow-2xl text-[11px] text-neutral-200 whitespace-nowrap z-50 pointer-events-none ${tooltipPositionClass}`}
                  >
                    <div className="font-semibold text-neutral-100">
                      {formatDateString(new Date(cell.iso + 'T00:00:00'))}
                    </div>
                    {progress !== null ? (
                      <div className="text-emerald-400 font-mono mt-0.5">
                        {percentage}% progress ({progress.completedCount}/{habits.length} habits)
                      </div>
                    ) : (
                      <div className="text-neutral-500 mt-0.5">No habits tracked</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Heat Map Legend & Monthly Average */}
        <div className="pt-2.5 border-t border-[#2A2A2A] flex items-center justify-between text-[10px] text-neutral-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#181818] border border-[#2A2A2A]" title="0%" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0E4429] border border-[#006D32]/40" title="1-33%" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#006D32] border border-[#26A641]/40" title="34-66%" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#26A641] border border-[#39D353]/50" title="67-99%" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#39D353] border border-[#39D353]" title="100%" />
            <span>More</span>
          </div>

          <div>
            Month Avg: <span className="text-neutral-300 font-semibold">{avgMonthlyProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
