"use client";

import type { TourEvent } from "@/types/artist-finder";
import { formatUsd } from "@/lib/format-usd";
import { CONCERT_BAR_COLORS } from "@/lib/chart-colors";
import Link from "next/link";

type EventCardProps = {
  event: TourEvent;
  accentIndex?: number;
};

export function EventCard({ event, accentIndex = 0 }: EventCardProps) {
  const accent = CONCERT_BAR_COLORS[accentIndex % CONCERT_BAR_COLORS.length];
  const dateOnly = event.dateTime.split("T")[0] || event.dateTime;
  const location = [event.city, event.state].filter(Boolean).join(", ");

  const addUrl = new URLSearchParams({
    artist: event.artistName,
    concert_name: event.name,
    venue: event.venue,
    city: event.city,
    state: event.state,
    concert_date: dateOnly,
  });

  return (
    <article
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-l-4 bg-base-100"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-semibold text-base">{event.artistName}</p>
        <p className="text-sm opacity-80">{event.venue}</p>
        {location && <p className="text-sm">{location}</p>}
        <p className="text-sm font-medium">{event.dateLabel}</p>
        {event.minPrice != null && (
          <p className="text-xs opacity-70">From {formatUsd(event.minPrice)}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            Tickets
          </a>
        )}
        <Link href={`/app/add?${addUrl.toString()}`} className="btn btn-primary btn-sm">
          Track this show
        </Link>
      </div>
    </article>
  );
}
