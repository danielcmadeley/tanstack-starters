import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue, push, update, remove } from "firebase/database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "../components/Login";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

function TodoApp() {
  const { user, loading } = useAuth();
  const [newTodoText, setNewTodoText] = useState("");
  const queryClient = useQueryClient();

  // User-specific todos path
  const userTodosPath = user ? `users/${user.uid}/todos` : null;

  // Query for user-specific todos with real-time updates
  const todosQuery = useQuery({
    queryKey: ["todos", user?.uid || "anonymous"],
    queryFn: () =>
      new Promise<Todo[]>((resolve) => {
        if (!userTodosPath) {
          resolve([]);
          return;
        }

        const todosRef = ref(database, userTodosPath);
        onValue(todosRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const todos = Object.entries(data).map(
              ([key, value]: [string, any]) => ({
                id: key,
                ...value,
              }),
            );
            resolve(todos.sort((a, b) => b.createdAt - a.createdAt));
          } else {
            resolve([]);
          }
        });
      }),
    staleTime: 0,
    enabled: !!user, // Only run query if user is authenticated
  });

  // Set up real-time listener for user-specific todos
  useEffect(() => {
    if (!user || !userTodosPath) return;

    const todosRef = ref(database, userTodosPath);
    const unsubscribe = onValue(todosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const todos = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            ...value,
          }),
        );
        queryClient.setQueryData(
          ["todos", user.uid],
          todos.sort((a, b) => b.createdAt - a.createdAt),
        );
      } else {
        queryClient.setQueryData(["todos", user.uid], []);
      }
    });

    return () => unsubscribe();
  }, [queryClient, user, userTodosPath]);

  // Add todo mutation
  const addTodoMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!userTodosPath) throw new Error("User not authenticated");

      const todosRef = ref(database, userTodosPath);
      await push(todosRef, {
        text,
        completed: false,
        createdAt: Date.now(),
      });
    },
  });

  // Toggle todo mutation
  const toggleTodoMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => {
      if (!userTodosPath) throw new Error("User not authenticated");

      const todoRef = ref(database, `${userTodosPath}/${id}`);
      await update(todoRef, { completed: !completed });
    },
  });

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userTodosPath) throw new Error("User not authenticated");

      const todoRef = ref(database, `${userTodosPath}/${id}`);
      await remove(todoRef);
    },
  });

  const todos = todosQuery.data || [];
  const completedTodos = todos.filter((todo) => todo.completed);
  const pendingTodos = todos.filter((todo) => !todo.completed);

  const addTodo = async () => {
    if (newTodoText.trim()) {
      await addTodoMutation.mutateAsync(newTodoText.trim());
      setNewTodoText("");
    }
  };

  const toggleTodo = (id: string, completed: boolean) => {
    toggleTodoMutation.mutate({ id, completed });
  };

  const deleteTodo = (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  // Now handle conditional rendering after all hooks are called
  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (todosQuery.isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <div>Loading todos...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {/* User Info and Sign Out */}
      <Login />

      <h1>🔥 My Todo App</h1>

      {/* Add Todo */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new todo..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={addTodo}
          disabled={!newTodoText.trim() || addTodoMutation.isPending}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {addTodoMutation.isPending ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <span>Total: {todos.length}</span>
        <span>Pending: {pendingTodos.length}</span>
        <span>Completed: {completedTodos.length}</span>
      </div>

      {/* Pending Todos */}
      {pendingTodos.length > 0 && (
        <div>
          <h3>📋 Pending ({pendingTodos.length})</h3>
          {pendingTodos.map((todo) => (
            <div
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                margin: "5px 0",
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                style={{ marginRight: "10px" }}
              />
              <span style={{ flex: 1 }}>{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>✅ Completed ({completedTodos.length})</h3>
          {completedTodos.map((todo) => (
            <div
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                margin: "5px 0",
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                borderRadius: "4px",
                opacity: 0.7,
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                style={{ marginRight: "10px" }}
              />
              <span style={{ flex: 1, textDecoration: "line-through" }}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <p>No todos yet! Add one above to get started.</p>
          <p style={{ fontSize: "32px", margin: "20px 0" }}>📝</p>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: TodoApp,
});
