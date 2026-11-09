import React, { useState } from 'react';
import { AlignLeft, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Habit } from '../types';

interface HabitListCardProps {
  habits: Habit[];
  onAddHabit: (name: string, icon: string) => void;
  onUpdateHabit: (id: string, name: string, icon: string) => void;
  onDeleteHabit: (id: string) => void;
}

const COMMON_ICONS = [
  '🛏️', '🍴', '🚶', '📓', '🏋️', '💧', '💻', '🧘', '📖', '🎯', 
  '💊', '⚡', '☕', '🎨', '🧹', '🍎', '🏃', '🎵', '✍️', '🌿',
  '🧠', '☀️', '🚲', '💡', '⏱️'
];

export const HabitListCard: React.FC<HabitListCardProps> = ({
  habits,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📓');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewHabitName('');
    setSelectedIcon(COMMON_ICONS[Math.floor(Math.random() * COMMON_ICONS.length)]);
  };

  const handleConfirmAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit(newHabitName.trim(), selectedIcon);
    setNewHabitName('');
    setIsAdding(false);
    setShowIconPicker(false);
  };

  const handleStartEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditIcon(habit.icon);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateHabit(id, editName.trim(), editIcon);
    setEditingId(null);
  };

  return (
    <div className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl shadow-lg transition-colors relative">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-[#2E2E2E] flex items-center justify-between rounded-t-xl bg-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-semibold tracking-wide text-neutral-200">
            Habit List
          </span>
        </div>
        <span className="text-[11px] text-neutral-500 font-mono">
          Syncs to Tracker columns
        </span>
      </div>

      {/* Habits List Content */}
      <div className="p-5">
        {habits.length === 0 ? (
          <div className="py-4 text-center text-xs text-neutral-500">
            No habits yet. Click &quot;Add habit&quot; below to add your first daily habit!
          </div>
        ) : (
          <ol className="space-y-2.5">
            {habits.map((habit, index) => {
              const isEditing = editingId === habit.id;

              return (
                <li
                  key={habit.id}
                  className="group flex items-center justify-between text-sm text-neutral-300 py-1 px-2 -mx-2 rounded hover:bg-[#252525] transition-colors"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <span className="text-neutral-500 font-mono text-xs w-4">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="w-9 text-center bg-[#171717] border border-[#3E3E3E] rounded px-1 py-0.5 text-sm"
                        title="Habit emoji icon"
                      />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(habit.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 bg-[#171717] border border-[#3E3E3E] text-neutral-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-neutral-300"
                      />
                      <button
                        onClick={() => handleSaveEdit(habit.id)}
                        className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs cursor-pointer"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded text-xs cursor-pointer"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="text-neutral-500 font-mono text-xs w-4">
                          {index + 1}.
                        </span>
                        <span className="text-base select-none">{habit.icon}</span>
                        <span className="text-neutral-200 text-xs sm:text-sm font-normal">
                          {habit.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(habit)}
                          title="Edit habit name or icon"
                          className="p-1 text-neutral-500 hover:text-neutral-200 hover:bg-[#303030] rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          title="Delete habit (removes column)"
                          className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-[#303030] rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {/* Add Habit Form or Button */}
        <div className="mt-4 pt-3 border-t border-[#2A2A2A] relative">
          {isAdding ? (
            <form onSubmit={handleConfirmAdd} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-9 h-9 flex items-center justify-center bg-[#282828] border border-[#3E3E3E] rounded-lg hover:border-neutral-400 text-lg transition-colors cursor-pointer"
                    title="Change icon"
                  >
                    {selectedIcon}
                  </button>

                  {/* Fully visible and responsive emoji tray */}
                  {showIconPicker && (
                    <>
                      {/* Click outside backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowIconPicker(false)} 
                      />
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-[#252525] border border-[#444444] rounded-xl shadow-2xl p-2.5 z-50">
                        <div className="text-[11px] font-semibold text-neutral-300 mb-1.5 px-1 flex items-center justify-between">
                          <span>Select Emoji Icon</span>
                          <button 
                            type="button" 
                            onClick={() => setShowIconPicker(false)}
                            className="text-neutral-400 hover:text-neutral-200 p-0.5 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto p-1 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                          {COMMON_ICONS.map((icon) => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => {
                                setSelectedIcon(icon);
                                setShowIconPicker(false);
                              }}
                              className={`w-9 h-9 flex items-center justify-center rounded-md text-lg transition-colors cursor-pointer ${
                                selectedIcon === icon
                                  ? 'bg-[#0070F3] text-white shadow-xs'
                                  : 'hover:bg-[#323232] text-neutral-200'
                              }`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="e.g. solve escbash.com problems..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  autoFocus
                  className="flex-1 bg-[#171717] border border-[#3A3A3A] text-neutral-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                />

                <button
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="px-3.5 py-2 bg-[#0070F3] hover:bg-[#0060DF] disabled:opacity-40 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-2 text-neutral-400 hover:text-neutral-200 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 italic pl-1">
                Adding this habit will immediately create a new column in your daily Habit Tracker above!
              </p>
            </form>
          ) : (
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 py-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add habit (creates new column)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
