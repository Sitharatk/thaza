"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ORDER_STATUSES, getStatusMeta, type AdminOrderStatus } from "@/src/lib/admin";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function OrderStatusEditor({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<AdminOrderStatus>((ADMIN_ORDER_STATUSES.includes(currentStatus as AdminOrderStatus) ? currentStatus as AdminOrderStatus : "pending"));
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const badge = useMemo(() => getStatusMeta(status), [status]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setMessage("");
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", orderId).select("id").single();

      if (updateError) {
        throw updateError;
      }

      setMessage("Order status updated successfully.");
      router.refresh();
    } catch (updateError) {
      const nextMessage = updateError instanceof Error ? updateError.message : "Could not update the order status.";
      setError(nextMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Current Status</p>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AdminOrderStatus)}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--navy)] outline-none focus:border-[var(--green)]"
          >
            {ADMIN_ORDER_STATUSES.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {getStatusMeta(statusOption).label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--green)] disabled:cursor-wait disabled:opacity-70"
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
