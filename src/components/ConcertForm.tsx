"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatUsd } from "@/lib/format-usd";
import { totalCost } from "@/lib/concert-utils";
import {
  buildConcertRow,
  insertTicketGroups,
  replaceTicketGroups,
  validateConcertForm,
  type ConcertFormPayload,
} from "@/lib/concert-save";
import { emptyTicketGroup, ticketGroupsToInputs } from "@/lib/ticket-utils";
import { isValidStateName } from "@/lib/us-states";
import type { Concert, TicketGroupInput } from "@/types/concert";
import { TicketGroupsEditor } from "@/components/TicketGroupsEditor";
import { MoneyInput } from "@/components/MoneyInput";
import { StateTypeahead } from "@/components/StateTypeahead";

const emptyDetails = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "0",
  ticket_fees: "0",
  parking_cost: "0",
  food_drink_cost: "0",
  merchandise_cost: "0",
  lodging_cost: "0",
  travel_cost: "0",
  other_cost: "0",
  fun_rating: "7",
  notes: "",
};

export type ConcertFormPrefill = {
  concert_name?: string;
  artist?: string;
  venue?: string;
  city?: string;
  state?: string;
  concert_date?: string;
};

type ConcertFormProps = {
  mode: "create" | "edit";
  concert?: Concert;
  prefill?: ConcertFormPrefill;
};

