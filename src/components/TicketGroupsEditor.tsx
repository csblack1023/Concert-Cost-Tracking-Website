"use client";

import { formatUsd } from "@/lib/format-usd";
import {
  emptyTicketGroup,
  parseTicketQuantity,
  ticketGroupTotal,
  ticketsTotalFromInputs,
} from "@/lib/ticket-utils";
import type { TicketGroupInput } from "@/types/concert";
import { MoneyInput } from "@/components/MoneyInput";

type TicketGroupsEditorProps = {
  groups: TicketGroupInput[];
  onChange: (groups: TicketGroupInput[]) => void;
};

export function TicketGroupsEditor({ groups, onChange }: TicketGroupsEditorProps) {
  const ticketsSubtotal = ticketsTotalFromInputs(groups);

  function updateGroup(clientId: string, patch: Partial<TicketGroupInput>) {
    onChange(
      groups.map((g) => (g.clientId === clientId ? { ...g, ...patch } : g))
    );
  }

  function removeGroup(clientId: string) {
    if (groups.length <= 1) return;
    onChange(groups.filter((g) => g.clientId !== clientId));
  }

  function addGroup() {
    onChange([...groups, emptyTicketGroup()]);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm opacity-70">
        Each ticket type: cost per ticket × quantity (whole numbers only). Amounts in USD.
      </p>

      {groups.map((group, index) => {
        const qty = parseTicketQuantity(group.quantity);
        const cost = Number(group.cost_per_ticket) || 0;
        const lineTotal = qty !== null ? ticketGroupTotal(cost, qty) : 0;
        const qtyInvalid =
          group.quantity.trim() !== "" && parseTicketQuantity(group.quantity) === null;

        return (
          <div
            key={group.clientId}
            className="card bg-base-200/50 border border-base-300"
          >
            <div className="card-body p-4 gap-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h3 className="font-semibold text-sm">
                  Ticket type {index + 1}
                  {group.label.trim() ? ` · ${group.label}` : ""}
                </h3>
                {groups.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => removeGroup(group.clientId)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="form-control">
                  <span className="label-text text-xs font-medium">Label (optional)</span>
                  <input
                    className="input input-bordered input-sm"
                    placeholder="Floor, Balcony, VIP…"
                    value={group.label}
                    onChange={(e) => updateGroup(group.clientId, { label: e.target.value })}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text text-xs font-medium">Quantity *</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className={`input input-bordered input-sm ${qtyInvalid ? "input-error" : ""}`}
                    value={group.quantity}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.includes(".")) return;
                      updateGroup(group.clientId, { quantity: v });
                    }}
                  />
                  {qtyInvalid && (
                    <span className="text-error text-xs mt-1">Whole numbers only (1, 2, 3…)</span>
                  )}
                </label>
                <label className="form-control sm:col-span-2">
                  <span className="label-text text-xs font-medium">Cost per ticket (USD) *</span>
                  <MoneyInput
                    value={group.cost_per_ticket}
                    onChange={(v) => updateGroup(group.clientId, { cost_per_ticket: v })}
                  />
                </label>
              </div>

              <p className="text-sm text-right opacity-80">
                Line total: <span className="font-semibold">{formatUsd(lineTotal)}</span>
              </p>
            </div>
          </div>
        );
      })}

      <button type="button" className="btn btn-outline btn-sm" onClick={addGroup}>
        + Add another ticket type
      </button>

      <div className="stat bg-base-200 rounded-box py-2">
        <div className="stat-title text-xs">All tickets subtotal</div>
        <div className="stat-value text-lg">{formatUsd(ticketsSubtotal)}</div>
      </div>
    </div>
  );
}
