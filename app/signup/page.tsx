import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Check, FileCode2 } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import GithubButton from "@/components/GithubButton";
import RegisterFormClient from "@/components/RegisterFormClient";
import GithubButton from "@/components/githubButton";

const STYLES = `
@keyframes su-fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes su-glow{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.85;transform:scale(1.08)}}
@keyframes su-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes su-grid{from{background-position:0 0}to{background-position:0 56px}}
.su-fadeUp{animation:su-fadeUp .6s ease-out both}
.su-glow{animation:su-glow 6s ease-in-out infinite}
.su-float{animation:su-float 7s ease-in-out infinite}
.su-grid{animation:su-grid 6s linear infinite}
@media (prefers-reduced-motion:reduce){.su-fadeUp,.su-glow,.su-float,.su-grid{animation:none}}
`;

const POINTS = [
  "Chat with any repository in plain English",
  "Every answer cites the exact file and line",
  "Ramp up in days, not weeks",
];

export default async function SignUpPage() {
  // Already logged in? Skip the form.
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black p-4 md:p-8">
      <style>{STYLES}</style>

      {/* background */}
      <div
        className="su-grid absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,197,94,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,.10) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 25%, transparent 75%)",
        }}
      />
      <div className="su-glow absolute left-1/2 top-[-140px] size-[520px] -translate-x-1/2 rounded-full bg-green-500/20 blur-[140px]" />

      <Link
        href="/"
        className="absolute left-5 top-5 z-10 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-green-400 md:left-8 md:top-8"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>

      {/* Card */}
      <div className="su-fadeUp relative z-10 grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_0_90px_-25px_rgba(34,197,94,.45)] lg:grid-cols-2">
        {/* Left: form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div>
              <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-green-500/15 text-lg font-bold text-green-400 ring-1 ring-green-500/40">
                CL
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Welcome, coder!
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Create your account to start exploring any codebase.
              </p>
            </div>

            <RegisterFormClient />

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-white/10" />
              <span className="mx-4 flex-shrink text-xs uppercase tracking-wider text-zinc-600">
                Or continue with
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            <GithubButton />

            <p className="pt-1 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-green-400 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right: illustration */}
        <div className="relative hidden min-h-[640px] bg-black lg:block">
          <Image
            src="/images/signin.jpg"
            alt="Sign up illustration"
            fill
            className="object-cover opacity-60"
            priority
          />
          {/* overlays so the image blends into the green/black theme */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-green-950/30" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent" />

          <div className="su-float absolute right-8 top-10 rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-xs text-zinc-300 backdrop-blur">
            <FileCode2 className="mb-1 size-4 text-green-400" />
            auth.ts:24
          </div>

          <div className="absolute inset-x-0 bottom-0 p-10">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
              Understand any codebase{" "}
              <span className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-transparent">
                on day one
              </span>
            </h2>
            <ul className="mt-6 space-y-3">
              {POINTS.map((p, i) => (
                <li
                  key={p}
                  className="su-fadeUp flex items-center gap-3 text-sm text-zinc-300"
                  style={{ animationDelay: `${400 + i * 150}ms` }}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                    <Check className="size-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}