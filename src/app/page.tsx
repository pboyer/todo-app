"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";

interface Todo {
  id: string;
  content: string;
  completed: boolean;
}

export default function Home() {
  const ref = useRef<HTMLInputElement>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");

  // Add item

  const addTodo = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!newTodo) {
      return;
    }

    await addDoc(collection(db, "todos"), {
      content: newTodo,
      completed: false,
    });

    setNewTodo("");
  };

  // Read items
  useEffect(() => {
    const q = query(collection(db, "todos"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsArr: Todo[] = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id } as Todo);
      });

      setTodos(itemsArr);
    });

    return unsubscribe;
  }, []);

  // Update a todo
  const updateTodo = async (id: string, data: Partial<Todo>) => {
    updateDoc(doc(db, "todos", id), data);
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const clearAll = async () => {
    const batch = writeBatch(db);

    for (const todo of todos) {
      const laRef = doc(db, "todos", todo.id);
      batch.delete(laRef);
    }
    // Commit the batch
    await batch.commit();
  };

  const setAllCompleted = async () => {
    const batch = writeBatch(db);

    for (const todo of todos) {
      const laRef = doc(db, "todos", todo.id);
      batch.update(laRef, { completed: true });
    }

    // Commit the batch
    await batch.commit();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-2xl p-4 text-center">TODO App</h1>
        <div className="bg-slate-100 pb-4">
          <form className="grid grid-cols-6">
            <input
              className="col-span-5 p-4 border"
              type="text"
              placeholder="My todo"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            ></input>
            <button
              className="col-span-1 p-4 bg-slate-200"
              type="submit"
              onClick={addTodo}
            >
              +
            </button>
          </form>
        </div>
        <div className="w-full">
          <div className="grid grid-cols-6 even:bg-gray-50 odd:bg-white">
            {todos.map((todo) => {
              return (
                <React.Fragment key={todo.id}>
                  <input
                    className="col-span-1 m-4"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() =>
                      updateTodo(todo.id, { completed: !todo.completed })
                    }
                  />
                  <div className="col-span-4 p-4 ">{todo.content}</div>
                  <button
                    className="col-span-1 p-4 bg-slate-100"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    X
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div className="bg-slate-100 grid grid-cols-2">
          <button
            className="grid-cols-1 bg-slate-300 p-4"
            onClick={setAllCompleted}
          >
            Set all completed
          </button>
          <button className="grid-cols-1 bg-slate-200 p-4" onClick={clearAll}>
            Clear
          </button>
        </div>
      </div>
    </main>
  );
}
