"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert, Loader2, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth/client";

function messageFor(status: number | undefined, fallback?: string) {
  if (status === 401) return "Incorrect email or password.";
  if (status === 403) return "Sign-in was blocked because this address is not a trusted origin. Check BETTER_AUTH_URL / BETTER_AUTH_TRUSTED_ORIGINS.";
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  return fallback || "Could not sign in right now. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        if (!email || !password) {
          setError("Enter your email and password.");
          return;
        }
        setPending(true);
        setError("");
        try {
          const { error: err } = await authClient.signIn.email({ email, password });
          if (err) {
            setError(messageFor(err.status, err.message));
            setPending(false);
            return;
          }
          router.replace("/admin");
          router.refresh();
        } catch {
          setError("Could not reach the server. Check your connection and try again.");
          setPending(false);
        }
      }}
    >
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="admin-input" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="admin-input" />
      </div>
      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary w-full">
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <LogIn aria-hidden className="size-4" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
