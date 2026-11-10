"use client";

import {
  Loader2,
  Sparkles,
  Clock3,
  Code2,
  Lock,
} from "lucide-react";
import { FiGithub } from "react-icons/fi";

interface AnalysisCardProps {
  isAnalyzing: boolean;
  activeRepoName: string;
  progressMessageIndex: number;
  currentMessage?: {
    title: string;
    description: string;
  };
}

const AnalysisCard = ({
  isAnalyzing,
  activeRepoName,
  progressMessageIndex,
  currentMessage,
}: AnalysisCardProps) => {
  if (!isAnalyzing) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={`Analyzing ${activeRepoName}`}
    >
      <div className="analysis-card w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-2xl">
        <div className="h-1 w-full overflow-hidden bg-zinc-800">
          <div className="progress-bar h-full rounded-full bg-emerald-500" />
        </div>

        <div className="px-7 py-9 sm:px-10">
          <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full border border-emerald-500/20" />
            <div className="absolute inset-2 rounded-full border border-emerald-500/30" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Code2 className="h-7 w-7 animate-pulse" />
            </div>
          </div>

          <div className="mb-7 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Repository analysis
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-white">
              Working on your repository
            </h2>

            <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
              <FiGithub className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="truncate font-mono text-sm text-zinc-300">
                {activeRepoName}
              </span>
            </div>
          </div>

          <div className="message-container min-h-[105px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-5 py-5 text-center">
            <div key={progressMessageIndex} className="message-animation">
              <div className="mb-2 flex items-center justify-center gap-2">
                {progressMessageIndex >= 4 ? (
                  <Clock3 className="h-4 w-4 text-amber-400" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                )}

                <h3 className="text-sm font-semibold text-zinc-100">
                  {currentMessage?.title ?? "Getting things ready..."}
                </h3>
              </div>

              <p className="text-sm leading-relaxed text-zinc-400">
                {currentMessage?.description ??
                  "Please give me a moment while I prepare your repository."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Lock className="h-3.5 w-3.5" />
            Please keep this page open while I work.
          </div>
        </div>
      </div>
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
};

export default AnalysisCard;