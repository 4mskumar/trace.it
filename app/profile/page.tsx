"use client";
import Image from "next/image";
import ProgressChart from "@/components/ProgressChart"; // Make sure path matches your setup
import { Button } from "@/components/ui/button";
import { Code2, Sparkles, CheckCircle2, MessageSquare, Bot } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const ProfileDashboardPage = () => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [stats, setStats] = useState({
    repoCount: 0,
    messagesSent: 0,
    messagesReceived: 0,
    codeEntityCount: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/profile/stats");

        if (!res.ok) {
          throw new Error("Failed to fetch profile statistics");
        }

        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Profile statistics error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6 text-zinc-100 animate-pulse">
        <div className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-6 h-28 flex items-center">
          <div className="h-16 w-16 rounded-full bg-zinc-800" />
          <div className="ml-4 space-y-2">
            <div className="h-5 w-32 bg-zinc-800 rounded" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 text-zinc-100">
      {/* User Info Header Card */}
      <div className="border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
            <Image
              alt={`${user?.name ?? "User"}'s profile picture`}
              src={
                user?.image && user.image.trim() !== ""
                  ? user.image
                  : "/images/user.png"
              }
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              {user?.name ?? "Developer"}
            </h1>
            <p className="text-sm text-zinc-400 font-mono">
              {user?.email ?? "@developer"}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full mt-1">
              <CheckCircle2 className="w-3 h-3" />
              GitHub connected
            </div>
          </div>
        </div>
        {/* <Button
          variant="outline"
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-200"
        >
          Edit profile
        </Button> */}
      </div>

      {/* Metrics & Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Connected Repositories */}
        <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-sm font-medium">Connected Repos</span>
            <FiGithub className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-zinc-100">
              {loading ? "..." : stats.repoCount}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Connected GitHub repositories
            </p>
          </div>
        </div>

        {/* Messages Sent */}
        <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-sm font-medium">Messages Sent</span>
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-zinc-100">
              {loading ? "..." : stats.messagesSent}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Questions asked by you</p>
          </div>
        </div>

        {/* Messages Received */}
        <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-sm font-medium">AI Responses</span>
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-zinc-100">
              {loading ? "..." : stats.messagesReceived}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Responses received from AI
            </p>
          </div>
        </div>

        {/* Code Entities */}
        <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-sm font-medium">Code Entities</span>
            <Code2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-zinc-100">
              {loading ? "..." : stats.codeEntityCount}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Indexed functions, classes and more
            </p>
          </div>
        </div>
      </div>

      {/* Progress Chart Section (Connected to live metrics) */}
      <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-6">
        <h2 className="text-lg font-medium text-zinc-200 mb-4">
          Activity & Indexing Overview
        </h2>
        <ProgressChart 
          codeEntityCount={stats.codeEntityCount} 
          messagesSent={stats.messagesSent} 
        />
      </div>
    </div>
  );
};

export default ProfileDashboardPage;