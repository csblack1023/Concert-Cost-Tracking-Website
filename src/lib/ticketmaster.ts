import type { ArtistSearchResult, EventsResponse, TourEvent } from "@/types/artist-finder";
import { stateCodeToName } from "@/lib/us-states";

const BASE = "https://app.ticketmaster.com/discovery/v2";

function apiKey(): string | undefined {
  return process.env.TICKETMASTER_API_KEY;
}

export function hasTicketmasterKey(): boolean {
  return Boolean(apiKey());
}

async function tmFetch(path: string, params: Record<string, string>) {
  const key = apiKey();
  if (!key) {
    throw new Error(
      "Ticketmaster API key is not configured. Add TICKETMASTER_API_KEY to .env.local."
    );
  }

  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("apikey", key);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ticketmaster error (${res.status}): ${text.slice(0, 120)}`);
  }
  return res.json();
}

function bestImage(images: { url: string; width: number }[] | undefined): string | null {
  if (!images?.length) return null;
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted.find((i) => i.url)?.url ?? null;
}

function primaryGenre(
  classifications: { segment?: { name: string }; genre?: { name: string } }[] | undefined
): string | null {
  const c = classifications?.[0];
  if (!c) return null;
  const parts = [c.segment?.name, c.genre?.name].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export async function searchArtists(keyword: string): Promise<ArtistSearchResult[]> {
  const data = await tmFetch("/attractions.json", {
    keyword: keyword.trim(),
    classificationName: "music",
    size: "8",
    sort: "relevance,desc",
  });

  const attractions = data?._embedded?.attractions ?? [];
  return attractions.map(
    (a: {
      id: string;
      name: string;
      images?: { url: string; width: number }[];
      classifications?: { segment?: { name: string }; genre?: { name: string } }[];
      url?: string;
    }) => ({
      id: a.id,
      name: a.name,
      imageUrl: bestImage(a.images),
      genre: primaryGenre(a.classifications),
      url: a.url ?? null,
    })
  );
}

function formatEventDate(
  iso: string | undefined,
  localDate: string | undefined,
  localTime: string | undefined
): { dateTime: string; dateLabel: string } {
  if (iso) {
    const d = new Date(iso);
    return {
      dateTime: iso,
      dateLabel: d.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  }
  if (localDate) {
    const label = localTime
      ? `${localDate} at ${localTime}`
      : new Date(localDate + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
    return { dateTime: localDate, dateLabel: label };
  }
  return { dateTime: "", dateLabel: "Date TBA" };
}

function mapRawEvent(
  e: {
    id: string;
    name: string;
    url?: string;
    dates?: { start?: { dateTime?: string; localDate?: string; localTime?: string } };
    priceRanges?: { min: number }[];
    _embedded?: {
      venues?: { name: string; city?: { name: string }; state?: { stateCode: string } }[];
      attractions?: { name: string }[];
    };
  },
  fallbackArtist: string
): TourEvent {
  const venue = e._embedded?.venues?.[0];
  const code = venue?.state?.stateCode ?? "";
  const { dateTime, dateLabel } = formatEventDate(
    e.dates?.start?.dateTime,
    e.dates?.start?.localDate,
    e.dates?.start?.localTime
  );
  const attractions = e._embedded?.attractions ?? [];
  const artistName =
    attractions.find((a) => a.name && !a.name.toLowerCase().includes("tribute"))?.name ??
    attractions[0]?.name ??
    fallbackArtist;

  return {
    id: e.id,
    name: e.name,
    artistName,
    venue: venue?.name ?? "Venue TBA",
    city: venue?.city?.name ?? "",
    state: code ? stateCodeToName(code) : "",
    dateTime,
    dateLabel,
    ticketUrl: e.url ?? null,
    minPrice: e.priceRanges?.[0]?.min ?? null,
  };
}

/** Upcoming U.S. shows for one artist (all states) */
export async function fetchEventsByArtist(
  attractionId: string,
  artistName: string,
  page = 0
): Promise<EventsResponse> {
  const data = await tmFetch("/events.json", {
    attractionId,
    countryCode: "US",
    sort: "date,asc",
    size: "12",
    page: String(page),
  });

  const raw = data?._embedded?.events ?? [];
  const events = raw.map((e: Parameters<typeof mapRawEvent>[0]) => mapRawEvent(e, artistName));

  const pageInfo = data?.page ?? {};
  return {
    events,
    page: pageInfo.number ?? page,
    totalPages: pageInfo.totalPages ?? 1,
    totalElements: pageInfo.totalElements ?? events.length,
  };
}

/** Upcoming music events in one U.S. state */
export async function fetchEventsByState(stateCode: string, page = 0): Promise<EventsResponse> {
  const data = await tmFetch("/events.json", {
    stateCode,
    countryCode: "US",
    classificationName: "music",
    sort: "date,asc",
    size: "12",
    page: String(page),
  });

  const raw = data?._embedded?.events ?? [];
  const events = raw.map((e: Parameters<typeof mapRawEvent>[0]) => mapRawEvent(e, "Various artists"));

  const pageInfo = data?.page ?? {};
  return {
    events,
    page: pageInfo.number ?? page,
    totalPages: pageInfo.totalPages ?? 1,
    totalElements: pageInfo.totalElements ?? events.length,
  };
}