export function ConcertForm({ mode, concert, prefill }: ConcertFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    concert
      ? {
          ...emptyDetails,
          concert_name: concert.concert_name,
          artist: concert.artist,
          venue: concert.venue,
          city: concert.city,
          state: concert.state,
          concert_date: concert.concert_date.split("T")[0],
          distance_from_home: String(concert.distance_from_home),
          ticket_fees: String(concert.ticket_fees),
          parking_cost: String(concert.parking_cost),
          food_drink_cost: String(concert.food_drink_cost),
          merchandise_cost: String(concert.merchandise_cost),
          lodging_cost: String(concert.lodging_cost),
          travel_cost: String(concert.travel_cost),
          other_cost: String(concert.other_cost),
          fun_rating: String(concert.fun_rating),
          notes: concert.notes ?? "",
        }
      : prefill
        ? {
            ...emptyDetails,
            concert_name: prefill.concert_name ?? "",
            artist: prefill.artist ?? "",
            venue: prefill.venue ?? "",
            city: prefill.city ?? "",
            state: prefill.state ?? "",
            concert_date: prefill.concert_date ?? "",
          }
        : { ...emptyDetails }
  );
  const [ticketGroups, setTicketGroups] = useState<TicketGroupInput[]>(() =>
    concert
      ? ticketGroupsToInputs(concert.concert_ticket_groups ?? [])
      : [emptyTicketGroup()]
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewTotal = useMemo(() => {
    const mock = {
      ticket_cost: 0,
      ticket_fees: Number(form.ticket_fees) || 0,
      parking_cost: Number(form.parking_cost) || 0,
      food_drink_cost: Number(form.food_drink_cost) || 0,
      merchandise_cost: Number(form.merchandise_cost) || 0,
      lodging_cost: Number(form.lodging_cost) || 0,
      travel_cost: Number(form.travel_cost) || 0,
      other_cost: Number(form.other_cost) || 0,
      concert_ticket_groups: ticketGroups.map((g) => ({
        cost_per_ticket: Number(g.cost_per_ticket) || 0,
        quantity: Number(g.quantity) || 0,
      })),
    };
    return totalCost(mock as Concert);
  }, [form, ticketGroups]);

  function update(field: string, value: string) {
    setSuccess(false);
    setForm((f) => ({ ...f, [field]: value }));
  }

  function buildPayload(): ConcertFormPayload {
    return {
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: Number(form.distance_from_home) || 0,
      ticket_fees: Number(form.ticket_fees) || 0,
      parking_cost: Number(form.parking_cost) || 0,
      food_drink_cost: Number(form.food_drink_cost) || 0,
      merchandise_cost: Number(form.merchandise_cost) || 0,
      lodging_cost: Number(form.lodging_cost) || 0,
      travel_cost: Number(form.travel_cost) || 0,
      other_cost: Number(form.other_cost) || 0,
      fun_rating: Number(form.fun_rating),
      notes: form.notes.trim() || null,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isValidStateName(form.state)) {
      setError("Please select a valid U.S. state name from the list.");
      return;
    }

    const validationError = validateConcertForm(ticketGroups);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in.");
      setLoading(false);
      return;
    }

    const payload = buildPayload();
    const row = buildConcertRow(user.id, payload, ticketGroups);

    if (mode === "create") {
      const { data, error: insertError } = await supabase
        .from("concerts")
        .insert(row)
        .select("id")
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? "Could not save concert.");
        setLoading(false);
        return;
      }

      const groupError = await insertTicketGroups(
        supabase,
        user.id,
        data.id,
        ticketGroups
      );
      if (groupError) {
        setError(groupError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setForm({ ...emptyDetails });
      setTicketGroups([emptyTicketGroup()]);
    } else if (concert) {
      const { error: updateError } = await supabase
        .from("concerts")
        .update(row)
        .eq("id", concert.id)
        .eq("user_id", user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      const groupError = await replaceTicketGroups(
        supabase,
        user.id,
        concert.id,
        ticketGroups
      );
      if (groupError) {
        setError(groupError.message);
        setLoading(false);
        return;
      }

      router.push("/app/concerts");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {success && mode === "create" && (
        <div role="alert" className="alert alert-success">
          <span>Concert saved! Add another or check your dashboard.</span>
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-lg">Concert details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Concert name" required>
              <input
                className="input input-bordered w-full"
                value={form.concert_name}
                onChange={(e) => update("concert_name", e.target.value)}
                required
              />
            </Field>
            <Field label="Artist or band" required>
              <input
                className="input input-bordered w-full"
                value={form.artist}
                onChange={(e) => update("artist", e.target.value)}
                required
              />
            </Field>
            <Field label="Venue" required>
              <input
                className="input input-bordered w-full"
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
                required
              />
            </Field>
            <Field label="City" required>
              <input
                className="input input-bordered w-full"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                required
              />
            </Field>
            <StateTypeahead
              value={form.state}
              onChange={(v) => update("state", v)}
              required
            />
            <Field label="Concert date" required>
              <input
                type="date"
                className="input input-bordered w-full"
                value={form.concert_date}
                onChange={(e) => update("concert_date", e.target.value)}
                required
              />
            </Field>
            <Field label="Distance from home (miles)">
              <input
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered w-full"
                value={form.distance_from_home}
                onChange={(e) => update("distance_from_home", e.target.value)}
              />
            </Field>
            <Field label="Rating (1–10)" required>
              <select
                className="select select-bordered w-full"
                value={form.fun_rating}
                onChange={(e) => update("fun_rating", e.target.value)}
                required
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md">
        <div className="card-body gap-4">
          <div>
            <h2 className="card-title text-lg">Tickets</h2>
            <p className="text-sm opacity-70">
              Cost per ticket × quantity (whole numbers). All amounts in USD.
            </p>
          </div>
          <TicketGroupsEditor groups={ticketGroups} onChange={setTicketGroups} />
        </div>
      </section>

      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-lg">Other costs (USD)</h2>
          <p className="text-sm opacity-70 -mt-2">Total updates automatically.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                ["ticket_fees", "Ticket fees (service charges)"],
                ["parking_cost", "Parking"],
                ["food_drink_cost", "Food & drink"],
                ["merchandise_cost", "Merchandise"],
                ["lodging_cost", "Hotel / lodging"],
                ["travel_cost", "Travel / gas"],
                ["other_cost", "Other"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <MoneyInput value={form[key]} onChange={(v) => update(key, v)} />
              </Field>
            ))}
          </div>
          <div className="stat bg-primary/10 rounded-box mt-2">
            <div className="stat-title">Total concert cost (USD)</div>
            <div className="stat-value text-primary">{formatUsd(previewTotal)}</div>
          </div>
        </div>
      </section>


      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? (
            <span className="loading loading-spinner" />
          ) : mode === "create" ? (
            "Save concert"
          ) : (
            "Update concert"
          )}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            className="btn btn-ghost btn-lg"
            onClick={() => router.push("/app/concerts")}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="form-control w-full">
      <span className="label py-1">
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      </span>
      {children}
      {hint && <span className="label-text-alt mt-1">{hint}</span>}
    </label>
  );
}
