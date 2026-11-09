import React, { useState } from 'react';
import { AlignLeft, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { NoteItem } from '../types';

interface NotesCardProps {
  notes: NoteItem[];
  onAddNote: (text: string) => void;
  onToggleNote: (id: string) => void;
  onUpdateNote: (id: string, text: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesCard: React.FC<NotesCardProps> = ({
  notes,
  onAddNote,
  onToggleNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleConfirmAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(newNoteText.trim());
    setNewNoteText('');
    setIsAdding(false);
  };

  const handleStartEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    onUpdateNote(id, editText.trim());
    setEditingId(null);
  };

  const completedCount = notes.filter((n) => n.completed).length;

  return (
    <div className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl overflow-hidden shadow-lg transition-colors flex flex-col h-full">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-[#2E2E2E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-semibold tracking-wide text-neutral-200">
            Notes &amp; Daily TODOs
          </span>
        </div>
        <span className="text-[11px] text-neutral-500 font-mono">
          {completedCount}/{notes.length} done
        </span>
      </div>

      {/* Notes List */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {notes.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-500">
            No notes or daily TODOs yet. Click &quot;Add new note or task&quot; below to add one!
          </div>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => {
              const isEditing = editingId === note.id;

              return (
                <li
                  key={note.id}
                  className="group flex items-start justify-between text-xs sm:text-sm text-neutral-300 py-1 px-1.5 -mx-1.5 rounded hover:bg-[#252525] transition-colors leading-relaxed"
                >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(note.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 bg-[#171717] border border-[#3E3E3E] text-neutral-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-neutral-300"
                    />
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs"
                      title="Save"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2.5 flex-1 cursor-pointer" onClick={() => onToggleNote(note.id)}>
                      {/* Checkable bullet dot */}
                      <button
                        type="button"
                        className={`mt-1 w-2.5 h-2.5 rounded-full border transition-all shrink-0 ${
                          note.completed
                            ? 'bg-emerald-400 border-emerald-400'
                            : 'bg-neutral-400 border-neutral-400 hover:bg-neutral-200'
                        }`}
                        title={note.completed ? 'Mark uncompleted' : 'Mark completed'}
                      />
                      <span
                        className={`text-xs sm:text-[13px] ${
                          note.completed
                            ? 'line-through text-neutral-500'
                            : 'text-neutral-200'
                        }`}
                      >
                        {note.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(note);
                        }}
                        title="Edit note text"
                        className="p-1 text-neutral-500 hover:text-neutral-200 hover:bg-[#303030] rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                        title="Delete note"
                        className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-[#303030] rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        )}

        {/* Add Note Input */}
        <div className="mt-5 pt-3 border-t border-[#2A2A2A]">
          {isAdding ? (
            <form onSubmit={handleConfirmAdd} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Call dentist or pick up groceries..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  autoFocus
                  className="flex-1 bg-[#171717] border border-[#3A3A3A] text-neutral-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-3 py-1.5 bg-[#0070F3] hover:bg-[#0060DF] disabled:opacity-40 text-white font-medium rounded text-xs transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1.5 text-neutral-400 hover:text-neutral-200 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 py-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add new note or task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
