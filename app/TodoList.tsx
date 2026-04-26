"use client";

import { useRef, useState, useTransition } from "react";
import { addTodo, toggleTodo, editTodo, deleteTodo, clearCompleted } from "./actions";
import type { Todo } from "@/lib/todos";

// ── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      className="w-2.5 h-2.5 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// ── TodoRow ───────────────────────────────────────────────────────────────────

function TodoRow({ todo }: { todo: Todo }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditText(todo.text);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === todo.text) {
      setEditing(false);
      return;
    }
    setEditing(false);
    startTransition(() => editTodo(todo.id, trimmed));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") {
      setEditText(todo.text);
      setEditing(false);
    }
  }

  const rowBase =
    "group flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all";
  const activeRow = `${rowBase} bg-white border-gray-100 shadow-sm hover:border-gray-200`;
  const editingRow = `${rowBase} bg-white border-indigo-300 shadow-sm ring-2 ring-indigo-100`;
  const completedRow = `${rowBase} bg-gray-50 border-gray-100 hover:border-gray-200`;

  const rowClass = todo.completed ? completedRow : editing ? editingRow : activeRow;

  return (
    <div className={rowClass}>
      {/* Checkbox */}
      <button
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        onClick={() => startTransition(() => toggleTodo(todo.id))}
        className={
          todo.completed
            ? "flex-shrink-0 w-5 h-5 rounded-full border-2 border-indigo-400 bg-indigo-500 flex items-center justify-center"
            : "flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-indigo-400 transition-colors"
        }
      >
        {todo.completed && <CheckIcon />}
      </button>

      {/* Text / edit input */}
      {editing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm text-gray-800 outline-none bg-transparent caret-indigo-500"
          />
          <span className="text-xs text-gray-300 flex-shrink-0">editing</span>
        </>
      ) : (
        <span
          onClick={todo.completed ? undefined : startEdit}
          className={
            todo.completed
              ? "flex-1 text-sm text-gray-400 line-through select-none"
              : "flex-1 text-sm text-gray-800 cursor-text"
          }
        >
          {todo.text}
        </span>
      )}

      {/* Delete — revealed on hover */}
      <button
        aria-label="Delete task"
        onClick={() => startTransition(() => deleteTodo(todo.id))}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-300 hover:text-red-400 transition-all"
      >
        <XIcon />
      </button>
    </div>
  );
}

// ── AddTaskForm ────────────────────────────────────────────────────────────────

function AddTaskForm() {
  const [text, setText] = useState("");
  const [, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    startTransition(() => addTodo(trimmed));
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
      <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-400 transition-all">
        {/* Plus icon */}
        <svg
          className="w-4 h-4 text-gray-300 mr-3 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <input
          type="text"
          placeholder="Add a new task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 text-sm text-gray-700 placeholder-gray-300 outline-none bg-transparent"
        />
      </div>
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-sm transition-colors whitespace-nowrap"
      >
        Add
      </button>
    </form>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Decorative circle with a faint checkmark */}
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg
          className="w-7 h-7 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-400 mb-1">No tasks yet</p>
      <p className="text-xs text-gray-300">Add something above to get started.</p>
    </div>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
      <p className="text-xs text-gray-300">Synced just now</p>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs text-gray-300">Live · shared with everyone</p>
      </div>
    </div>
  );
}

// ── TodoList (main export) ─────────────────────────────────────────────────────

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [, startTransition] = useTransition();

  const active = initialTodos.filter((t) => !t.completed);
  const completed = initialTodos.filter((t) => t.completed);

  return (
    <div className="max-w-xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Shared Todo
          </h1>
        </div>
        <p className="text-sm text-gray-400 ml-[38px]">
          Everyone sees the same list · No login needed
        </p>
      </div>

      {/* Add task */}
      <AddTaskForm />

      {/* Empty state — only when list is completely empty */}
      {initialTodos.length === 0 && <EmptyState />}

      {/* Active tasks */}
      {active.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">
            Tasks · {active.length}
          </p>
          <div className="space-y-1.5">
            {active.map((todo) => (
              <TodoRow key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">
            Completed · {completed.length}
          </p>
          <div className="space-y-1.5">
            {completed.map((todo) => (
              <TodoRow key={todo.id} todo={todo} />
            ))}
          </div>

          {/* Clear completed */}
          <div className="mt-4 text-center">
            <button
              onClick={() => startTransition(() => clearCompleted())}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear {completed.length} completed{" "}
              {completed.length === 1 ? "task" : "tasks"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
