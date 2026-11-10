"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  const path = usePathname()  
  

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <button className="cursor-pointer w-full text-left" onClick={() => signOut()}>
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        signIn("github", {
          callbackUrl: "/dashboard",
        })
      }
    >
      {
        path == '/signup' ? "Register with GitHub" : "Sign in with GitHub"
      }
      
    </button>
  );
}