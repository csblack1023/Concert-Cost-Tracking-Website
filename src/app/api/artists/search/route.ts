import { searchArtists, hasTicketmasterKey } from "@/lib/ticketmaster";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ artists: [] });
  }

  if (!hasTicketmasterKey()) {
    return NextResponse.json(
      {
        error:
          "Artist search is not configured. Add TICKETMASTER_API_KEY to .env.local (free at developer.ticketmaster.com).",
        artists: [],
      },
      { status: 503 }
    );
  }

  try {
    const artists = await searchArtists(q);
    return NextResponse.json({ artists });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message, artists: [] }, { status: 502 });
  }
}
