"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "idle" | "success" | "error";

const inputClass =
  "h-11 border-white/10 bg-zinc-900/60 pl-10 text-white placeholder:text-zinc-600 focus-visible:border-green-500/60 focus-visible:ring-green-500/20";

function passwordScore(pw: string) {
  return [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(
    Boolean,
  ).length;
}

export default function RegisterFormClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);
  const strengthLabel = ["Too weak", "Weak", "Okay", "Good", "Strong"][score];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setStatus("idle");
    setPreviewUrl("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Registration failed.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Account created.");
      setPreviewUrl(data.previewUrl || "");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm text-zinc-300">
          Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm text-zinc-300">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm text-zinc-300">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className={cn(inputClass, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-green-400"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {/* Strength meter */}
        {password && (
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    i <= score
                      ? score <= 1
                        ? "bg-red-500"
                        : score === 2
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      : "bg-zinc-800",
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500">{strengthLabel}</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="group relative h-11 w-full overflow-hidden bg-green-500 text-sm font-semibold text-black transition hover:bg-green-400 hover:shadow-[0_0_35px_-5px_rgba(34,197,94,.7)] disabled:opacity-60"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative flex items-center justify-center gap-2">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Creating account..." : "Create account"}
        </span>
      </Button>

      {/* Status message */}
      {message && (
        <div
          role="status"
          className={cn(
            "flex items-start gap-2.5 rounded-lg border p-3 text-sm",
            status === "error"
              ? "border-red-900/60 bg-red-950/40 text-red-300"
              : "border-green-500/30 bg-green-500/10 text-green-200",
          )}
        >
          {status === "error" ? (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          )}
          <span className="break-words">{message}</span>
        </div>
      )}

      {/* Ethereal preview */}
      {previewUrl && (
        <div className="space-y-2 rounded-lg border border-green-500/30 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium text-white">Your test email is ready.</p>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 break-all text-sm text-green-400 underline-offset-4 hover:underline"
          >
            Open Ethereal email preview
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
          <p className="text-xs leading-relaxed text-zinc-500">
            In the preview, click “Verify email address.” You will then be signed in and
            redirected to the dashboard.
          </p>
        </div>
      )}
    </form>
  );
}