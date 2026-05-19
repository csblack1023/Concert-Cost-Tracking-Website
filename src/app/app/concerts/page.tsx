import { ConcertCard } from "@/components/ConcertCard";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/types/concert";
import Link from "next/link";

export default async function MyConcertsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  const concerts = (data ?? []) as Concert[];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Concerts</h2>

      {error && (
        <div className="alert alert-warning mb-4">
          <span>Could not load concerts. ({error.message})</span>
        </div>
      )}

      {concerts.length === 0 ? (
        <div className="hero bg-base-100 rounded-box py-12 border border-base-300">
          <div className="hero-content text-center">
            <div>
              <p className="text-4xl mb-4" aria-hidden>
                🎤
              </p>
              <h3 className="text-xl font-semibold">No concerts logged yet</h3>
              <p className="py-3 opacity-80 max-w-md">
                No concerts logged yet. Add your first concert to start seeing your dashboard.
              </p>
              <Link href="/app/add" className="btn btn-primary">
                Add your first concert
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {concerts.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      )}
    </div>
  );
}
