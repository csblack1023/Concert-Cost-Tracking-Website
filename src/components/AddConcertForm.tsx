"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { totalCost } from "@/lib/concert-utils";

const emptyForm = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "0",
  hours_at_event: "3",
  ticket_cost: "0",
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

export function AddConcertForm() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewTotal = useMemo(
    () =>
      totalCost({
        ticket_cost: Number(form.ticket_cost) || 0,
        ticket_fees: Number(form.ticket_fees) || 0,
        parking_cost: Number(form.parking_cost) || 0,
        food_drink_cost: Number(form.food_drink_cost) || 0,
        merchandise_cost: Number(form.merchandise_cost) || 0,
        lodging_cost: Number(form.lodging_cost) || 0,
        travel_cost: Number(form.travel_cost) || 0,
        other_cost: Number(form.other_cost) || 0,
      }),
    [form]
  );

  function update(field: string, value: string) {
    setSuccess(false);
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in to save a concert.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("concerts").insert({
      user_id: user.id,
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: Number(form.distance_from_home) || 0,
      hours_at_event: Number(form.hours_at_event) || 1,
      ticket_cost: Number(form.ticket_cost) || 0,
      ticket_fees: Number(form.ticket_fees) || 0,
      parking_cost: Number(form.parking_cost) || 0,
      food_drink_cost: Number(form.food_drink_cost) || 0,
      merchandise_cost: Number(form.merchandise_cost) || 0,
      lodging_cost: Number(form.lodging_cost) || 0,
      travel_cost: Number(form.travel_cost) || 0,
      other_cost: Number(form.other_cost) || 0,
      fun_rating: Number(form.fun_rating),
      notes: form.notes.trim() || null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setForm(emptyForm);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {success && (
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
          <p className="text-sm opacity-70 -mt-2">Tell us about the show you saw.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Concert name" required>
              <input
                className="input input-bordered w-full"
                value={form.concert_name}
                onChange={(e) => update("concert_name", e.target.value)}
                required
                placeholder="Summer Tour Night 1"
              />
            </Field>
            <Field label="Artist or band" required>
              <input
                className="input input-bordered w-full"
                value={form.artist}
                onChange={(e) => update("artist", e.target.value)}
                required
                placeholder="The Headliners"
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
            <Field label="State" required>
              <input
                className="input input-bordered w-full"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                required
                placeholder="CA"
              />
            </Field>
            <Field label="Concert date" required>
              <input
                type="date"
                className="input input-bordered w-full"
                value={form.concert_date}
                onChange={(e) => update("concert_date", e.target.value)}
                required
              />
            </Field>
            <Field label="Distance from home (miles)" hint="How far you traveled">
              <input
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered w-full"
                value={form.distance_from_home}
                onChange={(e) => update("distance_from_home", e.target.value)}
              />
            </Field>
            <Field label="Hours at the event" hint="Used for cost per hour">
              <input
                type="number"
                min="0.5"
                step="0.5"
                className="input input-bordered w-full"
                value={form.hours_at_event}
                onChange={(e) => update("hours_at_event", e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="Notes" className="md:col-span-2">
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Memorable moments, who you went with, etc."
            />
          </Field>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-lg">Costs</h2>
          <p className="text-sm opacity-70 -mt-2">
            Enter amounts in dollars. Total updates automatically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                ["ticket_cost", "Ticket cost"],
                ["ticket_fees", "Ticket fees"],
                ["parking_cost", "Parking"],
                ["food_drink_cost", "Food & drink"],
                ["merchandise_cost", "Merchandise"],
                ["lodging_cost", "Hotel / lodging"],
                ["travel_cost", "Travel / gas"],
                ["other_cost", "Other"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-full pl-7"
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </div>
              </Field>
            ))}
          </div>
          <div className="stat bg-primary/10 rounded-box mt-2">
            <div className="stat-title">Total concert cost</div>
            <div className="stat-value text-primary">
              ${previewTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-lg">How fun was it?</h2>
          <p className="text-sm opacity-70 -mt-2">
            1 = Terrible Time · 10 = Best Time Ever
          </p>
          <input
            type="range"
            min={1}
            max={10}
            value={form.fun_rating}
            onChange={(e) => update("fun_rating", e.target.value)}
            className="range range-primary"
            step={1}
          />
          <div className="flex justify-between text-xs px-1 opacity-70">
            <span>Terrible Time (1)</span>
            <span className="font-bold text-lg text-primary">{form.fun_rating}</span>
            <span>Best Time Ever (10)</span>
          </div>
        </div>
      </section>

      <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={loading}>
        {loading ? <span className="loading loading-spinner" /> : "Save concert"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  hint,
  required,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`form-control w-full ${className}`}>
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
