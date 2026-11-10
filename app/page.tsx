"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  FileCode2,
  FolderGit2,
  GitBranch,
  Layers,
  Loader2,
  MessageSquareText,
  Pause,
  Play,
  Search,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ========================================================================== */
/*  Global keyframes + helpers                                                */
/* ========================================================================== */

const STYLES = `
@keyframes cl-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes cl-fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes cl-glow{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}
@keyframes cl-blink{50%{opacity:0}}
@keyframes cl-sweep{from{transform:translateY(-110%)}to{transform:translateY(110%)}}
@keyframes cl-travel{0%{left:0;opacity:0}12%{opacity:1}88%{opacity:1}100%{left:100%;opacity:0}}
@keyframes cl-fill{from{width:0}to{width:100%}}
@keyframes cl-grid{from{background-position:0 0}to{background-position:0 56px}}
@keyframes cl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes cl-dash{to{stroke-dashoffset:-24}}
@keyframes cl-shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
@keyframes cl-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}
.cl-marquee{animation:cl-marquee 45s linear infinite}
.cl-fadeUp{animation:cl-fadeUp .55s ease-out both}
.cl-glow{animation:cl-glow 6s ease-in-out infinite}
.cl-blink{animation:cl-blink 1s steps(1) infinite}
.cl-sweep{animation:cl-sweep 2.4s linear infinite}
.cl-travel{animation:cl-travel 2.8s ease-in-out infinite}
.cl-fill{animation:cl-fill 5s linear both}
.cl-grid{animation:cl-grid 6s linear infinite}
.cl-float{animation:cl-float 7s ease-in-out infinite}
.cl-dash{animation:cl-dash 1.2s linear infinite}
.cl-shimmer{background-size:200% 100%;animation:cl-shimmer 2.2s linear infinite}
.cl-ping{animation:cl-ping 1.8s ease-out infinite}
.cl-root ::selection{background:rgba(34,197,94,.35)}
@media (prefers-reduced-motion:reduce){
  .cl-root *{animation:none!important;transition:none!important}
}
`;

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Card with a green spotlight that follows the cursor
function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r || !ref.current) return;
        ref.current.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 transition-colors duration-300 hover:border-green-500/40",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(380px circle at var(--x,50%) var(--y,50%), rgba(34,197,94,.14), transparent 45%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function Typewriter({ text, speed = 16 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN(n + 1), speed);
    return () => clearTimeout(t);
  }, [n, text, speed]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && (
        <span className="cl-blink ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-green-400" />
      )}
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-green-400">
      {children}
    </p>
  );
}

function SectionTitle({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {sub && <p className="mt-5 text-lg text-zinc-400">{sub}</p>}
    </Reveal>
  );
}

function CtaButton({
  label = "Get started free",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const authed = status === "authenticated";
  
  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-black transition duration-300 hover:bg-green-400 hover:shadow-[0_0_45px_-5px_rgba(34,197,94,.75)] disabled:opacity-70 disabled:cursor-not-allowed",
    className,
  );

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);      
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false); // Reset if redirect fails or gets cancelled
    }
  };

  const inner = (
    <>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      
      {/* Show spinner or arrow depending on loading state */}
      {isSigningIn ? (
        <Loader2 className="relative size-4 animate-spin text-black" />
      ) : (
        <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-1" />
      )}

      <span className="relative">
        {authed ? "Open dashboard" : isSigningIn ? "Connecting..." : label}
      </span>
    </>
  );

  if (authed) {
    return (
      <Link href="/dashboard" className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn}
      className={classes}
    >
      {inner}
    </button>
  );
}

