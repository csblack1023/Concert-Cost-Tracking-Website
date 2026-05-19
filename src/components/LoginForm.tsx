"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlignedField } from "@/components/AlignedField";

export function LoginForm() {
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

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setMessage({
        type: "success",
        text: "Account created! Check your email if confirmation is required, then log in.",
      });
      setMode("login");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    window.location.href = "/app";
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
