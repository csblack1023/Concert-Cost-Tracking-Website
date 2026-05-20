import type { SupabaseClient } from "@supabase/supabase-js";
import { parseTicketQuantity, validateTicketGroups } from "@/lib/ticket-utils";
import { ticketsTotalFromInputs } from "@/lib/ticket-utils";
import type { TicketGroupInput } from "@/types/concert";

export type ConcertFormPayload = {
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: number;
  ticket_fees: number;
  parking_cost: number;
  food_drink_cost: number;
  merchandise_cost: number;
  lodging_cost: number;
  travel_cost: number;
  other_cost: number;
  fun_rating: number;
  notes: string | null;
};

export function buildConcertRow(
  userId: string,
  form: ConcertFormPayload,
  ticketGroups: TicketGroupInput[]
) {
  const ticketCost = ticketsTotalFromInputs(ticketGroups);
  return {
    user_id: userId,
    ...form,
    ticket_cost: ticketCost,
  };
}

export async function insertTicketGroups(
  supabase: SupabaseClient,
  userId: string,
  concertId: string,
  groups: TicketGroupInput[]
) {
  const rows = groups.map((g, index) => {
    const quantity = parseTicketQuantity(g.quantity)!;
    return {
      concert_id: concertId,
      user_id: userId,
      label: g.label.trim() || null,
      cost_per_ticket: Number(g.cost_per_ticket) || 0,
      quantity,
      sort_order: index,
    };
  });

  const { error } = await supabase.from("concert_ticket_groups").insert(rows);
  return error;
}

export async function replaceTicketGroups(
  supabase: SupabaseClient,
  userId: string,
  concertId: string,
  groups: TicketGroupInput[]
) {
  await supabase
    .from("concert_ticket_groups")
    .delete()
    .eq("concert_id", concertId)
    .eq("user_id", userId);

  return insertTicketGroups(supabase, userId, concertId, groups);
}

export function validateConcertForm(
  ticketGroups: TicketGroupInput[]
): string | null {
  return validateTicketGroups(ticketGroups);
}