/* ========================================================================== */
/*  Nav + scroll progress                                                     */
/* ========================================================================== */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);  

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 12);
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300", scrolled
          ? "border-b border-white/10 bg-black/70 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/15 text-sm font-bold text-green-400 ring-1 ring-green-500/40">
            T
          </div>
          <span className="text-2xl font-medium tracking-tight text-zinc-100">
            <span className="font-bold">
              trace
            </span>
            .it
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {[
            ["Features", "#features"],
            ["How it works", "#how"],
            ["FAQ", "#faq"],
          ].map(([l, h]) => (
            <a key={h} href={h} className="transition hover:text-white">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">

        <CtaButton label="Get started" className="px-5 py-2 cursor-pointer" />
        <Link href={'/signup'}>
          <Button variant={'link'} className="px-5 hover:-translate-y-1 py-2 cursor-pointer" >Signup</Button>
        </Link>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-green-500 to-emerald-300"
        style={{ width: `${progress}%` }}
      />
    </header>
  );
}

/* ========================================================================== */
/*  Hero                                                                      */
/* ========================================================================== */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* animated grid */}
      <div
        className="cl-grid absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,197,94,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,.10) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
        }}
      />
      <div className="cl-glow absolute left-1/2 top-[-120px] size-[560px] -translate-x-1/2 rounded-full bg-green-500/25 blur-[140px]" />

      {/* floating chips */}
      <div className="cl-float absolute left-[6%] top-48 hidden rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-xs text-zinc-300 backdrop-blur lg:block">
        <FileCode2 className="mb-1 size-4 text-green-400" />
        auth.ts:24
      </div>
      <div
        className="cl-float absolute right-[7%] top-64 hidden rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-xs text-zinc-300 backdrop-blur lg:block"
        style={{ animationDelay: "-3s" }}
      >
        <Layers className="mb-1 size-4 text-green-400" />
        3 services mapped
      </div>

      <div className="relative mx-auto max-w-4xl px-6 pb-28 pt-24 text-center md:pt-32">
        <div className="cl-fadeUp mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-300">
          <span className="relative flex size-2">
            <span className="cl-ping absolute inline-flex size-full rounded-full bg-green-400" />
            <span className="relative inline-flex size-2 rounded-full bg-green-400" />
          </span>
          Codebase onboarding, reimagined
        </div>

        <h1
          className="cl-fadeUp text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl"
          style={{ animationDelay: "120ms" }}
        >
          Understand Any Codebase{" "}
          <span className="bg-gradient-to-r from-green-300 via-green-400 to-emerald-500 bg-clip-text text-transparent">
            On Day One
          </span>
        </h1>

        <p
          className="cl-fadeUp mx-auto mt-7 max-w-2xl text-lg text-zinc-400 md:text-xl"
          style={{ animationDelay: "260ms" }}
        >
          Connect a repository and ask anything, <span className="font-bold text-zinc-200">trace</span> maps the architecture,
          finds the right files, and answers with citations, so new engineers
          ramp up without pulling your team away.
        </p>

        <div
          className="cl-fadeUp mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "400ms" }}
        >
          <CtaButton />
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-green-500/50 hover:text-white"
          >
            See it in action
          </a>
        </div>
        <p
          className="cl-fadeUp mt-5 text-xs text-zinc-600"
          style={{ animationDelay: "500ms" }}
        >
          Free to start · Sign in with GitHub
        </p>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Ticker                                                                    */
/* ========================================================================== */

const TICKER = [
  "Chat with any repository",
  "Architecture maps in seconds",
  "Every answer cites its source",
  "Find where anything lives",
  "Onboard engineers in days, not months",
  "No more stale wikis",
  "Stop interrupting your seniors",
];

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-zinc-950/60 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />
      <div className="cl-marquee flex w-max gap-10 whitespace-nowrap text-sm text-zinc-400">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <span className="text-green-500">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  Problem                                                                   */
/* ========================================================================== */

