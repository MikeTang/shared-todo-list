import { getTodos } from "@/lib/todos";
import TodoList from "./TodoList";

// Disable Next.js full-route cache — always fetch fresh todos on each request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const todos = await getTodos();

  return (
    <main className="min-h-screen bg-gray-50">
      <TodoList initialTodos={todos} />
    </main>
  );
}
