import { fetchEventsByState, hasTicketmasterKey } from "@/lib/ticketmaster";
import { stateNameToCode } from "@/lib/us-states";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stateName = searchParams.get("stateName")?.trim();
  const page = Math.max(0, Number(searchParams.get("page") ?? "0"));

  if (!stateName) {
    return NextResponse.json({ error: "stateName is required." }, { status: 400 });
  }

  const stateCode = stateNameToCode(stateName);
  if (!stateCode) {
    return NextResponse.json({ error: "Please choose a valid U.S. state name." }, { status: 400 });
  }

  if (!hasTicketmasterKey()) {
    return NextResponse.json(
      { error: "Add TICKETMASTER_API_KEY to .env.local.", events: [], page: 0, totalPages: 0, totalElements: 0 },
      { status: 503 }
    );
  }

  try {
    const result = await fetchEventsByState(stateCode, page);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load events";
    return NextResponse.json(
      { error: message, events: [], page: 0, totalPages: 0, totalElements: 0 },
      { status: 502 }
    );
  }
}
