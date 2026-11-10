import { Button } from "@/components/ui/button";
import { FiGithub } from "react-icons/fi";
import { Loader2, Search, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";

type GitHubRepository = {
  id: number;
  name: string;
  description: string | null;
  default_branch: string;
  owner: {
    login: string;
  };
};

type AnalyzedRepository = {
  githubId: string | number;
  updatedAt: string | Date;
};

type RepositoryContainerProps = {
  repositories: GitHubRepository[];
  isAnalyzing: boolean;
  filteredRepos: GitHubRepository[];
  currentRepos: GitHubRepository[];
  loadingItemId: string;
  setLoadingItemId: Dispatch<SetStateAction<string>>;
  setActiveRepoName: Dispatch<SetStateAction<string>>;
  allAnalyzedRepoIds?: AnalyzedRepository[];
};

const RepositoryContainer = ({
  repositories,
  isAnalyzing,
  filteredRepos,
  currentRepos,
  loadingItemId,
  setLoadingItemId,
  setActiveRepoName,
  allAnalyzedRepoIds = [],
}: RepositoryContainerProps) => {
  const router = useRouter();

  async function handleRepositoryAnalyze(
    owner: string,
    repoName: string,
    id: string | number,
  ) {
    if (isAnalyzing) return;

    if (!owner || !repoName || !id) {
      toast.error("Repository information is incomplete.");
      return;
    }

    setLoadingItemId(String(id));
    setActiveRepoName(repoName);

    try {
      const res = await fetch("/api/repositories/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repo: repoName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong during analysis.");
      }

      router.push(`/dashboard/repos/${owner}/${repoName}/${id}`);
      toast.success("Repository analysis completed!");
    } catch (error) {
      console.error("Repository analysis failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoadingItemId("");
      setActiveRepoName("");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
      {/* Empty state */}
      {repositories.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
            <FiGithub className="h-8 w-8 text-zinc-400" />
          </div>

          <h3 className="text-lg font-semibold text-white">
            No repositories found
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
            Connect your GitHub account to bring your repositories into your
            workspace.
          </p>

          <Button
            disabled={isAnalyzing}
            onClick={() => signIn("github")}
            className="mt-6 gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <FiGithub className="h-4 w-4" />
            Connect GitHub
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* No search results */}
      {repositories.length > 0 && filteredRepos.length === 0 && (
        <div className="px-6 py-16 text-center">
          <Search className="mx-auto mb-4 h-8 w-8 text-zinc-600" />
          <h3 className="font-medium text-zinc-200">
            No matching repositories
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Try searching with a different repository name.
          </p>
        </div>
      )}

      {/* Table header */}
      {currentRepos.length > 0 && (
        <>
          <div className="hidden grid-cols-12 border-b border-zinc-800 bg-zinc-900/70 px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 md:grid">
            <div className="col-span-4">Repository</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Last Indexed</div>
            <div className="col-span-3 text-right">Action</div>
          </div>

          {/* Repository rows */}
          {currentRepos.map((repo) => {
            const isCurrentRepo = loadingItemId === String(repo.id);

            // Find matching analyzed record from DB data
            const analyzedRecord = allAnalyzedRepoIds.find(
              (item) => String(item.githubId) === String(repo.id),
            );

            const isAnalyzed = Boolean(analyzedRecord);

            // Format updatedAt date if available
            const formattedDate = analyzedRecord?.updatedAt
              ? new Date(analyzedRecord.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Not analyzed yet";

            const ownerLogin = repo?.owner?.login;
            const repoName = repo?.name;

            return (
              <div
                key={repo.id}
                className="grid grid-cols-1 items-center gap-4 border-b border-zinc-800/70 px-5 py-5 transition-colors last:border-b-0 hover:bg-zinc-900/80 md:grid-cols-12 md:px-6"
              >
                {/* Repository name & details */}
                <div className="min-w-0 md:col-span-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
                      <FiGithub className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      {isAnalyzed ? (
                        <Link
                          href={`/dashboard/repos/${ownerLogin}/${repoName}/${repo.id}`}
                          className="font-mono text-sm font-semibold text-zinc-100 hover:text-emerald-400 hover:underline truncate block"
                        >
                          {repoName}
                        </Link>
                      ) : (
                        <h3 className="truncate font-mono text-sm font-semibold text-zinc-100">
                          {repoName}
                        </h3>
                      )}

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {repo.description || "No description provided"}
                      </p>

                      <p className="mt-2 text-xs text-zinc-600">
                        {ownerLogin || "GitHub"} /{" "}
                        {repo.default_branch || "main"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="md:col-span-3">
                  {isAnalyzed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/60 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Analyzed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      Not analyzed
                    </span>
                  )}
                </div>

                {/* Last Indexed timestamp */}
                <div className="text-xs text-zinc-400 md:col-span-2 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{formattedDate}</span>
                </div>

                {/* Action Button */}
                <div className="md:col-span-3 md:text-right">
                  <Button
                    onClick={() =>
                      handleRepositoryAnalyze(ownerLogin, repoName, repo.id)
                    }
                    disabled={isAnalyzing}
                    className={`h-9 cursor-pointer w-full gap-2 text-xs font-semibold transition-all md:w-auto ${
                      isCurrentRepo
                        ? "bg-emerald-600 text-white"
                        : isAnalyzed
                          ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                          : "bg-zinc-100 text-zinc-950 hover:bg-emerald-800 hover:text-white"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {isCurrentRepo ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : isAnalyzed ? (
                      <>
                        Re-analyze
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Analyze
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default RepositoryContainer;
