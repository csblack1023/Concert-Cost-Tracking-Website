export type TicketGroup = {
  id?: string;
  concert_id?: string;
  user_id?: string;
  label: string | null;
  cost_per_ticket: number;
  quantity: number;
  sort_order?: number;
};

export type Concert = {
  id: string;
  user_id: string;
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: number;
  ticket_cost: number;
  ticket_fees: number;
  parking_cost: number;
  food_drink_cost: number;
  merchandise_cost: number;
  lodging_cost: number;
  travel_cost: number;
  other_cost: number;
  fun_rating: number;
  notes: string | null;
  created_at: string;
  concert_ticket_groups?: TicketGroup[];
};

export type TicketGroupInput = {
  clientId: string;
  label: string;
  cost_per_ticket: string;
  quantity: string;
};
