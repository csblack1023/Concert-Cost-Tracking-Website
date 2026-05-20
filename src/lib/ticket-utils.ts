import type { TicketGroup, TicketGroupInput } from "@/types/concert";

/** Line total for one group: cost per ticket × quantity (whole numbers only) */
export function ticketGroupTotal(costPerTicket: number, quantity: number): number {
  return costPerTicket * quantity;
}

export function ticketsTotalFromGroups(groups: Pick<TicketGroup, "cost_per_ticket" | "quantity">[]): number {
  return groups.reduce(
    (sum, g) => sum + ticketGroupTotal(Number(g.cost_per_ticket), Number(g.quantity)),
    0
  );
}

export function ticketsTotalFromInputs(groups: TicketGroupInput[]): number {
  return groups.reduce((sum, g) => {
    const cost = Number(g.cost_per_ticket) || 0;
    const qty = parseTicketQuantity(g.quantity);
    if (qty === null) return sum;
    return sum + ticketGroupTotal(cost, qty);
  }, 0);
}

/** Parse quantity; returns null if not a positive whole number */
export function parseTicketQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.includes(".")) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

export function validateTicketGroups(groups: TicketGroupInput[]): string | null {
  if (groups.length === 0) {
    return "Add at least one ticket type.";
  }
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const qty = parseTicketQuantity(g.quantity);
    if (qty === null) {
      return `Ticket group ${i + 1}: quantity must be a whole number (1, 2, 3…).`;
    }
    const cost = Number(g.cost_per_ticket);
    if (Number.isNaN(cost) || cost < 0) {
      return `Ticket group ${i + 1}: enter a valid cost per ticket.`;
    }
  }
  return null;
}

export function emptyTicketGroup(): TicketGroupInput {
  return {
    clientId: crypto.randomUUID(),
    label: "",
    cost_per_ticket: "0",
    quantity: "1",
  };
}

export function ticketGroupsToInputs(groups: TicketGroup[]): TicketGroupInput[] {
  if (groups.length === 0) return [emptyTicketGroup()];
  return groups.map((g) => ({
    clientId: g.id ?? crypto.randomUUID(),
    label: g.label ?? "",
    cost_per_ticket: String(g.cost_per_ticket),
    quantity: String(Math.floor(Number(g.quantity))),
  }));
}
