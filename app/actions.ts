"use server";

// Server actions for the shared todo list.
//
// Each action follows the same pattern:
//   1. Read current list from Vercel Blob (getTodos)
//   2. Validate input
//   3. Mutate the in-memory array
//   4. Persist back (saveTodos)
//   5. revalidatePath('/') so the Next.js cache is busted and the new list
//      is served to all visitors on next request.
//
// Last-write-wins on concurrent edits — acceptable for a small group.

import { revalidatePath } from "next/cache";
import { getTodos, saveTodos, type Todo } from "@/lib/todos";

// ── Validation ──────────────────────────────────────────────────────────────

const MAX_TEXT_LENGTH = 500;

function validateText(raw: unknown): string {
  if (typeof raw !== "string") throw new Error("Text must be a string.");
  const text = raw.trim();
  if (text.length === 0) throw new Error("Task text must not be empty.");
  if (text.length > MAX_TEXT_LENGTH)
    throw new Error(`Task text must be at most ${MAX_TEXT_LENGTH} characters.`);
  return text;
}

function generateId(): string {
  // crypto.randomUUID() is available in Node 19+ and all Vercel runtimes.
  return crypto.randomUUID();
}

// ── Actions ──────────────────────────────────────────────────────────────────

/** Append a new incomplete task to the shared list. */
export async function addTodo(text: unknown): Promise<void> {
  const validated = validateText(text);
  const todos = await getTodos();

  const newTodo: Todo = {
    id: generateId(),
    text: validated,
    completed: false,
    createdAt: Date.now(),
  };

  await saveTodos([...todos, newTodo]);
  revalidatePath("/");
}

/** Toggle the completed state of a task by id. */
export async function toggleTodo(id: unknown): Promise<void> {
  if (typeof id !== "string" || id.trim() === "")
    throw new Error("Invalid todo id.");

  const todos = await getTodos();
  const updated = todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );

  // If nothing changed the id was bogus — still safe to write, no-op.
  await saveTodos(updated);
  revalidatePath("/");
}

/** Replace the text of an existing task in-place. */
export async function editTodo(id: unknown, text: unknown): Promise<void> {
  if (typeof id !== "string" || id.trim() === "")
    throw new Error("Invalid todo id.");

  const validated = validateText(text);
  const todos = await getTodos();
  const updated = todos.map((t) =>
    t.id === id ? { ...t, text: validated } : t
  );

  await saveTodos(updated);
  revalidatePath("/");
}

/** Remove a task from the list by id. */
export async function deleteTodo(id: unknown): Promise<void> {
  if (typeof id !== "string" || id.trim() === "")
    throw new Error("Invalid todo id.");

  const todos = await getTodos();
  const updated = todos.filter((t) => t.id !== id);

  await saveTodos(updated);
  revalidatePath("/");
}
