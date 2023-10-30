"use client";

import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { redirect, useRouter } from "next/navigation";

const provider = new GoogleAuthProvider();

export default function SignInScreen() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full grid grid-cols-1 max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-2xl p-4 text-center">TODO App</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
    </main>
  );
}
