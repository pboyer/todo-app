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
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import Link from "next/link";
import router from "next/router";
import Head from "next/head";

const APP_TITLE = "TODO";

interface Todo {
  id: string;
  content: string;
  completed: boolean;
}

const provider = new GoogleAuthProvider();

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");

  // Add item

  const addTodo = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!newTodo || !auth.currentUser) {
      return;
    }

    await addDoc(collection(db, "todos"), {
      content: newTodo,
      completed: false,
      author: auth.currentUser?.uid,
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
    <PageWrapper>
      {user ? (
        <>
          <div className="w-full text-center">
            <button
              className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 mb-4"
              onClick={() => {
                auth.signOut();
              }}
            >
              Sign out
            </button>
          </div>
          <div className="bg-slate-100">
            <form className="grid grid-cols-6">
              <input
                className="col-span-5 p-4 bg-slate-100"
                type="text"
                placeholder="My todo"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
              ></input>
              <button
                className="col-span-1 p-4 bg-slate-300"
                type="submit"
                onClick={addTodo}
              >
                +
              </button>
            </form>
          </div>
          <div className="bg-slate-100 grid grid-cols-2">
            <button
              className="grid-cols-1 bg-slate-300 p-2"
              onClick={setAllCompleted}
            >
              Set all completed
            </button>
            <button className="grid-cols-1 bg-slate-200 p-2" onClick={clearAll}>
              Clear
            </button>
          </div>
          <div className="w-full">
            <div className="grid grid-cols-6 even:bg-slate-200 odd:bg-slate">
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
        </>
      ) : (
        userLoaded && (
          <div className="w-full text-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
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
              Signin with Google
            </button>
          </div>
        )
      )}
    </PageWrapper>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>{APP_TITLE}</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
          <h1 className="text-2xl p-4 text-center">{APP_TITLE}</h1>
          {children}
        </div>
      </main>
    </>
  );
}
