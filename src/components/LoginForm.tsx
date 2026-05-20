"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlignedField } from "@/components/AlignedField";

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password. Try again, or use Create an account if you have not signed up yet.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email first. Check your inbox for a link from Supabase, or ask your teacher to turn off email confirmation in Supabase.";
  }
  if (lower.includes("user already registered")) {
    return "This email already has an account. Switch to Log in instead.";
  }
  return message;
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback`;

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      setLoading(false);
      if (error) {
        setMessage({ type: "error", text: friendlyAuthError(error.message) });
        return;
      }
      if (data.session) {
        router.refresh();
        router.push("/app");
        return;
      }
      setMessage({
        type: "success",
        text: "Account created! If email confirmation is on, check your inbox. Otherwise, log in below.",
      });
      setMode("login");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: friendlyAuthError(error.message) });
      return;
    }
    if (data.session) {
      router.refresh();
      router.push("/app");
    } else {
      setMessage({
        type: "error",
        text: "Signed in, but no session was created. Check Supabase URL settings for this site.",
      });
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-md">
      <div className="card-body">
        <h2 className="card-title justify-center text-2xl">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-center text-sm opacity-80 mb-2">
          {mode === "login"
            ? "Log in to track your concert spending and fun."
            : "Sign up free to start logging concerts."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AlignedField label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </AlignedField>

          <AlignedField label="Password" htmlFor="password" hint="At least 6 characters">
            <input
              id="password"
              type="password"
              className="input input-bordered w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </AlignedField>

          {message && (
            <div
              role="alert"
              className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} text-sm`}
            >
              <span>{message.text}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : mode === "login" ? (
              "Log in"
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-2">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                className="link link-primary"
                onClick={() => {
                  setMode("signup");
                  setMessage(null);
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="link link-primary"
                onClick={() => {
                  setMode("login");
                  setMessage(null);
                }}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
