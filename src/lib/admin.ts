export const ADMIN_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getStatusMeta(status: string) {
  switch (status) {
    case "pending":
      return { label: "Pending", className: "bg-amber-100 text-amber-800 ring-1 ring-amber-200" };
    case "confirmed":
      return { label: "Confirmed", className: "bg-blue-100 text-blue-800 ring-1 ring-blue-200" };
    case "preparing":
      return { label: "Preparing", className: "bg-orange-100 text-orange-800 ring-1 ring-orange-200" };
    case "out_for_delivery":
      return { label: "Out for Delivery", className: "bg-violet-100 text-violet-800 ring-1 ring-violet-200" };
    case "delivered":
      return { label: "Delivered", className: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-red-100 text-red-800 ring-1 ring-red-200" };
    default:
      return { label: "Pending", className: "bg-slate-100 text-slate-800 ring-1 ring-slate-200" };
  }
}
