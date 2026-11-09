import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (name: string, icon: string) => void;
}

const EMOJI_OPTIONS = [
  '🛏️', '🍴', '🚶', '📓', '🏋️', '💧', '💻', '🧘', '📖', '🎯', 
  '💊', '⚡', '☕', '🎨', '🧹', '🍎', '🏃', '🎵', '✍️', '🌿',
  '🧠', '☀️', '🚲', '💡', '⏱️'
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💻');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit(name.trim(), selectedIcon);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#202020] border border-[#333333] rounded-xl shadow-2xl max-w-md w-full p-5 text-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#2E2E2E]">
          <h3 className="text-sm font-semibold text-neutral-100">Add New Habit</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Habit Name
            </label>
            <input
              type="text"
              placeholder="e.g. solve escbash.com problems, Read 30m..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full bg-[#161616] border border-[#3A3A3A] rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Choose Column Icon
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-[#161616] border border-[#303030] rounded-lg">
              {EMOJI_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 flex items-center justify-center rounded text-lg transition-colors ${
                    selectedIcon === icon
                      ? 'bg-[#0070F3] text-white shadow-xs'
                      : 'hover:bg-[#2A2A2A] text-neutral-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#2E2E2E]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 bg-[#0070F3] hover:bg-[#0060DF] disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Add Habit Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
