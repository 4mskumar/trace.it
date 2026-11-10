
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const started = useRef(false);
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setMessage("The verification link is missing its token or email.");
      return;
    }

    async function verifyEmail() {
      try {
        const result = await signIn("credentials", {
          email,
          verificationToken: token,
          redirect: false,
        });

        if (result?.ok) {
          setMessage("Email verified successfully. Redirecting...");

          router.replace("/dashboard");
          router.refresh();
        } else {
          setMessage(
            "Verification failed. The link may be expired or already used."
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("Something went wrong while verifying your email.");
      }
    }

    void verifyEmail();
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border p-8 text-center">
        <h1 className="mb-4 text-2xl font-semibold">
          Email Verification
        </h1>

        <p role="status">{message}</p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-6">
          <p>Loading verification page...</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
