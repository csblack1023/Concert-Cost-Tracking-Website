import type { Concert } from "@/types/concert";
import {
  costPerHour,
  formatCurrency,
  formatDate,
  funPointsPer100,
  topCostCategories,
  totalCost,
} from "@/lib/concert-utils";

export function ConcertCard({ concert }: { concert: Concert }) {
  const total = totalCost(concert);
  const cph = costPerHour(concert);
  const fpd = funPointsPer100(concert);
  const categories = topCostCategories(concert);

  return (
    <article className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body gap-3">
        <div className="flex flex-wrap justify-between gap-2 items-start">
          <div>
            <h3 className="card-title text-xl">{concert.concert_name}</h3>
            <p className="text-base-content/80">{concert.artist}</p>
          </div>
          <span className="badge badge-primary badge-lg">{formatDate(concert.concert_date)}</span>
        </div>

        <p className="text-sm">
          {concert.venue} · {concert.city}, {concert.state}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Total cost" value={formatCurrency(total)} />
          <Metric label="Fun rating" value={`${concert.fun_rating} / 10`} />
          <Metric label="Cost per hour" value={formatCurrency(cph)} />
          <Metric label="Fun Points per $100" value={fpd.toFixed(2)} />
        </div>

        {categories.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase opacity-60 mb-1">Main costs</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <span key={c} className="badge badge-outline">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {concert.notes && (
          <p className="text-sm bg-base-200 rounded-lg p-3 italic">&ldquo;{concert.notes}&rdquo;</p>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-base-200/60 rounded-lg p-2">
      <p className="text-xs opacity-60">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
