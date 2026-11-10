"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FiGithub } from "react-icons/fi";
import {
  Loader2,
  Search,
  Sparkles,
  Clock3,
  Code2,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import AnalysisCard from "@/components/AnalysisCard";
import RepositoryContainer from "@/components/RepositoryContainer";

export default function RepositoryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeRepoName, setActiveRepoName] = useState("");
  const [loadingItemId, setLoadingItemId] = useState("");
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [progressMessageIndex, setProgressMessageIndex] = useState(0);
  const [allAnalyzedRepoIds, setAllAnalyzedRepoIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const isAnalyzing = Boolean(loadingItemId);

  const progressMessages = [
    {
      title: "Let's get things started!",
      description:
        "I'm getting your repository ready for analysis. This should just take a moment.",
    },
    {
      title: "Taking a closer look...",
      description:
        "I'm working through your repository and preparing its code for analysis.",
    },
    {
      title: "There's quite a bit to explore!",
      description:
        "Larger repositories naturally take a little longer. Thanks for hanging in there.",
    },
    {
      title: "Still working on it...",
      description:
        "Your repository is taking a little longer than expected. Don't worry, I'm still working on it.",
    },
    {
      title: "Thanks for sticking around!",
      description:
        "I'm still working through your repository. You can sit back and relax while I finish up.",
    },
    {
      title: "A little patience goes a long way.",
      description:
        "We're still in beta, so some analyses can take longer than usual. I really appreciate your patience!",
    },
    {
      title: "There's quite a bit to explore!",
      description:
        "Larger repositories naturally take a little longer. Thanks for hanging in there.",
    },
    {
      title: "Still working on it...",
      description:
        "Your repository is taking a little longer than expected. Don't worry, I'm still working on it.",
    },
    {
      title: "A little patience goes a long way.",
      description:
        "We're still in beta, so some analyses can take longer than usual. I really appreciate your patience!",
    },
  ];

  // Search debounce
  useEffect(() => {
    if (isAnalyzing) return;

    if (searchQuery.trim() !== "") {
      setIsSearching(true);
    }

    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setIsSearching(false);
      setCurrentPage(1);
    }, 800);

    return () => clearTimeout(handler);
  }, [searchQuery, isAnalyzing]);

  // Fetch repositories
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    async function fetchRepoIds() {
      try {
        const res1 = await fetch("/api/repositories/analyze");

        if (!res1.ok) {
          throw new Error("Failed to fetch repositories status");
        }

        const data1 = await res1.json();
        setAllAnalyzedRepoIds(data1.analyzedRepoIds);
      } catch (error) {}
    }

    async function fetchRepositories() {
      try {
        setLoadingRepos(true);

        const res = await fetch("/api/repositories");

        if (!res.ok) {
          throw new Error("Failed to fetch repositories");
        }

        const data = await res.json();

        setRepositories(data);
      } catch (error) {
        console.error(error);
        toast.error("Couldn't load your repositories.");
      } finally {
        setLoadingRepos(false);
      }
    }

    if (status === "authenticated") {
      fetchRepositories();
      fetchRepoIds();
    }
  }, [status, router]);

  // Rotate friendly progress messages while analysis is running.
  useEffect(() => {
    if (!isAnalyzing) {
      setProgressMessageIndex(0);
      return;
    }

    setProgressMessageIndex(0);

    const timers = [
      setTimeout(() => setProgressMessageIndex(1), 9000),
      setTimeout(() => setProgressMessageIndex(2), 18000),
      setTimeout(() => setProgressMessageIndex(3), 30000),
      setTimeout(() => setProgressMessageIndex(4), 50000),
      setTimeout(() => setProgressMessageIndex(5), 75000),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isAnalyzing, loadingItemId]);

  // Loading screen
  if (status === "loading" || loadingRepos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          Loading your repositories...
        </div>
      </div>
    );
  }

  if (!session) return null;

  const user = session?.user;

  // Filter repositories
  const filteredRepos = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredRepos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentRepos = filteredRepos.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const currentMessage = progressMessages[progressMessageIndex];

  return (
    <div className="min-h-screen  bg-[#09090b] text-zinc-100">
      {/* Analysis progress overlay */}
      <AnalysisCard
        isAnalyzing={isAnalyzing}
        activeRepoName={activeRepoName}
        progressMessageIndex={progressMessageIndex}
        currentMessage={currentMessage}
      />

      {/* Main page */}
      <main
        className={`mx-auto max-w-[90%] px-5 py-10 sm:px-8 lg:px-12 ${
          isAnalyzing ? "pointer-events-none select-none" : ""
        }`}
        aria-busy={isAnalyzing}
      >
        {/* Header */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Developer workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Your repositories
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Connect, analyze and understand your codebase.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              disabled={isAnalyzing}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 border-zinc-800 bg-zinc-900 pl-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Repository count */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              All repositories
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Showing {filteredRepos.length > 0 ? startIndex + 1 : 0}–
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredRepos.length)} of{" "}
              {filteredRepos.length} repositories
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {loadingItemId && <Loader2 className="animate-spin" />}
            {user?.isGithubConnected ? (
              <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-400 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                GitHub connected
              </div>
            ) : (
              <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-400 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                GitHub not connected
              </div>
            )}
          </div>
        </div>

        {/* Repository container */}
        <RepositoryContainer
          repositories={repositories}
          isAnalyzing={isAnalyzing}
          filteredRepos={filteredRepos}
          currentRepos={currentRepos}
          loadingItemId={loadingItemId}
          setLoadingItemId={setLoadingItemId}
          setActiveRepoName={setActiveRepoName}
          allAnalyzedRepoIds={allAnalyzedRepoIds}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || isAnalyzing}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || isAnalyzing}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Beta note */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <p className="text-xs leading-relaxed text-zinc-500">
            <span className="font-medium text-zinc-300">
              A little note from us:
            </span>{" "}
            We're still improving repository analysis. Larger codebases may take
            a little longer, and we appreciate your patience while we're in
            beta.
          </p>
        </div>
      </main>

      {/* Message animations */}
      <style jsx>{`
        .message-animation {
          animation: messageEnter 0.5s ease-out both;
        }

        @keyframes messageEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .progress-bar {
          width: 35%;
          animation: progressMove 2s ease-in-out infinite;
        }

        @keyframes progressMove {
          0% {
            transform: translateX(-110%);
          }

          100% {
            transform: translateX(310%);
          }
        }

        .analysis-card {
          animation: cardEnter 0.35s ease-out both;
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(12px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .message-animation,
          .analysis-card,
          .progress-bar {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