const PROBLEMS = [
  {
    tag: "Bottleneck",
    n: "001",
    title: "Seniors Become Search Engines",
    body: "Every new hire has dozens of questions, and the same few people answer all of them.",
  },
  {
    tag: "Decay",
    n: "002",
    title: "Docs Rot Faster Than Code",
    body: "Wikis and READMEs go stale the week after they are written, so nobody trusts them.",
  },
  {
    tag: "Sprawl",
    n: "003",
    title: "Context Is Scattered",
    body: "The why lives in old PRs, tickets and chat threads that are impossible to find.",
  },
  {
    tag: "Noise",
    n: "004",
    title: "Grep Isn't Understanding",
    body: "Keyword search returns hundreds of matches but never tells you how the pieces fit.",
  },
];

function PipelineIllustration() {
  const Node = ({ label, hot }: { label: string; hot?: boolean }) => (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 font-mono text-xs tracking-widest",
        hot
          ? "border-green-500/50 bg-green-500/10 text-green-300"
          : "border-white/10 bg-zinc-900 text-zinc-400",
      )}
    >
      {label}
    </div>
  );
  const Track = ({ delay = "0s" }: { delay?: string }) => (
    <div className="relative mx-2 h-px flex-1 bg-white/10">
      {[0, 1].map((i) => (
        <span
          key={i}
          className="cl-travel absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,.9)]"
          style={{ animationDelay: `calc(${delay} + ${i * 1.4}s)` }}
        />
      ))}
    </div>
  );
  return (
    <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 p-8">
      <div className="flex items-center">
        <Node label="NEW HIRE" />
        <Track />
        <Node label="QUESTIONS" hot />
        <Track delay="0.6s" />
        <Node label="WAITING" />
        <Track delay="1.2s" />
        <Node label="RAMPED" />
      </div>
      <p className="mt-6 text-center text-xs text-zinc-600">
        Illustrative workflow: questions queue up behind busy teammates, and
        ramp-up slows.
      </p>
    </div>
  );
}

