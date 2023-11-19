"use client";
import { GoogleAuthProvider, User, signInWithPopup } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import router from "next/router";
import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { APP_TITLE } from "./constants";
import { auth, db } from "./firebase";

interface Todo {
  id: string;
  index: number;
  content: string;
  completed: boolean;
}

const provider = new GoogleAuthProvider();

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");

  // Add item

  const addTodo = async () => {
    if (!newTodo || !auth.currentUser) {
      return;
    }

    addDoc(collection(db, "todos"), {
      content: newTodo,
      completed: false,
      author: auth.currentUser?.uid,
      index: todos.reduce((acc, todo) => Math.min(acc, todo.index ?? 0), 0) - 1,
    });

    setNewTodo("");
  };

  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState<boolean>(false);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (!userLoaded) {
        setUserLoaded(true);
      }

      setUser(user);
    });
  }, []);

  // Read items
  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(
      collection(db, "todos"),
      where("author", "==", auth.currentUser?.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsArr: Todo[] = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id } as Todo);
      });

      setTodos(itemsArr);
    });

    return unsubscribe;
  }, [user]);

  // Update a todo
  const updateTodo = async (id: string, data: Partial<Todo>) => {
    updateDoc(doc(db, "todos", id), data);
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to delete all todos?")) {
      return;
    }

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

  const onDragEnd: OnDragEndResponder = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const sortedTodos = todos
      .slice()
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    sortedTodos.splice(
      result.destination.index,
      0,
      sortedTodos.splice(result.source.index, 1)[0]
    );

    const batch = writeBatch(db);

    let count = 0;
    for (const todo of sortedTodos) {
      const laRef = doc(db, "todos", todo.id);
      batch.update(laRef, { index: count++ });
    }

    // Commit the batch
    batch.commit();
  };

  return (
    <PageWrapper>
      {user ? (
        <>
          <div className="w-full text-center flex items-center justify-between">
            <h1 className="text-2xl text-center">{APP_TITLE}</h1>
            <button
              className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-2 rounded"
              onClick={() => {
                auth.signOut();
              }}
            >
              Sign out
            </button>
          </div>
          <div className="mb-6 mt-8">
            <form className="grid grid-cols-6">
              <input
                className="col-span-5 p-4  text-black bg-slate-100 dark:bg-slate-900 focus:bg-slate-200 focus:dark:bg-slate-950 dark:text-white mr-2 rounded outline-none"
                type="text"
                placeholder="Add a todo"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyUp={(e) => {
                  if (e.code === "Enter") {
                    addTodo();
                  }
                }}
              ></input>
              <button
                className="col-span-1 p-4 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:text-white dark:hover:bg-slate-700 rounded"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  addTodo();
                }}
              >
                +
              </button>
            </form>
          </div>
          <div className="grid grid-cols-2 mb-6">
            <button
              className="grid-cols-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 rounded p-2 mr-2"
              onClick={setAllCompleted}
              disabled={todos.length === 0}
            >
              Complete all
            </button>
            <button
              className="grid-cols-1 bg-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 rounded p-2"
              onClick={clearAll}
            >
              Clear
            </button>
          </div>
          <div className="w-full  mb-5">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {todos
                      .slice()
                      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                      .map((todo, index) => (
                        <Draggable
                          key={todo.id}
                          draggableId={todo.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <React.Fragment key={todo.id}>
                                <TodoItem
                                  key={todo.id}
                                  todo={todo}
                                  updateTodo={updateTodo}
                                  deleteTodo={deleteTodo}
                                />
                              </React.Fragment>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </>
      ) : (
        userLoaded && (
          <div className="w-full text-center flex flex-col align-items justify-center p-24">
            <h1 className="text-2xl p-4 text-center pb-10">{APP_TITLE}</h1>
            <h2 className="text-slate-400 pb-10">Manage yourself</h2>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded"
              onClick={() => {
                signInWithPopup(auth, provider)
                  .then((result) => {
                    const credential =
                      GoogleAuthProvider.credentialFromResult(result);

                    if (!credential) {
                      return;
                    }

                    router.push("/");
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }}
            >
              Sign in with Google
            </button>
          </div>
        )
      )}
    </PageWrapper>
  );
}

function TodoItem({
  todo,
  updateTodo,
  deleteTodo,
}: {
  todo: Todo;
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}): React.JSX.Element {
  return (
    <div key={todo.id} className="col-span-6">
      <div className="w-full grid grid-cols-6 mb-2 bg-slate-100 dark:bg-slate-900 cursor-grab rounded">
        <div className="col-span-1 flex items-center justify-center">
          <input
            type="checkbox"
            className="w-5 h-5"
            checked={todo.completed}
            onChange={() => updateTodo(todo.id, { completed: !todo.completed })}
          />
        </div>
        <TodoInput
          todo={todo}
          onCommitText={(v) => updateTodo(todo.id, { content: v })}
        />
        <button
          className="m-2 rounded col-span-1 p-4 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700"
          onClick={() => deleteTodo(todo.id)}
        >
          X
        </button>
      </div>
    </div>
  );
}

function TodoInput({
  todo,
  onCommitText,
}: {
  todo: Todo;
  onCommitText: (v: string) => void;
}) {
  const [editingTodo, setEditingTodo] = useState<string>(todo.content);
  useEffect(() => {
    setEditingTodo(todo.content);
  }, [todo]);

  return (
    <div className="col-span-4 flex items-center">
      <input
        type="text"
        value={editingTodo}
        onChange={(e) => {
          setEditingTodo(e.target.value);
        }}
        onBlur={() => {
          onCommitText(editingTodo);
        }}
        onKeyUp={(e) => {
          if (e.code === "Enter") {
            onCommitText(editingTodo);
          }
        }}
        className="w-full p-4  text-black bg-slate-100 dark:bg-slate-900 focus:bg-slate-200 focus:dark:bg-slate-950 dark:text-white mr-2 rounded outline-none"
        // className="bg-transparent w-full p-4"
      ></input>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-white dark:bg-slate-800 text-black dark:text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        {children}
      </div>
    </main>
  );
}
