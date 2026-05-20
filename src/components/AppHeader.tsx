"use client";

import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";

type AppHeaderProps = {
  email: string;
};

export function AppHeader({ email }: AppHeaderProps) {
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="bg-base-200/80 backdrop-blur border-b border-base-300 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Concert Cost Tracker
          </h1>
          <p className="text-sm opacity-80 max-w-xl">
            Log what you spent in USD, rate the fun, and see which shows were worth every dollar.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <ThemeSelector compact className="max-w-[10rem]" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-outline badge-lg truncate max-w-[14rem]" title={email}>
              {email}
            </span>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
