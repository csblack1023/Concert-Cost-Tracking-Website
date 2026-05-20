import type { Concert } from "@/types/concert";
import {
  formatCurrency,
  formatDate,
  funPointsPer100,
  topCostCategories,
  totalCost,
} from "@/lib/concert-utils";
import { FUN_POINTS_LABEL } from "@/lib/format-usd";
import { ticketGroupTotal } from "@/lib/ticket-utils";
import Link from "next/link";

export function ConcertCard({ concert }: { concert: Concert }) {
  const total = totalCost(concert);
  const fpd = funPointsPer100(concert);
  const categories = topCostCategories(concert, 3);
  const groups = concert.concert_ticket_groups ?? [];

  return (
    <article className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body gap-3">
        <div className="flex flex-wrap justify-between gap-2 items-start">
          <div>
            <h3 className="card-title text-xl">{concert.concert_name}</h3>
            <p className="text-base-content/80">{concert.artist}</p>
          </div>
          <span className="badge badge-primary badge-lg">
            {formatDate(concert.concert_date)}
          </span>
        </div>

        <p className="text-sm">
          {concert.venue} · {concert.city}, {concert.state}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Metric label="Total cost (USD)" value={formatCurrency(total)} />
          <Metric label="Rating" value={`${concert.fun_rating} / 10`} />
          <Metric label={FUN_POINTS_LABEL} value={fpd.toFixed(2)} />
        </div>

        {groups.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase opacity-60 mb-1">Ticket types</p>
            <ul className="text-sm space-y-1">
              {groups.map((g) => {
                const line = ticketGroupTotal(
                  Number(g.cost_per_ticket),
                  Number(g.quantity)
                );
                return (
                  <li
                    key={g.id ?? `${g.label}-${g.quantity}`}
                    className="flex justify-between gap-2"
                  >
                    <span>
                      {g.label?.trim() || "General"}{" "}
                      <span className="opacity-60">
                        ({formatCurrency(Number(g.cost_per_ticket))} × {g.quantity})
                      </span>
                    </span>
                    <span className="font-medium">{formatCurrency(line)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

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

        <Link href={`/app/edit/${concert.id}`} className="btn btn-outline btn-sm w-fit">
          Edit concert
        </Link>
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
