import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#202020] border border-[#383838] rounded-xl shadow-2xl max-w-md w-full p-5 text-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#2E2E2E]">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-semibold text-neutral-100">
              Reset Habits &amp; Notes?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-2 text-xs text-neutral-300 leading-relaxed">
          <p>
            Are you sure you want to reset? This will clear all items in your{' '}
            <strong className="text-white">Habit List</strong> and{' '}
            <strong className="text-white">Notes &amp; Daily TODOs</strong> so you can start completely fresh.
          </p>
          <p className="text-emerald-400">
            ✓ Your Progress History and past tracking dates will remain completely preserved.
          </p>
        </div>

        <div className="pt-3 flex justify-end gap-2 border-t border-[#2E2E2E]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Yes, Reset Habits &amp; Notes
          </button>
        </div>
      </div>
    </div>
  );
};
