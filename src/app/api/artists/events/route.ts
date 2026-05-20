import { fetchEventsByArtist, hasTicketmasterKey } from "@/lib/ticketmaster";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const attractionId = searchParams.get("attractionId")?.trim();
  const artistName = searchParams.get("artistName")?.trim() ?? "Artist";
  const page = Math.max(0, Number(searchParams.get("page") ?? "0"));

  if (!attractionId) {
    return NextResponse.json({ error: "attractionId is required." }, { status: 400 });
  }

  if (!hasTicketmasterKey()) {
    return NextResponse.json(
      {
        error: "Add TICKETMASTER_API_KEY to .env.local.",
        events: [],
        page: 0,
        totalPages: 0,
        totalElements: 0,
      },
      { status: 503 }
    );
  }

  try {
    const result = await fetchEventsByArtist(attractionId, artistName, page);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load events";
    return NextResponse.json(
      { error: message, events: [], page: 0, totalPages: 0, totalElements: 0 },
      { status: 502 }
    );
  }
}
