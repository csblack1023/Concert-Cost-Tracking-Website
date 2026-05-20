import type { SupabaseClient } from "@supabase/supabase-js";
import type { Concert, TicketGroup } from "@/types/concert";

/** Load concerts and ticket groups (two queries — works without PostgREST nested joins). */
export async function fetchConcertsForUser(supabase: SupabaseClient) {
  const concertsResult = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  if (concertsResult.error) {
    return concertsResult;
  }

  const concerts = (concertsResult.data ?? []) as Concert[];
  const withGroups = await attachTicketGroups(supabase, concerts);

  return { ...concertsResult, data: withGroups };
}

export async function fetchConcertById(supabase: SupabaseClient, id: string) {
  const concertResult = await supabase
    .from("concerts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (concertResult.error || !concertResult.data) {
    return concertResult;
  }

  const [concert] = await attachTicketGroups(supabase, [
    concertResult.data as Concert,
  ]);

  return { ...concertResult, data: concert };
}

async function attachTicketGroups(
  supabase: SupabaseClient,
  concerts: Concert[]
): Promise<Concert[]> {
  if (concerts.length === 0) return concerts;

  const ids = concerts.map((c) => c.id);
  const { data: groups, error } = await supabase
    .from("concert_ticket_groups")
    .select("id, concert_id, user_id, label, cost_per_ticket, quantity, sort_order")
    .in("concert_id", ids)
    .order("sort_order", { ascending: true });

  if (error) {
    return concerts.map((c) => ({
      ...c,
      concert_ticket_groups: [],
    }));
  }

  const byConcert = new Map<string, TicketGroup[]>();
  for (const g of groups ?? []) {
    const list = byConcert.get(g.concert_id) ?? [];
    list.push(g as TicketGroup);
    byConcert.set(g.concert_id, list);
  }

  return concerts.map((c) => ({
    ...c,
    concert_ticket_groups: byConcert.get(c.id) ?? [],
  }));
}

export function normalizeConcert(row: Concert): Concert {
  const groups = row.concert_ticket_groups ?? [];
  groups.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return {
    ...row,
    concert_ticket_groups: groups,
  };
}
