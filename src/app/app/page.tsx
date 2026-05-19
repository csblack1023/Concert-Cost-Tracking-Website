import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardStats } from "@/components/DashboardStats";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/types/concert";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  const concerts = (data ?? []) as Concert[];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {error && (
        <div className="alert alert-warning mb-4">
          <span>
            Could not load concerts. Make sure the database table exists and your account is
            set up. ({error.message})
          </span>
        </div>
      )}
      <DashboardStats concerts={concerts} />
      <DashboardCharts concerts={concerts} />
    </div>
  );
}
