"use client";
import { Button } from "@/components/ui/button";
import { FiGithub } from "react-icons/fi";
import { User, Sliders, Save, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState(""); // Stores the baseline name from DB/Session
  const [saveOption, setSaveOption] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const { data: session, status, update } = useSession();

  const user = session?.user;
  

  // Fetch initial data & set baseline name
  useEffect(() => {
    async function fetchRepositories() {
      try {
        const res = await fetch("/api/repositories");
        if (!res.ok) throw new Error("Failed to fetch repositories");
        const data = await res.json();
        if (data && data.length > 0) {
          setUsername(data[0].owner.login);
        }
      } catch (error) {
        console.error(error);
        toast.error("Couldn't load your repositories.");
      }
    }

    if (status === "authenticated" && session?.user?.name) {
      setName(session.user.name);
      setInitialName(session.user.name); // Set baseline comparison point
      fetchRepositories();
    }
  }, [status, session]);

  // Enable Save button ONLY if the typed name differs from the original baseline name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Enable save button only if text changed and is not empty
    if (newName.trim() !== initialName && newName.trim() !== "") {
      setSaveOption(true);
    } else {
      setSaveOption(false);
    }
  };

 async function handleNameUpdate() {
    try {
      const email = user?.email;
      setSavingName(true);
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update name");
      }

      // 1. Update the active NextAuth session cookie live without refreshing
      await update({ name: name });

      toast.success("Display name updated successfully.");
      setInitialName(name); 
      setSaveOption(false);  
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setSavingName(false);
    }
  }

  const handleReAuth = async () => {
    try {
      setLoading(true);
      await signIn("github", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to re-authenticate. Please try again later.");
      setLoading(false);
    }
  };

  const handleSaveToken = () => {
    setTokenLoading(true);
    setTimeout(() => {
      setTokenLoading(false);
      toast.success("Personal access token updated successfully.");
    }, 800);
  };

  return (
    <div className="max-w-[90%] mx-auto p-6 space-y-8 text-zinc-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your account credentials, repository access, and index
          preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <section className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-zinc-200 font-medium">
            <User className="w-4 h-4 text-indigo-400" />
            <h2>Account Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Username
              </label>
              <input
                type="text"
                value={username}
                readOnly
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* GitHub & Integration Settings */}
        <section className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-zinc-200 font-medium">
            <FiGithub className="w-4 h-4 text-zinc-300" />
            <h2>GitHub Integration</h2>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-zinc-200">
                Connected Account
              </p>
              <p className="text-xs text-zinc-400">
                Authenticated via GitHub OAuth
              </p>
            </div>
            <Button
              onClick={handleReAuth}
              disabled={loading}
              variant="outline"
              className="border-zinc-800 hover:bg-zinc-800 text-xs disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
              {loading ? "Redirecting..." : "Re-authenticate"}
            </Button>
          </div>
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-zinc-400">
              Personal Access Token (Optional for private repos)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Button
                onClick={handleSaveToken}
                disabled={tokenLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 disabled:opacity-50"
              >
                {tokenLoading && (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                )}
                Save
              </Button>
            </div>
          </div>
        </section>

        {/* Indexing & Model Preferences */}
        <section className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-zinc-200 font-medium">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2>Indexing & Search Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Auto-sync Repositories
                </p>
                <p className="text-xs text-zinc-400">
                  Automatically re-index on git push events
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Default Chunking Strategy
              </label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500">
                <option value="ast">
                  AST (Abstract Syntax Tree) - Recommended
                </option>
                <option disabled value="fixed">
                  Fixed Block Chunks - 512 tokens (in development)
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            onClick={handleNameUpdate}
            disabled={!saveOption || savingName}
            className="bg-indigo-600 duration-300 hover:bg-indigo-500 text-white flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {savingName && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;