import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { DashboardStats } from "@/components/DashboardStats";
import { createClient } from "@/lib/supabase/server";
import { fetchConcertsForUser, normalizeConcert } from "@/lib/fetch-concerts";
import type { Concert } from "@/types/concert";

/** Always render fresh — avoids stale stat cards on hosted deploys */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await fetchConcertsForUser(supabase);

  const concerts = (data ?? []).map((row) => normalizeConcert(row as Concert));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {error && (
        <div className="alert alert-warning mb-4">
          <span>
            Could not load concerts. ({error.message}) If you added new features, run
            supabase/RUN_IN_SUPABASE_SQL_EDITOR.sql in the Supabase SQL Editor.
          </span>
        </div>
      )}
      <DashboardStats concerts={concerts} />
      <DashboardClient concerts={concerts} />
    </div>
  );
}
