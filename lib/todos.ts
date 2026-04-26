// Shared todo list storage via Vercel Blob.
//
// All visitors read and write the SAME blob — there is no per-user separation.
// The fixed path `todos/shared-list.json` is the single source of truth.
// Last write wins; this is intentional for a small shared group.
//
// Security note: blob is public-by-URL on Vercel's CDN. Don't store anything
// sensitive here. The path itself is unguessable enough for this use-case.

import { put, head, del as blobDel } from "@vercel/blob";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // Unix ms — stable sort key
}

const BLOB_PATH = "todos/shared-list.json";

/**
 * Fetch the shared todo list from Vercel Blob.
 * Returns an empty array if the blob doesn't exist yet.
 */
export async function getTodos(): Promise<Todo[]> {
  let url: string;
  try {
    const meta = await head(BLOB_PATH);
    url = meta.url;
  } catch {
    // Blob not found — first visit, return empty list.
    return [];
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  try {
    const data = await res.json();
    // Guard against corrupt blobs — must be an array.
    return Array.isArray(data) ? (data as Todo[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persist the full todo list back to Vercel Blob, overwriting the previous
 * version. `addRandomSuffix: false` + `allowOverwrite: true` ensures the path
 * stays stable and there's only ever one version.
 */
export async function saveTodos(todos: Todo[]): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(todos), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
  });
}

// Re-export del in case a future task needs to wipe the list entirely.
export { blobDel as deleteTodosBlob };