function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <SectionTitle
        eyebrow="The problem"
        title="Onboarding Is Slow And Expensive"
      />
      <Reveal delay={100}>
        <PipelineIllustration />
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {PROBLEMS.map((p, i) => (
          <Reveal key={p.n} delay={i * 90}>
            <SpotlightCard className="h-full p-7">
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-zinc-500">
                <span className="text-green-400">{p.tag}</span>
                <span>{p.n}</span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-white">{p.title}</h3>
              <p className="mt-3 text-zinc-400">{p.body}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Animated product demo                                                     */
/* ========================================================================== */

const AUTH_CODE = [
  'import NextAuth from "next-auth";',
  'import GitHub from "next-auth/providers/github";',
  "",
  "export const { handlers, auth, signIn, signOut } =",
  "  NextAuth({",
  "    providers: [GitHub],",
  '    session: { strategy: "jwt" },',
  "    callbacks: {",
  "      async jwt({ token, account }) {",
  "        if (account) token.accessToken = account.access_token;",
  "        return token;",
  "      },",
  "      async session({ session, token }) {",
  "        session.accessToken = token.accessToken;",
  "        return session;",
  "      },",
  "    },",
  "  });",
];

function colorize(line: string) {
  const parts = line.split(/(".*?"|\b(?:import|from|export|const|async|if|return)\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith('"'))
      return (
        <span key={i} className="text-green-300">
          {p}
        </span>
      );
    if (/^(import|from|export|const|async|if|return)$/.test(p))
      return (
        <span key={i} className="text-emerald-500">
          {p}
        </span>
      );
    return <span key={i}>{p}</span>;
  });
}

const DURATIONS = [900, 1700, 2100, 4400, 1700, 4400, 3600];

function Demo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [stage, setStage] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    const wait = stage < 0 ? 700 : DURATIONS[stage];
    const t = setTimeout(() => setStage((s) => (s >= 6 ? -1 : s + 1)), wait);
    return () => clearTimeout(t);
  }, [stage, inView]);

  const highlight =
    stage >= 5 ? [8, 9, 10] : stage >= 2 ? [5, 6] : ([] as number[]);

  const Bubble = ({
    role,
    children,
  }: {
    role: "You" | "trace.it";
    children: React.ReactNode;
  }) => (
    <div className="cl-fadeUp">
      <p
        className={cn(
          "mb-1 font-mono text-[10px] uppercase tracking-widest",
          role === "You" ? "text-zinc-500" : "text-green-400",
        )}
      >
        {role}
      </p>
      <p className="text-sm leading-relaxed text-zinc-200">{children}</p>
    </div>
  );

  return (
    <section id="demo" className="relative mx-auto max-w-6xl px-6 pb-28">
      <div className="cl-glow absolute left-1/2 top-1/3 size-[420px] -translate-x-1/2 rounded-full bg-green-500/15 blur-[130px]" />
      <SectionTitle
        eyebrow="Introducing trace.it"
        title="Instant Context, Right Inside Your Repo"
        sub="Ask a question in plain English, trace reads the repository, finds the relevant code, and explains it with sources."
      />

      <Reveal delay={120} className="relative mt-14">
        <div
          ref={ref}
          className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_0_80px_-20px_rgba(34,197,94,.35)]"
        >
          {/* window bar */}
          <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-zinc-700" />
              <span className="size-3 rounded-full bg-zinc-700" />
              <span className="size-3 rounded-full bg-zinc-700" />
              <span className="ml-3 font-mono text-xs text-zinc-500">
                workspace / my-app
              </span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[11px] text-green-300">
              <Check className="size-3" /> Indexed · 128 files
            </span>
          </div>

          <div className="grid md:grid-cols-[1.1fr_1fr]">
            {/* editor */}
            <div className="border-b border-white/10 md:border-b-0 md:border-r">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-xs text-zinc-400">
                <FileCode2 className="size-3.5 text-green-400" /> auth.ts
              </div>
              <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-7 text-zinc-400">
                {AUTH_CODE.map((line, i) => {
                  const on = highlight.includes(i);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex border-l-2 pr-4 transition-all duration-500",
                        on
                          ? "border-green-400 bg-green-500/10 text-zinc-100"
                          : "border-transparent",
                      )}
                    >
                      <span className="w-10 shrink-0 select-none pr-3 text-right text-zinc-700">
                        {i + 1}
                      </span>
                      <code>{colorize(line)}</code>
                    </div>
                  );
                })}
              </pre>
            </div>

            {/* chat */}
            <div className="flex h-[480px] flex-col">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-xs text-zinc-400">
                <MessageSquareText className="size-3.5 text-green-400" /> Repo chat
              </div>
              <div className="flex flex-1 flex-col justify-end gap-5 overflow-hidden p-5">
                {stage >= 0 && (
                  <Bubble role="You">How does authentication work in this repo?</Bubble>
                )}

                {stage >= 1 && (
                  <div className="cl-fadeUp rounded-xl border border-white/10 bg-black/60 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-mono text-zinc-400">
                        <Search className="size-3.5 text-green-400" /> trace.it ·
                        repo search
                      </span>
                      {stage === 1 ? (
                        <span className="flex items-center gap-1.5 text-green-300">
                          <Loader2 className="size-3 animate-spin" /> Running
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-green-300">
                          <Check className="size-3" /> 3 files
                        </span>
                      )}
                    </div>
                    {stage === 1 ? (
                      <div className="cl-shimmer mt-3 h-2 rounded bg-gradient-to-r from-zinc-800 via-green-500/30 to-zinc-800" />
                    ) : (
                      <ul className="mt-3 space-y-1 font-mono text-xs text-zinc-400">
                        {["auth.ts:5", "middleware.ts:12", "session.ts:30"].map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="size-1 rounded-full bg-green-400" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {stage >= 3 && (
                  <Bubble role="trace.it">
                    <Typewriter text="Auth uses NextAuth with GitHub OAuth and JWT sessions. middleware.ts checks the session before every /dashboard route." />
                  </Bubble>
                )}

                {stage >= 4 && (
                  <Bubble role="You">Where is the access token stored?</Bubble>
                )}

                {stage >= 5 && (
                  <Bubble role="trace.it">
                    <Typewriter text="In the jwt callback in auth.ts. It copies account.access_token onto the token, then session() exposes it." />
                  </Bubble>
                )}

                {stage >= 6 && (
                  <div className="cl-fadeUp flex items-center gap-2 text-xs text-green-300">
                    <Check className="size-3.5" /> Verified against source
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 p-3">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 text-sm text-zinc-600">
                  Ask about your codebase…
                  <span className="flex size-6 items-center justify-center rounded-md bg-green-500 text-black">
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-widest text-zinc-600">
          Illustrative example
        </p>
      </Reveal>
    </section>
  );
}

/* ========================================================================== */
/*  The loop (auto-advancing steps)                                           */
/* ========================================================================== */

const LOOP = [
  {
    k: "Connect",
    title: "Connect a repository.",
    body: "Sign in with GitHub and pick the repo you want to learn. No setup scripts, no config files.",
  },
  {
    k: "Index",
    title: "trace.it reads the whole codebase.",
    body: "Files, structure and dependencies are indexed so questions are answered from the real source.",
  },
  {
    k: "Ask",
    title: "Ask in plain English.",
    body: "Get answers with the exact files and lines they came from, so you can verify instead of guess.",
  },
  {
    k: "Explore",
    title: "See how everything fits together.",
    body: "Follow citations through the architecture and build a mental model in hours, not weeks.",
  },
];

function LoopVisual({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="space-y-3">
        {["acme/web-app", "acme/api-server", "acme/mobile"].map((r, idx) => (
          <div
            key={r}
            className="cl-fadeUp flex items-center justify-between rounded-xl border border-white/10 bg-black/60 px-4 py-3"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <span className="flex items-center gap-3 font-mono text-sm text-zinc-300">
              <FolderGit2 className="size-4 text-green-400" /> {r}
            </span>
            {idx === 1 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-300">
                <Check className="size-3" /> Connected
              </span>
            ) : (
              <span className="text-xs text-zinc-600">Connect</span>
            )}
          </div>
        ))}
      </div>
    );
  if (i === 1)
    return (
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/60 p-5 font-mono text-xs text-zinc-400">
        <div className="cl-sweep pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-green-500/20 to-transparent" />
        {[
          "src/",
          "  app/",
          "    page.tsx",
          "    api/chat/route.ts",
          "  components/",
          "    Sidebar.tsx",
          "  lib/auth.ts",
          "package.json",
        ].map((f) => (
          <div key={f} className="whitespace-pre py-0.5">
            {f}
          </div>
        ))}
      </div>
    );
  if (i === 2)
    return (
      <div className="space-y-4">
        <div className="cl-fadeUp ml-auto w-fit max-w-[80%] rounded-2xl rounded-tr-sm bg-green-500/90 px-4 py-2.5 text-sm text-black">
          Where do we handle payments?
        </div>
        <div className="cl-fadeUp rounded-2xl rounded-tl-sm border border-white/10 bg-black/60 p-4" style={{ animationDelay: "250ms" }}>
          <div className="space-y-2">
            <div className="h-2 w-full rounded bg-zinc-800" />
            <div className="h-2 w-5/6 rounded bg-zinc-800" />
            <div className="h-2 w-2/3 rounded bg-zinc-800" />
          </div>
          <div className="mt-4 flex gap-2">
            {["billing.ts:44", "stripe.ts:12"].map((c) => (
              <span key={c} className="rounded-md bg-green-500/10 px-2 py-1 font-mono text-[11px] text-green-300">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  const nodes = [
    { x: 40, y: 30, l: "UI" },
    { x: 200, y: 30, l: "API" },
    { x: 360, y: 30, l: "Auth" },
    { x: 120, y: 120, l: "DB" },
    { x: 280, y: 120, l: "Queue" },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [1, 4],
  ];
  return (
    <svg viewBox="0 0 440 170" className="w-full">
      {edges.map(([a, b], idx) => (
        <line
          key={idx}
          x1={nodes[a].x + 30}
          y1={nodes[a].y + 16}
          x2={nodes[b].x + 30}
          y2={nodes[b].y + 16}
          stroke="rgba(34,197,94,.6)"
          strokeWidth="1.5"
          strokeDasharray="5 7"
          className="cl-dash"
        />
      ))}
      {nodes.map((n) => (
        <g key={n.l}>
          <rect x={n.x} y={n.y} width="60" height="32" rx="8" fill="#052e16" stroke="rgba(74,222,128,.6)" />
          <text x={n.x + 30} y={n.y + 20} textAnchor="middle" fontSize="12" fill="#bbf7d0" fontFamily="monospace">
            {n.l}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Loop() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % LOOP.length), 5000);
    return () => clearTimeout(t);
  }, [active, paused]);

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 pb-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          {LOOP.map((s, i) => (
            <button
              key={s.k}
              onClick={() => {
                setActive(i);
                setPaused(true);
              }}
              className={cn(
                "relative block w-full border-l-2 py-5 pl-7 pr-4 text-left transition-all duration-300",
                i === active
                  ? "border-green-400 bg-green-500/5"
                  : "border-white/10 hover:border-white/30",
              )}
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                The loop / 0{i + 1}
              </span>
              <h3
                className={cn(
                  "mt-2 text-xl font-semibold transition-colors",
                  i === active ? "text-white" : "text-zinc-500",
                )}
              >
                {s.title}
              </h3>
              <div
                className={cn(
                  "grid transition-all duration-500",
                  i === active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <p className="overflow-hidden text-zinc-400">
                  <span className="mt-2 block">{s.body}</span>
                </p>
              </div>
              {i === active && !paused && (
                <span className="cl-fill absolute bottom-0 left-0 h-px bg-green-400" />
              )}
            </button>
          ))}

          <div className="mt-6 flex items-center gap-2 pl-7">
            {LOOP.map((s, i) => (
              <span
                key={s.k}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition",
                  i === active ? "bg-green-500/15 text-green-300" : "text-zinc-600",
                )}
              >
                0{i + 1} {s.k}
              </span>
            ))}
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play" : "Pause"}
              className="ml-auto rounded-full border border-white/10 p-2 text-zinc-400 transition hover:border-green-500/50 hover:text-white"
            >
              {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>
          </div>
        </div>

        <Reveal>
          <SpotlightCard className="p-6">
            <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              <span>{LOOP[active].k}</span>
              <span>0{active + 1} / 04</span>
            </div>
            <div key={active} className="cl-fadeUp min-h-[250px]">
              <LoopVisual i={active} />
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  The difference                                                            */
/* ========================================================================== */

function Difference() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-28">
      <SectionTitle
        eyebrow="The difference"
        title="Clear Answers. Real Sources."
        sub="Skip the archaeology. Get the context a senior engineer would give you, with receipts."
      />

      <div className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Reveal>
          <SpotlightCard className="h-full p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              01 / Without trace.it
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-6 text-zinc-400">
              <div>
                <span className="text-green-500">$</span> grep -r &quot;auth&quot; .
              </div>
              <div className="text-zinc-600">312 matches in 87 files…</div>
              <div className="text-zinc-600">node_modules/… (more)</div>
              <div className="text-zinc-600">README.md (outdated)</div>
            </div>
            <h4 className="mt-5 text-lg font-semibold text-white">Hours of digging</h4>
            <p className="mt-1 text-sm text-zinc-400">
              Search, skim, guess, then interrupt someone to confirm.
            </p>
          </SpotlightCard>
        </Reveal>

        <div className="hidden items-center md:flex">
          <div className="flex size-11 items-center justify-center rounded-full border border-green-500/40 bg-green-500/10 text-green-300">
            <ArrowRight className="size-5" />
          </div>
        </div>

        <Reveal delay={120}>
          <SpotlightCard className="h-full p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-green-400">
              02 / With trace.it
            </p>
            <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm leading-6 text-zinc-300">
              Auth runs through NextAuth with GitHub OAuth.
              <div className="mt-3 flex gap-2">
                {["auth.ts:5", "middleware.ts:12"].map((c) => (
                  <span key={c} className="rounded-md bg-green-500/15 px-2 py-0.5 font-mono text-[11px] text-green-300">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <h4 className="mt-5 text-lg font-semibold text-white">Answers in seconds</h4>
            <p className="mt-1 text-sm text-zinc-400">
              A direct explanation, linked to the code it came from.
            </p>
          </SpotlightCard>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          ["Know where to look.", "Answers point to the exact files and lines, so you can jump straight in."],
          ["Understand what matters.", "Explanations focus on how the code works and why, not just what it says."],
          ["Trust the source.", "Every claim links back to the repository so nothing is taken on faith."],
        ].map(([t, b], i) => (
          <Reveal key={t} delay={i * 100}>
            <div className="h-full rounded-2xl border border-white/10 p-6 transition hover:border-green-500/30">
              <span className="font-mono text-xs text-green-400">0{i + 1}</span>
              <h4 className="mt-4 text-xl font-semibold text-white">{t}</h4>
              <p className="mt-2 text-zinc-400">{b}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  How it works                                                              */
/* ========================================================================== */

const STEPS = [
  { icon: GitBranch, t: "Connect the repo", b: "Pick any repository from your GitHub account." },
  { icon: MessageSquareText, t: "Ask anything", b: "Chat with the codebase and get cited answers." },
  { icon: Layers, t: "Explore the code", b: "Open generated files and follow the architecture." },
];

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 pb-28">
      <SectionTitle
        eyebrow="How it works"
        title="Onboarding That Keeps Work Moving"
        sub="trace.it turns a repository into a conversation, so people learn while they ship."
      />
      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent md:block" />
        {STEPS.map((s, i) => (
          <Reveal key={s.t} delay={i * 130}>
            <SpotlightCard className="h-full p-7">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400 ring-1 ring-green-500/30">
                  <s.icon className="size-5" />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                  Step 0{i + 1}
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-semibold text-white">{s.t}</h3>
              <p className="mt-2 text-zinc-400">{s.b}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Benefits                                                                  */
/* ========================================================================== */

function Benefits() {
  const items = [
    { icon: Timer, t: "Ramp Faster", b: "New engineers become productive in days instead of waiting weeks for context." },
    { icon: Users, t: "Interrupt Less", b: "Your senior engineers stay focused while newcomers get answers on their own." },
    { icon: Zap, t: "Ship Sooner", b: "Less time hunting for context means more time building the thing that matters." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 pb-28">
      <SectionTitle
        eyebrow="Benefits"
        title="Less Waiting. More Shipping."
        sub="Turn onboarding from a drain on your team into something that runs itself."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 110}>
            <SpotlightCard className="h-full p-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-400 ring-1 ring-green-500/30 transition-transform duration-300 group-hover:scale-110">
                <it.icon className="size-6" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-white">{it.t}</h3>
              <p className="mt-3 text-zinc-400">{it.b}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Get started + stack                                                       */
/* ========================================================================== */

function GetStarted() {
  const steps = [
    ["01 / Sign in", "Log in with GitHub.", "One click, no new password to manage."],
    ["02 / Choose", "Pick a repository.", "Select any repo you have access to."],
    ["03 / Ask", "Start the conversation.", "Ask your first question and explore the answer."],
  ];
  const stack: [string, string[]][] = [
    ["Source control", ["GitHub"]],
    ["Languages", ["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java"]],
    ["Use it with", ["Any editor", "Any terminal"]],
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 pb-28">
      <SectionTitle eyebrow="Get started" title="Start where the code already lives." />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {steps.map(([k, t, b], i) => (
          <Reveal key={k} delay={i * 110}>
            <SpotlightCard className="h-full p-7">
              <p className="font-mono text-xs uppercase tracking-widest text-green-400">{k}</p>
              <h3 className="mt-5 text-2xl font-semibold text-white">{t}</h3>
              <p className="mt-2 text-zinc-400">{b}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10">
        <div className="rounded-2xl border border-white/10 p-8">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Sparkles className="size-5 text-green-400" /> Works with your stack.
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {stack.map(([label, chips]) => (
              <div key={label}>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                  {label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-sm text-zinc-300 transition hover:border-green-500/50 hover:text-green-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ========================================================================== */
/*  FAQ                                                                       */
/* ========================================================================== */

const FAQS = [
  ["Which repositories can I use?", "Any repository on your connected GitHub account that you have access to, public or private."],
  ["How accurate are the answers?", "Answers are grounded in the repository's actual code and cite the files and lines they came from, so you can always verify."],
  ["Does it replace our documentation?", "No. It complements it. trace.it answers from the live code, so it stays accurate even when docs fall behind."],
  ["Do I need to configure anything?", "No. Sign in, choose a repository, and start asking questions."],
  ["Which languages are supported?", "trace.it works across the popular languages, including TypeScript, JavaScript, Python, Go, Rust and Java."],
  ["Is my code safe?", "Access is limited to the repositories you choose to connect. See our privacy policy for how data is handled."],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 pb-28">
      <SectionTitle eyebrow="FAQ" title="Frequently asked questions." />
      <div className="mt-12 divide-y divide-white/10 rounded-2xl border border-white/10">
        {FAQS.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.02]"
              >
                <span className="flex items-center gap-4">
                  <span className="font-mono text-xs text-green-400">0{i + 1}</span>
                  <span className={cn("font-medium transition-colors", isOpen ? "text-white" : "text-zinc-300")}>
                    {q}
                  </span>
                </span>
                <ChevronDown
                  className={cn("size-4 shrink-0 text-zinc-500 transition-transform duration-300", isOpen && "rotate-180 text-green-400")}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 pl-[3.75rem] text-zinc-400">{a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Final CTA + footer                                                        */
/* ========================================================================== */

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 py-32">
      <div className="cl-glow absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/25 blur-[150px]" />
      <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-balance text-5xl font-semibold tracking-tight text-white md:text-6xl">
          Ship{" "}
          <span className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-transparent">
            Confidently
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
          Give every new engineer the context of your best one.
        </p>
        <div className="mt-10 flex justify-center">
          <CtaButton label="Start free" className="px-8 py-4 text-base" />
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/15 text-sm font-bold text-green-400 ring-1 ring-green-500/40">
              CL
            </div>
            <span className="text-lg font-semibold text-white">trace.it</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-zinc-500">
            Codebase onboarding for engineering teams.
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">Product</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#how" className="hover:text-white">How it works</a></li>
            <li><a href="#faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">Legal</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-zinc-600">
        <span className="inline-flex items-center gap-2">
          <BookOpen className="size-3.5" /> © 2026 trace.it. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

/* ========================================================================== */
/*  Page                                                                      */
/* ========================================================================== */

export default function LandingPage() {
  return (
    <div className="cl-root overflow-x-clip bg-black text-zinc-200">
      <style>{STYLES}</style>
      <Nav />
      <Hero />
      <Ticker />
      <Problem />
      <Demo />
      <Loop />
      <Difference />
      <HowItWorks />
      <Benefits />
      <GetStarted />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}